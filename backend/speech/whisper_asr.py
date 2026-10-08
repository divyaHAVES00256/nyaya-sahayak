"""CPU-friendly transcription with Whisper large-v3 and script-based language tags."""

import re
from io import BytesIO
from threading import Lock
from typing import Any


MODEL_SIZE = "large-v3"
DEVANAGARI_RE = re.compile(r"[\u0900-\u097f]")
LATIN_RE = re.compile(r"[A-Za-z]")


class SpeechTranscriptionError(RuntimeError):
    """Raised when Whisper cannot produce a usable transcript."""


class WhisperTranscriber:
    """Load Whisper large-v3 on first use and transcribe uploaded audio."""

    def __init__(self, model: Any | None = None) -> None:
        # Inject a fake model in tests; real model weights load only on first request.
        self._model = model
        self._model_lock = Lock()

    def transcribe(self, audio_bytes: bytes) -> dict[str, str | float | list[str] | bool]:
        """Transcribe audio and identify Hindi/English script combinations."""
        if not audio_bytes:
            raise SpeechTranscriptionError("The uploaded audio file is empty.")

        model = self._get_model()
        segments, info = model.transcribe(
            BytesIO(audio_bytes),
            beam_size=5,
            vad_filter=True,
        )
        text = " ".join(
            segment.text.strip()
            for segment in segments
            if segment.text.strip()
        ).strip()
        if not text:
            raise SpeechTranscriptionError(
                "No speech was detected. Try a clearer or longer recording."
            )

        language_tags = self._language_tags(info.language, text)
        is_code_mixed = "hi" in language_tags and "en" in language_tags
        return {
            "text": text,
            "detected_language": info.language,
            "language_tags": language_tags,
            "is_code_mixed": is_code_mixed,
            "language_probability": float(info.language_probability),
        }

    def _get_model(self) -> Any:
        """Load the multi-gigabyte model once, even if two requests arrive together."""
        if self._model is None:
            with self._model_lock:
                if self._model is None:
                    from faster_whisper import WhisperModel

                    # Int8 keeps large-v3 usable on the CPU-only development PC.
                    self._model = WhisperModel(
                        MODEL_SIZE,
                        device="cpu",
                        compute_type="int8",
                        cpu_threads=4,
                    )
        return self._model

    @staticmethod
    def _language_tags(detected_language: str, text: str) -> list[str]:
        """Tag mixed Devanagari and Latin text as Hindi-English code switching."""
        has_hindi_script = bool(DEVANAGARI_RE.search(text))
        has_latin_script = bool(LATIN_RE.search(text))
        if has_hindi_script and has_latin_script:
            return ["hi", "en"]
        if detected_language in {"hi", "en"}:
            return [detected_language]
        return [detected_language]
