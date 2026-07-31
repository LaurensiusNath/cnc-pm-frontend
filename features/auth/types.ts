export type UserRole = "owner" | "admin" | "teknisi";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}
