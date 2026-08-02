// UserRole is the same enum as features/auth's AuthUser.role - reused from
// there (single source), not redeclared, since internal/user and
// internal/auth share the same users.role column on the backend.
import type { UserRole } from "@/features/auth/types";

export type { UserRole };

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}
