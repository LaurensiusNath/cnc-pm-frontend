import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import type { ReactElement } from "react";

import { server } from "@/mocks/server";

import { JobAssignTechnicianForm } from "./JobAssignTechnicianForm";

const commonUserFields = {
  created_at: "2026-01-01T00:00:00Z",
  updated_at: "2026-01-01T00:00:00Z",
  deleted_at: null,
};

const technicians = [
  { id: "tech-1", name: "Budi Teknisi", email: "budi@x.test", role: "teknisi" as const, ...commonUserFields },
  { id: "tech-2", name: "Sari Teknisi", email: "sari@x.test", role: "teknisi" as const, ...commonUserFields },
];

function renderWithClient(ui: ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  return { queryClient, ...render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>,
  ) };
}

describe("JobAssignTechnicianForm", () => {
  it("shows technician names, not raw ids, in the select", async () => {
    const user = userEvent.setup();
    renderWithClient(
      <JobAssignTechnicianForm
        jobId="job-1"
        currentUpdatedAt="2026-08-01T00:00:00Z"
        technicians={technicians}
      />,
    );

    await user.click(screen.getByRole("combobox", { name: /teknisi/i }));
    await user.click(await screen.findByRole("option", { name: "Budi Teknisi" }));

    // The trigger's displayed label, not the hidden native input's value
    // (which correctly holds the raw id "tech-1" for form submission).
    expect(screen.getByRole("combobox", { name: /teknisi/i })).toHaveTextContent(
      "Budi Teknisi",
    );
  });

  it("sends technician_id and the given expected_updated_at on submit", async () => {
    server.use(
      http.patch("/api/v1/jobs/job-1/assign", async ({ request }) => {
        const body = (await request.json()) as Record<string, unknown>;
        expect(body).toEqual({
          technician_id: "tech-1",
          expected_updated_at: "2026-08-01T00:00:00Z",
        });
        return HttpResponse.json({
          success: true,
          data: {
            id: "job-1",
            job_code: "JOB-2026-0001",
            customer_id: "cust-1",
            machine_id: null,
            technician_id: "tech-1",
            title: "Servis rutin",
            description: null,
            status: "in_progress",
            scheduled_date: null,
            completed_date: null,
            created_at: "2026-08-01T00:00:00Z",
            updated_at: "2026-08-02T00:00:00Z",
          },
        });
      }),
    );

    const user = userEvent.setup();
    renderWithClient(
      <JobAssignTechnicianForm
        jobId="job-1"
        currentUpdatedAt="2026-08-01T00:00:00Z"
        technicians={technicians}
      />,
    );

    await user.click(screen.getByRole("combobox", { name: /teknisi/i }));
    await user.click(await screen.findByRole("option", { name: "Budi Teknisi" }));
    await user.click(screen.getByRole("button", { name: /^assign$/i }));

    await waitFor(() =>
      expect(screen.queryByText(/gagal menugaskan/i)).not.toBeInTheDocument(),
    );
  });

  it("shows a specific conflict message on 409 and refetches the stale job detail", async () => {
    server.use(
      http.patch("/api/v1/jobs/job-1/assign", () =>
        HttpResponse.json(
          {
            success: false,
            error: {
              code: "CONFLICT",
              message: "job was modified by someone else",
            },
          },
          { status: 409 },
        ),
      ),
    );

    const user = userEvent.setup();
    const { queryClient } = renderWithClient(
      <JobAssignTechnicianForm
        jobId="job-1"
        currentUpdatedAt="2026-08-01T00:00:00Z"
        technicians={technicians}
      />,
    );

    // Seeds the cache as if the job detail page this form actually lives
    // on had already fetched it - lets the test prove invalidateQueries
    // targets the right key. Without an active observer (nothing here
    // calls useJob), TanStack Query marks an invalidated query stale but
    // won't eagerly refetch it over the network, so checking the network
    // call count wouldn't prove anything either way; checking the cache
    // entry's own invalidated state directly does.
    const jobDetailKey = ["jobs", "detail", "job-1"];
    queryClient.setQueryData(jobDetailKey, {
      id: "job-1",
      updated_at: "2026-08-01T00:00:00Z",
    });

    await user.click(screen.getByRole("combobox", { name: /teknisi/i }));
    await user.click(await screen.findByRole("option", { name: "Budi Teknisi" }));
    await user.click(screen.getByRole("button", { name: /^assign$/i }));

    expect(
      await screen.findByText(/sudah diubah pihak lain/i),
    ).toBeInTheDocument();
    // Not the generic fallback message for this case.
    expect(
      screen.queryByText(/^gagal menugaskan teknisi\. coba lagi\.$/i),
    ).not.toBeInTheDocument();

    await waitFor(() => {
      expect(queryClient.getQueryState(jobDetailKey)?.isInvalidated).toBe(
        true,
      );
    });
  });
});
