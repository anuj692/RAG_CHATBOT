import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { sessionsApi } from "../lib/api";

export const sessionsQueryKey = ["sessions"] as const;

export function useSessionsQuery() {
  return useQuery({
    queryKey: sessionsQueryKey,
    queryFn: sessionsApi.list,
  });
}

interface CreateSessionInput {
  title?: string;
  documentId?: string;
}

export function useCreateSessionMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateSessionInput = {}) =>
      sessionsApi.create(input.title, input.documentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: sessionsQueryKey });
    },
  });
}

export function useDeleteSessionMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (sessionId: string) => sessionsApi.remove(sessionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: sessionsQueryKey });
    },
  });
}
