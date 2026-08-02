import { useMutation, useQueryClient } from "@tanstack/react-query";

import { jobService } from "../api/jobService";
import { jobKeys } from "../api/queryKeys";

export function useCreateJob() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: jobService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: jobKeys.lists() });
    },
  });
}
