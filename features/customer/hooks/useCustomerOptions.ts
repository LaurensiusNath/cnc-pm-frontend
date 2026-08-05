import { useQuery } from "@tanstack/react-query";

import { customerService } from "../api/customerService";
import { customerKeys } from "../api/queryKeys";

// Adapter for the generic RemoteSearchSelect's useOptions shape
// ({data, isFetching}) - reused as-is for both the customer filter on the
// job list and the customer field on the create-job form, and intended to
// be reused again for Invoice's own customer field later.
//
// Always enabled (no `enabled: trimmed !== ""` gate) - the popup shows
// the first page of all customers as soon as it opens (RemoteSearchSelect's
// own Combobox popup is already scrollable, see components/ui/combobox.tsx),
// not just after the user starts typing. Search narrows that list, it isn't
// the only way to populate it - a plain empty `search` param already
// returns the unfiltered list, same as the Customer list page's own default.
export function useCustomerOptions(query: string) {
  const trimmed = query.trim();
  const { data, isFetching } = useQuery({
    queryKey: customerKeys.list({ search: trimmed, limit: 20 }),
    queryFn: () => customerService.list({ search: trimmed, limit: 20 }),
  });
  return { data: data?.customers, isFetching };
}
