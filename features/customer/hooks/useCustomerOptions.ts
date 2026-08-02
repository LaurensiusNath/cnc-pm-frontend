import { useCustomers } from "./useCustomers";

// Adapter between useCustomers (returns {customers, meta}, built for the
// list page) and the generic RemoteSearchSelect's useOptions shape
// ({data, isFetching}) - reused as-is for both the customer filter on the
// job list and the customer field on the create-job form, and intended to
// be reused again for Invoice's own customer field later.
export function useCustomerOptions(query: string) {
  const { data, isFetching } = useCustomers({ search: query, limit: 20 });
  return { data: data?.customers, isFetching };
}
