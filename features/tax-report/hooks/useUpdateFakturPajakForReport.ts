import { useMutation, useQueryClient } from "@tanstack/react-query";

import { invoiceService } from "@/features/invoice/api/invoiceService";
import { invoiceKeys } from "@/features/invoice/api/queryKeys";
import type { FakturPajakInput } from "@/features/invoice/schema";

import { taxReportKeys } from "../api/queryKeys";

interface UpdateFakturPajakVariables {
  invoiceId: string;
  input: FakturPajakInput;
}

// The PPN table on this page spans many different invoices (one row per
// invoice), so invoiceId is a mutation VARIABLE, not something the hook is
// pre-scoped to - one hook instance covers the whole table, same as
// useUpdatePaymentBuktiPotong below. Reuses invoiceService directly
// (already exists, PATCH /invoices/{id}/faktur-pajak) rather than the
// features/invoice hook of the same underlying call, because that hook
// only invalidates invoiceKeys (correct for the Invoice detail page, but
// this page also needs its OWN tax-report cache invalidated - each
// feature's hooks only ever invalidate their own query keys, per this
// app's established convention, so that step lives here instead).
export function useUpdateFakturPajakForReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ invoiceId, input }: UpdateFakturPajakVariables) =>
      invoiceService.updateFakturPajak(invoiceId, input),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: invoiceKeys.detail(variables.invoiceId),
      });
      queryClient.invalidateQueries({ queryKey: taxReportKeys.all });
    },
  });
}
