import clsx from "clsx";
import type { DocumentResponse } from "../../lib/types";
import { useDeleteDocumentMutation } from "../../hooks/useDocuments";

interface DocumentListProps {
  documents: DocumentResponse[];
  selectedDocumentId: string | null;
  onSelect: (documentId: string) => void;
}

const statusStyles: Record<DocumentResponse["status"], string> = {
  ready:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
  processing:
    "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  failed: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
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
                "group flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm transition-colors",
                isSelected
                  ? "bg-indigo-50 dark:bg-indigo-950/50"
                  : "hover:bg-slate-100 dark:hover:bg-slate-800",
              )}
            >
              <button
                type="button"
                onClick={() => onSelect(doc.id)}
                disabled={doc.status !== "ready"}
                title={doc.error_message ?? undefined}
                className="flex flex-1 items-center gap-2 overflow-hidden text-left disabled:cursor-not-allowed"
              >
                <span
                  className={clsx(
                    "truncate",
                    isSelected
                      ? "font-medium text-indigo-700 dark:text-indigo-300"
                      : "text-slate-700 dark:text-slate-300",
                  )}
                >
                  {doc.file_name}
                </span>
                <span
                  className={clsx(
                    "ml-auto shrink-0 rounded px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide",
                    statusStyles[doc.status],
                  )}
                >
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
                🗑
              </button>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
