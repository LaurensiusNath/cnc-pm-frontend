import type { TaxSummaryParams } from "../types";

export const taxReportKeys = {
  all: ["tax-report"] as const,
  summary: (params: TaxSummaryParams) =>
    [...taxReportKeys.all, "summary", params] as const,
};
