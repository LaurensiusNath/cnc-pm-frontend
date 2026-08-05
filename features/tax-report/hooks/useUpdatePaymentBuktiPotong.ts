import { useMutation, useQueryClient } from "@tanstack/react-query";

import { invoiceService } from "@/features/invoice/api/invoiceService";
import { invoiceKeys } from "@/features/invoice/api/queryKeys";
import type { UpdatePaymentBuktiPotongInput } from "@/features/invoice/schema";

import { taxReportKeys } from "../api/queryKeys";

interface UpdatePaymentBuktiPotongVariables {
  invoiceId: string;
  paymentId: string;
  input: UpdatePaymentBuktiPotongInput;
}

// PATCH /invoices/{id}/payments/{payment_id}/bukti-potong-pph23 - backend
// route was still on an unmerged branch (feature/payment-bukti-potong-
// update) when this was written. See invoiceService.updatePaymentBuktiPotong
// for the same caveat. One hook instance covers the whole PPh23 table
// (many invoices/payments), invoiceId/paymentId are mutation variables -
// same reasoning as useUpdateFakturPajakForReport.
export function useUpdatePaymentBuktiPotong() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ invoiceId, paymentId, input }: UpdatePaymentBuktiPotongVariables) =>
      invoiceService.updatePaymentBuktiPotong(invoiceId, paymentId, input),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: invoiceKeys.payments(variables.invoiceId),
      });
      queryClient.invalidateQueries({ queryKey: taxReportKeys.all });
    },
  });
}
