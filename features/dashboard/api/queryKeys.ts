import type { DashboardSummaryParams } from "../types";

export const dashboardKeys = {
  all: ["dashboard"] as const,
  summary: (params: DashboardSummaryParams) =>
    [...dashboardKeys.all, "summary", params] as const,
};
