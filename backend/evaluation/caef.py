"""Evaluate the CAEF rule gate against a small labeled CSV case set."""

import argparse
import csv
import sys
from collections import defaultdict
from pathlib import Path
from typing import Any

from backend.safety.caef import DIMENSION_WEIGHTS, evaluate_answer


PROJECT_ROOT = Path(__file__).resolve().parents[2]
DEFAULT_DATA = Path(__file__).with_name("caef_cases.csv")
REQUIRED_COLUMNS = {
    "case_id",
    "dimension_under_test",
    "expected_dimension_score",
    "expected_pass",
    "question",
    "answer",
    "evidence_query",
    "evidence_reference_answer",
    "cited_act",
    "cited_sections",
    "disclaimer",
}


def evaluate_caef_dataset(data_path: Path) -> dict[str, Any]:
    """Compare CAEF gate/dimension outputs with the labels in a CSV case set."""
    with data_path.open("r", encoding="utf-8-sig", newline="") as source:
        reader = csv.DictReader(source)
        missing_columns = REQUIRED_COLUMNS - set(reader.fieldnames or ())
        if missing_columns:
            raise ValueError(
                f"Dataset is missing required columns: {', '.join(sorted(missing_columns))}"
            )
        cases = list(reader)

    if not cases:
        raise ValueError("CAEF evaluation dataset must contain at least one case.")

    seen_ids: set[str] = set()
    dimension_totals: dict[str, dict[str, int]] = defaultdict(
        lambda: {"cases": 0, "matches": 0}
    )
    gate_matches = 0
    true_positive = true_negative = false_positive = false_negative = 0
    mismatches: list[str] = []

    for row_number, case in enumerate(cases, start=2):
        case_id = case["case_id"].strip()
        if not case_id or case_id in seen_ids:
            raise ValueError(
                f"Row {row_number} has a missing or duplicate case_id: {case_id!r}"
            )
        seen_ids.add(case_id)

        dimension = case["dimension_under_test"].strip()
        if dimension not in DIMENSION_WEIGHTS:
            raise ValueError(
                f"Row {row_number} uses unknown dimension {dimension!r}."
            )
        try:
            expected_dimension_score = float(case["expected_dimension_score"])
        except ValueError as error:
            raise ValueError(
                f"Row {row_number} has an invalid expected dimension score."
            ) from error
        if not 0 <= expected_dimension_score <= 1:
            raise ValueError(
                f"Row {row_number} expected dimension score must be between 0 and 1."
            )

        expected_pass_text = case["expected_pass"].strip().casefold()
        if expected_pass_text not in {"true", "false"}:
            raise ValueError(
                f"Row {row_number} expected_pass must be true or false."
            )
        expected_pass = expected_pass_text == "true"

        evidence = [
            {
                "query": case["evidence_query"],
                "reference_answer": case["evidence_reference_answer"],
                "cited_act": case["cited_act"],
                "cited_sections": case["cited_sections"],
            }
        ]
        result = evaluate_answer(
            question=case["question"],
            answer=case["answer"],
            evidence=evidence,
            disclaimer=case["disclaimer"],
        )
        actual_dimension_score = result.dimensions[dimension]
        dimension_matches = abs(
            actual_dimension_score - expected_dimension_score
        ) < 1e-9
        gate_matches_case = result.passed == expected_pass
        dimension_totals[dimension]["cases"] += 1
        dimension_totals[dimension]["matches"] += int(dimension_matches)
        gate_matches += int(gate_matches_case)

        if expected_pass and result.passed:
            true_positive += 1
        elif not expected_pass and not result.passed:
            true_negative += 1
        elif result.passed:
            false_positive += 1
        else:
            false_negative += 1

        if not dimension_matches or not gate_matches_case:
            mismatches.append(
                f"{case_id}: expected {dimension}={expected_dimension_score:.2f} "
                f"and passed={expected_pass}; got {dimension}="
                f"{actual_dimension_score:.2f} and passed={result.passed}"
            )

    total = len(cases)
    return {
        "cases": total,
        "gate_matches": gate_matches,
        "gate_accuracy": gate_matches / total,
        "dimension_totals": dict(dimension_totals),
        "true_positive": true_positive,
        "true_negative": true_negative,
        "false_positive": false_positive,
        "false_negative": false_negative,
        "mismatches": mismatches,
    }


def main() -> None:
    """Print gate and per-dimension agreement for the configured case set."""
    parser = argparse.ArgumentParser(
        description="Evaluate CAEF against a labeled CSV case set."
    )
    parser.add_argument("--data", type=Path, default=DEFAULT_DATA)
    parser.add_argument(
        "--strict",
        action="store_true",
        help="Exit with status 1 if any case differs from its labels.",
    )
    args = parser.parse_args()
    try:
        results = evaluate_caef_dataset(args.data)
    except (OSError, ValueError) as error:
        parser.error(str(error))

    print("CAEF labeled-case evaluation (not an independently validated benchmark)")
    print(f"Cases: {results['cases']}")
    print(
        f"Gate agreement: {results['gate_accuracy']:.1%} "
        f"({results['gate_matches']}/{results['cases']})"
    )
    print(
        "Expected pass/fail confusion counts: "
        f"TP={results['true_positive']} "
        f"TN={results['true_negative']} "
        f"FP={results['false_positive']} "
        f"FN={results['false_negative']}"
    )
    print("Per-dimension score agreement:")
    for dimension, values in sorted(results["dimension_totals"].items()):
        print(
            f"  {dimension}: {values['matches']}/{values['cases']} exact"
        )
    if results["mismatches"]:
        print("Mismatches:")
        for mismatch in results["mismatches"]:
            print(f"  - {mismatch}")
    print(
        "This developer-authored seed set measures only these examples; "
        "it does not substantiate the resume's 100% adversarial accuracy claim."
    )
    if args.strict and results["mismatches"]:
        sys.exit(1)


if __name__ == "__main__":
    main()
