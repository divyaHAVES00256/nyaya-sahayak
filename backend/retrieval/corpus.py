"""Load and validate FAQ rows used as searchable documents."""

import csv
from dataclasses import dataclass
from pathlib import Path


REQUIRED_COLUMNS = {
    "id",
    "query",
    "language",
    "domain",
    "cited_act",
    "reference_answer",
    "cited_sections",
    "question_type",
    "split",
}


@dataclass(frozen=True)
class FAQ:
    """The question, answer, and citation fields shown for a search result."""

    id: str
    query: str
    language: str
    domain: str
    cited_act: str
    reference_answer: str
    cited_sections: str
    question_type: str


def load_training_faqs(csv_path: Path) -> list[FAQ]:
    """Read only training rows so validation and test FAQs stay out of the index."""
    with csv_path.open("r", encoding="utf-8-sig", newline="") as source:
        reader = csv.DictReader(source)
        missing = REQUIRED_COLUMNS - set(reader.fieldnames or [])
        if missing:
            raise ValueError(
                f"FAQ CSV is missing required columns: {', '.join(sorted(missing))}"
            )

        records: list[FAQ] = []
        seen_ids: set[str] = set()
        for row in reader:
            if (row.get("split") or "").strip().lower() != "train":
                continue

            faq = FAQ(
                id=(row.get("id") or "").strip(),
                query=(row.get("query") or "").strip(),
                language=(row.get("language") or "").strip(),
                domain=(row.get("domain") or "").strip(),
                cited_act=(row.get("cited_act") or "").strip(),
                reference_answer=(row.get("reference_answer") or "").strip(),
                cited_sections=(row.get("cited_sections") or "").strip(),
                question_type=(row.get("question_type") or "").strip(),
            )
            if not faq.id or not faq.query or not faq.reference_answer:
                raise ValueError(
                    "Every training row must have an id, query, and reference_answer"
                )
            if faq.id in seen_ids:
                raise ValueError(f"Duplicate FAQ id in training rows: {faq.id}")

            seen_ids.add(faq.id)
            records.append(faq)

    if not records:
        raise ValueError(f"No training FAQs found in {csv_path}")
    return records


def faq_document(faq: FAQ) -> str:
    """Combine the question and FAQ text for keyword matching."""
    return " ".join(
        (
            faq.query,
            faq.reference_answer,
            faq.domain,
            faq.cited_act,
            faq.cited_sections,
        )
    )


def faq_passage(faq: FAQ) -> str:
    """Build a passage from the answer and citations, without copying the query."""
    return " ".join(
        (
            faq.reference_answer,
            faq.domain,
            faq.cited_act,
            faq.cited_sections,
        )
    )
