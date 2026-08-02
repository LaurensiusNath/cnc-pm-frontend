import { useMutation, useQueryClient } from "@tanstack/react-query";

import { invoiceService } from "../api/invoiceService";
import { invoiceKeys } from "../api/queryKeys";
import type { AddPaymentInput } from "../schema";

export function useCreatePayment(invoiceId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: AddPaymentInput) =>
      invoiceService.createPayment(invoiceId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: invoiceKeys.payments(invoiceId) });
      // Recording a payment can flip the invoice's own status to "paid"
      // server-side (see RecordPayment's SUM(payments) >= total check) -
      // the cached detail object is stale after this mutation even though
      // this endpoint doesn't return an Invoice itself.
      queryClient.invalidateQueries({ queryKey: invoiceKeys.detail(invoiceId) });
    },
  });
}
