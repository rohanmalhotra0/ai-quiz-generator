"use client";

import { useState } from "react";
import FileUpload from "@/components/FileUpload";
import GenerateForm from "@/components/GenerateForm";
import ResultsDisplay from "@/components/ResultsDisplay";
import { uploadFile, generate, type OutputType, type Difficulty, type GenerateResponse } from "@/lib/api";

export default function Home() {
  const [documentId, setDocumentId] = useState<string | null>(null);
  const [filename, setFilename] = useState<string | null>(null);
  const [chunkCount, setChunkCount] = useState<number>(0);
  const [error, setError] = useState<string>("");
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<GenerateResponse | null>(null);

  const handleUploaded = (id: string, name: string, chunks: number) => {
    setDocumentId(id);
    setFilename(name);
    setChunkCount(chunks);
    setResult(null);
  };

  const handleGenerate = async (outputType: OutputType, difficulty: Difficulty | null, count: number) => {
    if (!documentId) return;
    setGenerating(true);
    setError("");
    try {
      const res = await generate({ document_id: documentId, output_type: outputType, difficulty, count });
      setResult(res);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Generation failed");
    } finally {
      setGenerating(false);
    }
  };

  const reset = () => {
    setDocumentId(null);
    setFilename(null);
    setChunkCount(0);
    setResult(null);
    setError("");
  };

  return (
    <div className="min-h-screen bg-stone-950">
      <header className="border-b border-stone-800">
        <div className="max-w-3xl mx-auto px-4 py-6">
          <h1 className="text-2xl font-semibold text-stone-100">AI Quiz Maker</h1>
          <p className="text-stone-500 text-sm mt-1">Upload a file, generate flashcards, quizzes, or active recall.</p>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8 space-y-10">
        {!documentId ? (
          <section>
            <h2 className="text-lg font-medium text-stone-200 mb-4">Upload study material</h2>
            <FileUpload
              uploadFile={uploadFile}
              onUploaded={handleUploaded}
              onError={setError}
            />
          </section>
        ) : (
          <>
            <section className="p-4 rounded-xl bg-stone-900/50 border border-stone-800">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-stone-300 font-medium">{filename}</p>
                  <p className="text-stone-500 text-sm">Chunks: {chunkCount}</p>
                </div>
                <button
                  type="button"
                  onClick={reset}
                  className="text-sm text-stone-500 hover:text-stone-300"
                >
                  Upload another
                </button>
              </div>
            </section>

            <section>
              <h2 className="text-lg font-medium text-stone-200 mb-4">Generate</h2>
              <GenerateForm
                documentId={documentId}
                filename={filename!}
                onGenerate={handleGenerate}
                generating={generating}
              />
            </section>
          </>
        )}

        {error && (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm">
            {error}
          </div>
        )}

        {result && (
          <section>
            <h2 className="text-lg font-medium text-stone-200 mb-4">Results</h2>
            <ResultsDisplay outputType={result.output_type} items={result.items} />
          </section>
        )}
      </main>
    </div>
  );
}
