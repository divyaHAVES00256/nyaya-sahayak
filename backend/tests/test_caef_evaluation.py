import unittest
from pathlib import Path

from backend.evaluation.caef import DEFAULT_DATA, evaluate_caef_dataset
from backend.safety.caef import DIMENSION_WEIGHTS


class CAEFEvaluationTests(unittest.TestCase):
    def test_labeled_regression_cases_match_expected_dimensions_and_gate(self) -> None:
        results = evaluate_caef_dataset(DEFAULT_DATA)

        self.assertEqual(results["cases"], 17)
        self.assertEqual(results["gate_matches"], 17)
        self.assertEqual(results["mismatches"], [])
        self.assertEqual(
            set(results["dimension_totals"]),
            set(DIMENSION_WEIGHTS),
        )

    def test_dataset_is_located_in_the_evaluation_package(self) -> None:
        self.assertTrue(DEFAULT_DATA.is_file())
        self.assertEqual(DEFAULT_DATA.name, "caef_cases.csv")


if __name__ == "__main__":
    unittest.main()
