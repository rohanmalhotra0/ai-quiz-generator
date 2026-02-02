"use client";

import { useCallback, useState } from "react";

const ALLOWED = [".pdf", ".txt", ".md"];
const ALLOWED_TYPES = "application/pdf, text/plain, text/markdown";

interface FileUploadProps {
  onUploaded: (documentId: string, filename: string, chunkCount: number) => void;
  onError: (message: string) => void;
  uploadFile: (file: File) => Promise<{ document_id: string; filename: string; chunk_count: number }>;
}

export default function FileUpload({ onUploaded, onError, uploadFile }: FileUploadProps) {
  const [drag, setDrag] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleFile = useCallback(
    async (file: File | null) => {
      if (!file) return;
      const ext = file.name.toLowerCase().slice(file.name.lastIndexOf("."));
      if (!ALLOWED.includes(ext)) {
        onError(`Use ${ALLOWED.join(", ")} only.`);
        return;
      }
      setUploading(true);
      onError("");
      try {
        const res = await uploadFile(file);
        onUploaded(res.document_id, res.filename, res.chunk_count);
      } catch (e) {
        onError(e instanceof Error ? e.message : "Upload failed");
      } finally {
        setUploading(false);
      }
    },
    [onUploaded, onError, uploadFile]
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDrag(false);
      const file = e.dataTransfer.files?.[0];
      handleFile(file || null);
    },
    [handleFile]
  );

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDrag(true);
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDrag(false);
  }, []);

  const onInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      handleFile(file || null);
      e.target.value = "";
    },
    [handleFile]
  );

  return (
    <label
      onDrop={onDrop}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      className={`
        block border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors
        ${drag ? "border-amber-500 bg-amber-500/10" : "border-stone-600 hover:border-stone-500"}
        ${uploading ? "pointer-events-none opacity-70" : ""}
      `}
    >
      <input
        type="file"
        accept={ALLOWED_TYPES}
        onChange={onInputChange}
        disabled={uploading}
        className="sr-only"
      />
      {uploading ? (
        <p className="text-stone-400">Uploading…</p>
      ) : (
        <>
          <p className="text-stone-300 font-medium">Drop your file here or click to browse</p>
          <p className="text-stone-500 text-sm mt-1">PDF, TXT, or Markdown</p>
        </>
      )}
    </label>
  );
}
