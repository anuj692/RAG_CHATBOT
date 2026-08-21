import { useState } from "react";
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

export function ChatWindow({ session, document }: ChatWindowProps) {
  const [sendError, setSendError] = useState<string | null>(null);

  const historyQuery = useHistoryQuery(session?.id ?? null);
  const sendMessage = useSendMessageMutation();

  if (!session) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2 text-center text-slate-400 dark:text-slate-500">
        <p className="text-sm font-medium">No chat session selected.</p>
        <p className="text-xs">Start a new chat from the sidebar to begin.</p>
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
      <header className="flex flex-col gap-0.5 border-b border-slate-200 bg-white px-4 py-3 dark:border-slate-700 dark:bg-slate-900">
        <h2 className="truncate text-sm font-semibold text-slate-800 dark:text-slate-100">
          {session.title}
        </h2>
        <p className="truncate text-xs text-slate-400 dark:text-slate-500">
          {document
            ? `Document: ${document.file_name}`
            : "No document selected"}
        </p>
      </header>

      <div className="thin-scrollbar flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-950">
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
