import { useState } from "react";
import { FileText, MessageSquareDashed, Sparkles } from "lucide-react";
import clsx from "clsx";
import type { DocumentResponse, SessionResponse } from "../../lib/types";
import { toErrorMessage } from "../../lib/api";
import { useHistoryQuery, useSendMessageMutation } from "../../hooks/useChat";
import { Spinner } from "../ui/Spinner";
import { ErrorBanner } from "../ui/ErrorBanner";
import { MessageList } from "./MessageList";
import { ChatInput } from "./ChatInput";

interface ChatWindowProps {
  session: SessionResponse | null;
  document: DocumentResponse | null;
}

const statusDot: Record<DocumentResponse["status"], string> = {
  ready: "bg-emerald-500",
  processing: "bg-amber-500",
  failed: "bg-red-500",
};

export function ChatWindow({ session, document }: ChatWindowProps) {
  const [sendError, setSendError] = useState<string | null>(null);

  const historyQuery = useHistoryQuery(session?.id ?? null);
  const sendMessage = useSendMessageMutation();

  if (!session) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
        <div className="brand-gradient flex h-16 w-16 items-center justify-center rounded-2xl opacity-90 shadow-lg shadow-violet-500/20">
          <MessageSquareDashed className="h-8 w-8 text-white" />
        </div>
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
          No chat session selected.
        </p>
        <p className="text-xs text-slate-400 dark:text-slate-500">
          Start a new chat from the sidebar to begin.
        </p>
      </div>
    );
  }

  const documentReady = document?.status === "ready";
  const disabledReason = !document
    ? "Upload and select a PDF to start asking questions."
    : !documentReady
      ? document.status === "processing"
        ? "The selected document is still processing…"
        : "The selected document failed to process. Choose another one."
      : null;

  const handleSend = (question: string) => {
    if (!document) return;
    setSendError(null);
    sendMessage.mutate(
      { sessionId: session.id, documentId: document.id, question },
      {
        onError: (error) => setSendError(toErrorMessage(error)),
      },
    );
  };

  return (
    <div className="flex h-full flex-col">
      <header className="flex items-center gap-3 border-b border-slate-200/70 bg-white/80 px-4 py-3 backdrop-blur-xl dark:border-slate-800/70 dark:bg-slate-900/80">
        <span
          className={clsx(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl",
            document
              ? "bg-violet-100 dark:bg-violet-950/50"
              : "bg-slate-100 dark:bg-slate-800",
          )}
        >
          {document ? (
            <FileText className="h-4.5 w-4.5 text-violet-600 dark:text-violet-300" />
          ) : (
            <Sparkles className="h-4.5 w-4.5 text-slate-400 dark:text-slate-500" />
          )}
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-sm font-semibold text-slate-800 dark:text-slate-100">
            {session.title}
          </h2>
          <p className="flex items-center gap-1.5 truncate text-xs text-slate-400 dark:text-slate-500">
            {document ? (
              <>
                <span className={clsx("h-1.5 w-1.5 shrink-0 rounded-full", statusDot[document.status])} />
                {document.file_name}
              </>
            ) : (
              "No document selected"
            )}
          </p>
        </div>
      </header>

      <div className="thin-scrollbar flex-1 overflow-y-auto">
        {historyQuery.isLoading ? (
          <div className="flex h-full items-center justify-center">
            <Spinner label="Loading history…" />
          </div>
        ) : historyQuery.isError ? (
          <div className="p-4">
            <ErrorBanner message={toErrorMessage(historyQuery.error)} />
          </div>
        ) : (
          <MessageList
            messages={historyQuery.data?.messages ?? []}
            isAnswering={sendMessage.isPending}
            suggestionsEnabled={documentReady}
            onSuggestionClick={handleSend}
          />
        )}
      </div>

      <div className="flex flex-col gap-2 px-3 pt-2">
        {sendError ? (
          <ErrorBanner message={sendError} onDismiss={() => setSendError(null)} />
        ) : null}
        {disabledReason ? (
          <p className="px-1 text-xs text-slate-400 dark:text-slate-500">
            {disabledReason}
          </p>
        ) : null}
      </div>

      <ChatInput
        disabled={!documentReady}
        isSending={sendMessage.isPending}
        placeholder={
          documentReady ? "Ask a question about the document…" : "Waiting for a document…"
        }
        onSend={handleSend}
      />
    </div>
  );
}
