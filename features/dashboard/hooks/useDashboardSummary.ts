import { useQuery } from "@tanstack/react-query";

import { dashboardService } from "../api/dashboardService";
import { dashboardKeys } from "../api/queryKeys";
import type { DashboardSummaryParams } from "../types";

// retry: false - a 403 for a teknisi-role viewer is a deterministic
// permission state (route is owner/admin-only, see cmd/api/main.go's
// adminGroup), not a transient failure, same reasoning as every other
// 403/404-as-valid-state case in this app.
export function useDashboardSummary(params: DashboardSummaryParams) {
  return useQuery({
    queryKey: dashboardKeys.summary(params),
    queryFn: () => dashboardService.getSummary(params),
    retry: false,
  });
}
