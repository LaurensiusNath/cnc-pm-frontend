import { api } from "@/lib/axios";
import type { ApiSuccess } from "@/types/api";

import type { DashboardSummary, DashboardSummaryParams } from "../types";

export const dashboardService = {
  getSummary: async (
    params: DashboardSummaryParams,
  ): Promise<DashboardSummary> => {
    const { data } = await api.get<ApiSuccess<DashboardSummary>>(
      "/v1/dashboard/summary",
      { params },
    );
    return data.data;
  },
};
