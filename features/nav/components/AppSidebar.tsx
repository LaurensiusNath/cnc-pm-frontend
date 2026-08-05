"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { CurrentUserBadge } from "@/features/auth/components/CurrentUserBadge";
import { LogoutButton } from "@/features/auth/components/LogoutButton";
import { useAuthMe } from "@/features/auth/hooks/useAuthMe";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

import { navItems } from "../navItems";

export function AppSidebar() {
  const pathname = usePathname();
  const { data: currentUser } = useAuthMe();

  // Hidden entirely for a role that can't see the item (not shown
  // disabled) - same precedent as JobDetailPage's assign-technician
  // section. While currentUser is still loading, role-restricted items
  // are omitted too (briefly), rather than flashing them then hiding.
  const visibleItems = navItems.filter(
    (item) => !item.roles || (currentUser && item.roles.includes(currentUser.role)),
  );

  return (
    <Sidebar collapsible="icon" className="print:hidden">
      <SidebarHeader className="px-3 py-3">
        <span className="text-sm font-semibold text-sidebar-primary group-data-[collapsible=icon]:hidden">
          CNC Service PM
        </span>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu className="px-2">
          {visibleItems.map((item) => {
            // Exact match for the root ("/dashboard"), startsWith for
            // everything else so a detail route (e.g. /jobs/123) still
            // highlights its list item ("/jobs").
            const isActive =
              pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  isActive={isActive}
                  tooltip={item.label}
                  render={<Link href={item.href} />}
                >
                  <item.icon />
                  <span>{item.label}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="gap-2 px-3 py-3 group-data-[collapsible=icon]:items-center">
        <CurrentUserBadge />
        <LogoutButton />
      </SidebarFooter>
    </Sidebar>
  );
}
