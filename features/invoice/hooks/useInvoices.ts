import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { invoiceService } from "../api/invoiceService";
import { invoiceKeys } from "../api/queryKeys";
import type { InvoiceListParams } from "../types";

export function useInvoices(params: InvoiceListParams) {
  return useQuery({
    queryKey: invoiceKeys.list(params),
    queryFn: () => invoiceService.list(params),
    placeholderData: keepPreviousData,
  });
}
