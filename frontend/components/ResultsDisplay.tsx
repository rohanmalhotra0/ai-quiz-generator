"use client";

import { useState } from "react";
import type { FlashcardItem, QuizItem, ActiveRecallItem } from "@/lib/api";
import type { OutputType } from "@/lib/api";

function DifficultyBadge({ d }: { d: string }) {
  const colors: Record<string, string> = {
    easy: "bg-emerald-500/20 text-emerald-300",
    medium: "bg-blue-500/20 text-blue-300",
    hard: "bg-rose-500/20 text-rose-300",
  };
  return (
    <span className={`px-2 py-0.5 rounded text-xs font-medium ${colors[d] ?? "bg-stone-600 text-stone-300"}`}>
      {d}
    </span>
  );
}

export function FlashcardsList({ items }: { items: FlashcardItem[] }) {
  const [flipped, setFlipped] = useState<Set<number>>(new Set());

  const toggle = (i: number) => {
    setFlipped((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  };

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {items.map((card, i) => (
        <button
          key={i}
          type="button"
          onClick={() => toggle(i)}
          className="text-left p-5 rounded-xl bg-stone-800/80 border border-stone-700 hover:border-stone-600 transition-colors min-h-[120px]"
        >
          <div className="flex justify-between items-start gap-2 mb-2">
            <DifficultyBadge d={card.difficulty} />
            {card.source && <span className="text-xs text-stone-500">{card.source}</span>}
          </div>
          <div className="text-stone-200">
            {flipped.has(i) ? (
              <p className="whitespace-pre-wrap">{card.back}</p>
            ) : (
              <p className="whitespace-pre-wrap">{card.front}</p>
            )}
          </div>
          <p className="text-xs text-stone-500 mt-2">Click to flip</p>
        </button>
      ))}
    </div>
  );
}

export function QuizList({ items }: { items: QuizItem[] }) {
  const [selected, setSelected] = useState<Record<number, string>>({});
  const [revealed, setRevealed] = useState<Set<number>>(new Set());

  const toggleReveal = (i: number) => {
    setRevealed((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  };

  return (
    <div className="space-y-8">
      {items.map((q, i) => (
        <div key={i} className="p-5 rounded-xl bg-stone-800/80 border border-stone-700">
          <div className="flex justify-between items-start gap-2 mb-3">
            <h3 className="font-medium text-stone-100">{q.question}</h3>
            <DifficultyBadge d={q.difficulty} />
          </div>
          <ul className="space-y-2 mb-4">
            {q.choices.map((choice, j) => (
              <li key={j}>
                {(() => {
                  const isRevealed = revealed.has(i);
                  const isSelected = selected[i] === choice;
                  const isCorrect = choice === q.answer;
                  const rowClass = isRevealed
                    ? isCorrect
                      ? "border-emerald-500/40 bg-emerald-500/10"
                      : isSelected
                        ? "border-rose-500/40 bg-rose-500/10"
                        : "border-stone-700 bg-stone-900/20"
                    : isSelected
                      ? "border-blue-500/40 bg-blue-500/10"
                      : "border-stone-700 hover:border-stone-600 bg-stone-900/20";
                  const textClass = isRevealed
                    ? isCorrect
                      ? "text-emerald-300"
                      : isSelected
                        ? "text-rose-300"
                        : "text-stone-200"
                    : "text-stone-200";

                  return (
                    <label className={`flex items-center gap-3 cursor-pointer rounded-lg px-3 py-2 border transition-colors ${rowClass}`}>
                  <input
                    type="radio"
                    name={`q-${i}`}
                    checked={selected[i] === choice}
                    onChange={() => setSelected((s) => ({ ...s, [i]: choice }))}
                    className="text-blue-500 focus:ring-blue-500"
                  />
                  <span className={`leading-snug ${textClass}`}>{choice}</span>
                </label>
                  );
                })()}
              </li>
            ))}
          </ul>
          {revealed.has(i) && (
            <div className="pt-3 border-t border-stone-700 space-y-2">
              {selected[i] ? (
                selected[i] === q.answer ? (
                  <p className="text-sm text-emerald-300">
                    <span className="font-medium">Correct.</span>
                  </p>
                ) : (
                  <p className="text-sm text-rose-300">
                    <span className="font-medium">Incorrect.</span> Correct answer:{" "}
                    <span className="text-stone-200">{q.answer}</span>
                  </p>
                )
              ) : (
                <p className="text-sm text-stone-400">No answer selected.</p>
              )}

              <p className="text-sm text-stone-400">
                <span className="text-stone-300 font-medium">Explanation:</span> {q.explanation}
              </p>
            </div>
          )}
          <button
            type="button"
            onClick={() => toggleReveal(i)}
            className="mt-3 text-sm text-blue-400 hover:text-blue-300"
          >
            {revealed.has(i) ? "Hide explanation" : "Show explanation"}
          </button>
        </div>
      ))}
    </div>
  );
}

export function ActiveRecallList({ items }: { items: ActiveRecallItem[] }) {
  return (
    <div className="space-y-6">
      {items.map((item, i) => (
        <div key={i} className="p-5 rounded-xl bg-stone-800/80 border border-stone-700">
          <div className="flex justify-between items-start gap-2 mb-3">
            <p className="text-stone-200 font-medium">{item.prompt}</p>
            <DifficultyBadge d={item.difficulty} />
          </div>
          {item.expected_topics?.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <span className="text-xs text-stone-500">Expected topics:</span>
              {item.expected_topics.map((t, j) => (
                <span key={j} className="px-2 py-1 rounded bg-stone-700/80 text-stone-300 text-xs">
                  {t}
                </span>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

interface ResultsDisplayProps {
  outputType: OutputType;
  items: FlashcardItem[] | QuizItem[] | ActiveRecallItem[];
}

export default function ResultsDisplay({ outputType, items }: ResultsDisplayProps) {
  if (items.length === 0) {
    return <p className="text-stone-500">No items generated.</p>;
  }

  if (outputType === "flashcards") {
    return <FlashcardsList items={items as FlashcardItem[]} />;
  }
  if (outputType === "quiz") {
    return <QuizList items={items as QuizItem[]} />;
  }
  return <ActiveRecallList items={items as ActiveRecallItem[]} />;
}
