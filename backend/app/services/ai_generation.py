"""
AI generation: call OpenAI with prompt templates; return structured JSON.
Clean separation: uses file_ingestion for document/chunks, prompts for text.
"""
import json
import re

from openai import OpenAI

from app.config import settings
from app.prompts.templates import build_user_prompt, get_system_prompt
from app.schemas import OutputType, Difficulty
from app.services.file_ingestion import get_document


def _select_context(document: dict, requested_count: int) -> str:
    """Select chunks to send as context (stay within token limits). ~4 chars per token rough."""
    chunks = document.get("chunks") or []
    if not chunks:
        return document.get("full_text", "")[:8000]
    # Use first N chunks; could later use embedding similarity
    max_chars = 6000
    selected = []
    for c in chunks:
        if sum(len(s) for s in selected) + len(c) > max_chars:
            break
        selected.append(c)
    return "\n\n---\n\n".join(selected) if selected else document.get("full_text", "")[:8000]


def _parse_json_array(raw: str) -> list[dict]:
    """Extract a JSON array from model output; tolerate markdown code blocks."""
    text = raw.strip()
    # Remove optional markdown code block
    if text.startswith("```"):
        text = re.sub(r"^```(?:json)?\s*", "", text)
        text = re.sub(r"\s*```\s*$", "", text)
    return json.loads(text)


def generate(
    document_id: str,
    output_type: OutputType,
    count: int = 5,
    difficulty: Difficulty | None = None,
) -> list[dict]:
    """
    Generate flashcards, quiz questions, or active-recall prompts from a document.
    Returns list of dicts matching the appropriate schema (valid JSON).
    """
    api_key = settings.openai_api_key
    if not api_key:
        raise ValueError("OPENAI_API_KEY is not set. Set it in your environment or .env file.")

    document = get_document(document_id)
    if not document:
        raise ValueError(f"Document not found: {document_id}")

    context = _select_context(document, count)
    if not context.strip():
        raise ValueError("Document has no text content to generate from.")

    system_prompt = get_system_prompt(output_type)
    user_prompt = build_user_prompt(output_type, context, count, difficulty)

    client = OpenAI(api_key=api_key)
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
        response_format={"type": "json_object"},  # Ensures valid JSON
        temperature=0.6,
    )
    content = (response.choices[0].message.content or "").strip()
    if not content:
        raise ValueError("Model returned empty response.")

    try:
        parsed = json.loads(content)
    except json.JSONDecodeError:
        parsed = {"items": _parse_json_array(content)}
    if isinstance(parsed, list):
        items = parsed
    elif isinstance(parsed, dict):
        for key in ("items", "flashcards", "questions", "prompts"):
            if key in parsed and isinstance(parsed[key], list):
                items = parsed[key]
                break
        else:
            items = list(parsed.values())[0] if parsed else []
            if not isinstance(items, list):
                items = [parsed]
    else:
        items = []

    # Ensure each item has difficulty
    for item in items:
        if isinstance(item, dict) and "difficulty" not in item:
            item["difficulty"] = "medium"
    return items[:count]
