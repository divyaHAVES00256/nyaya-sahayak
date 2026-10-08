"""Create blinded paired answer reviews and score completed annotations."""

import argparse
import csv
import json
import random
from collections.abc import Mapping
from pathlib import Path
from typing import Protocol

from backend.generation.openrouter import (
    GenerationError,
    UnusableAnswerError,
    load_generator_from_env,
)
from backend.retrieval.pipeline import HybridFAQRetriever


PROJECT_ROOT = Path(__file__).resolve().parents[2]
DEFAULT_DATA = PROJECT_ROOT / "data" / "faqs.csv"
DEFAULT_REVIEW_OUTPUT = (
    PROJECT_ROOT / "backend" / "evaluation" / "runs" / "answer_quality_review.csv"
)
DEFAULT_KEY_OUTPUT = (
    PROJECT_ROOT / "backend" / "evaluation" / "runs" / "answer_quality_key.csv"
)
FAITHFULNESS_LABELS = {"0", "1", "2", "unsure", ""}
YES_NO_LABELS = {"yes", "no", "unsure", ""}

REVIEW_FIELDS = [
    "case_id",
    "question",
    "gold_reference_answer",
    "retrieved_faq_id",
    "retrieved_faq_query",
    "retrieved_faq_act",
    "retrieved_faq_citation",
    "retrieved_faq_answer",
    "answer_a",
    "a_generation_status",
    "answer_b",
    "b_generation_status",
    "a_answers_question",
    "a_faithfulness_0_to_2",
    "a_has_material_unsupported_claim",
    "b_answers_question",
    "b_faithfulness_0_to_2",
    "b_has_material_unsupported_claim",
    "reviewer_id",
    "reviewer_notes",
]
KEY_FIELDS = [
    "case_id",
    "a_condition",
    "b_condition",
    "requested_model",
    "a_actual_model",
    "b_actual_model",
]


class FAQRetriever(Protocol):
    """Search interface needed by the paired evaluation runner."""

    def search(self, question: str, limit: int = 5) -> list[dict[str, object]]: ...


class PairedGenerator(Protocol):
    """Generation interface needed by a paired run."""

    last_model: str | None

    def generate(
        self,
        question: str,
        evidence: list[dict[str, str | float]],
    ) -> str: ...

    def generate_zero_shot(self, question: str) -> str: ...


def generate_review_data(
    test_rows: list[dict[str, str]],
    retriever: FAQRetriever,
    generator: PairedGenerator,
    limit: int,
    seed: int,
    requested_model: str,
) -> tuple[list[dict[str, str]], list[dict[str, str]]]:
    """Generate blinded answer pairs and a separate condition/model key."""
    if limit < 1 or limit > len(test_rows):
        raise ValueError(f"Limit must be between 1 and {len(test_rows)}.")
    if not requested_model.endswith(":free"):
        raise ValueError("Evaluation requires one explicit fixed model ending in ':free'.")

    review_rows: list[dict[str, str]] = []
    key_rows: list[dict[str, str]] = []
    randomizer = random.Random(seed)
    shuffled_test_rows = list(test_rows)
    randomizer.shuffle(shuffled_test_rows)
    observed_model: str | None = None

    for row in shuffled_test_rows[:limit]:
        question = row["query"]
        candidates = retriever.search(question, limit=3)
        evidence = candidates[:1]
        condition_order = ["zero_shot", "grounded"]
        randomizer.shuffle(condition_order)
        answers: dict[str, str] = {}
        statuses: dict[str, str] = {}
        actual_models: dict[str, str] = {}

        for condition in condition_order:
            try:
                if condition == "grounded":
                    answer = generator.generate(question, evidence)
                else:
                    answer = generator.generate_zero_shot(question)
                statuses[condition] = "completed"
            except UnusableAnswerError:
                answer = ""
                statuses[condition] = "unusable_model_output"

            actual_model = generator.last_model
            if not actual_model:
                raise GenerationError(
                    "OpenRouter did not identify the actual model; "
                    "cannot verify a fixed-model evaluation."
                )
            if observed_model is None:
                observed_model = actual_model
            elif actual_model != observed_model:
                raise GenerationError(
                    "OpenRouter changed the actual model during the evaluation; "
                    "discard this run and retry with a model-specific ID."
                )
            answers[condition] = answer
            actual_models[condition] = actual_model

        evidence_faq = evidence[0] if evidence else {}
        condition_by_slot = {
            "a": condition_order[0],
            "b": condition_order[1],
        }
        review_rows.append(
            {
                "case_id": row["id"],
                "question": question,
                "gold_reference_answer": row["reference_answer"],
                "retrieved_faq_id": str(evidence_faq.get("id", "")),
                "retrieved_faq_query": str(evidence_faq.get("query", "")),
                "retrieved_faq_act": str(evidence_faq.get("cited_act", "")),
                "retrieved_faq_citation": str(evidence_faq.get("cited_sections", "")),
                "retrieved_faq_answer": str(evidence_faq.get("reference_answer", "")),
                "answer_a": answers[condition_by_slot["a"]],
                "a_generation_status": statuses[condition_by_slot["a"]],
                "answer_b": answers[condition_by_slot["b"]],
                "b_generation_status": statuses[condition_by_slot["b"]],
                "a_answers_question": "",
                "a_faithfulness_0_to_2": "",
                "a_has_material_unsupported_claim": "",
                "b_answers_question": "",
                "b_faithfulness_0_to_2": "",
                "b_has_material_unsupported_claim": "",
                "reviewer_id": "",
                "reviewer_notes": "",
            }
        )
        key_rows.append(
            {
                "case_id": row["id"],
                "a_condition": condition_by_slot["a"],
                "b_condition": condition_by_slot["b"],
                "requested_model": requested_model,
                "a_actual_model": actual_models[condition_by_slot["a"]],
                "b_actual_model": actual_models[condition_by_slot["b"]],
            }
        )

    return review_rows, key_rows


def score_review_data(
    review_rows: list[dict[str, str]],
    key_rows: list[dict[str, str]],
) -> dict[str, object]:
    """Summarize human judgments and paired unsupported-claim reduction."""
    key_by_id = {row["case_id"]: row for row in key_rows}
    if len(key_by_id) != len(key_rows):
        raise ValueError("The condition key contains duplicate case IDs.")
    if {row["case_id"] for row in review_rows} != set(key_by_id):
        raise ValueError("Review rows and condition key must contain matching case IDs.")

    requested_models = {row["requested_model"] for row in key_rows}
    actual_models = {
        model
        for row in key_rows
        for model in (row["a_actual_model"], row["b_actual_model"])
    }
    if len(requested_models) != 1 or len(actual_models) != 1:
        raise ValueError("Cannot score a paired evaluation with mixed model IDs.")

    totals: dict[str, dict[str, object]] = {
        "zero_shot": {
            "valid_outputs": 0,
            "unusable_outputs": 0,
            "faithfulness": [],
            "unsupported": [],
            "relevance": [],
        },
        "grounded": {
            "valid_outputs": 0,
            "unusable_outputs": 0,
            "faithfulness": [],
            "unsupported": [],
            "relevance": [],
        },
    }
    for review in review_rows:
        key = key_by_id[review["case_id"]]
        for slot in ("a", "b"):
            condition = key[f"{slot}_condition"]
            if condition not in totals:
                raise ValueError(f"Unknown condition in key: {condition!r}")
            group = totals[condition]
            status = review.get(f"{slot}_generation_status", "completed")
            if status == "unusable_model_output":
                group["unusable_outputs"] += 1
                continue
            if status != "completed":
                raise ValueError(
                    f"Invalid generation status for {slot.upper()}: {status!r}"
                )
            group["valid_outputs"] += 1
            _append_faithfulness(
                group["faithfulness"], review[f"{slot}_faithfulness_0_to_2"]
            )
            _append_yes_no(
                group["unsupported"],
                review[f"{slot}_has_material_unsupported_claim"],
            )
            _append_yes_no(group["relevance"], review[f"{slot}_answers_question"])

    paired_unsupported: dict[str, list[float]] = {
        "zero_shot": [],
        "grounded": [],
    }
    for review in review_rows:
        key = key_by_id[review["case_id"]]
        labels: dict[str, float | None] = {}
        for slot in ("a", "b"):
            condition = key[f"{slot}_condition"]
            if review.get(f"{slot}_generation_status", "completed") != "completed":
                labels[condition] = None
            else:
                labels[condition] = _yes_no_score(
                    review[f"{slot}_has_material_unsupported_claim"]
                )
        if all(labels[condition] is not None for condition in paired_unsupported):
            for condition, label in labels.items():
                if label is not None:
                    paired_unsupported[condition].append(label)

    metrics = {}
    for condition, group in totals.items():
        faithfulness_scores = group["faithfulness"]
        unsupported = group["unsupported"]
        relevance = group["relevance"]
        metrics[condition] = {
            "valid_outputs": group["valid_outputs"],
            "unusable_outputs": group["unusable_outputs"],
            "faithfulness_scored": len(faithfulness_scores),
            "faithfulness_mean_0_to_1": (
                sum(faithfulness_scores) / (2 * len(faithfulness_scores))
                if faithfulness_scores
                else None
            ),
            "unsupported_claims_scored": len(unsupported),
            "unsupported_claim_rate": (
                sum(unsupported) / len(unsupported) if unsupported else None
            ),
            "relevance_scored": len(relevance),
            "answers_question_rate": (
                sum(relevance) / len(relevance) if relevance else None
            ),
        }

    paired_baseline_rate = (
        sum(paired_unsupported["zero_shot"]) / len(paired_unsupported["zero_shot"])
        if paired_unsupported["zero_shot"]
        else None
    )
    paired_grounded_rate = (
        sum(paired_unsupported["grounded"]) / len(paired_unsupported["grounded"])
        if paired_unsupported["grounded"]
        else None
    )
    reduction_percent = (
        (paired_baseline_rate - paired_grounded_rate)
        / paired_baseline_rate
        * 100
        if paired_baseline_rate
        else None
    )
    return {
        "cases": len(review_rows),
        "requested_model": next(iter(requested_models)),
        "actual_model": next(iter(actual_models)),
        "conditions": metrics,
        "paired_unsupported_claims_scored": len(paired_unsupported["zero_shot"]),
        "paired_zero_shot_unsupported_claim_rate": paired_baseline_rate,
        "paired_grounded_unsupported_claim_rate": paired_grounded_rate,
        "relative_unsupported_claim_reduction_percent": reduction_percent,
        "metric_note": (
            "Human-rated agreement with dataset reference answers, not legal "
            "fact verification or a reproduction of the resume benchmark."
        ),
    }


def _append_faithfulness(target: list[float], value: str) -> None:
    normalized = value.strip().casefold()
    if normalized not in FAITHFULNESS_LABELS:
        raise ValueError(f"Invalid faithfulness label: {value!r}; use 0, 1, 2, or unsure.")
    if normalized in {"0", "1", "2"}:
        target.append(float(normalized))


def _append_yes_no(target: list[float], value: str) -> None:
    score = _yes_no_score(value)
    if score is not None:
        target.append(score)


def _yes_no_score(value: str) -> float | None:
    normalized = value.strip().casefold()
    if normalized not in YES_NO_LABELS:
        raise ValueError(f"Invalid yes/no label: {value!r}; use yes, no, or unsure.")
    if normalized in {"yes", "no"}:
        return 1.0 if normalized == "yes" else 0.0
    return None


def _read_csv(path: Path) -> list[dict[str, str]]:
    with path.open("r", encoding="utf-8-sig", newline="") as source:
        return list(csv.DictReader(source))


def _write_csv(path: Path, fields: list[str], rows: list[Mapping[str, str]]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8-sig", newline="") as destination:
        writer = csv.DictWriter(destination, fieldnames=fields)
        writer.writeheader()
        writer.writerows(rows)


def prepare_review(
    data_path: Path,
    model: str,
    limit: int,
    seed: int,
    review_output: Path,
    key_output: Path,
) -> None:
    """Generate held-out answer pairs and write separate blinded review files."""
    if review_output.resolve() == key_output.resolve():
        raise ValueError("Review output and condition-key paths must be different.")
    if review_output.exists() or key_output.exists():
        raise FileExistsError("An output file already exists; choose new paths.")

    test_rows = [
        row
        for row in _read_csv(data_path)
        if row.get("split", "").strip().casefold() == "test"
    ]
    if not test_rows:
        raise ValueError(f"No test-split questions were found in {data_path}.")
    retriever = HybridFAQRetriever(data_path)
    generator = load_generator_from_env(model_override=model)
    if generator is None:
        raise RuntimeError(
            "Set OPENROUTER_API_KEY in backend/.env before generating review answers."
        )

    review_rows, key_rows = generate_review_data(
        test_rows=test_rows,
        retriever=retriever,
        generator=generator,
        limit=limit,
        seed=seed,
        requested_model=model,
    )
    _write_csv(review_output, REVIEW_FIELDS, review_rows)
    _write_csv(key_output, KEY_FIELDS, key_rows)
    print(f"Generated {len(review_rows)} blinded question pairs.")
    print(f"Review file: {review_output}")
    print(f"Condition key (keep hidden until scoring): {key_output}")
    print(f"Verified model: {key_rows[0]['a_actual_model']}")
    print(
        "Provider requests used: "
        f"{len(review_rows) * 2}. Each pair contains one zero-shot and one grounded answer."
    )


def score_review(review_path: Path, key_path: Path) -> None:
    """Score completed annotations and print metrics with their denominators."""
    report = score_review_data(_read_csv(review_path), _read_csv(key_path))
    print(json.dumps(report, indent=2, ensure_ascii=False))
    print(
        "\nInterpretation: these are human ratings against dataset reference "
        "answers. They do not independently verify legal correctness and do not "
        "by themselves reproduce the resume's reported metrics."
    )


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Prepare blinded grounded-vs-zero-shot answer evaluations."
    )
    commands = parser.add_subparsers(dest="command", required=True)

    prepare = commands.add_parser("prepare", help="Generate answer pairs for review.")
    prepare.add_argument("--data", type=Path, default=DEFAULT_DATA)
    prepare.add_argument(
        "--model",
        required=True,
        help="One fixed OpenRouter model ID ending in :free; openrouter/free is not allowed.",
    )
    prepare.add_argument(
        "--limit",
        type=int,
        required=True,
        help="Number of held-out questions (each question uses two provider requests).",
    )
    prepare.add_argument("--seed", type=int, default=42)
    prepare.add_argument("--review-output", type=Path, default=DEFAULT_REVIEW_OUTPUT)
    prepare.add_argument("--key-output", type=Path, default=DEFAULT_KEY_OUTPUT)

    score = commands.add_parser("score", help="Summarize completed human annotations.")
    score.add_argument("--review", type=Path, required=True)
    score.add_argument("--key", type=Path, required=True)

    args = parser.parse_args()
    if args.command == "prepare":
        prepare_review(
            args.data,
            args.model,
            args.limit,
            args.seed,
            args.review_output,
            args.key_output,
        )
    else:
        score_review(args.review, args.key)


if __name__ == "__main__":
    main()
