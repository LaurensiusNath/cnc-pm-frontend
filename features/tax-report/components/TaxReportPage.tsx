"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import axios from "axios";

import { AccessDenied } from "@/components/AccessDenied";
import { PeriodSelector } from "@/components/PeriodSelector";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDateOnly } from "@/lib/utils";

import { useTaxSummary } from "../hooks/useTaxSummary";
import { PPh23Section } from "./PPh23Section";
import { PPNSection } from "./PPNSection";

export function TaxReportPage() {
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

  const { data, isLoading, isError, error } = useTaxSummary({
    period_from: periodFrom ?? undefined,
    period_to: periodTo ?? undefined,
  });

  const isForbidden = axios.isAxiosError(error) && error.response?.status === 403;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4 print:hidden">
        <h1 className="text-2xl font-semibold">Laporan Pajak</h1>
        <PeriodSelector
          periodFrom={periodFrom}
          periodTo={periodTo}
          onChange={updateParams}
        />
      </div>
      {/* Print-only heading - the header row above (with the period
          controls) is print:hidden, but the title itself should still
          show up on the printed page. */}
      <h1 className="hidden text-2xl font-semibold print:block">Laporan Pajak</h1>

      {isLoading ? (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      ) : isForbidden ? (
        <AccessDenied resource="Laporan Pajak" />
      ) : isError || !data ? (
        <p className="text-sm text-destructive">
          Gagal memuat laporan pajak. Coba muat ulang halaman.
        </p>
      ) : (
        <>
          {/* period.from/to come straight from the response (dateonly.Date
              since day one for this endpoint) - never computed client-side. */}
          <p className="text-sm text-muted-foreground">
            Periode: {formatDateOnly(data.period.from)} —{" "}
            {formatDateOnly(data.period.to)}
          </p>

          <PPNSection ppn={data.ppn} />
          <PPh23Section pph23={data.pph23} />
        </>
      )}
    </div>
  );
}
