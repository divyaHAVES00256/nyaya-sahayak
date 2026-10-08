import unittest

from backend.evaluation.recall import (
    build_relevance_map,
    citations_for_row,
    normalize_citation,
)
from backend.retrieval.corpus import FAQ


class RecallEvaluationTests(unittest.TestCase):
    def test_citation_normalization_ignores_case_and_extra_spaces(self) -> None:
        self.assertEqual(
            normalize_citation("  ACT Name,  Section 12 "),
            "act name, section 12",
        )

    def test_semicolon_separated_citations_are_individual_labels(self) -> None:
        self.assertEqual(
            citations_for_row(
                {"cited_sections": "Act A, Section 1; Act B, Section 2"}
            ),
            {"act a, section 1", "act b, section 2"},
        )

    def test_relevance_map_links_only_exact_citation_entries(self) -> None:
        records = [
            FAQ("QA_1", "q1", "en", "law", "Act A", "a1", "Act A, Section 1", "factual"),
            FAQ("QA_2", "q2", "en", "law", "Act A", "a2", "Act A, Section 2", "factual"),
        ]

        relevant = build_relevance_map(records)

        self.assertEqual(relevant["act a, section 1"], {"QA_1"})
        self.assertNotIn("act a, section 3", relevant)


if __name__ == "__main__":
    unittest.main()
