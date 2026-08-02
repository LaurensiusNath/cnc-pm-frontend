import { useMutation, useQueryClient } from "@tanstack/react-query";

import { jobService } from "../api/jobService";
import { jobKeys } from "../api/queryKeys";

export function useDeleteJobCost(jobId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (costId: string) => jobService.deleteCost(jobId, costId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: jobKeys.costs(jobId) });
    },
  });
}
