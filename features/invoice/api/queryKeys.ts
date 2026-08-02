import type { InvoiceListParams } from "../types";

export const invoiceKeys = {
  all: ["invoices"] as const,
  lists: () => [...invoiceKeys.all, "list"] as const,
  list: (params: InvoiceListParams) => [...invoiceKeys.lists(), params] as const,
  details: () => [...invoiceKeys.all, "detail"] as const,
  detail: (id: string) => [...invoiceKeys.details(), id] as const,
  payments: (invoiceId: string) => [...invoiceKeys.all, "payments", invoiceId] as const,
  byJob: (jobId: string) => [...invoiceKeys.all, "byJob", jobId] as const,
};
