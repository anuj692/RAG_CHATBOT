// Only opaque IDs (and the theme preference) ever touch localStorage.
// No document content, chat text, or API keys are stored client-side.
const KEYS = {
  documentId: "rag-chatbot:selected-document-id",
  sessionId: "rag-chatbot:selected-session-id",
  theme: "rag-chatbot:theme",
} as const;

export type Theme = "light" | "dark";

function read(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function write(key: string, value: string | null): void {
  try {
    if (value === null) {
      localStorage.removeItem(key);
    } else {
      localStorage.setItem(key, value);
    }
  } catch {
    // localStorage can be unavailable (private mode, disabled storage). The
    // app still works; selections just won't persist across reloads.
  }
}

export const storage = {
  getSelectedDocumentId: () => read(KEYS.documentId),
  setSelectedDocumentId: (id: string | null) => write(KEYS.documentId, id),

  getSelectedSessionId: () => read(KEYS.sessionId),
  setSelectedSessionId: (id: string | null) => write(KEYS.sessionId, id),

  getTheme: (): Theme | null => {
    const value = read(KEYS.theme);
    return value === "light" || value === "dark" ? value : null;
  },
  setTheme: (theme: Theme) => write(KEYS.theme, theme),
};
