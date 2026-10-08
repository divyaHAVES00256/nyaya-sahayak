# Retrieval evaluation

Run from the repository root after training the mBERT retriever:

```powershell
python -m backend.evaluation.recall --k 5
```

The evaluator searches only the 358 `train` FAQ entries and scores questions
from the 75-row `test` split. Its only available relevance signal is exact
overlap in semicolon-separated `cited_sections`; it never treats the test
answer as a searchable document.

## Result interpretation

The CSV does not contain explicit query-to-training-FAQ relevance judgments,
and no test `chunk_id` occurs in the training split. Only the test questions
with at least one exact citation match in training can be scored; all remaining
questions are reported as unlabeled and excluded from the Recall@k denominator.

Current result for this prototype: **Recall@5 = 0.000 (0/2 evaluable
questions)**, with **2.7% label coverage (2/75 test questions)** and **73
unlabeled questions**. This is a diagnostic on a tiny weakly labeled subset,
not evidence of overall retrieval quality.

This citation-overlap score is a weak proxy. A shared citation does not
guarantee that two FAQs discuss the same legal provision in the same context.
Always report Recall@k with label coverage and the number of evaluable queries.
Do **not** present it as the resume's 0.893 Recall@5 unless a properly labeled
legal-passage benchmark reproduces that result. To measure the claimed metric,
provide held-out questions mapped to gold relevant legal passages (and search
those passages rather than only FAQ entries).

## CAEF rule-gate regression cases

Run the small, local CAEF case set from the repository root:

```powershell
python -m backend.evaluation.caef --strict
```

The evaluator compares both each case's expected score for its named dimension
and its expected pass/block result. The CSV includes safe informational
examples, negative examples for all eight dangerous-guidance pattern families,
and cases exercising the other CAEF dimensions. `--strict` returns a failing
exit status if a case differs from its labels.

These 17 developer-authored cases are a regression seed set, **not** an
independent or human-adjudicated adversarial benchmark. Their agreement rate
only describes these examples; do not use it to claim the resume's 100% CAEF
accuracy. The expected values document the intended behavior of these
particular cases, including that a single non-safety dimension scoring zero
does not necessarily block an answer under the weighted 0.75 threshold.

The current FAQ file also does not contain suitable reference judgments for
measuring generated-answer faithfulness or hallucination reduction. Those
generation metrics require reviewed question/evidence/answer examples and a
predefined scoring procedure; a successful model API call alone does not
validate them.

## Paired answer-quality review

The test split contains 75 questions with dataset reference answers, but those
answers are not human factuality labels. The workflow below exports blinded
pairs for human review; it does not automatically grade legal correctness.
It uses the same explicitly selected `:free` model for zero-shot and
FAQ-grounded generation and aborts if OpenRouter reports a different model.
The default free-model router (`openrouter/free`) is deliberately not accepted
because its selected model may change between requests.

Prepare a review set from the repository root:

```powershell
python -m backend.evaluation.answer_quality prepare `
  --model "provider/model-name:free" `
  --limit 20
```

Replace the example with a currently available fixed free model ID. The
backend reads `OPENROUTER_API_KEY` from `backend/.env`. Each question makes two
provider requests. For example, `--limit 20` uses 40 requests; preparing all 75
held-out questions uses 150 and may exceed free-tier daily limits. Review files
are written under the Git-ignored `backend/evaluation/runs/` directory by
default. If the model returns recognizable planning text, that answer is
discarded, marked `unusable_model_output`, and the rest of the run continues;
the rejected content is never written into the review file. Provider errors
(including rate limits) or model changes abort the run before final files are
written.

The prepare command sends held-out questions and (for the grounded condition)
the top retrieved FAQ evidence to OpenRouter. Do not use this workflow if that
data transfer is inappropriate for your deployment.

Share only `answer_quality_review.csv` with reviewers. It contains each
question, dataset reference answer, retrieved FAQ evidence, and randomized
answers A/B, but does not identify which answer is zero-shot or grounded.
Keep `answer_quality_key.csv` private until annotation is complete.
If an answer's generation status is `unusable_model_output`, leave that
answer's annotation fields blank; it is reported as a generation failure and
excluded from answer-quality and paired unsupported-claim metrics.

For each answer, annotate:

- `a_answers_question` / `b_answers_question`: `yes`, `no`, or `unsure`.
- `a_faithfulness_0_to_2` / `b_faithfulness_0_to_2`: `2` when relevant factual claims agree with and are
  supported by the supplied reference/evidence; `1` when mostly supported but
  materially incomplete or imprecise; `0` when a material claim is unsupported
  or contradicted; or `unsure`.
- `a_has_material_unsupported_claim` / `b_has_material_unsupported_claim`:
  `yes`, `no`, or `unsure`, using the
  supplied reference answer and retrieved evidence as the comparison standard.
- Optionally fill `reviewer_id` and `reviewer_notes`.

Have reviewers judge whether claims are supported by the provided benchmark
materials, not infer a fact from model wording alone. The score is reference-
relative; it is not independent legal verification. For stronger results,
have qualified reviewers adjudicate disagreements.

After annotation, score the review:

```powershell
python -m backend.evaluation.answer_quality score `
  --review backend/evaluation/runs/answer_quality_review.csv `
  --key backend/evaluation/runs/answer_quality_key.csv
```

The report includes faithfulness rating (mean 0-2 normalized to 0-1),
reference-relative unsupported-claim rate, answer relevance, counts/coverage,
and paired relative unsupported-claim reduction as a percentage:
`(zero-shot rate - grounded rate) / zero-shot rate * 100`.
The paired reduction includes only questions where both answers have a `yes`
or `no` unsupported-claim judgment; it is undefined when the zero-shot rate is
zero. Missing and `unsure` annotations are excluded from the relevant
denominators.

These results do not automatically reproduce the resume's `0.930` faithfulness
or `85%` hallucination-reduction figures. Those claims require the original
evaluation set, judge rubric, model/version (the current production default is
not fixed Gemma), and baseline methodology to be known and reproduced.
