"""Command-line access to the BM25-only FAQ search baseline."""

import argparse
from dataclasses import asdict
from pathlib import Path

from backend.retrieval.bm25 import BM25Search
from backend.retrieval.corpus import load_training_faqs


class FAQRetriever:
    """Backward-compatible BM25-only retriever used for simple CLI searches."""

    def __init__(self, csv_path: Path) -> None:
        self.records = load_training_faqs(csv_path)
        self._search = BM25Search(self.records)

    def search(self, question: str, limit: int = 5) -> list[dict[str, str | float]]:
        """Return the highest-ranked FAQ candidates; scores are not confidence."""
        if not question.strip():
            raise ValueError("Question cannot be empty")
        if limit < 1:
            raise ValueError("Result limit must be at least 1")

        return [
            {**asdict(faq), "score": score}
            for faq, score in self._search.search(question, limit)
        ]


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Find likely matching FAQ entries using BM25 keyword search."
    )
    parser.add_argument("question", nargs="+", help="Question to search for")
    parser.add_argument("--limit", type=int, default=5, help="Maximum results (default: 5)")
    args = parser.parse_args()

    csv_path = Path(__file__).resolve().parents[1] / "data" / "faqs.csv"
    retriever = FAQRetriever(csv_path)
    results = retriever.search(" ".join(args.question), limit=args.limit)

    if not results:
        print("No FAQ candidates matched the question's words.")
        return

    print("BM25 scores rank candidates; they are not confidence or accuracy scores.\n")
    for rank, result in enumerate(results, start=1):
        print(f"{rank}. {result['id']} | {result['domain']} | score: {result['score']:.3f}")
        print(f"   Act: {result['cited_act']}")
        print(f"   Sections: {result['cited_sections']}")
        print(f"   Answer: {result['reference_answer']}\n")


if __name__ == "__main__":
    main()
