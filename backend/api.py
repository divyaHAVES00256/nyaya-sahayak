"""HTTP API for searching the FAQ training data."""

from pathlib import Path
from typing import Literal, Protocol

from fastapi import FastAPI, File, HTTPException, UploadFile
from pydantic import BaseModel, Field
from starlette.concurrency import run_in_threadpool

from backend.generation.openrouter import (
    GenerationError,
    UnusableAnswerError,
    load_generator_from_env,
)
from backend.retrieval.pipeline import HybridFAQRetriever
from backend.safety.caef import CAEFResult, evaluate_answer
from backend.speech.whisper_asr import SpeechTranscriptionError, WhisperTranscriber


FAQ_CSV = Path(__file__).resolve().parents[1] / "data" / "faqs.csv"
MAX_AUDIO_BYTES = 25 * 1024 * 1024
ANSWER_NOTICE = (
    "General legal information, not legal advice."
)
FAQ_ANSWER_NOTICE = (
    "Stored FAQ answer, not newly generated. General information, not legal advice."
)
UNUSABLE_GENERATION_NOTICE = (
    "The generated response was not usable, so this is the best matching stored "
    "FAQ answer. General information, not legal advice."
)
SAFETY_BLOCK_NOTICE = (
    "This response was withheld because it did not pass the safety check. "
    "General legal information, not legal advice."
)
SAFETY_BLOCK_ANSWER = (
    "I can’t provide that response. Please rephrase your question as a request "
    "for safe, lawful information."
)
SEARCH_NOTICE = (
    "These are FAQ-entry candidates, not source-law passages or verified legal advice. "
    "Stage scores rank results and are not confidence scores."
)


class AnswerGenerator(Protocol):
    """The small interface used by the answer endpoint and its tests."""

    def generate(
        self,
        question: str,
        evidence: list[dict[str, str | float]],
    ) -> str: ...


class AudioTranscriber(Protocol):
    """The transcription interface used by the upload endpoint and its tests."""

    def transcribe(
        self,
        audio_bytes: bytes,
    ) -> dict[str, str | float | list[str] | bool]: ...


class SearchRequest(BaseModel):
    """Input accepted by the FAQ search endpoint."""

    question: str = Field(min_length=1, max_length=2000)
    limit: int = Field(default=5, ge=1, le=10)


class AnswerRequest(BaseModel):
    """Input accepted by the grounded answer endpoint."""

    question: str = Field(min_length=1, max_length=2000)
    limit: int = Field(default=5, ge=1, le=10)


class FAQCandidate(BaseModel):
    """One FAQ plus the raw ranking signals from each retrieval stage."""

    id: str
    query: str
    language: str
    domain: str
    cited_act: str
    reference_answer: str
    cited_sections: str
    question_type: str
    score: float = Field(description="Cross-encoder ranking logit; not confidence.")
    bm25_score: float = Field(description="BM25 keyword-ranking score.")
    dense_score: float = Field(description="Cosine similarity from dense retrieval.")
    rrf_score: float = Field(description="Reciprocal Rank Fusion score.")


class AnswerSource(BaseModel):
    """An FAQ entry shown as the evidence for a generated answer."""

    id: str
    query: str
    cited_act: str
    cited_sections: str
    reference_answer: str


class CAEFReport(BaseModel):
    """Transparent score and gate decision from the six-dimension CAEF checker."""

    score: float
    threshold: float
    passed: bool
    dimensions: dict[str, float]
    reasons: list[str]


class SearchResponse(BaseModel):
    """Search results and a notice about how to interpret them."""

    question: str
    count: int
    candidates: list[FAQCandidate]
    notice: str


class AnswerResponse(BaseModel):
    """A safety-checked answer with its FAQ evidence and CAEF report."""

    question: str
    answer: str
    sources: list[AnswerSource]
    generation_mode: Literal["free_model", "retrieved_faq", "safety_blocked"]
    model_used: str | None = None
    notice: str
    safety: CAEFReport


class TranscriptionResponse(BaseModel):
    """Recognized speech and language tags returned from the audio endpoint."""

    text: str
    detected_language: str
    language_tags: list[str]
    is_code_mixed: bool
    language_probability: float


class HealthResponse(BaseModel):
    """Basic readiness information for local development."""

    status: str
    indexed_faqs: int


def create_app(
    retriever: HybridFAQRetriever | None = None,
    generator: AnswerGenerator | None = None,
    transcriber: AudioTranscriber | None = None,
) -> FastAPI:
    """Create the API and load retrieval, generation, and speech services once."""
    faq_retriever = retriever or HybridFAQRetriever(FAQ_CSV)
    answer_generator = generator or load_generator_from_env()
    speech_transcriber = transcriber or WhisperTranscriber()
    app = FastAPI(
        title="Nyaya Sahayak FAQ Search",
        description=(
            "A four-stage hybrid FAQ retrieval prototype with optional grounded "
            "answer generation through OpenRouter's free-model router."
        ),
        version="0.1.0",
    )
    app.state.retriever = faq_retriever
    app.state.answer_generator = answer_generator
    app.state.transcriber = speech_transcriber

    @app.get("/health", response_model=HealthResponse)
    def health_check() -> HealthResponse:
        return HealthResponse(
            status="ok",
            indexed_faqs=faq_retriever.document_count(),
        )

    @app.post("/api/v1/transcribe", response_model=TranscriptionResponse)
    async def transcribe_audio(
        audio: UploadFile = File(...),
    ) -> TranscriptionResponse:
        if not audio.content_type or not audio.content_type.startswith("audio/"):
            raise HTTPException(
                status_code=415,
                detail="Upload an audio recording to transcribe.",
            )

        audio_bytes = await audio.read(MAX_AUDIO_BYTES + 1)
        await audio.close()
        if len(audio_bytes) > MAX_AUDIO_BYTES:
            raise HTTPException(
                status_code=413,
                detail="Audio is too large. Keep recordings under 25 MB.",
            )
        if not audio_bytes:
            raise HTTPException(status_code=422, detail="The uploaded audio is empty.")

        try:
            # CPU transcription takes time, so run it away from the async event loop.
            result = await run_in_threadpool(
                app.state.transcriber.transcribe,
                audio_bytes,
            )
        except SpeechTranscriptionError as error:
            raise HTTPException(status_code=422, detail=str(error)) from error

        return TranscriptionResponse(**result)

    @app.post("/api/v1/search", response_model=SearchResponse)
    def search_faqs(request: SearchRequest) -> SearchResponse:
        if not request.question.strip():
            raise HTTPException(
                status_code=422,
                detail="Question must contain at least one non-space character.",
            )

        # The pipeline returns existing FAQ entries; no LLM is called.
        candidates = faq_retriever.search(request.question, limit=request.limit)
        return SearchResponse(
            question=request.question,
            count=len(candidates),
            candidates=candidates,
            notice=SEARCH_NOTICE,
        )

    @app.post("/api/v1/answer", response_model=AnswerResponse)
    def answer_question(request: AnswerRequest) -> AnswerResponse:
        if not request.question.strip():
            raise HTTPException(
                status_code=422,
                detail="Question must contain at least one non-space character.",
            )

        # First run the four retrieval stages; only their top FAQ entries become evidence.
        candidates = faq_retriever.search(request.question, limit=request.limit)
        sources = [
            AnswerSource(
                id=str(candidate["id"]),
                query=str(candidate["query"]),
                cited_act=str(candidate["cited_act"]),
                cited_sections=str(candidate["cited_sections"]),
                reference_answer=str(candidate["reference_answer"]),
            )
            for candidate in candidates
        ]

        configured_generator: AnswerGenerator | None = app.state.answer_generator
        generation_mode: Literal["free_model", "retrieved_faq", "safety_blocked"]
        model_used: str | None = None
        notice = ANSWER_NOTICE
        if configured_generator is None:
            # Keep the chat useful without credentials, but label this as stored FAQ text.
            answer = (
                str(candidates[0]["reference_answer"])
                if candidates
                else "I could not find a matching FAQ in the available material."
            )
            generation_mode = "retrieved_faq"
            notice = FAQ_ANSWER_NOTICE
        else:
            relevant_candidates = candidates[:1]
            try:
                answer = configured_generator.generate(
                    request.question,
                    relevant_candidates,
                )
            except UnusableAnswerError:
                if not candidates:
                    raise HTTPException(
                        status_code=502,
                        detail="The model response was not usable and no FAQ fallback is available.",
                    )
                answer = str(candidates[0]["reference_answer"])
                generation_mode = "retrieved_faq"
                notice = UNUSABLE_GENERATION_NOTICE
            except GenerationError as error:
                if error.status_code == 429:
                    raise HTTPException(
                        status_code=429,
                        detail=(
                            "OpenRouter rate-limited the free-model request or its "
                            "free providers are temporarily at capacity. Wait and retry. "
                            f"{error}"
                        ),
                    ) from error
                raise HTTPException(status_code=502, detail=str(error)) from error
            else:
                generation_mode = "free_model"
                model_used = getattr(configured_generator, "last_model", None)

        safety_result: CAEFResult = evaluate_answer(
            question=request.question,
            answer=answer,
            evidence=candidates[:1],
            disclaimer=notice,
        )
        if not safety_result.passed:
            return AnswerResponse(
                question=request.question,
                answer=SAFETY_BLOCK_ANSWER,
                sources=[],
                generation_mode="safety_blocked",
                notice=SAFETY_BLOCK_NOTICE,
                safety=CAEFReport(
                    score=safety_result.score,
                    threshold=safety_result.threshold,
                    passed=False,
                    dimensions=safety_result.dimensions,
                    reasons=list(safety_result.reasons),
                ),
            )
        return AnswerResponse(
            question=request.question,
            answer=answer,
            sources=sources[:1],
            generation_mode=generation_mode,
            model_used=model_used,
            notice=notice,
            safety=CAEFReport(
                score=safety_result.score,
                threshold=safety_result.threshold,
                passed=True,
                dimensions=safety_result.dimensions,
                reasons=list(safety_result.reasons),
            ),
        )

    return app


app = create_app()
