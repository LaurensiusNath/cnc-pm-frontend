import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

import { jobService } from "../api/jobService";
import { jobKeys } from "../api/queryKeys";
import type { AssignTechnicianFormInput } from "../schema";

interface AssignTechnicianVariables extends AssignTechnicianFormInput {
  expectedUpdatedAt: string;
}

export function useAssignTechnician(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (variables: AssignTechnicianVariables) =>
      jobService.assignTechnician(id, {
        technician_id: variables.technician_id,
        expected_updated_at: variables.expectedUpdatedAt,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: jobKeys.lists() });
      queryClient.invalidateQueries({ queryKey: jobKeys.detail(id) });
    },
    onError: (error) => {
      // 409 means the job was changed by someone else since we read its
      // updated_at (optimistic locking conflict) - the cached detail is
      // stale regardless of how the component chooses to display the
      // error, so refetch it here so a retry uses the fresh
      // expected_updated_at rather than the one that just failed.
      if (axios.isAxiosError(error) && error.response?.status === 409) {
        queryClient.invalidateQueries({ queryKey: jobKeys.detail(id) });
      }
    },
  });
}
