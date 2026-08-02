import { useQuery } from "@tanstack/react-query";

import { jobService } from "../api/jobService";
import { jobKeys } from "../api/queryKeys";

// Single source for both the cost items table and the total_selling/
// total_margin totals - GET /jobs/{id} nests a `costs` array too, but not
// the totals, so this separate call is used for the whole Costs section
// rather than mixing two different sources of the same conceptual data.
export function useJobCosts(jobId: string) {
  return useQuery({
    queryKey: jobKeys.costs(jobId),
    queryFn: () => jobService.listCosts(jobId),
    enabled: Boolean(jobId),
  });
}
