import { useMutation, useQueryClient } from "@tanstack/react-query";

import { invoiceService } from "../api/invoiceService";
import { invoiceKeys } from "../api/queryKeys";
import type { UpdateInvoiceStatusInput } from "../schema";

export function useUpdateInvoiceStatus(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateInvoiceStatusInput) =>
      invoiceService.updateStatus(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: invoiceKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: invoiceKeys.lists() });
    },
  });
}
