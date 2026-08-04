import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

import type { FinancialSummary } from "../types";

interface FinancialSummaryCardsProps {
  financial: FinancialSummary;
}

export function FinancialSummaryCards({ financial }: FinancialSummaryCardsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <Card>
        <CardHeader>
          <CardDescription>Total Ditagihkan</CardDescription>
          <CardTitle className="text-2xl">
            {formatCurrency(financial.invoiced_total)}
          </CardTitle>
        </CardHeader>
      </Card>
      <Card>
        <CardHeader>
          <CardDescription>Total Diterima</CardDescription>
          <CardTitle className="text-2xl">
            {formatCurrency(financial.received_total)}
          </CardTitle>
        </CardHeader>
      </Card>
      <Card>
        <CardHeader>
          <CardDescription>Sisa Tagihan (Outstanding)</CardDescription>
          {/*
            outstanding_total is shown exactly as returned by the backend,
            INCLUDING when negative - never Math.abs()'d or clamped to 0.
            A negative value here is a deliberate diagnostic signal: it can
            only happen if an invoice was manually PATCHed back to sent/
            overdue after already being paid (no state-machine enforcement,
            see docs/api-contract.md Catatan Desain #7/#6) - hiding it would
            hide exactly the anomaly this number exists to surface.
          */}
          <CardTitle
            className={
              financial.outstanding_total < 0
                ? "text-2xl text-destructive"
                : "text-2xl"
            }
          >
            {formatCurrency(financial.outstanding_total)}
          </CardTitle>
        </CardHeader>
      </Card>
    </div>
  );
}
