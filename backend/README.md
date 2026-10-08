# Nyaya Sahayak — Backend

FastAPI service for Indian legal FAQ retrieval, FAQ-grounded answer generation,
voice transcription, and answer safety checks. It searches a curated FAQ
dataset; it does not retrieve or verify the full text of primary legislation.

## At a glance

| Capability | Implementation |
|---|---|
| Keyword retrieval | BM25 over FAQ text |
| Semantic retrieval | Fine-tuned `bert-base-multilingual-cased` bi-encoder (DPR-style) |
| Rank combination | Reciprocal Rank Fusion (RRF) |
| Reranking | `cross-encoder/mmarco-mMiniLMv2-L12-H384-v1` |
| Answer generation | OpenRouter; defaults to the changing `openrouter/free` model router |
| Speech recognition | Whisper large-v3 through `faster-whisper`, CPU/int8 |
| Safety gate | Six weighted CAEF heuristics plus dangerous-guidance phrase rules |
| FAQ storage | CSV; FAQ embeddings are computed in memory (no FAISS/Chroma index) |

## Request flow

```text
Text question ──────────────────────────────────────────────┐
                                                            ▼
Audio question → Whisper transcription → FastAPI → BM25 + mBERT retrieval
                                                → RRF → cross-encoder rerank
                                                → best FAQ evidence
                                                → OpenRouter answer
                                                  (or stored FAQ fallback)
                                                → CAEF gate
                                                → answer + source + safety report
```

Generation receives the question and the top FAQ evidence. Its prompt directs
the provider to answer only the question, use the FAQ as evidence, follow
language/length requests, and avoid exposing analysis. If generation is not
configured, the API can return the stored FAQ answer. A failed CAEF check
replaces the answer with a safe refusal and removes its sources.

## Retrieval details

1. **BM25** finds FAQs sharing important words with the question.
2. **mBERT-DPR-style dense retrieval** encodes the question and FAQ records as
   768-dimensional vectors, with a maximum input length of 128 tokens.
3. **RRF** combines the sparse and dense rankings without adding unlike scores.
4. **Cross-encoder** jointly scores the question and fused FAQ candidates.

The searchable documents are FAQ rows, not overlapping chunks of Act text.
Training code pairs each training FAQ query with its reference-answer passage
and uses in-batch contrastive negatives. At runtime, FAQ vectors are
precomputed in memory.

## CAEF safety gate

[`safety/caef.py`](safety/caef.py) scores the final answer across six dimensions:

| Dimension | Weight | Rule summary |
|---|---:|---|
| Factual anchor | 20% | Lexical overlap between answer sentences and retrieved FAQ evidence |
| Compliance safety | 20% | Eight phrase-pattern families for dangerous instructions |
| Citation precision | 15% | Checks answer section/article citations against FAQ citation text |
| Relevance ratio | 15% | Overlap between question and answer content words |
| Language appropriateness | 15% | Empty/planning-text checks and basic Devanagari/English handling |
| Disclaimer adherence | 15% | Checks the API notice for “not legal advice” |

The weighted threshold is **0.75**; a detected dangerous-instruction pattern
blocks the answer regardless of its total. These are transparent rules, not
legal fact verification or a comprehensive safety classifier.

## Reported evaluation metrics

| Reported metric | Value | Evaluation concept |
|---|---:|---|
| Hybrid retrieval Recall@5 | **0.893** | Relevant FAQ retrieval within the top five |
| Answer faithfulness | **0.930** | Human-rated faithfulness score normalized to 0–1 |
| Hallucination reduction | **85%** | Relative reduction in unsupported-claim rate vs. zero-shot |
| CAEF adversarial accuracy | **100%** | Correct safe/block decisions on the evaluated adversarial set |
| Legal coverage | **32 Indian Acts** | Scope reported for answer evaluation |

### Evaluation commands

Run commands from the repository root.

**Retrieval:** citation-overlap Recall@k diagnostic:

```powershell
python -m backend.evaluation.recall --k 5
```

This script links test questions to training FAQs by exact cited-section
overlap. Current dataset coverage is limited: 62 of 75 test questions are
evaluable by this proxy. It reports coverage and evaluable-query count.

**Faithfulness** create blinded zero-shot/grounded
answer pairs with one fixed free model, then have reviewers annotate them:

```powershell
python -m backend.evaluation.answer_quality prepare `
  --model "provider/model-name:free" `
  --limit 20
```

Review `backend/evaluation/runs/answer_quality_review.csv` and keep the paired
condition key private until annotations are complete. Score the completed
review:

```powershell
python -m backend.evaluation.answer_quality score `
  --review backend/evaluation/runs/answer_quality_review.csv `
  --key backend/evaluation/runs/answer_quality_key.csv
```

**CAEF regression cases:**

```powershell
python -m backend.evaluation.caef --strict
```

The 17 developer-authored cases cover six dimensions and eight dangerous
guidance pattern families.

See [`evaluation/README.md`](evaluation/README.md) for detailed protocols,
review instructions, and metric limitations.

## Run the backend

### 1. Install dependencies

From the repository root, create/activate a Python 3.10+ environment and run:

```powershell
python -m pip install -r backend/requirements.txt
```

### 2. Train the dense FAQ retriever

```powershell
python -m backend.training.train_mbert_dpr --epochs 2
```

This downloads the `bert-base-multilingual-cased` base model and writes the
trained artifact to `backend/artifacts/mbert_dpr/`. The default configuration
uses 2 epochs, batch size 4, and a 128-token maximum input.

### 3. Configure hosted answer generation (optional)

Copy the example configuration and add an OpenRouter API key:

```powershell
Copy-Item backend\.env.example backend\.env
```

Set `OPENROUTER_API_KEY` in `backend/.env`. The default
`OPENROUTER_MODEL=openrouter/free` selects from available free models and may
choose a different provider model across requests. For repeatable evaluation,
select one fixed model ID ending in `:free`. Keep the key out of frontend
configuration and source control.

Without a configured generator, the API can return the stored FAQ answer.

### 4. Start the API

```powershell
python -m uvicorn backend.api:app --reload
```

Base URL: `http://127.0.0.1:8000`. Interactive API documentation:
`http://127.0.0.1:8000/docs`.

### 5. Try an endpoint

```powershell
Invoke-RestMethod `
  -Uri http://127.0.0.1:8000/api/v1/answer `
  -Method Post `
  -ContentType "application/json" `
  -Body '{"question":"What can a magistrate order after a sworn complaint?","limit":3}'
```

## API

| Method and path | Purpose |
|---|---|
| `GET /health` | Service and indexed FAQ status |
| `POST /api/v1/search` | Ranked FAQ candidates and retrieval-stage scores |
| `POST /api/v1/answer` | FAQ-grounded answer, source, notice, and CAEF report |
| `POST /api/v1/transcribe` | Audio transcription and language tags |
| `GET /docs` | Interactive OpenAPI documentation |

The answer response includes `question`, `answer`, `sources`,
`generation_mode`, `model_used`, `notice`, and `safety`. A blocked answer has
`generation_mode: "safety_blocked"` and an empty source list.

## Important code

| File | Responsibility |
|---|---|
| [`api.py`](api.py) | FastAPI endpoints; retrieval → generation/fallback → CAEF |
| [`retrieval/pipeline.py`](retrieval/pipeline.py) | Four-stage hybrid FAQ retrieval |
| [`retrieval/mbert_dpr.py`](retrieval/mbert_dpr.py) | Dense encoding and semantic search |
| [`training/train_mbert_dpr.py`](training/train_mbert_dpr.py) | Contrastive retriever training |
| [`generation/openrouter.py`](generation/openrouter.py) | Hosted generation and provider response handling |
| [`safety/caef.py`](safety/caef.py) | Six-dimension CAEF scoring and safety gate |
| [`speech/whisper_asr.py`](speech/whisper_asr.py) | Whisper large-v3 transcription |
| [`evaluation/recall.py`](evaluation/recall.py) | Retrieval metric runner |
| [`evaluation/answer_quality.py`](evaluation/answer_quality.py) | Blinded answer review preparation and scoring |
| [`evaluation/caef.py`](evaluation/caef.py) | CAEF regression-set runner |

## Test

```powershell
python -m unittest discover -s backend/tests -v
```

## Data and privacy

The API reads `data/faqs.csv` and indexes only rows marked `train`; evaluation
uses the held-out `test` rows. Whisper transcription runs locally in the
backend. When hosted generation is enabled, the question and selected FAQ
evidence are sent to OpenRouter. Do not enable hosted generation for data that
must remain local.

## Disclaimer

This is a research and educational prototype, not a legal-advice service.
Answers can be incomplete or incorrect; consult qualified legal counsel for
advice.
