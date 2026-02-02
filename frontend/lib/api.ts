const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export type OutputType = "flashcards" | "quiz" | "active_recall";
export type Difficulty = "easy" | "medium" | "hard";

export interface UploadResponse {
  document_id: string;
  filename: string;
  chunk_count: number;
  total_chars: number;
}

export interface GenerateRequest {
  document_id: string;
  output_type: OutputType;
  difficulty?: Difficulty | null;
  count?: number;
}

export interface GenerateResponse {
  output_type: OutputType;
  items: FlashcardItem[] | QuizItem[] | ActiveRecallItem[];
}

export interface FlashcardItem {
  front: string;
  back: string;
  difficulty: string;
  source: string;
}

export interface QuizItem {
  question: string;
  choices: string[];
  answer: string;
  difficulty: string;
  explanation: string;
}

export interface ActiveRecallItem {
  prompt: string;
  expected_topics: string[];
  difficulty: string;
}

export async function uploadFile(file: File): Promise<UploadResponse> {
  const form = new FormData();
  form.append("file", file);
  const res = await fetch(`${API_BASE}/upload`, {
    method: "POST",
    body: form,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || "Upload failed");
  }
  return res.json();
}

export async function generate(req: GenerateRequest): Promise<GenerateResponse> {
  const res = await fetch(`${API_BASE}/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      document_id: req.document_id,
      output_type: req.output_type,
      difficulty: req.difficulty ?? null,
      count: req.count ?? 5,
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || "Generation failed");
  }
  return res.json();
}
