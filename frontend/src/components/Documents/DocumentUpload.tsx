import { useRef, useState } from "react";
import type { DragEvent } from "react";
import clsx from "clsx";
import { UploadCloud } from "lucide-react";
import { useUploadDocumentMutation } from "../../hooks/useDocuments";
import { toErrorMessage } from "../../lib/api";
import { ErrorBanner } from "../ui/ErrorBanner";
import { Spinner } from "../ui/Spinner";

interface DocumentUploadProps {
  onUploaded: (documentId: string) => void;
}

export function DocumentUpload({ onUploaded }: DocumentUploadProps) {
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const upload = useUploadDocumentMutation();

  const handleFile = (file: File | undefined) => {
    if (!file) return;
    if (!file.name.toLowerCase().endsWith(".pdf")) {
      setError("Only PDF files are supported.");
      return;
    }
    setError(null);
    upload.mutate(file, {
      onSuccess: (document) => onUploaded(document.id),
      onError: (err) => setError(toErrorMessage(err)),
    });
  };

  const handleDrop = (event: DragEvent<HTMLButtonElement>) => {
    event.preventDefault();
    setIsDragging(false);
    handleFile(event.dataTransfer.files?.[0]);
  };

  return (
    <div className="flex flex-col gap-2">
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf"
        className="hidden"
        onChange={(event) => handleFile(event.target.files?.[0])}
      />
      <button
        type="button"
        disabled={upload.isPending}
        onClick={() => inputRef.current?.click()}
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={clsx(
          "flex flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed px-3 py-4 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60",
          isDragging
            ? "border-violet-400 bg-violet-50 text-violet-600 dark:border-violet-500 dark:bg-violet-950/40 dark:text-violet-300"
            : "border-slate-300 text-slate-500 hover:border-violet-400 hover:bg-violet-50/50 hover:text-violet-600 dark:border-slate-700 dark:text-slate-400 dark:hover:border-violet-500 dark:hover:bg-violet-950/20 dark:hover:text-violet-300",
        )}
      >
        {upload.isPending ? (
          <Spinner label="Uploading…" />
        ) : (
          <>
            <UploadCloud className="h-5 w-5" />
            <span>
              <span className="font-semibold">Click to upload</span> or drag a PDF
            </span>
          </>
        )}
      </button>
      {error ? (
        <ErrorBanner message={error} onDismiss={() => setError(null)} />
      ) : null}
    </div>
  );
}
