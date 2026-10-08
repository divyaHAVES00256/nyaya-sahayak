"""Keyword retrieval stage using BM25."""

import re

from rank_bm25 import BM25Okapi

from backend.retrieval.corpus import FAQ, faq_document


def tokenize(text: str) -> list[str]:
    """Split English and Devanagari text into lowercase words for BM25."""
    return re.findall(r"[^\W_]+", text.lower(), flags=re.UNICODE)


class BM25Search:
    """Find FAQ entries that share important words with the user's question."""

    def __init__(self, records: list[FAQ]) -> None:
        self.records = records
        # BM25 scores questions using their answers and citation metadata too.
        self._index = BM25Okapi([tokenize(faq_document(faq)) for faq in records])

    def search(self, question: str, limit: int) -> list[tuple[FAQ, float]]:
        """Return matching FAQs ordered by keyword relevance."""
        terms = tokenize(question)
        if not terms:
            return []

        scores = self._index.get_scores(terms)
        ordered = sorted(
            range(len(self.records)),
            key=lambda index: (-scores[index], self.records[index].id),
        )
        return [
            (self.records[index], float(scores[index]))
            for index in ordered[:limit]
            if scores[index] > 0
        ]
