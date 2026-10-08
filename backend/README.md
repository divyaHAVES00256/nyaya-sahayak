# ⚖️ FAQ Hybrid Retrieval & Grounded Legal QA

> **A legal FAQ prototype with hybrid search, optional FAQ-grounded answer generation, and Hindi/Hinglish voice input.**

The project answers questions from a curated collection of Indian legal FAQs. It is a prototype: answers are based on FAQ entries, not a live search of primary legislation.

---

## ✨ What does this project do?

A user can ask a legal question such as:

> **“What can a magistrate do if someone abducts a girl?”**

The system then:

```text
                  👤 User Question
                        │
                        ▼
                  🔎 BM25 Search
                        │
                        ├──────────────┐
                        ▼              ▼
                  🧠 mBERT-DPR      Keyword Retrieval
                  (Dense Search)
                        │              │
                        └──────┬───────┘
                                ▼
                          🔗 RRF Fusion
                                │
                                ▼
                        🎯 Cross-Encoder
                            Reranking
                                │
                                ▼
                        📄 Best FAQ Evidence
                                │
                                ▼
                        🤖 OpenRouter free model
                        Grounded Generation
                                │
                                ▼
                        💬 Answer + Citation
```

The system currently supports:

- 🎙️ Hindi/Hinglish voice questions
- 📚 Citation-backed FAQ answers
- 🔊 Browser-based text-to-speech
- 🌐 Local REST API

---

# 📌 Resume Metrics and Current Validation

The numbers below are resume claims, not results reproduced by the current
backend evaluation code. The repository now includes workflows to measure
retrieval on available weak labels and prepare human-reviewed paired answer
evaluation.

| Resume claim | Current project evidence |
|---|---:|
| Retrieval Recall@5 = 0.893 | Not reproduced. Current weak diagnostic: 0/2 evaluable test queries; only 2 of 75 test questions have citation-overlap labels. |
| Faithfulness = 0.930; hallucination reduction = 85% | Not reproduced. See [paired human-review evaluation](evaluation/README.md#paired-answer-quality-review). |
| CAEF adversarial accuracy = 100% | Not verified; a heuristic CAEF prototype and selected unit tests exist, but not an independently labeled adversarial evaluation set. |
| Generation evaluation across 32 Acts | Not reproduced. The CSV contains 32 distinct Act labels overall; the held-out test split spans 21. |

The generated-answer evaluation is reference-relative human review, not legal
fact verification. It cannot be presented as reproducing the resume numbers
unless the original dataset, model/version, baseline, and scoring protocol are
available and matched.

---

# 🧠 How the Retrieval Pipeline Works

Instead of relying on a single search method, the system combines **four retrieval stages**.

### 1. 🔤 BM25 — Keyword Search

BM25 finds FAQs that contain important words from the user's question.

For example:

```text
Question:
"What can a magistrate do if someone abducts a girl?"

Important terms:
magistrate → abducts → girl
```

This works well when the question and FAQ use similar terminology.

---

### 2. 🧠 mBERT-DPR — Semantic Search

Keyword matching alone is not enough.

The system therefore uses a fine-tuned:

```text
bert-base-multilingual-cased
```

The model converts the question and FAQ text into **768-dimensional embeddings**.

This allows the system to find semantically similar questions even when they use different wording.

The encoder is trained contrastively using question-answer pairs from the training data.

> This is a **DPR-style prototype**, not a claim of a full independently trained dual-encoder DPR system.

---

### 3. 🔗 Reciprocal Rank Fusion

BM25 and dense retrieval produce different ranking scores, so directly adding their scores would be unreliable.

Instead, the system uses **Reciprocal Rank Fusion (RRF)**.

```text
BM25 Results
     +
mBERT Results
     ↓
   RRF
     ↓
Top 20 Candidates
```

RRF combines candidates based primarily on their **rank positions**.

---

### 4. 🎯 Cross-Encoder Reranking

The top 20 candidates are passed to:

```text
cross-encoder/mmarco-mMiniLMv2-L12-H384-v1
```

Unlike the initial retrieval models, the cross-encoder jointly processes:

```text
Question + Candidate FAQ
```

and produces a relevance score.

The final system returns up to **5 ranked FAQs**.

---

# 🤖 Grounded Answer Generation

After retrieval, the highest-ranked FAQ is used as evidence for answer generation.

```text
User Question
      ↓
Hybrid Retrieval
      ↓
Top FAQ Evidence
      ↓
OpenRouter free-model router
      ↓
Grounded Answer
      ↓
Citation + Disclaimer
```

The model is instructed to:

- Answer only the user's question
- Use the retrieved FAQ as evidence
- Follow requested language/length
- Avoid exposing reasoning
- Avoid unsupported information

If generation is unavailable, the system can fall back to the stored FAQ answer.

---

# Safety-checking status

The backend now runs a deterministic six-dimension CAEF prototype on every
final answer before returning it from `POST /api/v1/answer`. It uses the
documented weights (factual anchor 20%, compliance safety 20%, citation
precision 15%, relevance 15%, language appropriateness 15%, disclaimer
adherence 15%), with a selected block threshold of **0.75**. Detected
dangerous instructions are blocked regardless of the weighted score. Blocked
answers are replaced with a safe refusal, with no FAQ sources attached. A
small labeled regression set can be run with
`python -m backend.evaluation.caef --strict`.

The dimension scores are transparent **heuristics**, including lexical
overlap-based grounding and relevance; they are not legal fact verification.
The dangerous-guidance rules use eight explicit English/Hinglish phrase
patterns and can miss novel, indirect, or multilingual phrasing. The
17-case developer-authored regression set is not an independent adversarial
benchmark; the resume's **100% adversarial accuracy has not been reproduced**.

---

# 🎙️ Hindi / Hinglish Voice Input

The system also supports voice-based questions.

The frontend records audio and sends it to:

```text
POST /api/v1/transcribe
```

The backend uses:

**Whisper large-v3 + faster-whisper**

with CPU-compatible INT8 inference.

### Example

```text
🎙️ User speaks:
"Magistrate kisi girl ko abduct karne ke case mein kya kar sakta hai?"

                ↓

       Whisper large-v3

                ↓

      Transcribed Question

                ↓

       Hybrid Retrieval

                ↓

          AI Answer
```

The system supports Hindi + English code-switching.

It uses script-based tagging:

```text
Hindi Devanagari + English Latin
              ↓
       hi + en tags
```

> The tagging is script-based rather than word-level language identification. Romanized Hinglish may therefore not always receive both tags.

---

# 🔊 Text-to-Speech

The chat interface can read answers aloud using the browser's built-in **Text-to-Speech API**.

Features:

- 🔊 Read answer aloud
- ⏹️ Stop speaking
- ♿ Useful for accessibility

No separate neural TTS model is required.

---

# 🏗️ System Architecture

```text
                         ┌──────────────────┐
                         │     Frontend     │
                         │   React / Vite   │
                         └────────┬─────────┘
                                  │
                         User Question
                                  │
                                  ▼
                         ┌──────────────────┐
                         │    FastAPI       │
                         │      API         │
                         └────────┬─────────┘
                                  │
                  ┌───────────────┴───────────────┐
                  │                               │
                  ▼                               ▼
             BM25 Search                    mBERT-DPR
                  │                               │
                  └───────────────┬───────────────┘
                                  ▼
                              RRF Fusion
                                  │
                                  ▼
                         Cross-Encoder
                            Reranking
                                  │
                                  ▼
                           Top FAQ Evidence
                                  │
                                  ▼
                         OpenRouter free-model router
                                  │
                                  ▼
                       Grounded Answer + Citation
```

---

# 📊 Evaluation

Retrieval has a weak-label diagnostic; generated-answer quality has a paired
human-review workflow. No current workflow establishes the resume's reported
faithfulness, hallucination, or CAEF results.

### Retrieval

```text
Hybrid Retrieval
      ↓
BM25 + mBERT-DPR
      ↓
RRF
      ↓
Cross-Encoder
      ↓
See evaluation/README.md for weak-label result and limitations
```

### Generation

```text
Retrieved FAQ
      ↓
OpenRouter free-model router
      ↓
Grounded Answer
```

The CSV contains 32 distinct Act labels overall; the 75-question test split
covers 21. Faithfulness and unsupported-claim scoring require completion of
the [paired human-review workflow](evaluation/README.md#paired-answer-quality-review).

### Safety

The API applies CAEF to the final generated or stored answer. See
[Safety-checking status](#safety-checking-status) for dimensions, the threshold,
and current limitations.

---

# 🛠️ Tech Stack

| Area | Technology |
|---|---|
| Backend | FastAPI |
| Sparse Retrieval | BM25 |
| Dense Retrieval | mBERT / `bert-base-multilingual-cased` |
| Rank Fusion | RRF |
| Reranking | mMiniLM Cross-Encoder |
| Generation | OpenRouter free-model router (default) |
| LLM Gateway | OpenRouter |
| Speech Recognition | Whisper large-v3 |
| Speech Runtime | faster-whisper |
| Frontend | React + Vite |
| API Server | Uvicorn |
| Data | CSV FAQ dataset |
| Safety | No checker currently implemented |

---

# ⚡ Getting Started

## 1. Install dependencies

From the repository root:

```powershell
python -m pip install -r backend/requirements.txt
```

---

## 2. Train the mBERT-DPR model

```powershell
python -m backend.training.train_mbert_dpr --epochs 2
```

The first run downloads:

```text
bert-base-multilingual-cased
```

The trained model is stored in:

```text
backend/artifacts/mbert_dpr/
```

This directory is Git-ignored.

Default configuration:

```text
Epochs          → 2
Batch size      → 4
Max sequence    → 128 tokens
Embedding size  → 768
```

---

## 3. Test retrieval from the command line

```powershell
python backend/faq_search.py "What can a magistrate do if someone abducts a girl?"
```

---

## 4. Run tests

```powershell
python -m pip install -r backend/requirements-dev.txt

python -m unittest discover -s backend/tests -v
```

---

# 🌐 Start the API

Run from the repository root:

```powershell
python -m uvicorn backend.api:app --reload
```

The API will be available locally at:

```text
http://127.0.0.1:8000
```

### Useful endpoints

| Endpoint | Purpose |
|---|---|
| `GET /health` | Check API and indexed FAQ count |
| `POST /api/v1/search` | Retrieve ranked FAQ candidates |
| `POST /api/v1/answer` | Generate a grounded answer |
| `POST /api/v1/transcribe` | Convert voice to text |
| `/docs` | Interactive API documentation |

---

# 🔑 OpenRouter Setup

For free-model testing, the backend supports:

```text
openrouter/free
```

Create the backend environment file:

```powershell
if (-not (Test-Path backend\.env)) {
    Copy-Item backend\.env.example backend\.env
}

notepad backend\.env
```

Add:

```text
OPENROUTER_API_KEY=your_private_key
```

### Important

Keep the key inside:

```text
backend/.env
```

Do **not** put it in:

```text
frontend/.env
```

and never commit the real key to GitHub.

---

# 🆓 Free Model vs Gemma Evaluation

The project supports OpenRouter's automatic free-model router:

```text
OPENROUTER_MODEL=openrouter/free
```

The router automatically selects an available free model.

However, this means the runtime model can change.

The resume bullet names Gemma-3-12B, but the current runtime defaults to
`openrouter/free`, which may select a different model. Therefore, results from
the default router cannot substantiate a Gemma-specific benchmark. The
paired-review workflow requires a concrete free-model ID and records the
actual model returned for every answer.

If a fixed free model is configured, the backend only accepts model IDs ending in:

```text
:free
```

to prevent accidental paid-model selection.

---

# 💻 Start the Frontend

Keep the backend running and open another terminal:

```powershell
cd frontend
npm run dev
```

The Vite development server forwards:

```text
/api
/health
```

to:

```text
http://127.0.0.1:8000
```

So the frontend can communicate with the local FastAPI backend without additional CORS configuration.

---

# 🎙️ Voice Setup

The first time voice transcription is used, Whisper large-v3 will be downloaded.

⚠️ The model requires several GB of storage and CPU transcription can be slow on laptops.

Requirements:

- Browser microphone permission
- `MediaRecorder` support
- Maximum audio upload size: **25 MB**

Audio transcription happens locally through the backend and is not sent to OpenRouter during transcription.

Only the resulting text and retrieved FAQ evidence may be sent to OpenRouter when hosted generation is enabled.

---

# 📁 Project Structure

```text
project/
│
├── backend/
│   ├── api.py
│   ├── faq_search.py
│   ├── training/
│   │   └── train_mbert_dpr.py
│   │
│   ├── evaluation/
│   │   └── README.md
│   │
│   ├── tests/
│   ├── artifacts/
│   │   └── mbert_dpr/
│   │
│   ├── data/
│   │   └── faqs.csv
│   │
│   ├── .env.example
│   └── requirements.txt
│
├── frontend/
│   └── ...
│
└── README.md
```

---

# ⚠️ Limitations

This project is a **research/prototype system**, not a legal-advice platform.

### Retrieval

- The system retrieves FAQ entries rather than directly retrieving primary legal Act passages.
- The resume's Recall@5 of **0.893** has not been reproduced by the available weak-label diagnostic.
- The result should not be generalized to every legal question.

### Generation

- Generated answers depend on the retrieved FAQ evidence.
- The resume's faithfulness score of **0.930** and **85% hallucination reduction** have not been reproduced. A paired human-review workflow is documented in `backend/evaluation/README.md`.
- The model does not independently verify legal claims against primary legislation.
- AI-generated responses are not legal advice.

### Safety

- CAEF is implemented as a prototype heuristic gate; its six-dimension rules and selected test cases are covered by unit tests.
- The resume's **100% adversarial accuracy** is not established by those unit tests or an independently labeled adversarial evaluation set.

### Speech

- Whisper accuracy depends on microphone quality, accents, background noise, and language mixing.
- Hindi/Hinglish tagging is script-based.
- Romanized Hinglish may not always be detected as bilingual.

### Hosted Models

- OpenRouter's free-model availability can change.
- `openrouter/free` may select a different model from Gemma-3-12B.
- Provider failures are reported rather than silently replacing the response with another generated answer.

---

# 🎯 Project Highlights

### 🔎 Hybrid Retrieval
Combines **lexical + semantic search** rather than depending on one retrieval method.

### 🧠 Intelligent Reranking
Uses a cross-encoder to improve the ordering of retrieved FAQs.

### 🤖 Grounded Generation
Generates answers using retrieved FAQ evidence instead of relying entirely on the LLM's internal knowledge.

### 🛡️ Safety Layer
CAEF applies six weighted heuristic checks before an answer is returned.
Dangerous guidance patterns block an answer regardless of its total score.

### 🎙️ Hindi/Hinglish Support
Whisper large-v3 enables voice-based questions with code-switched language support.

### ♿ Accessibility
Browser TTS and voice interaction provide additional accessibility options.

---

# 📌 Important Evaluation Note

The resume figures (`Recall@5 = 0.893`, faithfulness `= 0.930`, `85%`
hallucination reduction, and `100%` CAEF accuracy across 32 Acts) have not
been reproduced by the current backend evaluation code. See
[`backend/evaluation/README.md`](evaluation/README.md) for what is currently
measured and the paired human-review procedure. CAEF's implementation is a
heuristic prototype; its resume accuracy claim remains unverified.

---

## ⚖️ Disclaimer

This project is intended for **research and educational purposes**.

The system retrieves and generates answers from a curated FAQ dataset and does not independently verify primary legal sources. AI-generated responses may contain errors and should not be treated as professional legal advice.