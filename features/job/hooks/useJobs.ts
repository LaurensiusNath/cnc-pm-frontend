import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { jobService } from "../api/jobService";
import { jobKeys } from "../api/queryKeys";
import type { JobListParams } from "../types";

export function useJobs(params: JobListParams) {
  return useQuery({
    queryKey: jobKeys.list(params),
    queryFn: () => jobService.list(params),
    placeholderData: keepPreviousData,
  });
}
