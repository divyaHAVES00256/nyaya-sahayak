import csv
import unittest
from pathlib import Path
from tempfile import TemporaryDirectory

from backend.faq_search import FAQRetriever


PROJECT_ROOT = Path(__file__).resolve().parents[2]
FAQ_CSV = PROJECT_ROOT / "data" / "faqs.csv"


class FAQRetrieverTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        cls.retriever = FAQRetriever(FAQ_CSV)

    def test_index_uses_training_rows_only(self) -> None:
        with FAQ_CSV.open(encoding="utf-8-sig", newline="") as source:
            rows = list(csv.DictReader(source))
        expected_ids = {row["id"] for row in rows if row["split"] == "train"}

        self.assertEqual({faq.id for faq in self.retriever.records}, expected_ids)

    def test_exact_training_question_ranks_its_faq_first(self) -> None:
        faq = next(record for record in self.retriever.records if record.id == "QA_001")

        results = self.retriever.search(faq.query, limit=3)

        self.assertTrue(results)
        self.assertEqual(results[0]["id"], faq.id)
        self.assertEqual(results[0]["cited_act"], faq.cited_act)
        self.assertGreater(results[0]["score"], 0)

    def test_unmatched_words_return_no_candidates(self) -> None:
        self.assertEqual(
            self.retriever.search("zxqvplm notaword", limit=5),
            [],
        )

    def test_invalid_question_and_limit_are_rejected(self) -> None:
        with self.assertRaisesRegex(ValueError, "Question cannot be empty"):
            self.retriever.search("  ")
        with self.assertRaisesRegex(ValueError, "at least 1"):
            self.retriever.search("legal question", limit=0)

    def test_missing_required_columns_are_reported(self) -> None:
        with TemporaryDirectory() as temp_dir:
            csv_path = Path(temp_dir) / "bad.csv"
            csv_path.write_text("id,query,split\n", encoding="utf-8")

            with self.assertRaisesRegex(ValueError, "missing required columns"):
                FAQRetriever(csv_path)


if __name__ == "__main__":
    unittest.main()
