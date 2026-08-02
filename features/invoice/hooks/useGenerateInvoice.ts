import { useMutation, useQueryClient } from "@tanstack/react-query";

import { invoiceService } from "../api/invoiceService";
import { invoiceKeys } from "../api/queryKeys";
import type { GenerateInvoiceInput } from "../schema";

export function useGenerateInvoice(jobId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: GenerateInvoiceInput) =>
      invoiceService.createFromJob(jobId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: invoiceKeys.byJob(jobId) });
      queryClient.invalidateQueries({ queryKey: invoiceKeys.lists() });
    },
  });
}
