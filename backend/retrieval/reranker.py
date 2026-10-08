"""Cross-encoder reranking stage for a small set of fused FAQ candidates."""

from sentence_transformers import CrossEncoder

from backend.retrieval.corpus import FAQ, faq_document


class FAQReranker:
    """Compare each query and FAQ together to refine their relevance order."""

    def __init__(self, model_name: str, device: str = "cpu") -> None:
        self._model = CrossEncoder(model_name, device=device)

    def rerank(self, question: str, candidates: list[FAQ]) -> list[tuple[FAQ, float]]:
        """Return candidate FAQs sorted by the cross-encoder's relevance logit."""
        if not candidates:
            return []

        # A cross-encoder reads both texts together, which is slower but more precise.
        pairs = [(question, faq_document(faq)) for faq in candidates]
        scores = self._model.predict(pairs, show_progress_bar=False)
        ranked = sorted(
            zip(candidates, scores),
            key=lambda item: (-float(item[1]), item[0].id),
        )
        return [(faq, float(score)) for faq, score in ranked]
