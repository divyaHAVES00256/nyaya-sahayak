"""Fine-tune multilingual BERT for question-to-FAQ-answer retrieval."""

import argparse
import random
from pathlib import Path

import torch
from torch.nn import functional as F
from transformers import AutoTokenizer

from backend.retrieval.corpus import faq_passage, load_training_faqs
from backend.training.mbert_dpr import SharedMbertDPR


BASE_MODEL = "bert-base-multilingual-cased"
PROJECT_ROOT = Path(__file__).resolve().parents[2]
DEFAULT_DATA = PROJECT_ROOT / "data" / "faqs.csv"
DEFAULT_OUTPUT = PROJECT_ROOT / "backend" / "artifacts" / "mbert_dpr"


def parse_args() -> argparse.Namespace:
    """Read small, explicit training options from the command line."""
    parser = argparse.ArgumentParser(
        description="Train a shared-weight mBERT DPR-style FAQ retriever."
    )
    parser.add_argument("--data", type=Path, default=DEFAULT_DATA)
    parser.add_argument("--output", type=Path, default=DEFAULT_OUTPUT)
    parser.add_argument("--epochs", type=int, default=2)
    parser.add_argument("--batch-size", type=int, default=4)
    parser.add_argument("--max-length", type=int, default=128)
    parser.add_argument("--learning-rate", type=float, default=2e-5)
    parser.add_argument("--trainable-layers", type=int, default=1)
    parser.add_argument("--seed", type=int, default=42)
    return parser.parse_args()


def train(args: argparse.Namespace) -> None:
    """Train on CSV train rows using in-batch answers as contrastive negatives."""
    if args.epochs < 1 or args.batch_size < 2 or args.max_length < 8:
        raise ValueError("Use epochs >= 1, batch-size >= 2, and max-length >= 8")

    # A fixed seed makes shuffling and the initial training run reproducible.
    random.seed(args.seed)
    torch.manual_seed(args.seed)
    torch.set_num_threads(max(1, min(4, torch.get_num_threads())))
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

    records = load_training_faqs(args.data)
    tokenizer = AutoTokenizer.from_pretrained(BASE_MODEL)
    model = SharedMbertDPR.from_pretrained(BASE_MODEL)
    model.freeze_lower_layers(args.trainable_layers)
    model.to(device)

    # A question is paired with its own reference answer; other answers in the
    # same batch act as negatives for the contrastive objective.
    questions = [faq.query for faq in records]
    answers = [faq_passage(faq) for faq in records]
    optimizer = torch.optim.AdamW(
        [parameter for parameter in model.parameters() if parameter.requires_grad],
        lr=args.learning_rate,
    )

    for epoch in range(args.epochs):
        order = list(range(len(records)))
        random.shuffle(order)
        total_loss = 0.0
        step_count = 0
        model.train()

        for start in range(0, len(order), args.batch_size):
            batch_ids = order[start : start + args.batch_size]
            # In-batch negative training needs at least two different examples.
            if len(batch_ids) < 2:
                continue

            question_tokens = tokenizer(
                [questions[index] for index in batch_ids],
                padding=True,
                truncation=True,
                max_length=args.max_length,
                return_tensors="pt",
            ).to(device)
            answer_tokens = tokenizer(
                [answers[index] for index in batch_ids],
                padding=True,
                truncation=True,
                max_length=args.max_length,
                return_tensors="pt",
            ).to(device)

            optimizer.zero_grad(set_to_none=True)
            question_vectors = model.encode(question_tokens)
            answer_vectors = model.encode(answer_tokens)

            # The correct pair is on the diagonal; other answers are negatives.
            logits = question_vectors @ answer_vectors.T / 0.05
            targets = torch.arange(len(batch_ids), device=device)
            loss = (
                F.cross_entropy(logits, targets)
                + F.cross_entropy(logits.T, targets)
            ) / 2
            loss.backward()
            optimizer.step()

            total_loss += float(loss.detach())
            step_count += 1

        if not step_count:
            raise ValueError("Training data did not produce a batch of two examples")
        print(f"epoch {epoch + 1}/{args.epochs} - mean contrastive loss: {total_loss / step_count:.4f}")

    model.eval()
    model.save(args.output, tokenizer)
    print(f"Trained shared-weight mBERT DPR-style model saved to: {args.output}")
    print(f"Training pairs: {len(records)} | device: {device}")
    print("This loss is a training diagnostic, not a retrieval Recall@5 evaluation.")


def main() -> None:
    """Run the trainer and report invalid settings or model/data failures."""
    train(parse_args())


if __name__ == "__main__":
    main()
