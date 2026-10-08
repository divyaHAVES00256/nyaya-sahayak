"""Load a fine-tuned mBERT bi-encoder and retrieve semantically similar FAQs."""

from pathlib import Path

import numpy as np
import torch
from safetensors.torch import load_file
from transformers import AutoModel, AutoTokenizer

from backend.retrieval.corpus import FAQ, faq_passage
from backend.training.mbert_dpr import SharedMbertDPR


class MbertDPRSearch:
    """Create question and FAQ vectors with the trained shared mBERT encoder."""

    def __init__(
        self,
        records: list[FAQ],
        model_dir: Path,
        device: str = "cpu",
        batch_size: int = 8,
        max_length: int = 128,
    ) -> None:
        if not (model_dir / "projection.safetensors").is_file():
            raise FileNotFoundError(
                f"Trained mBERT DPR artifact missing at {model_dir}. "
                "Run python -m backend.training.train_mbert_dpr first."
            )
        self.records = records
        self.device = torch.device(device)
        self.batch_size = batch_size
        self.max_length = max_length
        self.tokenizer = AutoTokenizer.from_pretrained(model_dir)
        self.model = SharedMbertDPR(AutoModel.from_pretrained(model_dir))

        # Restore the trained projection on top of the saved BERT encoder.
        projection = load_file(str(model_dir / "projection.safetensors"))
        self.model.projection.load_state_dict(projection)
        self.model.to(self.device)
        self.model.eval()

        # Precompute passage vectors once; each incoming query only needs one pass.
        documents = [faq_passage(faq) for faq in records]
        self._vectors = self._encode_texts(documents)

    def _encode_texts(self, texts: list[str]) -> np.ndarray:
        """Encode text in small batches to limit RAM use on a CPU-only machine."""
        vectors: list[np.ndarray] = []
        with torch.inference_mode():
            for start in range(0, len(texts), self.batch_size):
                tokens = self.tokenizer(
                    texts[start : start + self.batch_size],
                    padding=True,
                    truncation=True,
                    max_length=self.max_length,
                    return_tensors="pt",
                ).to(self.device)
                batch_vectors = self.model.encode(tokens)
                vectors.append(batch_vectors.cpu().numpy())
        return np.concatenate(vectors, axis=0)

    def search(self, question: str, limit: int) -> list[tuple[FAQ, float]]:
        """Return FAQ entries sorted by mBERT query-to-document cosine similarity."""
        query_vector = self._encode_texts([question])[0]
        scores = np.asarray(self._vectors @ query_vector, dtype=float)
        ordered = sorted(
            range(len(self.records)),
            key=lambda index: (-scores[index], self.records[index].id),
        )
        return [
            (self.records[index], float(scores[index]))
            for index in ordered[:limit]
        ]
