"use client";

import { useState } from "react";
import { GraduationCap } from "lucide-react";
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
    <div className="relative min-h-screen bg-stone-950 overflow-x-hidden">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 left-1/2 h-[520px] w-[820px] -translate-x-1/2 rounded-full bg-blue-500/10 blur-3xl" />
        <div className="absolute -bottom-40 right-[-120px] h-[520px] w-[520px] rounded-full bg-indigo-500/10 blur-3xl" />
        <div className="absolute -bottom-48 left-[-120px] h-[520px] w-[520px] rounded-full bg-cyan-500/10 blur-3xl" />
      </div>

      <header className="sticky top-0 z-20 border-b border-stone-800/80 bg-stone-950/70 backdrop-blur">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-blue-500/90 to-indigo-500/90 ring-1 ring-white/10 grid place-items-center">
              <GraduationCap className="h-5 w-5 text-white/95" aria-hidden="true" />
            </div>
            <div>
              <p className="text-stone-100 font-semibold leading-tight">AI Quiz Maker</p>
              <p className="text-stone-500 text-xs leading-tight">Turn notes into practice questions fast.</p>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-sm">
            <a className="text-stone-400 hover:text-stone-200 transition-colors" href="#features">
              Features
            </a>
            <a className="text-stone-400 hover:text-stone-200 transition-colors" href="#how">
              How it works
            </a>
            <a className="text-stone-400 hover:text-stone-200 transition-colors" href="#try">
              Try it
            </a>
          </nav>

          <a
            href="#try"
            className="inline-flex items-center justify-center px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 transition-colors text-white text-sm font-medium"
          >
            Get started
          </a>
        </div>
      </header>

      <main className="relative">
        <section className="max-w-6xl mx-auto px-4 pt-14 pb-10">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-stone-900/60 border border-stone-800 text-stone-300 text-xs">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                Works with PDF, TXT, and Markdown
              </div>

              <h1 className="mt-5 text-4xl sm:text-5xl font-semibold tracking-tight text-stone-50 text-balance">
                Study smarter with instant quizzes, flashcards, and active recall.
              </h1>
              <p className="mt-4 text-stone-400 text-lg text-balance">
                Upload your material and generate high-quality practice questions in seconds. Great for midterms, finals, and
                interview prep.
              </p>

              <div className="mt-7 flex flex-col sm:flex-row gap-3">
                <a
                  href="#try"
                  className="inline-flex items-center justify-center px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 transition-colors text-white font-medium"
                >
                  Try it now
                </a>
                <a
                  href="#how"
                  className="inline-flex items-center justify-center px-5 py-3 rounded-xl bg-stone-900/60 border border-stone-800 hover:border-stone-700 transition-colors text-stone-200 font-medium"
                >
                  See how it works
                </a>
              </div>

              <div className="mt-8 grid grid-cols-3 gap-3">
                <div className="p-4 rounded-2xl bg-stone-900/40 border border-stone-800">
                  <p className="text-stone-100 font-semibold">3</p>
                  <p className="text-stone-500 text-xs mt-1">Output modes</p>
                </div>
                <div className="p-4 rounded-2xl bg-stone-900/40 border border-stone-800">
                  <p className="text-stone-100 font-semibold">1–50</p>
                  <p className="text-stone-500 text-xs mt-1">Items per run</p>
                </div>
                <div className="p-4 rounded-2xl bg-stone-900/40 border border-stone-800">
                  <p className="text-stone-100 font-semibold">Mix</p>
                  <p className="text-stone-500 text-xs mt-1">Difficulty option</p>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="rounded-3xl bg-gradient-to-b from-stone-900/70 to-stone-950/60 border border-stone-800 overflow-hidden">
                <div className="p-6 border-b border-stone-800">
                  <p className="text-stone-100 font-medium">Preview</p>
                  <p className="text-stone-500 text-sm mt-1">What you’ll generate from your notes.</p>
                </div>
                <div className="p-6 space-y-4">
                  <div className="p-4 rounded-2xl bg-stone-900/60 border border-stone-800">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-xs px-2 py-0.5 rounded bg-blue-500/15 text-blue-300">quiz</span>
                      <span className="text-xs text-stone-500">medium</span>
                    </div>
                    <p className="mt-3 text-stone-200 font-medium">What is overfitting in machine learning?</p>
                    <p className="mt-2 text-stone-500 text-sm">
                      When a model learns noise and performs poorly on unseen data.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-stone-900/60 border border-stone-800">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-xs px-2 py-0.5 rounded bg-indigo-500/15 text-indigo-300">flashcard</span>
                      <span className="text-xs text-stone-500">easy</span>
                    </div>
                    <p className="mt-3 text-stone-200 font-medium">Front</p>
                    <p className="mt-1 text-stone-500 text-sm">Define “gradient descent”.</p>
                    <div className="mt-3 h-px bg-stone-800" />
                    <p className="mt-3 text-stone-200 font-medium">Back</p>
                    <p className="mt-1 text-stone-500 text-sm">
                      An optimization method that iteratively reduces a loss function.
                    </p>
                  </div>
                </div>
              </div>

              <div className="absolute -inset-2 -z-10 rounded-[28px] bg-gradient-to-r from-blue-500/15 via-indigo-500/10 to-cyan-500/15 blur-xl" />
            </div>
          </div>
        </section>

        <section id="features" className="max-w-6xl mx-auto px-4 py-12">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold text-stone-100">Everything you need to practice</h2>
              <p className="text-stone-500 mt-2">Designed for quick loops: generate → study → repeat.</p>
            </div>
          </div>

          <div className="mt-8 grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-6 rounded-2xl bg-stone-900/40 border border-stone-800">
              <p className="text-stone-100 font-medium">Multiple formats</p>
              <p className="text-stone-500 text-sm mt-2">Flashcards, quizzes, and active recall prompts from the same file.</p>
            </div>
            <div className="p-6 rounded-2xl bg-stone-900/40 border border-stone-800">
              <p className="text-stone-100 font-medium">Difficulty control</p>
              <p className="text-stone-500 text-sm mt-2">Mix or target easy/medium/hard questions to match your prep.</p>
            </div>
            <div className="p-6 rounded-2xl bg-stone-900/40 border border-stone-800">
              <p className="text-stone-100 font-medium">Fast iteration</p>
              <p className="text-stone-500 text-sm mt-2">Generate up to 50 items per run, then rerun with new settings.</p>
            </div>
            <div className="p-6 rounded-2xl bg-stone-900/40 border border-stone-800">
              <p className="text-stone-100 font-medium">Clean results UI</p>
              <p className="text-stone-500 text-sm mt-2">Flip flashcards, reveal quiz explanations, and skim recall prompts.</p>
            </div>
            <div className="p-6 rounded-2xl bg-stone-900/40 border border-stone-800">
              <p className="text-stone-100 font-medium">Drag & drop</p>
              <p className="text-stone-500 text-sm mt-2">Upload PDFs and text files with a simple dropzone.</p>
            </div>
            <div className="p-6 rounded-2xl bg-stone-900/40 border border-stone-800">
              <p className="text-stone-100 font-medium">Made for students</p>
              <p className="text-stone-500 text-sm mt-2">Best for notes, lectures, chapters, and cheat sheets.</p>
            </div>
          </div>
        </section>

        <section id="how" className="max-w-6xl mx-auto px-4 py-12">
          <div className="rounded-3xl bg-stone-900/30 border border-stone-800 overflow-hidden">
            <div className="p-8 md:p-10">
              <h2 className="text-2xl font-semibold text-stone-100">How it works</h2>
              <p className="text-stone-500 mt-2">Three quick steps to get practice questions.</p>

              <div className="mt-8 grid md:grid-cols-3 gap-6">
                <div className="p-6 rounded-2xl bg-stone-950/40 border border-stone-800">
                  <p className="text-xs text-stone-500">Step 1</p>
                  <p className="mt-2 text-stone-100 font-medium">Upload material</p>
                  <p className="mt-2 text-stone-500 text-sm">Drop a PDF, TXT, or Markdown file.</p>
                </div>
                <div className="p-6 rounded-2xl bg-stone-950/40 border border-stone-800">
                  <p className="text-xs text-stone-500">Step 2</p>
                  <p className="mt-2 text-stone-100 font-medium">Choose output</p>
                  <p className="mt-2 text-stone-500 text-sm">Select mode, difficulty, and number of items.</p>
                </div>
                <div className="p-6 rounded-2xl bg-stone-950/40 border border-stone-800">
                  <p className="text-xs text-stone-500">Step 3</p>
                  <p className="mt-2 text-stone-100 font-medium">Study & repeat</p>
                  <p className="mt-2 text-stone-500 text-sm">Generate again until you feel confident.</p>
                </div>
              </div>
            </div>
            <div className="px-8 md:px-10 pb-8 md:pb-10">
              <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between p-5 rounded-2xl bg-stone-950/40 border border-stone-800">
                <p className="text-stone-300 text-sm">
                  Tip: shorter, cleaner notes usually generate better questions.
                </p>
                <a
                  href="#try"
                  className="inline-flex items-center justify-center px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 transition-colors text-white text-sm font-medium"
                >
                  Build a quiz now
                </a>
              </div>
            </div>
          </div>
        </section>

        <section id="try" className="max-w-6xl mx-auto px-4 pt-12 pb-16">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold text-stone-100">Try it now</h2>
              <p className="text-stone-500 mt-2">Upload a file, then generate content instantly.</p>
            </div>
          </div>

          <div className="mt-8 grid lg:grid-cols-12 gap-6">
            <div className="lg:col-span-5 rounded-3xl bg-stone-900/30 border border-stone-800 overflow-hidden">
              <div className="p-6 border-b border-stone-800">
                <p className="text-stone-100 font-medium">{documentId ? "Your file" : "Upload study material"}</p>
                <p className="text-stone-500 text-sm mt-1">
                  {documentId ? "Ready to generate questions from this material." : "PDF, TXT, or Markdown."}
                </p>
              </div>

              <div className="p-6">
                {!documentId ? (
                  <FileUpload uploadFile={uploadFile} onUploaded={handleUploaded} onError={setError} />
                ) : (
                  <div className="space-y-4">
                    <div className="p-4 rounded-2xl bg-stone-950/40 border border-stone-800">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-stone-200 font-medium break-words">{filename}</p>
                          <p className="text-stone-500 text-sm mt-1">Chunks: {chunkCount}</p>
                        </div>
                        <button
                          type="button"
                          onClick={reset}
                          className="shrink-0 text-sm text-stone-400 hover:text-stone-200 transition-colors"
                        >
                          Upload another
                        </button>
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-stone-950/40 border border-stone-800">
                      <p className="text-stone-200 font-medium mb-4">Generate</p>
                      <GenerateForm
                        documentId={documentId}
                        filename={filename!}
                        onGenerate={handleGenerate}
                        generating={generating}
                      />
                    </div>
                  </div>
                )}
              </div>

              {error && (
                <div className="px-6 pb-6">
                  <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm whitespace-pre-wrap break-words">
                    {error}
                  </div>
                </div>
              )}
            </div>

            <div className="lg:col-span-7">
              <div className="rounded-3xl bg-stone-900/30 border border-stone-800 overflow-hidden">
                <div className="p-6 border-b border-stone-800 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-stone-100 font-medium">Results</p>
                    <p className="text-stone-500 text-sm mt-1">Your generated items will show up here.</p>
                  </div>
                  {result && (
                    <span className="text-xs px-2 py-1 rounded-lg bg-stone-950/50 border border-stone-800 text-stone-300">
                      {result.items.length} items · {result.output_type.replace("_", " ")}
                    </span>
                  )}
                </div>

                <div className="p-6">
                  {!result ? (
                    <div className="p-8 rounded-2xl bg-stone-950/40 border border-stone-800">
                      <p className="text-stone-200 font-medium">No results yet</p>
                      <p className="text-stone-500 text-sm mt-2">
                        Upload a file and click <span className="text-stone-300 font-medium">Generate</span> to see flashcards,
                        quizzes, or active recall prompts.
                      </p>
                    </div>
                  ) : (
                    <ResultsDisplay outputType={result.output_type} items={result.items} />
                  )}
                </div>
              </div>

              <div className="mt-6 grid sm:grid-cols-2 gap-4">
                <div className="p-5 rounded-2xl bg-stone-900/30 border border-stone-800">
                  <p className="text-stone-100 font-medium">Pro tip</p>
                  <p className="text-stone-500 text-sm mt-2">
                    If your notes are long, generate fewer items first, then increase count once the questions look good.
                  </p>
                </div>
                <div className="p-5 rounded-2xl bg-stone-900/30 border border-stone-800">
                  <p className="text-stone-100 font-medium">Best results</p>
                  <p className="text-stone-500 text-sm mt-2">
                    Use headings and bullet points in your material, a clear structure helps the model pick better concepts.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <footer className="border-t border-stone-800/80">
          <div className="max-w-6xl mx-auto px-4 py-10 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <p className="text-sm text-stone-500">
              © {new Date().getFullYear()} AI Quiz Maker. Built for fast studying.
            </p>
            <div className="flex items-center gap-4 text-sm">
              <a className="text-stone-500 hover:text-stone-300 transition-colors" href="#features">
                Features
              </a>
              <a className="text-stone-500 hover:text-stone-300 transition-colors" href="#how">
                How it works
              </a>
              <a className="text-stone-500 hover:text-stone-300 transition-colors" href="#try">
                Try it
              </a>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
