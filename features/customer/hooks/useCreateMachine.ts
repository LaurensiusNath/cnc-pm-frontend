import { useMutation, useQueryClient } from "@tanstack/react-query";

import { customerService } from "../api/customerService";
import { customerKeys } from "../api/queryKeys";
import type { CreateMachineInput } from "../schema";

export function useCreateMachine(customerId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateMachineInput) =>
      customerService.createMachine(customerId, input),
    onSuccess: () => {
      // Invalidates the customer DETAIL query, not a separate "machines"
      // key - GET /customers/{id} nests machines directly (see
      // CustomerDetail.machines), so this is the query that actually
      // needs to refetch for the new machine to show up.
      queryClient.invalidateQueries({ queryKey: customerKeys.detail(customerId) });
    },
  });
}
