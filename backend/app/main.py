"""
FastAPI app: /upload and /generate endpoints.
Clean separation: routes delegate to file_ingestion and ai_generation.
"""
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.schemas import GenerateRequest, GenerateResponse, OutputType, UploadResponse
from app.services import ai_generation, file_ingestion

app = FastAPI(
    title="AI Quiz & Flashcard Generator",
    description="Upload study files, generate flashcards, quizzes, and active-recall prompts via OpenAI.",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/upload", response_model=UploadResponse)
async def upload(file: UploadFile = File(...)):
    """
    Upload a study file (PDF, TXT, or Markdown).
    Returns a document_id to use with /generate.
    """
    suffix = (file.filename or "").lower()
    if not any(suffix.endswith(ext) for ext in (".pdf", ".txt", ".md")):
        raise HTTPException(
            status_code=400,
            detail="Allowed types: .pdf, .txt, .md",
        )
    content = await file.read()
    if not content:
        raise HTTPException(status_code=400, detail="File is empty")
    try:
        result = file_ingestion.ingest_file(
            content,
            file.filename or "unknown",
            chunk_size=settings.chunk_size,
            chunk_overlap=settings.chunk_overlap,
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    return UploadResponse(**result)


@app.post("/generate", response_model=GenerateResponse)
async def generate(req: GenerateRequest):
    """
    Generate flashcards, quiz questions, or active-recall prompts from an uploaded document.
    Requires OPENAI_API_KEY set in the environment.
    """
    try:
        items = ai_generation.generate(
            document_id=req.document_id,
            output_type=req.output_type,
            count=req.count,
            difficulty=req.difficulty,
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    return GenerateResponse(output_type=req.output_type, items=items)
