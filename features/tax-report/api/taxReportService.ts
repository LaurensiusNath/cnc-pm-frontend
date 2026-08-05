import { api } from "@/lib/axios";
import type { ApiSuccess } from "@/types/api";

import type { TaxSummary, TaxSummaryParams } from "../types";

export const taxReportService = {
  getSummary: async (params: TaxSummaryParams): Promise<TaxSummary> => {
    const { data } = await api.get<ApiSuccess<TaxSummary>>(
      "/v1/reports/tax-summary",
      { params },
    );
    return data.data;
  },
};
