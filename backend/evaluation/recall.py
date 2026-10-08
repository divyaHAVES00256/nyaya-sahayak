"""Evaluate top-k FAQ retrieval using available test citations as weak labels."""

import argparse
import csv
from collections import defaultdict
from pathlib import Path

from backend.retrieval.corpus import FAQ, load_training_faqs
from backend.retrieval.pipeline import HybridFAQRetriever


PROJECT_ROOT = Path(__file__).resolve().parents[2]
DEFAULT_DATA = PROJECT_ROOT / "data" / "faqs.csv"


def normalize_citation(citation: str) -> str:
    """Normalize spaces and case while preserving citation wording and numbers."""
    return " ".join(citation.casefold().split())


def citations_for_row(row: dict[str, str]) -> set[str]:
    """Split the CSV's semicolon-separated citations into comparable entries."""
    return {
        normalize_citation(item)
        for item in row.get("cited_sections", "").split(";")
        if item.strip()
    }


def build_relevance_map(
    train_records: list[FAQ],
) -> dict[str, set[str]]:
    """Map each exact citation to train FAQ IDs carrying that same citation."""
    relevant_by_citation: dict[str, set[str]] = defaultdict(set)
    for faq in train_records:
        row = {"cited_sections": faq.cited_sections}
        for citation in citations_for_row(row):
            relevant_by_citation[citation].add(faq.id)
    return dict(relevant_by_citation)


def evaluate_recall_at_k(
    data_path: Path,
    retriever: HybridFAQRetriever,
    k: int = 5,
) -> dict[str, int | float]:
    """Measure citation-overlap Recall@k only where a test label can be linked."""
    if k < 1:
        raise ValueError("k must be at least 1")

    # Use the training rows as the searchable documents and gold-link source.
    train_records = load_training_faqs(data_path)
    relevance_by_citation = build_relevance_map(train_records)

    with data_path.open("r", encoding="utf-8-sig", newline="") as source:
        test_rows = [
            row
            for row in csv.DictReader(source)
            if (row.get("split") or "").strip().lower() == "test"
        ]

    evaluable = 0
    hits = 0
    for row in test_rows:
        # Citations provide only weak relevance labels; no chunk IDs are shared.
        gold_ids = set().union(
            *(
                relevance_by_citation.get(citation, set())
                for citation in citations_for_row(row)
            )
        )
        if not gold_ids:
            continue

        evaluable += 1
        results = retriever.search(row["query"], limit=k)
        if any(result["id"] in gold_ids for result in results):
            hits += 1

    return {
        "test_queries": len(test_rows),
        "evaluable_queries": evaluable,
        "unlabeled_queries": len(test_rows) - evaluable,
        "hits": hits,
        "k": k,
        "recall_at_k": hits / evaluable if evaluable else 0.0,
        "label_coverage": evaluable / len(test_rows) if test_rows else 0.0,
    }


def main() -> None:
    """Run the retrieval pipeline on test questions and print metric coverage."""
    parser = argparse.ArgumentParser(
        description="Evaluate hybrid retrieval using exact test/train citation overlap."
    )
    parser.add_argument("--data", type=Path, default=DEFAULT_DATA)
    parser.add_argument("--k", type=int, default=5)
    args = parser.parse_args()

    retriever = HybridFAQRetriever(args.data)
    results = evaluate_recall_at_k(args.data, retriever, k=args.k)

    print("Metric: citation-overlap Recall@k (weak relevance labels)")
    print(
        f"Recall@{results['k']}: {results['recall_at_k']:.3f} "
        f"({results['hits']}/{results['evaluable_queries']} evaluable queries)"
    )
    print(
        f"Label coverage: {results['label_coverage']:.1%} "
        f"({results['evaluable_queries']}/{results['test_queries']} test queries)"
    )
    print(f"Unlabeled test queries: {results['unlabeled_queries']}")
    print(
        "This small, citation-linked subset is not a standard corpus Recall@k "
        "and cannot substantiate the resume's legal-passage Recall@5 claim."
    )


if __name__ == "__main__":
    main()
