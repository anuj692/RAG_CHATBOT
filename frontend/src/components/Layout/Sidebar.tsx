import type { DocumentResponse, SessionResponse } from "../../lib/types";
import type { Theme } from "../../lib/storage";
import { DocumentUpload } from "../Documents/DocumentUpload";
import { DocumentList } from "../Documents/DocumentList";
import { SessionList } from "../Sessions/SessionList";
import { Spinner } from "../ui/Spinner";

interface SidebarProps {
  documents: DocumentResponse[];
  documentsLoading: boolean;
  selectedDocumentId: string | null;
  onSelectDocument: (documentId: string) => void;
  onDocumentUploaded: (documentId: string) => void;

  sessions: SessionResponse[];
  sessionsLoading: boolean;
  selectedSessionId: string | null;
  onSelectSession: (sessionId: string) => void;
  onNewChat: () => void;
  isCreatingSession: boolean;

  theme: Theme;
  onToggleTheme: () => void;
}

export function Sidebar({
  documents,
  documentsLoading,
  selectedDocumentId,
  onSelectDocument,
  onDocumentUploaded,
  sessions,
  sessionsLoading,
  selectedSessionId,
  onSelectSession,
  onNewChat,
  isCreatingSession,
  theme,
  onToggleTheme,
}: SidebarProps) {
  return (
    <div className="flex h-full flex-col gap-5 overflow-y-auto p-4">
      <div className="hidden items-center justify-between lg:flex">
        <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">
          RAG Chatbot
        </span>
        <button
          type="button"
          onClick={onToggleTheme}
          aria-label="Toggle color theme"
          className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
        >
          {theme === "dark" ? "☀️" : "🌙"}
        </button>
      </div>

      <section className="flex flex-col gap-2">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
          Documents
        </h3>
        <DocumentUpload onUploaded={onDocumentUploaded} />
        {documentsLoading ? (
          <Spinner label="Loading documents…" />
        ) : (
          <DocumentList
            documents={documents}
            selectedDocumentId={selectedDocumentId}
            onSelect={onSelectDocument}
          />
        )}
      </section>

      <section className="flex flex-1 flex-col gap-2 overflow-hidden">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
            Chats
          </h3>
          <button
            type="button"
            onClick={onNewChat}
            disabled={isCreatingSession}
            className="rounded-md px-2 py-1 text-xs font-medium text-indigo-600 hover:bg-indigo-50 disabled:cursor-not-allowed disabled:text-slate-300 dark:text-indigo-400 dark:hover:bg-indigo-950/50 dark:disabled:text-slate-600"
          >
            + New chat
          </button>
        </div>
        <div className="thin-scrollbar flex-1 overflow-y-auto">
          {sessionsLoading ? (
            <Spinner label="Loading chats…" />
          ) : (
            <SessionList
              sessions={sessions}
              selectedSessionId={selectedSessionId}
              onSelect={onSelectSession}
            />
          )}
        </div>
      </section>
    </div>
  );
}
