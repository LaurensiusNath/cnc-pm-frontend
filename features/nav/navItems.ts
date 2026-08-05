import {
  FileSpreadsheet,
  LayoutDashboard,
  Receipt,
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

// Single source for the app's nav structure - AppSidebar renders this
// list, filtered by the logged-in user's role. Dashboard and Laporan
// Pajak are owner/admin-only because their backing endpoints
// (GET /dashboard/summary, GET /reports/tax-summary) 403 for teknisi -
// hidden entirely rather than shown disabled, same precedent as
// JobDetailPage's assign-technician section.
export const navItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard, roles: ["owner", "admin"] },
  { label: "Job", href: "/jobs", icon: Wrench },
  { label: "Customer", href: "/customers", icon: Users },
  { label: "Invoice", href: "/invoices", icon: Receipt },
  { label: "Laporan Pajak", href: "/tax-report", icon: FileSpreadsheet, roles: ["owner", "admin"] },
];
