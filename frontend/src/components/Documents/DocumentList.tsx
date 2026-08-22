import clsx from "clsx";
import { FileText, Loader2, Trash2 } from "lucide-react";
import type { DocumentResponse } from "../../lib/types";
import { useDeleteDocumentMutation } from "../../hooks/useDocuments";

interface DocumentListProps {
  documents: DocumentResponse[];
  selectedDocumentId: string | null;
  onSelect: (documentId: string) => void;
}

const statusStyles: Record<DocumentResponse["status"], string> = {
  ready: "bg-emerald-500",
  processing: "bg-amber-500",
  failed: "bg-red-500",
};

const statusLabelStyles: Record<DocumentResponse["status"], string> = {
  ready: "text-emerald-600 dark:text-emerald-400",
  processing: "text-amber-600 dark:text-amber-400",
  failed: "text-red-600 dark:text-red-400",
};

export function DocumentList({
  documents,
  selectedDocumentId,
  onSelect,
}: DocumentListProps) {
  const deleteDocument = useDeleteDocumentMutation();

  if (documents.length === 0) {
    return (
      <p className="px-1 text-xs text-slate-400 dark:text-slate-500">
        No documents uploaded yet.
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-1">
      {documents.map((doc) => {
        const isSelected = doc.id === selectedDocumentId;
        return (
          <li key={doc.id}>
            <div
              className={clsx(
                "group relative flex items-center gap-2 overflow-hidden rounded-lg pl-2.5 pr-1.5 py-1.5 text-sm transition-colors",
                isSelected
                  ? "bg-violet-50 dark:bg-violet-950/40"
                  : "hover:bg-slate-100 dark:hover:bg-slate-800/70",
              )}
            >
              {isSelected ? (
                <span className="brand-gradient absolute inset-y-0 left-0 w-1" aria-hidden />
              ) : null}
              <button
                type="button"
                onClick={() => onSelect(doc.id)}
                disabled={doc.status !== "ready"}
                title={doc.error_message ?? undefined}
                className="flex flex-1 items-center gap-2 overflow-hidden text-left disabled:cursor-not-allowed"
              >
                {doc.status === "processing" ? (
                  <Loader2 className="h-4 w-4 shrink-0 animate-spin text-amber-500" />
                ) : (
                  <FileText
                    className={clsx(
                      "h-4 w-4 shrink-0",
                      isSelected
                        ? "text-violet-600 dark:text-violet-300"
                        : "text-slate-400 dark:text-slate-500",
                    )}
                  />
                )}
                <span
                  className={clsx(
                    "truncate",
                    isSelected
                      ? "font-medium text-violet-700 dark:text-violet-300"
                      : "text-slate-700 dark:text-slate-300",
                  )}
                >
                  {doc.file_name}
                </span>
                <span
                  className={clsx(
                    "ml-auto flex shrink-0 items-center gap-1 text-[10px] font-medium uppercase tracking-wide",
                    statusLabelStyles[doc.status],
                  )}
                >
                  <span className={clsx("h-1.5 w-1.5 rounded-full", statusStyles[doc.status])} />
                  {doc.status}
                </span>
              </button>
              <button
                type="button"
                onClick={() => deleteDocument.mutate(doc.id)}
                disabled={deleteDocument.isPending}
                aria-label={`Delete ${doc.file_name}`}
                className="shrink-0 rounded p-1 text-slate-400 opacity-0 transition-opacity hover:text-red-600 group-hover:opacity-100 disabled:opacity-40 dark:text-slate-500 dark:hover:text-red-400"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
