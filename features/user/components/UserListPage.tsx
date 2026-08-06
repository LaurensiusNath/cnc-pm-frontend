"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import axios from "axios";

import { AccessDenied } from "@/components/AccessDenied";
import { buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

import { useUsers } from "../hooks/useUsers";
import type { UserRole } from "../types";
import { UserFilters } from "./UserFilters";
import { UserTable } from "./UserTable";

const VALID_ROLES: UserRole[] = ["owner", "admin", "teknisi"];

function parseRole(value: string | null): UserRole | "all" {
  return value && (VALID_ROLES as string[]).includes(value)
    ? (value as UserRole)
    : "all";
}

export function UserListPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const role = parseRole(searchParams.get("role"));

  function updateParams(patch: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(patch)) {
      if (value === null || value === "") params.delete(key);
      else params.set(key, value);
    }
    router.replace(`${pathname}?${params.toString()}`);
  }

  // Single fetch (no pagination on GET /users, small scale) - role
  // filtering happens client-side over this one cached result, not a
  // re-fetch per filter change. See UserFilters' own comment.
  const { data: users, isLoading, isError, error } = useUsers();
  const visibleUsers = role === "all" ? users : users?.filter((u) => u.role === role);

  const isForbidden = axios.isAxiosError(error) && error.response?.status === 403;
  const isEmpty = Boolean(visibleUsers) && visibleUsers!.length === 0;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Manajemen Pengguna</h1>
        <Link href="/users/new" className={cn(buttonVariants())}>
          Tambah Pengguna
        </Link>
      </div>

      <UserFilters
        role={role}
        onRoleChange={(value) => updateParams({ role: value === "all" ? null : value })}
      />

      {isLoading ? (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      ) : isForbidden ? (
        <AccessDenied resource="Manajemen Pengguna" />
      ) : isError ? (
        <p className="text-sm text-destructive">
          Gagal memuat data pengguna. Coba muat ulang halaman.
        </p>
      ) : isEmpty ? (
        <div className="rounded-md border border-dashed p-8 text-center text-sm text-muted-foreground">
          {role !== "all"
            ? "Tidak ada pengguna dengan role ini."
            : 'Belum ada pengguna lain. Klik "Tambah Pengguna" untuk mulai.'}
        </div>
      ) : (
        <UserTable users={visibleUsers ?? []} />
      )}
    </div>
  );
}
