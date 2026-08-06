"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { userRoleOptions } from "../schema";
import type { UserRole } from "../types";

// Select.Value renders the raw value by default (Base UI docs) - without
// this, the trigger would show "teknisi"/"all" literally.
function roleLabel(value: string) {
  if (value === "all") return "Semua Role";
  return userRoleOptions.find((opt) => opt.value === value)?.label ?? value;
}

interface UserFiltersProps {
  role: UserRole | "all";
  onRoleChange: (value: UserRole | "all") => void;
}

// Filters client-side over the single useUsers() fetch (no pagination on
// this endpoint, small scale) - deliberately NOT a separate query per
// role, see UserListPage.
export function UserFilters({ role, onRoleChange }: UserFiltersProps) {
  return (
    <Select value={role} onValueChange={(value) => onRoleChange(value as UserRole | "all")}>
      <SelectTrigger className="sm:w-48" aria-label="Filter role">
        <SelectValue placeholder="Semua Role">
          {(value: string | null) => (value ? roleLabel(value) : "Semua Role")}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">Semua Role</SelectItem>
        {userRoleOptions.map((opt) => (
          <SelectItem key={opt.value} value={opt.value}>
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
