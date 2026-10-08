"""Shared-weight multilingual BERT bi-encoder and contrastive training."""

from pathlib import Path

import torch
from torch import nn
from torch.nn import functional as F
from transformers import AutoModel


class SharedMbertDPR(nn.Module):
    """Encode questions and FAQ answers into the same normalized vector space."""

    def __init__(self, encoder: nn.Module) -> None:
        super().__init__()
        self.encoder = encoder
        hidden_size = encoder.config.hidden_size
        # Start with an identity map, then let contrastive training adapt the vector.
        self.projection = nn.Linear(hidden_size, hidden_size, bias=False)
        nn.init.eye_(self.projection.weight)

    def encode(self, tokens: dict[str, torch.Tensor]) -> torch.Tensor:
        """Use BERT's pooled [CLS] output as a normalized document/query vector."""
        result = self.encoder(**tokens, return_dict=True)
        pooled = result.pooler_output
        if pooled is None:
            pooled = result.last_hidden_state[:, 0]
        return F.normalize(self.projection(pooled), p=2, dim=1)

    def freeze_lower_layers(self, trainable_last_layers: int = 1) -> None:
        """Freeze most BERT weights to keep CPU fine-tuning within modest memory."""
        if trainable_last_layers < 1:
            raise ValueError("At least one transformer layer must remain trainable")

        for parameter in self.encoder.parameters():
            parameter.requires_grad = False

        layers = self.encoder.encoder.layer
        if trainable_last_layers > len(layers):
            raise ValueError(
                f"Requested {trainable_last_layers} layers, but BERT has {len(layers)}"
            )
        for layer in layers[-trainable_last_layers:]:
            for parameter in layer.parameters():
                parameter.requires_grad = True

        # Train the pooler and projection while keeping token embeddings fixed.
        if self.encoder.pooler is not None:
            for parameter in self.encoder.pooler.parameters():
                parameter.requires_grad = True
        for parameter in self.projection.parameters():
            parameter.requires_grad = True

    @classmethod
    def from_pretrained(cls, model_name: str) -> "SharedMbertDPR":
        """Initialize both retrieval roles from the multilingual BERT checkpoint."""
        return cls(AutoModel.from_pretrained(model_name))

    def save(self, output_dir: Path, tokenizer) -> None:
        """Save model and tokenizer so the retrieval API can load this trained model."""
        output_dir.mkdir(parents=True, exist_ok=True)
        self.encoder.save_pretrained(output_dir, safe_serialization=True)
        tokenizer.save_pretrained(output_dir)
        # Store the trained projection separately in a safe tensor format.
        from safetensors.torch import save_file

        save_file(
            {"weight": self.projection.weight.detach().cpu().contiguous()},
            str(output_dir / "projection.safetensors"),
        )
