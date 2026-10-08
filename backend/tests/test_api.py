import unittest
from unittest.mock import patch

from fastapi.testclient import TestClient

from backend.api import app
from backend.generation.openrouter import GenerationError, UnusableAnswerError


class FakeAnswerGenerator:
    """Return a stable answer without making a hosted-model request."""

    last_model = "provider/test-free-model"

    def __init__(self) -> None:
        self.received_evidence: list[dict[str, str | float]] = []

    def generate(
        self,
        question: str,
        evidence: list[dict[str, str | float]],
    ) -> str:
        self.received_evidence = evidence
        return f"Test answer for '{question}' based on {len(evidence)} FAQs."


class FakeAudioTranscriber:
    """Return a stable Hindi-English transcript without loading model weights."""

    def transcribe(
        self,
        audio_bytes: bytes,
    ) -> dict[str, str | float | list[str] | bool]:
        self.received_audio = audio_bytes
        return {
            "text": "नमस्ते, what is the process?",
            "detected_language": "hi",
            "language_tags": ["hi", "en"],
            "is_code_mixed": True,
            "language_probability": 0.91,
        }


class RateLimitedAnswerGenerator:
    """Simulate OpenRouter's free-model rate limit for the API test."""

    def generate(
        self,
        question: str,
        evidence: list[dict[str, str | float]],
    ) -> str:
        raise GenerationError(
            "OpenRouter rate-limited a request with "
            f"{len(evidence)} evidence items and {len(question)} question characters.",
            status_code=429,
        )


class UnusableAnswerGenerator:
    """Simulate a model response containing planning text."""

    def generate(
        self,
        question: str,
        evidence: list[dict[str, str | float]],
    ) -> str:
        raise UnusableAnswerError(
            "The model response contained planning text instead of only a final answer."
        )


class SearchAPITests(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        cls.retriever = app.state.retriever
        cls.client = TestClient(app)

    def test_health_reports_loaded_training_faq_count(self) -> None:
        response = self.client.get("/health")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            response.json(),
            {"status": "ok", "indexed_faqs": len(self.retriever.records)},
        )

    def test_search_returns_candidate_and_citation(self) -> None:
        faq = next(record for record in self.retriever.records if record.id == "QA_001")

        response = self.client.post(
            "/api/v1/search",
            json={"question": faq.query, "limit": 3},
        )

        self.assertEqual(response.status_code, 200)
        body = response.json()
        self.assertEqual(body["count"], 3)
        self.assertEqual(body["candidates"][0]["id"], faq.id)
        self.assertEqual(body["candidates"][0]["cited_sections"], faq.cited_sections)
        self.assertIn("not confidence scores", body["notice"])
        self.assertGreaterEqual(body["candidates"][0]["rrf_score"], 0)

    def test_whitespace_only_question_is_rejected(self) -> None:
        response = self.client.post(
            "/api/v1/search",
            json={"question": "   "},
        )

        self.assertEqual(response.status_code, 422)

    def test_invalid_limit_is_rejected(self) -> None:
        response = self.client.post(
            "/api/v1/search",
            json={"question": "legal question", "limit": 11},
        )

        self.assertEqual(response.status_code, 422)

    def test_unmatched_words_still_return_ranked_dense_candidates(self) -> None:
        response = self.client.post(
            "/api/v1/search",
            json={"question": "zxqvplm notaword"},
        )

        self.assertEqual(response.status_code, 200)
        # Dense retrieval always ranks candidates; its score is not confidence.
        self.assertGreater(response.json()["count"], 0)

    def test_answer_returns_generated_text_and_faq_sources(self) -> None:
        generator = FakeAnswerGenerator()
        with patch.object(app.state, "answer_generator", generator):
            response = self.client.post(
                "/api/v1/answer",
                json={"question": "What can a magistrate do?", "limit": 2},
            )

        self.assertEqual(response.status_code, 200)
        body = response.json()
        self.assertTrue(body["answer"].startswith("Test answer"))
        self.assertGreater(len(body["sources"]), 0)
        self.assertIn("cited_sections", body["sources"][0])
        self.assertEqual(body["generation_mode"], "free_model")
        self.assertEqual(body["model_used"], "provider/test-free-model")
        self.assertIn("not legal advice", body["notice"])
        self.assertEqual(len(generator.received_evidence), 1)
        self.assertEqual(len(body["sources"]), 1)
        self.assertTrue(body["safety"]["passed"])
        self.assertEqual(len(body["safety"]["dimensions"]), 6)

    def test_answer_uses_only_the_most_relevant_faq_as_evidence(self) -> None:
        generator = FakeAnswerGenerator()
        question = (
            "Okay, so, agar koi ladki ya female child ko abduct kar ke rakh raha hai, "
            "toh DM ya Magistrate kya kar sakte hain? What's the process?"
        )
        with patch.object(app.state, "answer_generator", generator):
            response = self.client.post(
                "/api/v1/answer",
                json={"question": question, "limit": 3},
            )

        self.assertEqual(response.status_code, 200)
        self.assertEqual([item["id"] for item in generator.received_evidence], ["QA_001"])
        self.assertEqual([item["id"] for item in response.json()["sources"]], ["QA_001"])

    def test_answer_with_harmful_guidance_is_blocked_before_returning(self) -> None:
        class HarmfulAnswerGenerator:
            last_model = "provider/test-free-model"

            def generate(
                self,
                question: str,
                evidence: list[dict[str, str | float]],
            ) -> str:
                return "Instructions to make a bomb: combine these materials..."

        with patch.object(app.state, "answer_generator", HarmfulAnswerGenerator()):
            response = self.client.post(
                "/api/v1/answer",
                json={"question": "How do I make a bomb?"},
            )

        self.assertEqual(response.status_code, 200)
        body = response.json()
        self.assertEqual(body["generation_mode"], "safety_blocked")
        self.assertFalse(body["safety"]["passed"])
        self.assertEqual(body["sources"], [])
        self.assertNotIn("combine these materials", body["answer"])
        self.assertIn("withheld", body["notice"])

    def test_answer_replaces_unusable_model_output_with_labeled_faq_answer(self) -> None:
        with patch.object(app.state, "answer_generator", UnusableAnswerGenerator()):
            response = self.client.post(
                "/api/v1/answer",
                json={
                    "question": (
                        "Okay, so, agar koi ladki ya female child ko abduct kar ke "
                        "rakh raha hai, toh DM ya Magistrate kya kar sakte hain? "
                        "What's the process, in english detail answer"
                    ),
                    "limit": 3,
                },
            )

        self.assertEqual(response.status_code, 200)
        body = response.json()
        self.assertEqual(body["generation_mode"], "retrieved_faq")
        self.assertEqual(body["sources"][0]["id"], "QA_001")
        self.assertIn("not usable", body["notice"])
        self.assertNotIn("thinking process", body["answer"].casefold())

    def test_answer_uses_stored_faq_answer_when_gemma_is_not_configured(self) -> None:
        with patch.object(app.state, "answer_generator", None):
            response = self.client.post(
                "/api/v1/answer",
                json={"question": "Okay, agar koi ladki ko abduct kar le toh magistrate kya kar sakte hain?"},
            )

        self.assertEqual(response.status_code, 200)
        body = response.json()
        self.assertEqual(body["generation_mode"], "retrieved_faq")
        self.assertTrue(body["answer"])
        self.assertEqual(body["answer"], body["sources"][0]["reference_answer"])
        self.assertIn("Stored FAQ answer", body["notice"])

    def test_answer_returns_clear_message_for_free_provider_rate_limit(self) -> None:
        with patch.object(app.state, "answer_generator", RateLimitedAnswerGenerator()):
            response = self.client.post(
                "/api/v1/answer",
                json={"question": "What can a magistrate do?"},
            )

        self.assertEqual(response.status_code, 429)
        self.assertIn("OpenRouter rate-limited", response.json()["detail"])
        self.assertIn("free-model request", response.json()["detail"])

    def test_transcribe_returns_text_and_dual_language_tags(self) -> None:
        fake_transcriber = FakeAudioTranscriber()
        with patch.object(app.state, "transcriber", fake_transcriber):
            response = self.client.post(
                "/api/v1/transcribe",
                files={"audio": ("question.webm", b"audio-bytes", "audio/webm")},
            )

        self.assertEqual(response.status_code, 200)
        body = response.json()
        self.assertEqual(body["text"], "नमस्ते, what is the process?")
        self.assertEqual(body["language_tags"], ["hi", "en"])
        self.assertTrue(body["is_code_mixed"])
        self.assertEqual(fake_transcriber.received_audio, b"audio-bytes")

    def test_transcribe_rejects_non_audio_uploads(self) -> None:
        response = self.client.post(
            "/api/v1/transcribe",
            files={"audio": ("question.txt", b"not audio", "text/plain")},
        )

        self.assertEqual(response.status_code, 415)

    def test_transcribe_rejects_empty_audio(self) -> None:
        with patch.object(app.state, "transcriber", FakeAudioTranscriber()):
            response = self.client.post(
                "/api/v1/transcribe",
                files={"audio": ("question.webm", b"", "audio/webm")},
            )

        self.assertEqual(response.status_code, 422)


if __name__ == "__main__":
    unittest.main()
    last_model = "openrouter/test-model:free"
