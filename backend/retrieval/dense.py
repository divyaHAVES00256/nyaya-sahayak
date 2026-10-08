"""Dense retrieval stage backed by the fine-tuned mBERT DPR-style encoder."""

from pathlib import Path

from backend.retrieval.corpus import FAQ
from backend.retrieval.mbert_dpr import MbertDPRSearch


class DenseSearch:
    """Preserve the pipeline interface while using the trained mBERT bi-encoder."""

    def __init__(
        self,
        records: list[FAQ],
        model_dir: Path,
        device: str = "cpu",
    ) -> None:
        self.records = records
        self._search = MbertDPRSearch(records, model_dir=model_dir, device=device)

    def search(self, question: str, limit: int) -> list[tuple[FAQ, float]]:
        """Encode one query and return the closest FAQ documents."""
        return self._search.search(question, limit)
