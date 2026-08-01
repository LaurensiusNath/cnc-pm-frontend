import { useMutation, useQueryClient } from "@tanstack/react-query";

import { customerService } from "../api/customerService";
import { customerKeys } from "../api/queryKeys";

export function useCreateCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: customerService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: customerKeys.lists() });
    },
  });
}
