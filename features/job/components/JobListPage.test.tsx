import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import type { ReactElement } from "react";

import { server } from "@/mocks/server";

import type { Job } from "../types";
import { JobListPage } from "./JobListPage";

const replace = jest.fn();
const push = jest.fn();
const mockSearchParams = jest.fn(() => new URLSearchParams());

jest.mock("next/navigation", () => ({
  useRouter: () => ({ replace, push }),
  usePathname: () => "/jobs",
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

function makeJob(overrides: Partial<Job> = {}): Job {
  return {
    id: "job-1",
    job_code: "JOB-2026-0001",
    customer_id: "cust-1",
    machine_id: null,
    technician_id: null,
    title: "Servis CNC rutin",
    description: null,
    status: "requested",
    scheduled_date: "2026-08-10",
    completed_date: null,
    created_at: "2026-08-01T00:00:00Z",
    updated_at: "2026-08-01T00:00:00Z",
    ...overrides,
  };
}

describe("JobListPage", () => {
  beforeEach(() => {
    replace.mockClear();
    push.mockClear();
    mockSearchParams.mockReturnValue(new URLSearchParams());
  });

  it("renders jobs returned by GET /jobs", async () => {
    server.use(
      http.get("/api/v1/jobs", () =>
        HttpResponse.json({
          success: true,
          data: [makeJob()],
          meta: { page: 1, total: 1 },
        }),
      ),
    );

    renderWithClient(<JobListPage />);

    expect(await screen.findByText("JOB-2026-0001")).toBeInTheDocument();
  });

  it("shows the empty state when there are no jobs and no active filter", async () => {
    server.use(
      http.get("/api/v1/jobs", () =>
        HttpResponse.json({ success: true, data: [], meta: { page: 1, total: 0 } }),
      ),
    );

    renderWithClient(<JobListPage />);

    expect(await screen.findByText(/belum ada job/i)).toBeInTheDocument();
  });

  it("updates the status filter via router.replace", async () => {
    server.use(
      http.get("/api/v1/jobs", () =>
        HttpResponse.json({ success: true, data: [], meta: { page: 1, total: 0 } }),
      ),
    );

    const user = userEvent.setup();
    renderWithClient(<JobListPage />);

    await user.click(screen.getByRole("combobox", { name: /filter status/i }));
    await user.click(await screen.findByRole("option", { name: "Terjadwal" }));

    await waitFor(() => {
      expect(replace).toHaveBeenCalled();
      const lastUrl = replace.mock.calls.at(-1)?.[0] as string;
      expect(lastUrl).toContain("status=scheduled");
      expect(lastUrl).toContain("page=1");
    });
  });

  it("sends the status param from the URL to GET /jobs", async () => {
    mockSearchParams.mockReturnValue(new URLSearchParams("status=in_progress"));

    let capturedStatus: string | null = null;
    server.use(
      http.get("/api/v1/jobs", ({ request }) => {
        capturedStatus = new URL(request.url).searchParams.get("status");
        return HttpResponse.json({
          success: true,
          data: [makeJob({ status: "in_progress" })],
          meta: { page: 1, total: 1 },
        });
      }),
    );

    renderWithClient(<JobListPage />);

    await screen.findByText("JOB-2026-0001");
    expect(capturedStatus).toBe("in_progress");
  });

  it("selects a customer from the searchable combobox and updates the URL", async () => {
    server.use(
      http.get("/api/v1/jobs", () =>
        HttpResponse.json({ success: true, data: [], meta: { page: 1, total: 0 } }),
      ),
      http.get("/api/v1/customers", () =>
        HttpResponse.json({
          success: true,
          data: [
            {
              id: "cust-1",
              name: "Acme Corp",
              customer_type: "badan_usaha",
              phone: null,
              email: null,
              address: null,
              company_name: null,
              created_at: "2026-01-01T00:00:00Z",
              updated_at: "2026-01-01T00:00:00Z",
              deleted_at: null,
            },
          ],
          meta: { page: 1, total: 1 },
        }),
      ),
    );

    const user = userEvent.setup();
    renderWithClient(<JobListPage />);

    await user.click(screen.getByRole("combobox", { name: /filter customer/i }));
    await user.type(
      screen.getByRole("combobox", { name: /filter customer/i }),
      "Acme",
    );
    await user.click(await screen.findByRole("option", { name: "Acme Corp" }));

    await waitFor(() => {
      expect(replace).toHaveBeenCalled();
      const lastUrl = replace.mock.calls.at(-1)?.[0] as string;
      expect(lastUrl).toContain("customer_id=cust-1");
    });
  });

  it("sends the customer_id param from the URL to GET /jobs", async () => {
    mockSearchParams.mockReturnValue(new URLSearchParams("customer_id=cust-1"));

    let capturedCustomerId: string | null = null;
    server.use(
      http.get("/api/v1/jobs", ({ request }) => {
        capturedCustomerId = new URL(request.url).searchParams.get(
          "customer_id",
        );
        return HttpResponse.json({
          success: true,
          data: [makeJob()],
          meta: { page: 1, total: 1 },
        });
      }),
      http.get("/api/v1/customers/cust-1", () =>
        HttpResponse.json({
          success: true,
          data: {
            id: "cust-1",
            name: "Acme Corp",
            customer_type: "badan_usaha",
            phone: null,
            email: null,
            address: null,
            company_name: null,
            created_at: "2026-01-01T00:00:00Z",
            updated_at: "2026-01-01T00:00:00Z",
            deleted_at: null,
            machines: [],
          },
        }),
      ),
    );

    renderWithClient(<JobListPage />);

    await screen.findByText("JOB-2026-0001");
    expect(capturedCustomerId).toBe("cust-1");
    // Resolved customer name should now be visible in the filter combobox.
    expect(await screen.findByDisplayValue("Acme Corp")).toBeInTheDocument();
  });
});
