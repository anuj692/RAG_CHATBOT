import { useEffect, useState } from "react";
import { useTheme } from "./hooks/useTheme";
import { storage } from "./lib/storage";
import { useDocumentsQuery } from "./hooks/useDocuments";
import {
  useCreateSessionMutation,
  useSessionsQuery,
} from "./hooks/useSessions";
import { AppShell } from "./components/Layout/AppShell";
import { Sidebar } from "./components/Layout/Sidebar";
import { ChatWindow } from "./components/Chat/ChatWindow";
import { ErrorBanner } from "./components/ui/ErrorBanner";
import { Spinner } from "./components/ui/Spinner";
import { toErrorMessage } from "./lib/api";

export default function App() {
  const { theme, toggleTheme } = useTheme();

  const documentsQuery = useDocumentsQuery();
  const sessionsQuery = useSessionsQuery();
  const createSession = useCreateSessionMutation();

  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(
    () => storage.getSelectedDocumentId(),
  );
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(
    () => storage.getSelectedSessionId(),
  );

  const documents = documentsQuery.data ?? [];
  const sessions = sessionsQuery.data ?? [];

  // Keep the selected document valid; drop it if it was deleted elsewhere.
  useEffect(() => {
    if (!documentsQuery.isSuccess) return;
    if (selectedDocumentId && !documents.some((d) => d.id === selectedDocumentId)) {
      setSelectedDocumentId(null);
    }
  }, [documentsQuery.isSuccess, documents, selectedDocumentId]);

  // Auto-create the first chat session, and keep the selection valid if the
  // active session was deleted elsewhere (e.g. another tab).
  useEffect(() => {
    if (!sessionsQuery.isSuccess) return;

    const stillExists = sessions.some((s) => s.id === selectedSessionId);
    if (selectedSessionId && stillExists) return;

    if (sessions.length > 0) {
      setSelectedSessionId(sessions[0].id);
      return;
    }

    if (!createSession.isPending) {
      createSession.mutate(
        {},
        { onSuccess: (session) => setSelectedSessionId(session.id) },
      );
    }
  }, [sessionsQuery.isSuccess, sessions, selectedSessionId, createSession]);

  useEffect(() => {
    storage.setSelectedDocumentId(selectedDocumentId);
  }, [selectedDocumentId]);

  useEffect(() => {
    storage.setSelectedSessionId(selectedSessionId);
  }, [selectedSessionId]);

  // Each document gets its own chat: reuse the session already tied to it,
  // or create a fresh one, instead of continuing whatever session was open.
  const handleSelectDocument = (documentId: string) => {
    setSelectedDocumentId(documentId);

    const existingSession = sessions.find((s) => s.document_id === documentId);
    if (existingSession) {
      setSelectedSessionId(existingSession.id);
      return;
    }

    const document = documents.find((d) => d.id === documentId);
    createSession.mutate(
      { title: document?.file_name, documentId },
      { onSuccess: (session) => setSelectedSessionId(session.id) },
    );
  };

  // Picking a chat directly should also switch to whichever document it
  // belongs to, so the header always matches the conversation shown.
  const handleSelectSession = (sessionId: string) => {
    setSelectedSessionId(sessionId);
    const session = sessions.find((s) => s.id === sessionId);
    if (session?.document_id) {
      setSelectedDocumentId(session.document_id);
    }
  };

  const activeDocument =
    documents.find((d) => d.id === selectedDocumentId) ?? null;
  const activeSession =
    sessions.find((s) => s.id === selectedSessionId) ?? null;

  const loadError = documentsQuery.isError
    ? toErrorMessage(documentsQuery.error)
    : sessionsQuery.isError
      ? toErrorMessage(sessionsQuery.error)
      : null;

  const sidebar = (
    <Sidebar
      documents={documents}
      documentsLoading={documentsQuery.isLoading}
      selectedDocumentId={selectedDocumentId}
      onSelectDocument={handleSelectDocument}
      onDocumentUploaded={handleSelectDocument}
      sessions={sessions}
      sessionsLoading={sessionsQuery.isLoading}
      selectedSessionId={selectedSessionId}
      onSelectSession={handleSelectSession}
      onNewChat={() =>
        createSession.mutate(
          {},
          { onSuccess: (session) => setSelectedSessionId(session.id) },
        )
      }
      isCreatingSession={createSession.isPending}
      theme={theme}
      onToggleTheme={toggleTheme}
    />
  );

  return (
    <AppShell theme={theme} onToggleTheme={toggleTheme} sidebar={sidebar}>
      {loadError ? (
        <div className="p-4">
          <ErrorBanner message={loadError} />
        </div>
      ) : documentsQuery.isLoading || sessionsQuery.isLoading ? (
        <div className="flex h-full items-center justify-center">
          <Spinner label="Loading…" />
        </div>
      ) : (
        <ChatWindow session={activeSession} document={activeDocument} />
      )}
    </AppShell>
  );
}
