import { useQuery } from "@tanstack/react-query";

import { customerService } from "../api/customerService";
import { customerKeys } from "../api/queryKeys";

// Powers the create-job cascading select: enabled only once a customer is
// actually chosen, so there's no request for a customerId that doesn't
// exist yet.
export function useCustomerMachines(customerId: string | undefined) {
  return useQuery({
    queryKey: customerKeys.machines(customerId ?? ""),
    queryFn: () => customerService.listMachines(customerId!),
    enabled: Boolean(customerId),
  });
}
