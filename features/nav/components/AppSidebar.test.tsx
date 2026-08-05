import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import type { ReactElement } from "react";

import { SidebarProvider } from "@/components/ui/sidebar";
import { server } from "@/mocks/server";

import { AppSidebar } from "./AppSidebar";

jest.mock("next/navigation", () => ({
  usePathname: () => "/jobs/job-1",
  useRouter: () => ({ push: jest.fn() }),
}));

function renderWithProviders(ui: ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <SidebarProvider>{ui}</SidebarProvider>
    </QueryClientProvider>,
  );
}

function mockAuthMe(role: "owner" | "admin" | "teknisi") {
  server.use(
    http.get("/api/v1/auth/me", () =>
      HttpResponse.json({
        success: true,
        data: { user: { id: "u-1", name: "Test User", email: "u@x.test", role } },
      }),
    ),
  );
}

describe("AppSidebar", () => {
  it("shows every nav item, including Dashboard and Laporan Pajak, for an owner", async () => {
    mockAuthMe("owner");
    renderWithProviders(<AppSidebar />);

    expect(await screen.findByRole("link", { name: /dashboard/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /^job$/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /customer/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /^invoice$/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /laporan pajak/i })).toBeInTheDocument();
  });

  it("hides Dashboard and Laporan Pajak for a teknisi viewer, keeps the rest", async () => {
    mockAuthMe("teknisi");
    renderWithProviders(<AppSidebar />);

    expect(await screen.findByRole("link", { name: /^job$/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /customer/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /^invoice$/i })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /dashboard/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /laporan pajak/i })).not.toBeInTheDocument();
  });

  it("marks the Job item active when the current path is a job detail route", async () => {
    mockAuthMe("owner");
    renderWithProviders(<AppSidebar />);

    // Base UI's useRender exposes boolean state as attribute PRESENCE
    // (data-active="", not data-active="true") - the CSS in
    // sidebarMenuButtonVariants selects on presence too (`data-active:...`).
    const jobLink = await screen.findByRole("link", { name: /^job$/i });
    expect(jobLink).toHaveAttribute("data-active");
    const dashboardLink = await screen.findByRole("link", { name: /customer/i });
    expect(dashboardLink).not.toHaveAttribute("data-active");
  });
});
