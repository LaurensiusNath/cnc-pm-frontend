import { useQuery } from "@tanstack/react-query";

import { customerService } from "../api/customerService";
import { customerKeys } from "../api/queryKeys";

export function useCustomer(id: string) {
  return useQuery({
    queryKey: customerKeys.detail(id),
    queryFn: () => customerService.getById(id),
    enabled: Boolean(id),
  });
}
