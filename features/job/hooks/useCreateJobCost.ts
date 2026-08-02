import { useMutation, useQueryClient } from "@tanstack/react-query";

import { jobService } from "../api/jobService";
import { jobKeys } from "../api/queryKeys";
import type { CreateJobCostInput } from "../schema";

export function useCreateJobCost(jobId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateJobCostInput) =>
      jobService.createCost(jobId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: jobKeys.costs(jobId) });
    },
  });
}
