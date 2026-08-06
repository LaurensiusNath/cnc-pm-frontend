import {
  FileSpreadsheet,
  LayoutDashboard,
  Receipt,
  Settings,
  UserCog,
  Users,
  Wrench,
  type LucideIcon,
} from "lucide-react";

import type { UserRole } from "@/features/auth/types";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  /** Omitted = visible to every logged-in role. */
  roles?: UserRole[];
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

// Single source for the app's nav structure - AppSidebar renders this
// grouped list, filtering both items (by role) and whole groups (a group
// with zero visible items after filtering isn't rendered at all - see
// AppSidebar). "Administrasi" is owner/admin-only across the board: even
// though GET /settings/company itself is open to every logged-in role
// (see features/settings' read-only-for-non-admin note), the NAV ENTRY
// for it is still hidden from teknisi - two different, deliberately
// separate decisions (nav visibility vs backend authorization), see
// CLAUDE.md's "AccessDenied vs read-only" Pola & Gotcha entry.
export const navGroups: NavGroup[] = [
  {
    label: "Operasional",
    items: [
      { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard, roles: ["owner", "admin"] },
      { label: "Job", href: "/jobs", icon: Wrench },
      { label: "Customer", href: "/customers", icon: Users },
      { label: "Invoice", href: "/invoices", icon: Receipt },
      { label: "Laporan Pajak", href: "/tax-report", icon: FileSpreadsheet, roles: ["owner", "admin"] },
    ],
  },
  {
    label: "Administrasi",
    items: [
      { label: "Pengguna", href: "/users", icon: UserCog, roles: ["owner", "admin"] },
      { label: "Pengaturan", href: "/settings/company", icon: Settings, roles: ["owner", "admin"] },
    ],
  },
];
