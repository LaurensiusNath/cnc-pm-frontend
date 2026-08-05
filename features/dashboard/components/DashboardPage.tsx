"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import axios from "axios";

import { AccessDenied } from "@/components/AccessDenied";
import { PeriodSelector } from "@/components/PeriodSelector";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDateOnly } from "@/lib/utils";

import { useDashboardSummary } from "../hooks/useDashboardSummary";
import { FinancialSummaryCards } from "./FinancialSummaryCards";
import { InvoiceStatusChart } from "./InvoiceStatusChart";
import { JobStatusChart } from "./JobStatusChart";
import { ScheduledJobList } from "./ScheduledJobList";

export function DashboardPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const periodFrom = searchParams.get("period_from");
  const periodTo = searchParams.get("period_to");

  function updateParams(patch: { period_from: string | null; period_to: string | null }) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(patch)) {
      if (value === null || value === "") params.delete(key);
      else params.set(key, value);
    }
    router.replace(`${pathname}?${params.toString()}`);
  }

  const { data, isLoading, isError, error } = useDashboardSummary({
    period_from: periodFrom ?? undefined,
    period_to: periodTo ?? undefined,
  });

  const isForbidden = axios.isAxiosError(error) && error.response?.status === 403;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <PeriodSelector
          periodFrom={periodFrom}
          periodTo={periodTo}
          onChange={updateParams}
        />
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      ) : isForbidden ? (
        <AccessDenied resource="Dashboard" />
      ) : isError || !data ? (
        <p className="text-sm text-destructive">
          Gagal memuat ringkasan dashboard. Coba muat ulang halaman.
        </p>
      ) : (
        <>
          {/* Period label always comes from the response's own
              financial.period, never computed client-side - the frontend
              never guesses what "current month" resolved to. */}
          <p className="text-sm text-muted-foreground">
            Periode: {formatDateOnly(data.financial.period.from)} —{" "}
            {formatDateOnly(data.financial.period.to)}
          </p>

          <FinancialSummaryCards financial={data.financial} />

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <InvoiceStatusChart byStatus={data.financial.by_status} />
            <JobStatusChart byStatus={data.jobs.by_status} />
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <ScheduledJobList
              title="Jadwal 7 Hari ke Depan"
              jobs={data.jobs.upcoming_7_days}
              emptyMessage="Tidak ada job terjadwal dalam 7 hari ke depan."
            />
            <ScheduledJobList
              title="Terlambat Dikerjakan"
              jobs={data.jobs.overdue_scheduled}
              emptyMessage="Tidak ada job yang terlambat."
              emphasize
            />
          </div>
        </>
      )}
    </div>
  );
}
