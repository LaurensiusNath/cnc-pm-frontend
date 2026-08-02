import { useQuery } from "@tanstack/react-query";

import { invoiceService } from "../api/invoiceService";
import { invoiceKeys } from "../api/queryKeys";

export function useInvoicePayments(invoiceId: string) {
  return useQuery({
    queryKey: invoiceKeys.payments(invoiceId),
    queryFn: () => invoiceService.listPayments(invoiceId),
    enabled: Boolean(invoiceId),
  });
}
