import unittest

from backend.evaluation.answer_quality import (
    generate_review_data,
    score_review_data,
)
from backend.generation.openrouter import GenerationError, UnusableAnswerError


class FakeRetriever:
    def search(self, question: str, limit: int = 5) -> list[dict[str, object]]:
        return [
            {
                "id": "TRAIN_1",
                "query": "Related FAQ",
                "cited_act": "Example Act",
                "cited_sections": "Section 1",
                "reference_answer": "Grounded evidence text.",
            }
        ]


class FakeGenerator:
    last_model = "provider/fixed-model:free"

    def generate(
        self,
        question: str,
        evidence: list[dict[str, str | float]],
    ) -> str:
        if len(evidence) != 1:
            raise AssertionError("Grounded condition should receive the top FAQ.")
        return "Grounded answer."

    def generate_zero_shot(self, question: str) -> str:
        return "Zero-shot answer."


class ChangingModelGenerator(FakeGenerator):
    def __init__(self) -> None:
        self.calls = 0

    def _next_answer(self) -> str:
        self.calls += 1
        self.last_model = f"provider/model-{self.calls}:free"
        return "Answer."

    def generate(
        self,
        question: str,
        evidence: list[dict[str, str | float]],
    ) -> str:
        return self._next_answer()

    def generate_zero_shot(self, question: str) -> str:
        return self._next_answer()


class SometimesUnusableGenerator(FakeGenerator):
    def generate_zero_shot(self, question: str) -> str:
        raise UnusableAnswerError("Rejected planning output.")


class AnswerQualityEvaluationTests(unittest.TestCase):
    def setUp(self) -> None:
        self.test_rows = [
            {
                "id": "TEST_1",
                "query": "Question one?",
                "reference_answer": "Expected answer one.",
            },
            {
                "id": "TEST_2",
                "query": "Question two?",
                "reference_answer": "Expected answer two.",
            },
        ]

    def test_generation_randomizes_slots_and_keeps_condition_key_separate(self) -> None:
        review, key = generate_review_data(
            self.test_rows,
            FakeRetriever(),
            FakeGenerator(),
            limit=2,
            seed=42,
            requested_model="provider/fixed-model:free",
        )

        self.assertEqual(len(review), 2)
        self.assertEqual(len(key), 2)
        self.assertNotIn("condition", review[0])
        self.assertEqual(
            {key[0]["a_condition"], key[0]["b_condition"]},
            {"zero_shot", "grounded"},
        )
        for review_row, key_row in zip(review, key):
            self.assertEqual(review_row["case_id"], key_row["case_id"])
            self.assertEqual(review_row["retrieved_faq_id"], "TRAIN_1")

    def test_generator_model_changes_abort_the_paired_run(self) -> None:
        with self.assertRaisesRegex(GenerationError, "changed the actual model"):
            generate_review_data(
                self.test_rows[:1],
                FakeRetriever(),
                ChangingModelGenerator(),
                limit=1,
                seed=2,
                requested_model="provider/fixed-model:free",
            )

    def test_unusable_response_is_recorded_without_exposing_its_text(self) -> None:
        review, key = generate_review_data(
            self.test_rows[:1],
            FakeRetriever(),
            SometimesUnusableGenerator(),
            limit=1,
            seed=2,
            requested_model="provider/fixed-model:free",
        )
        review_row = review[0]
        self.assertTrue(
            (
                review_row["a_generation_status"] == "unusable_model_output"
                and review_row["answer_a"] == ""
            )
            or (
                review_row["b_generation_status"] == "unusable_model_output"
                and review_row["answer_b"] == ""
            )
        )
        self.assertNotIn("Rejected planning", str(review_row))
        self.assertEqual(key[0]["a_actual_model"], "provider/fixed-model:free")

    def test_metrics_report_reference_faithfulness_and_relative_reduction(self) -> None:
        review = [
            {
                "case_id": "TEST_1",
                "a_faithfulness_0_to_2": "1",
                "a_has_material_unsupported_claim": "yes",
                "a_answers_question": "yes",
                "b_faithfulness_0_to_2": "2",
                "b_has_material_unsupported_claim": "no",
                "b_answers_question": "yes",
            }
        ]
        key = [
            {
                "case_id": "TEST_1",
                "a_condition": "zero_shot",
                "b_condition": "grounded",
                "requested_model": "provider/fixed-model:free",
                "a_actual_model": "provider/fixed-model:free",
                "b_actual_model": "provider/fixed-model:free",
            }
        ]

        report = score_review_data(review, key)

        self.assertEqual(
            report["conditions"]["zero_shot"]["faithfulness_mean_0_to_1"],
            0.5,
        )
        self.assertEqual(
            report["conditions"]["grounded"]["faithfulness_mean_0_to_1"],
            1.0,
        )
        self.assertEqual(
            report["relative_unsupported_claim_reduction_percent"],
            100.0,
        )

    def test_mixed_actual_models_are_rejected(self) -> None:
        key = [
            {
                "case_id": "TEST_1",
                "a_condition": "zero_shot",
                "b_condition": "grounded",
                "requested_model": "provider/fixed-model:free",
                "a_actual_model": "provider/model-a:free",
                "b_actual_model": "provider/model-b:free",
            }
        ]
        with self.assertRaisesRegex(ValueError, "mixed model IDs"):
            score_review_data([{"case_id": "TEST_1"}], key)


if __name__ == "__main__":
    unittest.main()
