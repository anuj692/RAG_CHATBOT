export type DocumentStatus = "processing" | "ready" | "failed";

export interface DocumentResponse {
  id: string;
  file_name: string;
  status: DocumentStatus;
  total_chunks: number;
  error_message: string | null;
  created_at: string;
}

export interface SessionResponse {
  id: string;
  title: string;
  document_id: string | null;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
}

export interface Citation {
  document_id: string;
  file_name: string;
  page_number: number;
  chunk_id: string;
  score: number;
}

export interface ChatRequest {
  session_id: string;
  document_id: string;
  question: string;
}

export interface ChatResponse {
  answer: string;
  citations: Citation[];
  retrieved_chunks: number;
}

export type MessageRole = "user" | "assistant";

export interface MessageResponse {
  id: string;
  session_id: string;
  role: MessageRole;
  content: string;
  citations: Citation[] | null;
  created_at: string;
}

export interface HistoryResponse {
  session_id: string;
  messages: MessageResponse[];
}

export interface ApiErrorBody {
  detail?: string;
}
