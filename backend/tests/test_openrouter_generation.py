import json
import os
import unittest
from urllib.error import HTTPError
from unittest.mock import patch

from backend.generation.openrouter import (
    BACKEND_ENV_PATH,
    DEFAULT_FREE_MODEL,
    GenerationError,
    OpenRouterFreeGenerator,
    UnusableAnswerError,
    load_generator_from_env,
)


class FakeResponse:
    """A small context-managed response used to test the HTTP adapter."""

    def __init__(self, body: dict[str, object]) -> None:
        self._body = json.dumps(body).encode("utf-8")

    def __enter__(self) -> "FakeResponse":
        return self

    def __exit__(self, *_: object) -> None:
        return None

    def read(self) -> bytes:
        return self._body


class OpenRouterFreeGeneratorTests(unittest.TestCase):
    def setUp(self) -> None:
        self.generator = OpenRouterFreeGenerator(
            "https://openrouter.ai/api/v1/",
            "test-key",
            "provider/model:free",
        )

    @patch("backend.generation.openrouter.urlopen")
    def test_generate_sends_faq_evidence_and_extracts_answer(
        self,
        mock_urlopen: unittest.mock.MagicMock,
    ) -> None:
        mock_urlopen.return_value = FakeResponse(
            {
                "model": "provider/actual-free-model:free",
                "choices": [{"message": {"content": "The magistrate may act."}}],
            }
        )
        evidence = [
            {
                "id": "QA_001",
                "query": "What can a magistrate do?",
                "cited_act": "BNSS",
                "cited_sections": "Section 101",
                "reference_answer": "The magistrate may order release.",
                "score": 1.0,
            }
        ]

        answer = self.generator.generate("What can a magistrate do?", evidence)

        self.assertEqual(answer, "The magistrate may act.")
        request = mock_urlopen.call_args.args[0]
        self.assertEqual(
            request.full_url,
            "https://openrouter.ai/api/v1/chat/completions",
        )
        self.assertEqual(
            json.loads(request.data.decode("utf-8"))["model"],
            "provider/model:free",
        )
        self.assertEqual(self.generator.last_model, "provider/actual-free-model:free")
        payload = json.loads(request.data.decode("utf-8"))
        self.assertEqual(payload["reasoning"], {"exclude": True})
        self.assertEqual(payload["messages"][0]["role"], "system")
        prompt = payload["messages"][1]["content"]
        self.assertIn("Section 101", prompt)
        self.assertIn("The magistrate may order release.", prompt)
        self.assertIn("do not include analysis, reasoning", payload["messages"][0]["content"])

    @patch("backend.generation.openrouter.urlopen")
    def test_generate_rejects_model_planning_instead_of_returning_it(
        self,
        mock_urlopen: unittest.mock.MagicMock,
    ) -> None:
        mock_urlopen.return_value = FakeResponse(
            {
                "choices": [
                    {
                        "message": {
                            "content": (
                                "The user asks: What is the process? "
                                "Here's a thinking process: "
                                "Under Section 101, a Magistrate may act."
                            )
                        }
                    }
                ]
            }
        )

        with self.assertRaises(UnusableAnswerError):
            self.generator.generate("What is the process?", [])

    @patch("backend.generation.openrouter.urlopen")
    def test_generate_zero_shot_omits_faq_context(
        self,
        mock_urlopen: unittest.mock.MagicMock,
    ) -> None:
        mock_urlopen.return_value = FakeResponse(
            {
                "model": "provider/model:free",
                "choices": [{"message": {"content": "A general answer."}}],
            }
        )

        answer = self.generator.generate_zero_shot("What can a magistrate do?")

        self.assertEqual(answer, "A general answer.")
        payload = json.loads(mock_urlopen.call_args.args[0].data.decode("utf-8"))
        self.assertEqual(len(payload["messages"]), 2)
        self.assertIn("without external reference material", payload["messages"][0]["content"])
        self.assertEqual(
            payload["messages"][1]["content"],
            "Question:\nWhat can a magistrate do?",
        )
        self.assertEqual(self.generator.last_model, "provider/model:free")

    @patch("backend.generation.openrouter.urlopen")
    def test_provider_response_without_choices_is_an_explicit_error(
        self,
        mock_urlopen: unittest.mock.MagicMock,
    ) -> None:
        mock_urlopen.return_value = FakeResponse({"choices": []})

        with self.assertRaisesRegex(GenerationError, "no answer choices"):
            self.generator.generate("Question", [])

    @patch("backend.generation.openrouter.urlopen")
    def test_provider_response_reports_unexpected_content_type(
        self,
        mock_urlopen: unittest.mock.MagicMock,
    ) -> None:
        mock_urlopen.return_value = FakeResponse(
            {"choices": [{"message": {"content": None}}]}
        )

        with self.assertRaisesRegex(
            GenerationError,
            r"choices\[0\]\.message\.content' has type NoneType",
        ):
            self.generator.generate("Question", [])

    @patch("backend.generation.openrouter.urlopen")
    def test_provider_response_extracts_text_content_blocks(
        self,
        mock_urlopen: unittest.mock.MagicMock,
    ) -> None:
        mock_urlopen.return_value = FakeResponse(
            {
                "choices": [
                    {
                        "message": {
                            "content": [
                                {"type": "text", "text": "A magistrate "},
                                {"type": "text", "text": "may act."},
                            ]
                        }
                    }
                ]
            }
        )

        self.assertEqual(
            self.generator.generate("Question", []),
            "A magistrate may act.",
        )

    @patch("backend.generation.openrouter.urlopen")
    def test_provider_error_payload_is_identified_without_exposing_values(
        self,
        mock_urlopen: unittest.mock.MagicMock,
    ) -> None:
        mock_urlopen.return_value = FakeResponse(
            {"error": {"code": "provider_error", "message": "private detail"}}
        )

        with self.assertRaises(GenerationError) as raised:
            self.generator.generate("Question", [])

        self.assertIn("error fields: code, message", str(raised.exception))
        self.assertNotIn("private detail", str(raised.exception))

    @patch("backend.generation.openrouter.urlopen")
    def test_rate_limit_error_preserves_provider_status(
        self,
        mock_urlopen: unittest.mock.MagicMock,
    ) -> None:
        mock_urlopen.side_effect = HTTPError(
            "https://openrouter.ai/api/v1/chat/completions",
            429,
            "Too Many Requests",
            {},
            None,
        )

        with self.assertRaises(GenerationError) as raised:
            self.generator.generate("Question", [])

        self.assertEqual(raised.exception.status_code, 429)
        self.assertIn("HTTP 429", str(raised.exception))

    @patch.dict(os.environ, {}, clear=True)
    @patch("backend.generation.openrouter.load_dotenv")
    def test_generation_is_optional_when_provider_is_not_configured(
        self,
        mock_load_dotenv: unittest.mock.MagicMock,
    ) -> None:
        self.assertIsNone(load_generator_from_env())
        mock_load_dotenv.assert_called_once_with(BACKEND_ENV_PATH)

    @patch.dict(
        os.environ,
        {
            "OPENROUTER_API_BASE_URL": "https://openrouter.ai/api/v1",
            "OPENROUTER_API_KEY": "test-key",
            "OPENROUTER_MODEL": "provider/model:free",
        },
        clear=True,
    )
    @patch("backend.generation.openrouter.load_dotenv")
    @patch("backend.generation.openrouter.urlopen")
    def test_environment_configuration_uses_selected_free_model(
        self,
        mock_urlopen: unittest.mock.MagicMock,
        mock_load_dotenv: unittest.mock.MagicMock,
    ) -> None:
        mock_urlopen.return_value = FakeResponse(
            {
                "model": "provider/actual-free-model",
                "choices": [{"message": {"content": "Answer"}}],
            }
        )
        generator = load_generator_from_env()

        self.assertIsInstance(generator, OpenRouterFreeGenerator)
        assert generator is not None
        generator.generate("Question", [])
        request = mock_urlopen.call_args.args[0]
        self.assertEqual(
            json.loads(request.data.decode("utf-8"))["model"],
            "provider/model:free",
        )
        self.assertEqual(generator.last_model, "provider/actual-free-model")
        mock_load_dotenv.assert_called_once_with(BACKEND_ENV_PATH)

    def test_paid_model_ids_are_rejected_before_any_request(self) -> None:
        with self.assertRaisesRegex(ValueError, "openrouter/free"):
            OpenRouterFreeGenerator(
                "https://openrouter.ai/api/v1",
                "test-key",
                "google/gemma-3-12b-it",
            )

    @patch.dict(
        os.environ,
        {
            "OPENROUTER_API_KEY": "test-key",
        },
        clear=True,
    )
    @patch("backend.generation.openrouter.load_dotenv")
    @patch("backend.generation.openrouter.urlopen")
    def test_router_is_default_and_selects_a_free_model(
        self,
        mock_urlopen: unittest.mock.MagicMock,
        mock_load_dotenv: unittest.mock.MagicMock,
    ) -> None:
        mock_urlopen.return_value = FakeResponse(
            {
                "model": "provider/selected-free-model",
                "choices": [{"message": {"content": "Answer"}}],
            }
        )
        generator = load_generator_from_env()
        self.assertIsInstance(generator, OpenRouterFreeGenerator)
        assert generator is not None
        generator.generate("Question", [])
        request = mock_urlopen.call_args.args[0]
        self.assertEqual(
            json.loads(request.data.decode("utf-8"))["model"],
            DEFAULT_FREE_MODEL,
        )
        self.assertEqual(generator.last_model, "provider/selected-free-model")
        mock_load_dotenv.assert_called_once_with(BACKEND_ENV_PATH)

    def test_openrouter_free_router_is_rejected_for_non_openrouter_urls(self) -> None:
        with self.assertRaisesRegex(ValueError, "OpenRouter API URL"):
            OpenRouterFreeGenerator(
                "https://provider.example/v1",
                "test-key",
                "provider/model:free",
            )


if __name__ == "__main__":
    unittest.main()
