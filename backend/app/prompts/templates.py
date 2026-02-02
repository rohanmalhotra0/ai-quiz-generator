"""
AI prompt templates for flashcards, quizzes, and active recall.
Difficulty mapping:
  - easy: definitions, recall, direct facts
  - medium: application, examples, connections
  - hard: edge cases, synthesis, multi-concept
"""
from app.schemas import Difficulty, OutputType

# --- System prompts (role + behavior) ---

SYSTEM_FLASHCARDS = """You are a study assistant. Generate flashcards from the provided study material.
Output ONLY valid JSON. No markdown fences, no extra text. Follow the exact schema.
Each card must have: "front", "back", "difficulty" (easy|medium|hard), "source" (short reference to where in the material)."""

SYSTEM_QUIZ = """You are a study assistant. Generate multiple-choice quiz questions from the provided study material.
Output ONLY valid JSON. No markdown fences, no extra text. Follow the exact schema.
Each question must have: "question", "choices" (array of strings), "answer" (exact string matching one choice), "difficulty" (easy|medium|hard), "explanation"."""

SYSTEM_ACTIVE_RECALL = """You are a study assistant. Generate active-recall prompts (open-ended questions or tasks) from the provided study material.
Output ONLY valid JSON. No markdown fences, no extra text. Follow the exact schema.
Each item must have: "prompt", "expected_topics" (array of topics the answer should cover), "difficulty" (easy|medium|hard)."""

# --- Difficulty instructions (injected into user prompt) ---

DIFFICULTY_INSTRUCTIONS = {
    Difficulty.EASY: (
        "Focus on definitions, key terms, and direct recall. One concept per item."
    ),
    Difficulty.MEDIUM: (
        "Focus on application: examples, comparisons, and connecting concepts."
    ),
    Difficulty.HARD: (
        "Focus on edge cases, synthesis across topics, and multi-step reasoning."
    ),
}

# --- JSON schema strings for structured output (for model instructions) ---

FLASHCARD_JSON_SCHEMA = """JSON array of objects, each with:
  "front": string (question or term),
  "back": string (answer or definition),
  "difficulty": "easy" | "medium" | "hard",
  "source": string (short reference, e.g. "Section 2.1")"""

QUIZ_JSON_SCHEMA = """JSON array of objects, each with:
  "question": string,
  "choices": array of strings (typically 4 options),
  "answer": string (must exactly match one of the choices),
  "difficulty": "easy" | "medium" | "hard",
  "explanation": string"""

ACTIVE_RECALL_JSON_SCHEMA = """JSON array of objects, each with:
  "prompt": string (open-ended question or task),
  "expected_topics": array of strings (topics the answer should cover),
  "difficulty": "easy" | "medium" | "hard" """


def get_system_prompt(output_type: OutputType) -> str:
    """Return system prompt for the given output type."""
    if output_type == OutputType.FLASHCARDS:
        return SYSTEM_FLASHCARDS
    if output_type == OutputType.QUIZ:
        return SYSTEM_QUIZ
    if output_type == OutputType.ACTIVE_RECALL:
        return SYSTEM_ACTIVE_RECALL
    raise ValueError(f"Unknown output_type: {output_type}")


def get_json_schema(output_type: OutputType) -> str:
    """Return JSON schema description for the model."""
    if output_type == OutputType.FLASHCARDS:
        return FLASHCARD_JSON_SCHEMA
    if output_type == OutputType.QUIZ:
        return QUIZ_JSON_SCHEMA
    if output_type == OutputType.ACTIVE_RECALL:
        return ACTIVE_RECALL_JSON_SCHEMA
    raise ValueError(f"Unknown output_type: {output_type}")


def get_difficulty_instruction(difficulty: Difficulty | None) -> str:
    """Instruction string for difficulty; if None, ask for a mix."""
    if difficulty is None:
        return "Include a mix of easy, medium, and hard items."
    return DIFFICULTY_INSTRUCTIONS[difficulty]


def build_user_prompt(
    output_type: OutputType,
    context: str,
    count: int,
    difficulty: Difficulty | None,
) -> str:
    """Build the user prompt with context and parameters."""
    schema = get_json_schema(output_type)
    diff_instruction = get_difficulty_instruction(difficulty)
    return f"""Study material (excerpt):

---
{context}
---

Generate exactly {count} items. {diff_instruction}

Required format: {schema}

Return a single JSON object with key "items" and value the array of items. No other text."""
