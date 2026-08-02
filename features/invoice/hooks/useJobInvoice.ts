import { useQuery } from "@tanstack/react-query";

import { invoiceService } from "../api/invoiceService";
import { invoiceKeys } from "../api/queryKeys";

// GET /jobs/{id}/invoice - 404 ("belum ada invoice") is a valid, expected
// state for most of a job's lifetime, not a transient failure - retry
// would just repeat a request that's going to 404 again. Consumers should
// branch on isError as a normal render case ("belum ada invoice, tampilkan
// tombol Generate"), not surface it as an error banner/toast.
export function useJobInvoice(jobId: string) {
  return useQuery({
    queryKey: invoiceKeys.byJob(jobId),
    queryFn: () => invoiceService.getByJobId(jobId),
    enabled: Boolean(jobId),
    retry: false,
  });
}
