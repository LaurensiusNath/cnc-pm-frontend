import { useQuery } from "@tanstack/react-query";

import { customerService } from "../api/customerService";
import { customerKeys } from "../api/queryKeys";

// Adapter for the generic RemoteSearchSelect's useOptions shape
// ({data, isFetching}) - reused as-is for both the customer filter on the
// job list and the customer field on the create-job form, and intended to
// be reused again for Invoice's own customer field later.
//
// A separate query rather than delegating to useCustomers: this one must
// skip fetching entirely while the query is blank (enabled: false) - an
// unopened/untouched combobox shouldn't fire a request at all, matching
// Base UI's own documented async-search pattern. useCustomers itself
// can't have that behavior baked in since the customer list page
// legitimately wants results with no search term typed yet.
export function useCustomerOptions(query: string) {
  const trimmed = query.trim();
  const { data, isFetching } = useQuery({
    queryKey: customerKeys.list({ search: trimmed, limit: 20 }),
    queryFn: () => customerService.list({ search: trimmed, limit: 20 }),
    enabled: trimmed !== "",
  });
  return { data: data?.customers, isFetching };
}
