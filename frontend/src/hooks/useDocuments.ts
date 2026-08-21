import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { documentsApi } from "../lib/api";

export const documentsQueryKey = ["documents"] as const;

export function useDocumentsQuery() {
  return useQuery({
    queryKey: documentsQueryKey,
    queryFn: documentsApi.list,
    // Documents can finish embedding shortly after upload; poll gently while
    // any document is still processing so the UI updates without a refresh.
    refetchInterval: (query) => {
      const data = query.state.data;
      const stillProcessing = data?.some((doc) => doc.status === "processing");
      return stillProcessing ? 3000 : false;
    },
  });
}

export function useUploadDocumentMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => documentsApi.upload(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: documentsQueryKey });
    },
  });
}

export function useDeleteDocumentMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (documentId: string) => documentsApi.remove(documentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: documentsQueryKey });
    },
  });
}
