"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

import { Pagination } from "@/components/Pagination";
import { buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useCustomer } from "@/features/customer/hooks/useCustomer";
import type { Customer } from "@/features/customer/types";
import { cn } from "@/lib/utils";

import { useJobs } from "../hooks/useJobs";
import type { JobListParams, JobStatus } from "../types";
import { JobFilters } from "./JobFilters";
import { JobTable } from "./JobTable";

const PAGE_SIZE = 20;
const VALID_STATUSES: JobStatus[] = [
  "requested",
  "scheduled",
  "in_progress",
  "completed",
  "cancelled",
];

function parseStatus(value: string | null): JobStatus | "all" {
  return value && (VALID_STATUSES as string[]).includes(value)
    ? (value as JobStatus)
    : "all";
}

export function JobListPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const page = Math.max(1, Number(searchParams.get("page") ?? "1") || 1);
  const status = parseStatus(searchParams.get("status"));
  const customerIdFromUrl = searchParams.get("customer_id");

  // Tracks a customer picked via user interaction (RemoteSearchSelect
  // hands back the full object directly). If the page instead loads with
  // ?customer_id=... already in the URL (bookmark, or linked in from
  // elsewhere), that object isn't known yet - resolved below via
  // useCustomer so the filter's displayed value isn't just blank.
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null,
  );
  const { data: resolvedCustomer } = useCustomer(customerIdFromUrl ?? "");
  const activeCustomer =
    selectedCustomer?.id === customerIdFromUrl
      ? selectedCustomer
      : (resolvedCustomer ?? null);

  function updateParams(patch: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(patch)) {
      if (value === null || value === "") params.delete(key);
      else params.set(key, value);
    }
    router.replace(`${pathname}?${params.toString()}`);
  }

  const listParams: JobListParams = {
    page,
    limit: PAGE_SIZE,
    status: status === "all" ? undefined : status,
    customer_id: customerIdFromUrl || undefined,
  };

  const { data, isLoading, isFetching, isError } = useJobs(listParams);
  const isEmpty = Boolean(data) && data!.jobs.length === 0;
  const hasActiveFilter = status !== "all" || Boolean(customerIdFromUrl);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Job</h1>
        <Link href="/jobs/new" className={cn(buttonVariants())}>
          Tambah Job
        </Link>
      </div>

      <JobFilters
        status={status}
        onStatusChange={(value) =>
          updateParams({
            status: value === "all" ? null : value,
            page: "1",
          })
        }
        customer={activeCustomer}
        onCustomerChange={(customer) => {
          setSelectedCustomer(customer);
          updateParams({ customer_id: customer?.id ?? null, page: "1" });
        }}
      />

      {isLoading ? (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      ) : isError ? (
        <p className="text-sm text-destructive">
          Gagal memuat data job. Coba muat ulang halaman.
        </p>
      ) : isEmpty ? (
        <div className="rounded-md border border-dashed p-8 text-center text-sm text-muted-foreground">
          {hasActiveFilter
            ? "Tidak ada job yang cocok dengan filter ini."
            : 'Belum ada job. Klik "Tambah Job" untuk mulai.'}
        </div>
      ) : (
        <>
          <JobTable jobs={data?.jobs ?? []} />
          {isFetching && (
            <p className="text-xs text-muted-foreground">Memperbarui...</p>
          )}
          {data && (
            <Pagination
              page={data.meta.page}
              total={data.meta.total}
              limit={PAGE_SIZE}
              itemLabel="job"
              onPageChange={(newPage) =>
                updateParams({ page: String(newPage) })
              }
            />
          )}
        </>
      )}
    </div>
  );
}
