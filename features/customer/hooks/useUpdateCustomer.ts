import { useMutation, useQueryClient } from "@tanstack/react-query";

import { customerService } from "../api/customerService";
import { customerKeys } from "../api/queryKeys";
import type { UpdateCustomerInput } from "../schema";

export function useUpdateCustomer(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateCustomerInput) =>
      customerService.update(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: customerKeys.lists() });
      queryClient.invalidateQueries({ queryKey: customerKeys.detail(id) });
    },
  });
}
