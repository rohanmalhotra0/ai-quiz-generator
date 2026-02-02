"""Request/response and AI output schemas. All AI outputs are valid JSON matching these."""
from enum import Enum
from typing import Literal

from pydantic import BaseModel, Field


class Difficulty(str, Enum):
    EASY = "easy"
    MEDIUM = "medium"
    HARD = "hard"


class OutputType(str, Enum):
    FLASHCARDS = "flashcards"
    QUIZ = "quiz"
    ACTIVE_RECALL = "active_recall"


# --- AI output schemas (structured JSON) ---


class FlashcardItem(BaseModel):
    front: str = Field(..., description="Question or term on the front")
    back: str = Field(..., description="Answer or definition on the back")
    difficulty: Literal["easy", "medium", "hard"]
    source: str = Field(..., description="Short reference to source in the material")


class QuizItem(BaseModel):
    question: str
    choices: list[str]
    answer: str = Field(..., description="Correct answer, must match one of choices")
    difficulty: Literal["easy", "medium", "hard"]
    explanation: str


class ActiveRecallItem(BaseModel):
    prompt: str = Field(..., description="Open-ended question or task")
    expected_topics: list[str] = Field(..., description="Topics the answer should cover")
    difficulty: Literal["easy", "medium", "hard"]


# --- API request/response ---


class GenerateRequest(BaseModel):
    output_type: OutputType
    difficulty: Difficulty | None = None  # None = mix of all
    count: int = Field(default=5, ge=1, le=50)
    document_id: str = Field(..., description="ID returned from /upload")


class UploadResponse(BaseModel):
    document_id: str
    filename: str
    chunk_count: int
    total_chars: int


class GenerateResponse(BaseModel):
    output_type: OutputType
    items: list[dict]  # List of FlashcardItem | QuizItem | ActiveRecallItem as dicts
