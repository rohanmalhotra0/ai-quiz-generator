# AI Quiz & Flashcard Generator

A file-based, AI-native study tool: upload PDF/TXT/Markdown, supply your OpenAI API key, and generate **flashcards**, **quiz questions**, and **active-recall prompts** as structured JSON.

## Project structure

```
Ai Quiz Maker/
├── backend/                  # FastAPI API
│   ├── app/
│   │   ├── main.py           # /upload, /generate
│   │   ├── config.py         # OPENAI_API_KEY, chunk size
│   │   ├── schemas.py        # Request/response and AI output schemas
│   │   ├── prompts/
│   │   │   └── templates.py  # AI prompt templates
│   │   └── services/
│   │       ├── file_ingestion.py  # PDF/TXT/MD extraction, chunking
│   │       └── ai_generation.py   # OpenAI, structured JSON
│   └── requirements.txt
├── frontend/                 # Next.js UI
│   ├── app/                  # Layout, page, globals
│   ├── components/           # FileUpload, GenerateForm, ResultsDisplay
│   ├── lib/api.ts            # uploadFile, generate
│   └── package.json
└── README.md
```

- **File ingestion**: accept `.pdf`, `.txt`, `.md`; extract text; chunk for context.
- **Text processing**: normalize whitespace; chunk with overlap and paragraph-aware splits.
- **AI prompting**: system + user prompts per output type; difficulty instructions.
- **Response formatting**: all AI outputs are valid JSON matching the schemas below.

## Setup

### Backend

1. **Python 3.10+** recommended.

2. **Create a virtualenv and install dependencies:**

   ```bash
   cd backend
   python -m venv .venv
   source .venv/bin/activate   # Windows: .venv\Scripts\activate
   pip install -r requirements.txt
   ```

3. **Set your OpenAI API key** (user supplies; never commit real keys):

   ```bash
   export OPENAI_API_KEY="sk-..."
   ```

   Or create a `.env` in `backend/`:

   ```
   OPENAI_API_KEY=sk-...
   ```

4. **Run the API:**

   ```bash
   uvicorn app.main:app --reload --app-dir .
   ```

   API base: `http://127.0.0.1:8000`. Docs: `http://127.0.0.1:8000/docs`.

### Frontend

1. **Node 18+** recommended.

2. **Install and run:**

   ```bash
   cd frontend
   npm install
   npm run dev
   ```

3. **Open** [http://localhost:3000](http://localhost:3000). The app talks to the backend at `http://localhost:8000` by default. To use another API URL, set:

   ```bash
   NEXT_PUBLIC_API_URL=http://localhost:8000
   ```

4. **Flow:** Drag-and-drop (or click) to upload a PDF, TXT, or Markdown file → choose output type (Flashcards / Quiz / Active Recall), difficulty (Mix / Easy / Medium / Hard), and count → Generate → view results (flip cards, answer quiz, read prompts).

## API usage

### 1. Upload a study file

- **Endpoint:** `POST /upload`
- **Body:** multipart form with `file` (PDF, TXT, or MD).
- **Response:** `document_id`, `filename`, `chunk_count`, `total_chars`.

Example (curl):

```bash
curl -X POST http://127.0.0.1:8000/upload -F "file=@notes.pdf"
```

Example response:

```json
{
  "document_id": "550e8400-e29b-41d4-a716-446655440000",
  "filename": "notes.pdf",
  "chunk_count": 4,
  "total_chars": 5200
}
```

Use `document_id` in the next step.

### 2. Generate content

- **Endpoint:** `POST /generate`
- **Body (JSON):**
  - `document_id` (required): from `/upload`
  - `output_type`: `"flashcards"` | `"quiz"` | `"active_recall"`
  - `difficulty` (optional): `"easy"` | `"medium"` | `"hard"`; omit for a mix
  - `count` (optional): 1–50, default 5

Example (curl):

```bash
curl -X POST http://127.0.0.1:8000/generate \
  -H "Content-Type: application/json" \
  -d '{"document_id": "550e8400-e29b-41d4-a716-446655440000", "output_type": "flashcards", "count": 5}'
```

Example response (flashcards):

```json
{
  "output_type": "flashcards",
  "items": [
    {
      "front": "What is X?",
      "back": "X is ...",
      "difficulty": "easy",
      "source": "Section 2.1"
    }
  ]
}
```

## How difficulty works

Difficulty controls **what kind of thinking** the model targets, not just vocabulary:

| Level   | Focus |
|--------|--------|
| **Easy**   | Definitions, key terms, direct recall. One concept per item. |
| **Medium**| Application: examples, comparisons, connecting concepts. |
| **Hard**  | Edge cases, synthesis across topics, multi-step reasoning. |

- If you omit `difficulty` in `/generate`, the API asks for a **mix** of easy, medium, and hard.
- All outputs include a `difficulty` field per item so the frontend can filter or label them.

## Structured output schemas

All AI responses are valid JSON.

**Flashcard**

```json
{
  "front": "string",
  "back": "string",
  "difficulty": "easy | medium | hard",
  "source": "string"
}
```

**Quiz question**

```json
{
  "question": "string",
  "choices": ["string"],
  "answer": "string",
  "difficulty": "easy | medium | hard",
  "explanation": "string"
}
```

**Active recall**

```json
{
  "prompt": "string",
  "expected_topics": ["string"],
  "difficulty": "easy | medium | hard"
}
```

## Next steps

- **Persistence**: Replace in-memory document store with a DB or file store for production.
