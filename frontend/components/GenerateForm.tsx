"use client";

import { useState } from "react";
import type { OutputType, Difficulty } from "@/lib/api";

const OUTPUT_OPTIONS: { value: OutputType; label: string }[] = [
  { value: "flashcards", label: "Flashcards" },
  { value: "quiz", label: "Quiz" },
  { value: "active_recall", label: "Active Recall" },
];

const DIFFICULTY_OPTIONS: { value: Difficulty | ""; label: string }[] = [
  { value: "", label: "Mix" },
  { value: "easy", label: "Easy" },
  { value: "medium", label: "Medium" },
  { value: "hard", label: "Hard" },
];

interface GenerateFormProps {
  documentId: string;
  filename: string;
  onGenerate: (outputType: OutputType, difficulty: Difficulty | null, count: number) => void;
  generating: boolean;
}

export default function GenerateForm({
  documentId,
  filename,
  onGenerate,
  generating,
}: GenerateFormProps) {
  const [outputType, setOutputType] = useState<OutputType>("flashcards");
  const [difficulty, setDifficulty] = useState<Difficulty | "">("");
  const [count, setCount] = useState(5);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onGenerate(outputType, difficulty || null, count);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <p className="text-stone-400 text-sm">
        Generating from <span className="text-stone-200 font-medium">{filename}</span>
      </p>

      <div>
        <label className="block text-sm font-medium text-stone-300 mb-2">Output type</label>
        <div className="flex flex-wrap gap-2">
          {OUTPUT_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setOutputType(opt.value)}
              className={`
                px-4 py-2 rounded-lg text-sm font-medium transition-colors
                ${outputType === opt.value ? "bg-blue-600 text-white" : "bg-stone-800 text-stone-300 hover:bg-stone-700"}
              `}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-stone-300 mb-2">Difficulty</label>
        <div className="flex flex-wrap gap-2">
          {DIFFICULTY_OPTIONS.map((opt) => (
            <button
              key={opt.value || "mix"}
              type="button"
              onClick={() => setDifficulty(opt.value as Difficulty | "")}
              className={`
                px-4 py-2 rounded-lg text-sm font-medium transition-colors
                ${difficulty === opt.value ? "bg-blue-600 text-white" : "bg-stone-800 text-stone-300 hover:bg-stone-700"}
              `}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-stone-300 mb-2">Count (1–50)</label>
        <input
          type="number"
          min={1}
          max={50}
          value={count}
          onChange={(e) => setCount(Number(e.target.value) || 5)}
          className="w-24 px-3 py-2 rounded-lg bg-stone-800 border border-stone-600 text-stone-100 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
        />
      </div>

      <button
        type="submit"
        disabled={generating}
        className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-white transition-colors"
      >
        {generating ? "Generating…" : "Generate"}
      </button>

      {generating && (
        <div className="space-y-2" aria-live="polite">
          <div className="h-2 rounded-full bg-stone-800 border border-stone-700 indeterminate-bar" />
          <p className="text-xs text-stone-500">Thinking through your material…</p>
        </div>
      )}
    </form>
  );
}
