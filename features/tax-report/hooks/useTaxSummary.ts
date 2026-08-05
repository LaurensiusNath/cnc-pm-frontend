import { useQuery } from "@tanstack/react-query";

import { taxReportService } from "../api/taxReportService";
import { taxReportKeys } from "../api/queryKeys";
import type { TaxSummaryParams } from "../types";

// retry: false - 403 for a teknisi-role viewer is deterministic (route is
// owner/admin-only, same adminGroup as dashboard), not a transient failure.
export function useTaxSummary(params: TaxSummaryParams) {
  return useQuery({
    queryKey: taxReportKeys.summary(params),
    queryFn: () => taxReportService.getSummary(params),
    retry: false,
  });
}
