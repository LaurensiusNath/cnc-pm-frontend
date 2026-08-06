import { z } from "zod";

import type { UserRole } from "./types";

export const userRoleOptions = [
  { value: "owner", label: "Owner" },
  { value: "admin", label: "Admin" },
  { value: "teknisi", label: "Teknisi" },
] as const;

// Ad-hoc Tailwind classes per role, not a new CSS token - same pattern as
// invoiceStatusBadgeClassName (features/invoice/schema.ts). Decided
// against introducing --border-strong/--warning tokens for this: nothing
// in this wave actually needs a reusable semantic token, just a per-role
// visual distinction on one badge.
export const userRoleBadgeClassName: Record<UserRole, string> = {
  owner: "border-sky-500 text-sky-600 dark:border-sky-400 dark:text-sky-400",
  admin: "border-violet-500 text-violet-600 dark:border-violet-400 dark:text-violet-400",
  teknisi: "border-border text-muted-foreground",
};

export const createUserSchema = z.object({
  name: z.string().trim().min(1, "Nama wajib diisi"),
  email: z.string().trim().email("Email tidak valid"),
  password: z.string().min(8, "Minimal 8 karakter"),
  role: z.enum(["owner", "admin", "teknisi"], {
    message: "Role wajib dipilih",
  }),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
