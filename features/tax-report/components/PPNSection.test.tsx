import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import type { ReactElement } from "react";

import { server } from "@/mocks/server";

import type { PPNSummary } from "../types";
import { PPNSection } from "./PPNSection";

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

function makePPN(): PPNSummary {
  return {
    total_ppn_keluaran: 165000,
    invoices: [
      {
        id: "inv-1",
        invoice_number: "INV-2026-0001",
        job_code: "JOB-2026-0001",
        customer_name: "Acme Corp",
        subtotal: 1500000,
        tax_amount: 165000,
        nomor_faktur_pajak: null,
      },
    ],
  };
}

describe("PPNSection", () => {
  it('shows "Belum diisi" when nomor_faktur_pajak is null', () => {
    renderWithClient(<PPNSection ppn={makePPN()} />);

    expect(screen.getByText(/belum diisi/i)).toBeInTheDocument();
  });

  it("submits nomor_faktur_pajak via PATCH /invoices/{id}/faktur-pajak", async () => {
    let capturedBody: Record<string, unknown> | null = null;
    server.use(
      http.patch("/api/v1/invoices/inv-1/faktur-pajak", async ({ request }) => {
        capturedBody = (await request.json()) as Record<string, unknown>;
        return HttpResponse.json({
          success: true,
          data: {
            id: "inv-1",
            invoice_number: "INV-2026-0001",
            nomor_faktur_pajak: "010.000-26.00000001",
            job_id: "job-1",
            subtotal: 1500000,
            tax_percentage: 11,
            tax_amount: 165000,
            total: 1665000,
            dpp_pph23: 0,
            pph23_rate: 2,
            pph23_estimated_amount: 0,
            expected_receivable: 1665000,
            status: "sent",
            due_date: null,
            created_at: "2026-08-01T00:00:00Z",
            updated_at: "2026-08-05T00:00:00Z",
          },
        });
      }),
    );

    const user = userEvent.setup();
    renderWithClient(<PPNSection ppn={makePPN()} />);

    await user.click(screen.getByRole("button", { name: /isi faktur pajak/i }));
    await user.type(
      screen.getByLabelText(/nomor faktur pajak/i),
      "010.000-26.00000001",
    );
    await user.click(screen.getByRole("button", { name: /^simpan$/i }));

    await waitFor(() => {
      expect(capturedBody).toEqual({
        nomor_faktur_pajak: "010.000-26.00000001",
      });
    });
  });
});
