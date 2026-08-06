"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Fragment } from "react";

import { CurrentUserBadge } from "@/features/auth/components/CurrentUserBadge";
import { LogoutButton } from "@/features/auth/components/LogoutButton";
import { useAuthMe } from "@/features/auth/hooks/useAuthMe";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar";

import { navGroups } from "../navItems";

export function AppSidebar() {
  const pathname = usePathname();
  const { data: currentUser } = useAuthMe();

  function isVisible(roles?: string[]) {
    // Hidden entirely for a role that can't see the item (not shown
    // disabled) - same precedent as JobDetailPage's assign-technician
    // section. While currentUser is still loading, role-restricted items
    // are omitted too (briefly), rather than flashing them then hiding.
    return !roles || (currentUser && roles.includes(currentUser.role));
  }

  // Filter both items (by role) and whole groups (a group left with zero
  // visible items - e.g. "Administrasi" for a teknisi viewer - isn't
  // rendered at all, not even its label/separator).
  const renderedGroups = navGroups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => isVisible(item.roles)),
    }))
    .filter((group) => group.items.length > 0);

  return (
    <Sidebar collapsible="icon" className="print:hidden">
      <SidebarHeader className="px-3 py-3">
        <span className="text-sm font-semibold text-sidebar-primary group-data-[collapsible=icon]:hidden">
          CNC Service PM
        </span>
      </SidebarHeader>
      <SidebarContent>
        {renderedGroups.map((group, index) => (
          <Fragment key={group.label}>
            {index > 0 && <SidebarSeparator />}
            <SidebarGroup>
              <SidebarGroupLabel className="uppercase tracking-wider">
                {group.label}
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {group.items.map((item) => {
                    // Exact match for the root, startsWith for everything
                    // else so a detail route (e.g. /jobs/123) still
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
              </SidebarGroupContent>
            </SidebarGroup>
          </Fragment>
        ))}
      </SidebarContent>
      <SidebarFooter className="gap-2 px-3 py-3 group-data-[collapsible=icon]:items-center">
        <CurrentUserBadge />
        <LogoutButton />
      </SidebarFooter>
    </Sidebar>
  );
}
