"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { Pagination } from "@/components/Pagination";
import { Skeleton } from "@/components/ui/skeleton";

import { useInvoices } from "../hooks/useInvoices";
import type { InvoiceListParams, InvoiceStatus } from "../types";
import { InvoiceFilters } from "./InvoiceFilters";
import { InvoiceTable } from "./InvoiceTable";

const PAGE_SIZE = 20;
const VALID_STATUSES: InvoiceStatus[] = [
  "draft",
  "sent",
  "paid",
  "overdue",
  "cancelled",
];

function parseStatus(value: string | null): InvoiceStatus | "all" {
  return value && (VALID_STATUSES as string[]).includes(value)
    ? (value as InvoiceStatus)
    : "all";
}

export function InvoiceListPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const page = Math.max(1, Number(searchParams.get("page") ?? "1") || 1);
  const status = parseStatus(searchParams.get("status"));

  function updateParams(patch: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(patch)) {
      if (value === null || value === "") params.delete(key);
      else params.set(key, value);
    }
    router.replace(`${pathname}?${params.toString()}`);
  }

  const listParams: InvoiceListParams = {
    page,
    limit: PAGE_SIZE,
    status: status === "all" ? undefined : status,
  };

  const { data, isLoading, isFetching, isError } = useInvoices(listParams);
  const isEmpty = Boolean(data) && data!.invoices.length === 0;

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold">Invoice</h1>

      <InvoiceFilters
        status={status}
        onStatusChange={(value) =>
          updateParams({ status: value === "all" ? null : value, page: "1" })
        }
      />

      {isLoading ? (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      ) : isError ? (
        <p className="text-sm text-destructive">
          Gagal memuat data invoice. Coba muat ulang halaman.
        </p>
      ) : isEmpty ? (
        <div className="rounded-md border border-dashed p-8 text-center text-sm text-muted-foreground">
          {status !== "all"
            ? "Tidak ada invoice yang cocok dengan filter ini."
            : "Belum ada invoice. Invoice dibuat dari halaman detail job yang sudah selesai."}
        </div>
      ) : (
        <>
          <InvoiceTable invoices={data?.invoices ?? []} />
          {isFetching && (
            <p className="text-xs text-muted-foreground">Memperbarui...</p>
          )}
          {data && (
            <Pagination
              page={data.meta.page}
              total={data.meta.total}
              limit={PAGE_SIZE}
              itemLabel="invoice"
              onPageChange={(newPage) => updateParams({ page: String(newPage) })}
            />
          )}
        </>
      )}
    </div>
  );
}
