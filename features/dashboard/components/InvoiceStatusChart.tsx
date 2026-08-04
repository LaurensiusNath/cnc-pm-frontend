"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { invoiceStatusOptions } from "@/features/invoice/schema";
import { formatCurrency } from "@/lib/utils";

import type { FinancialByStatus } from "../types";

const chartConfig = {
  count: {
    label: "Jumlah Invoice",
    color: "var(--color-chart-1)",
  },
} satisfies ChartConfig;

interface InvoiceStatusChartProps {
  byStatus: FinancialByStatus;
}

// Labels reused from features/invoice/schema.ts (single source for the 5
// invoice status labels) rather than re-declared here.
export function InvoiceStatusChart({ byStatus }: InvoiceStatusChartProps) {
  const data = invoiceStatusOptions.map((opt) => ({
    status: opt.label,
    count: byStatus[opt.value].count,
    total: byStatus[opt.value].total,
  }));

  return (
    <div className="flex flex-col gap-2">
      <h2 className="text-lg font-semibold">Breakdown Invoice per Status</h2>
      <ChartContainer config={chartConfig} className="h-64 w-full">
        <BarChart data={data}>
          <CartesianGrid vertical={false} />
          <XAxis dataKey="status" tickLine={false} axisLine={false} />
          <YAxis allowDecimals={false} tickLine={false} axisLine={false} />
          <ChartTooltip
            content={
              <ChartTooltipContent
                formatter={(value, name, item) => {
                  if (name !== "count") return value;
                  const total = (item.payload as { total: number }).total;
                  return `${value} invoice (${formatCurrency(total)})`;
                }}
              />
            }
          />
          <Bar dataKey="count" fill="var(--color-count)" radius={4} />
        </BarChart>
      </ChartContainer>
    </div>
  );
}
