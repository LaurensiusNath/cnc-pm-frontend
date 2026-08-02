"use client";

import { useAuthMe } from "../hooks/useAuthMe";
import type { UserRole } from "../types";

const ROLE_LABELS: Record<UserRole, string> = {
  owner: "Owner",
  admin: "Admin",
  teknisi: "Teknisi",
};

export function CurrentUserBadge() {
  const { data: user, isLoading } = useAuthMe();

  if (isLoading || !user) {
    return null;
  }

  return (
    <span className="text-sm text-muted-foreground">
      {user.name}{" "}
      <span className="text-xs">({ROLE_LABELS[user.role] ?? user.role})</span>
    </span>
  );
}
