"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useDebouncedValue } from "@/lib/useDebouncedValue";

import { useCustomers } from "../hooks/useCustomers";
import type { CustomerListParams, CustomerType } from "../types";
import { CustomerFilters } from "./CustomerFilters";
import { CustomerPagination } from "./CustomerPagination";
import { CustomerTable } from "./CustomerTable";

const PAGE_SIZE = 20;
const SEARCH_DEBOUNCE_MS = 400;

function parseCustomerType(value: string | null): CustomerType | "all" {
  return value === "badan_usaha" || value === "perorangan" ? value : "all";
}

export function CustomerListPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const page = Math.max(1, Number(searchParams.get("page") ?? "1") || 1);
  const urlSearch = searchParams.get("search") ?? "";
  const customerType = parseCustomerType(searchParams.get("customer_type"));

  // Raw input updates instantly for a responsive field; only the debounced
  // value ever reaches the URL/query, so typing doesn't trigger a fetch
  // per keystroke.
  const [searchInput, setSearchInput] = useState(urlSearch);
  const debouncedSearch = useDebouncedValue(searchInput, SEARCH_DEBOUNCE_MS);

  // Keeps the input in sync with the URL when it changes from outside our
  // own typing (e.g. browser back/forward across a previous search) -
  // adjusted during render rather than in an Effect, per React's guidance
  // on deriving state from a changed prop without an extra render pass.
  const [prevUrlSearch, setPrevUrlSearch] = useState(urlSearch);
  if (urlSearch !== prevUrlSearch) {
    setPrevUrlSearch(urlSearch);
    setSearchInput(urlSearch);
  }

  function updateParams(patch: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(patch)) {
      if (value === null || value === "") params.delete(key);
      else params.set(key, value);
    }
    // replace, not push: search/filter/pagination refine the same view
    // rather than each being a distinct page in browser history.
    router.replace(`${pathname}?${params.toString()}`);
  }

  useEffect(() => {
    if (debouncedSearch === urlSearch) return;
    updateParams({ search: debouncedSearch || null, page: "1" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  const listParams: CustomerListParams = {
    page,
    limit: PAGE_SIZE,
    search: urlSearch || undefined,
    customer_type: customerType === "all" ? undefined : customerType,
  };

  const { data, isLoading, isFetching, isError } = useCustomers(listParams);
  const isEmpty = Boolean(data) && data!.customers.length === 0;
  const hasActiveFilter = Boolean(urlSearch) || customerType !== "all";

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Customer</h1>
        <Link href="/customers/new" className={cn(buttonVariants())}>
          Tambah Customer
        </Link>
      </div>

      <CustomerFilters
        searchValue={searchInput}
        onSearchChange={setSearchInput}
        customerType={customerType}
        onCustomerTypeChange={(value) =>
          updateParams({
            customer_type: value === "all" ? null : value,
            page: "1",
          })
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
          Gagal memuat data customer. Coba muat ulang halaman.
        </p>
      ) : isEmpty ? (
        <div className="rounded-md border border-dashed p-8 text-center text-sm text-muted-foreground">
          {hasActiveFilter
            ? "Tidak ada customer yang cocok dengan pencarian/filter ini."
            : 'Belum ada customer. Klik "Tambah Customer" untuk mulai.'}
        </div>
      ) : (
        <>
          <CustomerTable customers={data?.customers ?? []} />
          {isFetching && (
            <p className="text-xs text-muted-foreground">Memperbarui...</p>
          )}
          {data && (
            <CustomerPagination
              page={data.meta.page}
              total={data.meta.total}
              limit={PAGE_SIZE}
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
