import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { chatApi } from "../lib/api";
import type { HistoryResponse, MessageResponse } from "../lib/types";

export function historyQueryKey(sessionId: string) {
  return ["history", sessionId] as const;
}

export function useHistoryQuery(sessionId: string | null) {
  return useQuery({
    queryKey: historyQueryKey(sessionId ?? "none"),
    queryFn: () => chatApi.history(sessionId as string),
    enabled: Boolean(sessionId),
  });
}

interface SendMessageInput {
  sessionId: string;
  documentId: string;
  question: string;
}

function tempMessage(
  sessionId: string,
  role: "user" | "assistant",
  content: string,
): MessageResponse {
  return {
    id: `temp-${role}-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    session_id: sessionId,
    role,
    content,
    citations: null,
    created_at: new Date().toISOString(),
  };
}

export function useSendMessageMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: SendMessageInput) =>
      chatApi.send({
        session_id: input.sessionId,
        document_id: input.documentId,
        question: input.question,
      }),

    onMutate: async (input) => {
      const key = historyQueryKey(input.sessionId);
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<HistoryResponse>(key);

      const optimisticUserMessage = tempMessage(
        input.sessionId,
        "user",
        input.question,
      );

      queryClient.setQueryData<HistoryResponse>(key, (current) => ({
        session_id: input.sessionId,
        messages: [...(current?.messages ?? []), optimisticUserMessage],
      }));

      return { previous, key };
    },

    onError: (_error, _input, context) => {
      if (context) {
        queryClient.setQueryData(context.key, context.previous);
      }
    },

    onSuccess: (response, input, context) => {
      if (!context) return;
      const assistantMessage: MessageResponse = {
        ...tempMessage(input.sessionId, "assistant", response.answer),
        citations: response.citations,
      };

      queryClient.setQueryData<HistoryResponse>(context.key, (current) => ({
        session_id: input.sessionId,
        messages: [...(current?.messages ?? []), assistantMessage],
      }));
    },
  });
}
