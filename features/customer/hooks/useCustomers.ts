import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { customerService } from "../api/customerService";
import { customerKeys } from "../api/queryKeys";
import type { CustomerListParams } from "../types";

export function useCustomers(params: CustomerListParams) {
  return useQuery({
    queryKey: customerKeys.list(params),
    queryFn: () => customerService.list(params),
    // Keeps the current page's rows visible (instead of flashing to a
    // loading state) while the next page/search/filter result is
    // in flight - avoids the table jumping to empty on every change.
    placeholderData: keepPreviousData,
  });
}
