import { Suspense } from "react";

import { TaxReportPage } from "@/features/tax-report/components/TaxReportPage";

export default function TaxReportRoute() {
  return (
    <Suspense fallback={null}>
      <TaxReportPage />
    </Suspense>
  );
}
