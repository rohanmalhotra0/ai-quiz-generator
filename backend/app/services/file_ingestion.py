"""
File ingestion: accept PDF, TXT, MD; extract text; chunk content intelligently.
Clean separation from AI and API layers.
"""
import io
import re
import uuid
from pathlib import Path

from pypdf import PdfReader

# In-memory store for MVP (replace with DB or file store later)
_documents: dict[str, dict] = {}

ALLOWED_EXTENSIONS = {".pdf", ".txt", ".md"}
ALLOWED_CONTENT_TYPES = {
    "application/pdf",
    "text/plain",
    "text/markdown",
    "text/x-markdown",
}


def get_document(document_id: str) -> dict | None:
    """Return stored document by id, or None."""
    return _documents.get(document_id)


def extract_text_from_file(content: bytes, filename: str) -> str:
    """
    Extract plain text from uploaded file.
    Supports .pdf, .txt, .md.
    """
    suffix = Path(filename).suffix.lower()
    raw = content.decode("utf-8", errors="replace") if suffix in (".txt", ".md") else None

    if suffix == ".pdf":
        reader = PdfReader(io.BytesIO(content))
        parts = []
        for page in reader.pages:
            parts.append(page.extract_text() or "")
        text = "\n\n".join(parts)
    elif suffix in (".txt", ".md"):
        text = raw
    else:
        raise ValueError(f"Unsupported file type: {suffix}")

    return _normalize_text(text)


def _normalize_text(text: str) -> str:
    """Collapse whitespace and trim."""
    text = re.sub(r"\r\n", "\n", text)
    text = re.sub(r"[ \t]+", " ", text)
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()


def chunk_text(
    text: str,
    chunk_size: int = 1500,
    overlap: int = 200,
) -> list[str]:
    """
    Split text into overlapping chunks for context windows.
    Prefer breaking on paragraph/sentence boundaries when possible.
    """
    if not text or chunk_size <= 0:
        return []
    if len(text) <= chunk_size:
        return [text] if text.strip() else []

    chunks = []
    start = 0
    while start < len(text):
        end = start + chunk_size
        if end >= len(text):
            chunk = text[start:].strip()
            if chunk:
                chunks.append(chunk)
            break
        # Prefer break at paragraph or sentence
        search_region = text[end - overlap : end + 100]
        break_at = -1
        for sep in ("\n\n", "\n", ". ", " "):
            idx = search_region.rfind(sep)
            if idx != -1:
                break_at = idx + len(sep)
                break
        if break_at != -1:
            end = end - overlap + break_at
        chunk = text[start:end].strip()
        if chunk:
            chunks.append(chunk)
        start = end - overlap if end < len(text) else len(text)

    return chunks


def ingest_file(content: bytes, filename: str, chunk_size: int, chunk_overlap: int) -> dict:
    """
    Ingest a file: extract text, chunk, store by document_id.
    Returns document metadata for API response.
    """
    suffix = Path(filename).suffix.lower()
    if suffix not in ALLOWED_EXTENSIONS:
        raise ValueError(f"Unsupported file type. Allowed: {', '.join(ALLOWED_EXTENSIONS)}")

    text = extract_text_from_file(content, filename)
    chunks = chunk_text(text, chunk_size=chunk_size, overlap=chunk_overlap)

    document_id = str(uuid.uuid4())
    _documents[document_id] = {
        "document_id": document_id,
        "filename": filename,
        "full_text": text,
        "chunks": chunks,
        "total_chars": len(text),
    }

    return {
        "document_id": document_id,
        "filename": filename,
        "chunk_count": len(chunks),
        "total_chars": len(text),
    }
