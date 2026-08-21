import axios, { AxiosError } from "axios";
import type {
  ChatRequest,
  ChatResponse,
  DocumentResponse,
  HistoryResponse,
  SessionResponse,
} from "./types";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

export const apiClient = axios.create({
  baseURL: API_URL,
});

/** Turns an axios error into a plain, user-presentable message. */
export function toErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<{ detail?: string }>;
    const detail = axiosError.response?.data?.detail;
    if (detail) return detail;
    if (axiosError.response) {
      return `Request failed with status ${axiosError.response.status}.`;
    }
    return `Could not reach the server at ${API_URL}. Is the backend running?`;
  }
  if (error instanceof Error) return error.message;
  return "Something went wrong.";
}

export const documentsApi = {
  list: async (): Promise<DocumentResponse[]> => {
    const { data } = await apiClient.get<DocumentResponse[]>("/documents");
    return data;
  },

  upload: async (file: File): Promise<DocumentResponse> => {
    const formData = new FormData();
    formData.append("file", file);
    const { data } = await apiClient.post<DocumentResponse>(
      "/documents/upload",
      formData,
    );
    return data;
  },

  remove: async (documentId: string): Promise<void> => {
    await apiClient.delete(`/documents/${documentId}`);
  },
};

export const sessionsApi = {
  list: async (): Promise<SessionResponse[]> => {
    const { data } = await apiClient.get<SessionResponse[]>("/sessions");
    return data;
  },

  create: async (
    title?: string,
    documentId?: string,
  ): Promise<SessionResponse> => {
    const { data } = await apiClient.post<SessionResponse>("/sessions", {
      ...(title ? { title } : {}),
      ...(documentId ? { document_id: documentId } : {}),
    });
    return data;
  },

  remove: async (sessionId: string): Promise<void> => {
    await apiClient.delete(`/sessions/${sessionId}`);
  },
};

export const chatApi = {
  history: async (sessionId: string): Promise<HistoryResponse> => {
    const { data } = await apiClient.get<HistoryResponse>(
      `/history/${sessionId}`,
    );
    return data;
  },

  send: async (payload: ChatRequest): Promise<ChatResponse> => {
    const { data } = await apiClient.post<ChatResponse>("/chat", payload);
    return data;
  },
};
