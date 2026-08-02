import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import type { ReactElement } from "react";

import { server } from "@/mocks/server";

import { JobInvoiceSection } from "./JobInvoiceSection";

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

describe("JobInvoiceSection", () => {
  it("renders nothing when the job isn't completed yet", () => {
    renderWithClient(<JobInvoiceSection jobId="job-1" jobStatus="in_progress" />);

    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });

  it('shows "Generate Invoice" when the job is completed and GET /jobs/{id}/invoice 404s', async () => {
    server.use(
      http.get("/api/v1/jobs/job-1/invoice", () =>
        HttpResponse.json(
          { success: false, error: { code: "NOT_FOUND", message: "invoice not found" } },
          { status: 404 },
        ),
      ),
    );

    renderWithClient(<JobInvoiceSection jobId="job-1" jobStatus="completed" />);

    const link = await screen.findByRole("link", { name: /generate invoice/i });
    expect(link).toHaveAttribute("href", "/jobs/job-1/invoice/new");
  });

  it('shows "Lihat Invoice" linking to the existing invoice when GET /jobs/{id}/invoice returns 200', async () => {
    server.use(
      http.get("/api/v1/jobs/job-1/invoice", () =>
        HttpResponse.json({
          success: true,
          data: {
            id: "inv-1",
            invoice_number: "INV-2026-0001",
            nomor_faktur_pajak: null,
            job_id: "job-1",
            subtotal: 0,
            tax_percentage: 11,
            tax_amount: 0,
            total: 0,
            dpp_pph23: 0,
            pph23_rate: 2,
            pph23_estimated_amount: 0,
            expected_receivable: 0,
            status: "draft",
            due_date: null,
            created_at: "2026-08-01T00:00:00Z",
            updated_at: "2026-08-01T00:00:00Z",
          },
        }),
      ),
    );

    renderWithClient(<JobInvoiceSection jobId="job-1" jobStatus="completed" />);

    const link = await screen.findByRole("link", { name: /lihat invoice/i });
    expect(link).toHaveAttribute("href", "/invoices/inv-1");
  });
});
