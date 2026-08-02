import { useQuery } from "@tanstack/react-query";

import { jobService } from "../api/jobService";
import { jobKeys } from "../api/queryKeys";

export function useJob(id: string) {
  return useQuery({
    queryKey: jobKeys.detail(id),
    queryFn: () => jobService.getById(id),
    enabled: Boolean(id),
  });
}
