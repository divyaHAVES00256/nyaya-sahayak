import unittest

import torch
from transformers import BertConfig, BertModel

from backend.training.mbert_dpr import SharedMbertDPR


class SharedMbertDPRTests(unittest.TestCase):
    def setUp(self) -> None:
        # A tiny random BERT keeps these unit tests fast and avoids model downloads.
        config = BertConfig(
            vocab_size=100,
            hidden_size=16,
            num_hidden_layers=2,
            num_attention_heads=2,
            intermediate_size=32,
        )
        self.model = SharedMbertDPR(BertModel(config))

    def test_freezing_keeps_only_requested_top_layer_trainable(self) -> None:
        self.model.freeze_lower_layers(trainable_last_layers=1)

        self.assertFalse(
            any(
                parameter.requires_grad
                for parameter in self.model.encoder.encoder.layer[0].parameters()
            )
        )
        self.assertTrue(
            all(
                parameter.requires_grad
                for parameter in self.model.encoder.encoder.layer[1].parameters()
            )
        )
        self.assertTrue(self.model.projection.weight.requires_grad)

    def test_encoder_returns_normalized_vectors(self) -> None:
        self.model.eval()
        tokens = {
            "input_ids": torch.tensor([[1, 4, 2], [1, 8, 2]]),
            "attention_mask": torch.ones((2, 3), dtype=torch.long),
            "token_type_ids": torch.zeros((2, 3), dtype=torch.long),
        }

        vectors = self.model.encode(tokens)

        self.assertEqual(tuple(vectors.shape), (2, 16))
        self.assertTrue(torch.allclose(vectors.norm(dim=1), torch.ones(2), atol=1e-5))

    def test_invalid_trainable_layer_count_is_rejected(self) -> None:
        with self.assertRaisesRegex(ValueError, "At least one"):
            self.model.freeze_lower_layers(trainable_last_layers=0)


if __name__ == "__main__":
    unittest.main()
