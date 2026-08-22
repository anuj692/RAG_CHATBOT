import { FileText, MessageSquarePlus, Moon, Sparkles, Sun } from "lucide-react";
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
        <span className="flex items-center gap-2">
          <span className="brand-gradient flex h-8 w-8 items-center justify-center rounded-xl shadow-md shadow-violet-500/30">
            <Sparkles className="h-4.5 w-4.5 text-white" />
          </span>
          <span className="flex flex-col leading-tight">
            <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">
              RAG Chatbot
            </span>
            <span className="text-[11px] text-slate-400 dark:text-slate-500">
              Chat with your PDFs
            </span>
          </span>
        </span>
        <button
          type="button"
          onClick={onToggleTheme}
          aria-label="Toggle color theme"
          className="rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
        >
          {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>
      </div>

      <section className="flex flex-col gap-2">
        <h3 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
          <FileText className="h-3.5 w-3.5" />
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
        </div>
        <button
          type="button"
          onClick={onNewChat}
          disabled={isCreatingSession}
          className="brand-gradient flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-white shadow-sm shadow-violet-500/30 transition-transform hover:scale-[1.01] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
        >
          <MessageSquarePlus className="h-4 w-4" />
          New chat
        </button>
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
