import unittest
from types import SimpleNamespace

from backend.speech.whisper_asr import SpeechTranscriptionError, WhisperTranscriber


class FakeWhisperModel:
    """Mimic the small part of faster-whisper used by the transcriber."""

    def __init__(self, segments: list[object], info: object) -> None:
        self._segments = segments
        self._info = info
        self.received_audio = None

    def transcribe(self, audio: object, **kwargs: object) -> tuple[list[object], object]:
        self.received_audio = audio
        self.options = kwargs
        return self._segments, self._info


class WhisperTranscriberTests(unittest.TestCase):
    def test_mixed_hindi_and_english_scripts_get_both_language_tags(self) -> None:
        model = FakeWhisperModel(
            [SimpleNamespace(text=" नमस्ते, what is the process? ")],
            SimpleNamespace(language="hi", language_probability=0.91),
        )

        result = WhisperTranscriber(model).transcribe(b"audio")

        self.assertEqual(result["text"], "नमस्ते, what is the process?")
        self.assertEqual(result["language_tags"], ["hi", "en"])
        self.assertTrue(result["is_code_mixed"])
        self.assertEqual(result["language_probability"], 0.91)
        self.assertEqual(model.options, {"beam_size": 5, "vad_filter": True})

    def test_single_detected_language_gets_one_language_tag(self) -> None:
        model = FakeWhisperModel(
            [SimpleNamespace(text="Hello, how can I help?")],
            SimpleNamespace(language="en", language_probability=0.98),
        )

        result = WhisperTranscriber(model).transcribe(b"audio")

        self.assertEqual(result["language_tags"], ["en"])
        self.assertFalse(result["is_code_mixed"])

    def test_empty_audio_is_rejected_before_loading_model(self) -> None:
        with self.assertRaisesRegex(SpeechTranscriptionError, "empty"):
            WhisperTranscriber().transcribe(b"")

    def test_empty_transcription_reports_no_speech(self) -> None:
        model = FakeWhisperModel(
            [],
            SimpleNamespace(language="hi", language_probability=0.5),
        )

        with self.assertRaisesRegex(SpeechTranscriptionError, "No speech"):
            WhisperTranscriber(model).transcribe(b"audio")


if __name__ == "__main__":
    unittest.main()
