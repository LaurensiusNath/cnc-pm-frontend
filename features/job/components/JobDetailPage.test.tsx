import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import type { ReactElement } from "react";

import { server } from "@/mocks/server";

import { JobDetailPage } from "./JobDetailPage";

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

const jobDetail = {
  id: "job-1",
  job_code: "JOB-2026-0001",
  customer_id: "cust-1",
  machine_id: "machine-1",
  technician_id: "tech-1",
  title: "Servis CNC rutin",
  description: "Ganti oli dan cek spindle",
  status: "in_progress",
  scheduled_date: "2026-08-10",
  completed_date: null,
  created_at: "2026-08-01T00:00:00Z",
  updated_at: "2026-08-01T00:00:00Z",
  status_history: [
    {
      id: "hist-1",
      job_id: "job-1",
      status: "requested",
      changed_by: "owner-1",
      changed_at: "2026-08-01T00:00:00Z",
      notes: null,
    },
  ],
  costs: [],
};

const customerDetail = {
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
  machines: [
    {
      id: "machine-1",
      customer_id: "cust-1",
      machine_name: "CNC Mill A",
      machine_type: null,
      serial_number: null,
      notes: null,
      created_at: "2026-01-01T00:00:00Z",
      updated_at: "2026-01-01T00:00:00Z",
    },
  ],
};

const allUsers = [
  { id: "owner-1", name: "Pemilik Bengkel", email: "owner@x.test", role: "owner" },
  { id: "tech-1", name: "Budi Teknisi", email: "budi@x.test", role: "teknisi" },
];

function mockCommonHandlers() {
  server.use(
    http.get("/api/v1/jobs/job-1", () =>
      HttpResponse.json({ success: true, data: jobDetail }),
    ),
    http.get("/api/v1/jobs/job-1/costs", () =>
      HttpResponse.json({
        success: true,
        data: [],
        meta: { total_selling: 0, total_margin: 0 },
      }),
    ),
    http.get("/api/v1/customers/cust-1", () =>
      HttpResponse.json({ success: true, data: customerDetail }),
    ),
  );
}

describe("JobDetailPage", () => {
  it("renders job info and resolved status history author name for an owner viewer", async () => {
    mockCommonHandlers();
    server.use(
      http.get("/api/v1/users", () =>
        HttpResponse.json({ success: true, data: allUsers }),
      ),
      http.get("/api/v1/auth/me", () =>
        HttpResponse.json({
          success: true,
          data: { user: { id: "owner-1", name: "Pemilik Bengkel", email: "owner@x.test", role: "owner" } },
        }),
      ),
    );

    renderWithClient(<JobDetailPage jobId="job-1" />);

    expect(await screen.findByText("Servis CNC rutin")).toBeInTheDocument();
    expect(screen.getByText("JOB-2026-0001")).toBeInTheDocument();
    expect(await screen.findByText("Acme Corp")).toBeInTheDocument();
    expect(await screen.findByText("CNC Mill A")).toBeInTheDocument();
    expect(await screen.findByText("Budi Teknisi")).toBeInTheDocument();
    expect(await screen.findByText(/oleh pemilik bengkel/i)).toBeInTheDocument();

    // Owner can manage assignment.
    expect(
      await screen.findByRole("heading", { name: /assign teknisi/i }),
    ).toBeInTheDocument();
  });

  it("hides the assign-technician section for a teknisi viewer (GET /users is admin-only)", async () => {
    mockCommonHandlers();
    server.use(
      http.get("/api/v1/users", () =>
        HttpResponse.json(
          { success: false, error: { code: "FORBIDDEN", message: "forbidden" } },
          { status: 403 },
        ),
      ),
      http.get("/api/v1/auth/me", () =>
        HttpResponse.json({
          success: true,
          data: { user: { id: "tech-1", name: "Budi Teknisi", email: "budi@x.test", role: "teknisi" } },
        }),
      ),
    );

    renderWithClient(<JobDetailPage jobId="job-1" />);

    expect(await screen.findByText("Servis CNC rutin")).toBeInTheDocument();
    // changed_by can't be resolved to a name (GET /users 403'd) - falls
    // back to a truncated id instead of crashing or showing nothing.
    expect(await screen.findByText(/oleh id owner-1/i)).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: /assign teknisi/i }),
    ).not.toBeInTheDocument();
  });
});
