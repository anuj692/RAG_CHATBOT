import { useRef, useState } from "react";
import { useUploadDocumentMutation } from "../../hooks/useDocuments";
import { toErrorMessage } from "../../lib/api";
import { ErrorBanner } from "../ui/ErrorBanner";
import { Spinner } from "../ui/Spinner";

interface DocumentUploadProps {
  onUploaded: (documentId: string) => void;
}

export function DocumentUpload({ onUploaded }: DocumentUploadProps) {
  const [error, setError] = useState<string | null>(null);
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
        className="flex items-center justify-center gap-2 rounded-lg border border-dashed border-slate-300 px-3 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:border-indigo-400 hover:text-indigo-600 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-600 dark:text-slate-300 dark:hover:border-indigo-500 dark:hover:text-indigo-400"
      >
        {upload.isPending ? (
          <Spinner label="Uploading…" />
        ) : (
          <>
            <span aria-hidden>＋</span> Upload PDF
          </>
        )}
      </button>
      {error ? (
        <ErrorBanner message={error} onDismiss={() => setError(null)} />
      ) : null}
    </div>
  );
}
