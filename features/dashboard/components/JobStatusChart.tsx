"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { jobStatusOptions } from "@/features/job/schema";

import type { JobsByStatus } from "../types";

const chartConfig = {
  count: {
    label: "Jumlah Job",
    color: "var(--color-chart-2)",
  },
} satisfies ChartConfig;

interface JobStatusChartProps {
  byStatus: JobsByStatus;
}

// Labels reused from features/job/schema.ts (single source for the 5 job
// status labels) rather than re-declared here. All-time snapshot, not
// scoped to the selected period - see JobsSummary.ByStatus's comment in
// the backend domain.go.
export function JobStatusChart({ byStatus }: JobStatusChartProps) {
  const data = jobStatusOptions.map((opt) => ({
    status: opt.label,
    count: byStatus[opt.value],
  }));

  return (
    <div className="flex flex-col gap-2">
      <h2 className="text-lg font-semibold">Breakdown Job per Status</h2>
      <ChartContainer config={chartConfig} className="h-64 w-full">
        <BarChart data={data}>
          <CartesianGrid vertical={false} />
          <XAxis dataKey="status" tickLine={false} axisLine={false} />
          <YAxis allowDecimals={false} tickLine={false} axisLine={false} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Bar dataKey="count" fill="var(--color-count)" radius={4} />
        </BarChart>
      </ChartContainer>
    </div>
  );
}
