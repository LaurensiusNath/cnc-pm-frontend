import { useMutation, useQueryClient } from "@tanstack/react-query";

import { customerService } from "../api/customerService";
import { customerKeys } from "../api/queryKeys";

export function useDeleteCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => customerService.remove(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: customerKeys.lists() });
      queryClient.removeQueries({ queryKey: customerKeys.detail(id) });
    },
  });
}
