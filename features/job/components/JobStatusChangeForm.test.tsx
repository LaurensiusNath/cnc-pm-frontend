import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import type { ReactElement } from "react";

import { server } from "@/mocks/server";

import { JobStatusChangeForm } from "./JobStatusChangeForm";

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

describe("JobStatusChangeForm", () => {
  it("offers every other status with no ordering restriction", async () => {
    const user = userEvent.setup();
    renderWithClient(
      <JobStatusChangeForm jobId="job-1" currentStatus="requested" />,
    );

    await user.click(screen.getByRole("combobox", { name: /status baru/i }));

    // No state machine on the backend (see docs/api-contract.md) - all 4
    // other statuses must be selectable, including jumping straight to
    // "completed" or "cancelled" from "requested".
    expect(await screen.findByRole("option", { name: "Terjadwal" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Dikerjakan" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Selesai" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Dibatalkan" })).toBeInTheDocument();
    expect(screen.queryByRole("option", { name: "Diminta" })).not.toBeInTheDocument();
  });

  it("submits the new status and notes to PATCH /jobs/{id}/status", async () => {
    server.use(
      http.patch("/api/v1/jobs/job-1/status", async ({ request }) => {
        const body = (await request.json()) as Record<string, unknown>;
        expect(body).toEqual({ status: "completed", notes: "Selesai diperbaiki" });
        return HttpResponse.json({
          success: true,
          data: {
            id: "job-1",
            job_code: "JOB-2026-0001",
            customer_id: "cust-1",
            machine_id: null,
            technician_id: null,
            title: "Servis rutin",
            description: null,
            status: "completed",
            scheduled_date: null,
            completed_date: "2026-08-02",
            created_at: "2026-08-01T00:00:00Z",
            updated_at: "2026-08-02T00:00:00Z",
          },
        });
      }),
    );

    const user = userEvent.setup();
    renderWithClient(
      <JobStatusChangeForm jobId="job-1" currentStatus="in_progress" />,
    );

    await user.click(screen.getByRole("combobox", { name: /status baru/i }));
    await user.click(await screen.findByRole("option", { name: "Selesai" }));
    await user.type(screen.getByLabelText(/catatan/i), "Selesai diperbaiki");
    await user.click(screen.getByRole("button", { name: /^ubah status$/i }));

    expect(
      await screen.findByText(/status berhasil diubah/i),
    ).toBeInTheDocument();
  });
});
