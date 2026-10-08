"""Orchestrate the four FAQ retrieval stages."""

from dataclasses import asdict
from pathlib import Path

from backend.retrieval.bm25 import BM25Search
from backend.retrieval.corpus import load_training_faqs
from backend.retrieval.dense import DenseSearch
from backend.retrieval.fusion import reciprocal_rank_fusion
from backend.retrieval.reranker import FAQReranker


CROSS_ENCODER_MODEL = "cross-encoder/mmarco-mMiniLMv2-L12-H384-v1"
PROJECT_ROOT = Path(__file__).resolve().parents[2]
DEFAULT_M_BERT_MODEL_DIR = PROJECT_ROOT / "backend" / "artifacts" / "mbert_dpr"


class HybridFAQRetriever:
    """Run BM25, dense search, RRF fusion, and cross-encoder reranking in order."""

    def __init__(
        self,
        csv_path: Path,
        embedding_model: Path = DEFAULT_M_BERT_MODEL_DIR,
        cross_encoder_model: str = CROSS_ENCODER_MODEL,
        candidate_pool: int = 100,
        fused_pool: int = 20,
        device: str = "cpu",
    ) -> None:
        if candidate_pool < 1 or fused_pool < 1:
            raise ValueError("Candidate and fused pool sizes must be at least 1")

        self.records = load_training_faqs(csv_path)
        self._by_id = {faq.id: faq for faq in self.records}
        self._candidate_pool = candidate_pool
        self._fused_pool = fused_pool

        # Build the keyword and semantic indexes once, then reuse them per query.
        self._bm25 = BM25Search(self.records)
        self._dense = DenseSearch(self.records, embedding_model, device=device)
        self._reranker = FAQReranker(cross_encoder_model, device=device)

    def search(self, question: str, limit: int = 5) -> list[dict[str, str | float]]:
        """Return ranked FAQ records with per-stage scores for transparency."""
        if not question.strip():
            raise ValueError("Question cannot be empty")
        if limit < 1:
            raise ValueError("Result limit must be at least 1")

        # Stage 1: keyword search is strong for exact legal terms and section numbers.
        keyword_results = self._bm25.search(question, self._candidate_pool)

        # Stage 2: multilingual embeddings retrieve questions with similar meaning.
        dense_results = self._dense.search(question, self._candidate_pool)

        # Stage 3: RRF combines ranks without comparing incompatible score scales.
        keyword_ids = [faq.id for faq, _ in keyword_results]
        dense_ids = [faq.id for faq, _ in dense_results]
        fused_results = reciprocal_rank_fusion([keyword_ids, dense_ids])
        fused_ids = [faq_id for faq_id, _ in fused_results[: self._fused_pool]]

        # Stage 4: the cross-encoder jointly reads query and FAQ to refine the top set.
        reranked = self._reranker.rerank(
            question,
            [self._by_id[faq_id] for faq_id in fused_ids],
        )

        keyword_scores = {faq.id: score for faq, score in keyword_results}
        dense_scores = {faq.id: score for faq, score in dense_results}
        fusion_scores = dict(fused_results)
        return [
            {
                **asdict(faq),
                "score": cross_score,
                "bm25_score": keyword_scores.get(faq.id, 0.0),
                "dense_score": dense_scores.get(faq.id, 0.0),
                "rrf_score": fusion_scores[faq.id],
            }
            for faq, cross_score in reranked[:limit]
        ]

    def document_count(self) -> int:
        """Return how many FAQ entries were loaded into the retrieval indexes."""
        return len(self.records)
