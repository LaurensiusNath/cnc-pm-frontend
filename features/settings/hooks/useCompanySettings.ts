import { useQuery } from "@tanstack/react-query";

import { settingsService } from "../api/settingsService";
import { settingsKeys } from "../api/queryKeys";

// No retry:false here unlike Dashboard/Tax Report/Users - GET is open to
// every logged-in role (see settingsService.get's comment), a 403 here
// would be a genuine unexpected failure worth retrying, not a
// deterministic permission state.
export function useCompanySettings() {
  return useQuery({
    queryKey: settingsKeys.company,
    queryFn: settingsService.get,
  });
}
