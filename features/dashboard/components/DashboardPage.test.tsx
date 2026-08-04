import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import type { ReactElement } from "react";

import { server } from "@/mocks/server";

import { DashboardPage } from "./DashboardPage";

const replace = jest.fn();
const mockSearchParams = jest.fn(() => new URLSearchParams());

jest.mock("next/navigation", () => ({
  useRouter: () => ({ replace }),
  usePathname: () => "/dashboard",
  useSearchParams: () => mockSearchParams(),
}));

function renderWithClient(ui: ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  return render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>,
  );
}

// Shape verified live against the running backend (2026-08-04):
// GET /api/v1/dashboard/summary as owner -> 200 with exactly this shape.
function makeSummary() {
  return {
    financial: {
      period: { from: "2026-08-01T00:00:00Z", to: "2026-08-31T00:00:00Z" },
      invoiced_total: 1665000,
      received_total: 600000,
      outstanding_total: 1065000,
      by_status: {
        draft: { count: 0, total: 0 },
        sent: { count: 1, total: 1665000 },
        paid: { count: 0, total: 0 },
        overdue: { count: 0, total: 0 },
        cancelled: { count: 1, total: 333000 },
      },
    },
    jobs: {
      by_status: {
        requested: 1,
        scheduled: 0,
        in_progress: 1,
        completed: 2,
        cancelled: 0,
      },
      upcoming_7_days: [
        {
          id: "30bfc474-c976-4acd-9d82-67a5bf8937f0",
          job_code: "JOB-2026-0001",
          customer_name: "Dashboard Demo Co",
          scheduled_date: "2026-08-06T00:00:00Z",
        },
      ],
      overdue_scheduled: [
        {
          id: "7710f775-03bf-4971-82dc-2bb355ed530c",
          job_code: "JOB-2026-0002",
          customer_name: "Dashboard Demo Co",
          scheduled_date: "2026-08-01T00:00:00Z",
        },
      ],
    },
  };
}

describe("DashboardPage", () => {
  beforeEach(() => {
    replace.mockClear();
    mockSearchParams.mockReturnValue(new URLSearchParams());
  });

  it("renders financial totals, breakdowns, and scheduled job lists from GET /dashboard/summary", async () => {
    server.use(
      http.get("/api/v1/dashboard/summary", () =>
        HttpResponse.json({ success: true, data: makeSummary() }),
      ),
    );

    renderWithClient(<DashboardPage />);

    expect(await screen.findByText(/Rp\s*1\.665\.000/)).toBeInTheDocument();
    expect(screen.getByText("JOB-2026-0001")).toBeInTheDocument();
    expect(screen.getByText("JOB-2026-0002")).toBeInTheDocument();
    expect(screen.getByText(/periode: 2026-08-01/i)).toBeInTheDocument();
  });

  it("shows the empty message for a list with no entries, not a crash", async () => {
    const summary = makeSummary();
    summary.jobs.overdue_scheduled = [];
    server.use(
      http.get("/api/v1/dashboard/summary", () =>
        HttpResponse.json({ success: true, data: summary }),
      ),
    );

    renderWithClient(<DashboardPage />);

    expect(
      await screen.findByText(/tidak ada job yang terlambat/i),
    ).toBeInTheDocument();
  });

  it("sends period_from/period_to from the URL to GET /dashboard/summary", async () => {
    mockSearchParams.mockReturnValue(
      new URLSearchParams("period_from=2026-01-01&period_to=2026-12-31"),
    );

    let captured: { from: string | null; to: string | null } = { from: null, to: null };
    server.use(
      http.get("/api/v1/dashboard/summary", ({ request }) => {
        const url = new URL(request.url);
        captured = {
          from: url.searchParams.get("period_from"),
          to: url.searchParams.get("period_to"),
        };
        return HttpResponse.json({ success: true, data: makeSummary() });
      }),
    );

    renderWithClient(<DashboardPage />);

    await waitFor(() => {
      expect(captured).toEqual({ from: "2026-01-01", to: "2026-12-31" });
    });
  });

  it("updates the URL via router.replace when the period selector changes", async () => {
    server.use(
      http.get("/api/v1/dashboard/summary", () =>
        HttpResponse.json({ success: true, data: makeSummary() }),
      ),
    );

    const user = userEvent.setup();
    renderWithClient(<DashboardPage />);
    await screen.findByText(/Rp\s*1\.665\.000/);

    await user.type(screen.getByLabelText(/^dari$/i), "2026-08-01");

    await waitFor(() => {
      expect(replace).toHaveBeenCalled();
      const lastUrl = replace.mock.calls.at(-1)?.[0] as string;
      expect(lastUrl).toContain("period_from=2026-08-01");
    });
  });

  it("shows an explicit access-denied message on 403, not the generic error banner", async () => {
    server.use(
      http.get("/api/v1/dashboard/summary", () =>
        HttpResponse.json(
          { success: false, error: { code: "FORBIDDEN", message: "insufficient permissions for this action" } },
          { status: 403 },
        ),
      ),
    );

    renderWithClient(<DashboardPage />);

    expect(
      await screen.findByText(/anda tidak punya akses ke halaman ini/i),
    ).toBeInTheDocument();
    expect(
      screen.queryByText(/gagal memuat ringkasan dashboard/i),
    ).not.toBeInTheDocument();
  });
});
