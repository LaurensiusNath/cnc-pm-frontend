import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import type { ReactElement } from "react";

import { server } from "@/mocks/server";

import type { Invoice } from "../types";
import { PaymentsSection } from "./PaymentsSection";

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

function makeInvoice(overrides: Partial<Invoice> = {}): Invoice {
  return {
    id: "inv-1",
    invoice_number: "INV-2026-0001",
    nomor_faktur_pajak: null,
    job_id: "job-1",
    subtotal: 1000000,
    tax_percentage: 11,
    tax_amount: 110000,
    total: 1110000,
    dpp_pph23: 500000,
    pph23_rate: 2,
    pph23_estimated_amount: 10000,
    expected_receivable: 1100000,
    status: "sent",
    due_date: null,
    created_at: "2026-08-01T00:00:00Z",
    updated_at: "2026-08-01T00:00:00Z",
    ...overrides,
  };
}

describe("PaymentsSection", () => {
  it("rejects a non-positive amount", async () => {
    server.use(
      http.get("/api/v1/invoices/inv-1/payments", () =>
        HttpResponse.json({ success: true, data: [] }),
      ),
    );

    const user = userEvent.setup();
    renderWithClient(<PaymentsSection invoice={makeInvoice()} />);

    await user.type(screen.getByLabelText(/^jumlah/i), "-100");
    await user.click(screen.getByRole("button", { name: /tambah pembayaran/i }));

    expect(
      await screen.findByText(/jumlah harus lebih dari 0/i),
    ).toBeInTheDocument();
  });

  it("computes the UI-only remaining balance from total minus recorded payments", async () => {
    server.use(
      http.get("/api/v1/invoices/inv-1/payments", () =>
        HttpResponse.json({
          success: true,
          data: [
            {
              id: "pay-1",
              invoice_id: "inv-1",
              amount: 400000,
              payment_method: "transfer",
              bukti_potong_pph23_ref: null,
              notes: null,
              created_at: "2026-08-02T00:00:00Z",
            },
          ],
        }),
      ),
    );

    renderWithClient(<PaymentsSection invoice={makeInvoice({ total: 1110000 })} />);

    // 1110000 - 400000 = 710000
    expect(await screen.findByText(/Rp\s*710\.000/)).toBeInTheDocument();
  });

  it("submits amount and payment_method to POST /invoices/{id}/payments, omitting blank optional fields", async () => {
    server.use(
      http.get("/api/v1/invoices/inv-1/payments", () =>
        HttpResponse.json({ success: true, data: [] }),
      ),
    );

    let capturedBody: Record<string, unknown> | null = null;
    server.use(
      http.post("/api/v1/invoices/inv-1/payments", async ({ request }) => {
        capturedBody = (await request.json()) as Record<string, unknown>;
        return HttpResponse.json(
          {
            success: true,
            data: {
              id: "pay-2",
              invoice_id: "inv-1",
              amount: 500000,
              payment_method: "transfer",
              bukti_potong_pph23_ref: null,
              notes: null,
              created_at: "2026-08-02T00:00:00Z",
            },
          },
          { status: 201 },
        );
      }),
    );

    const user = userEvent.setup();
    renderWithClient(<PaymentsSection invoice={makeInvoice()} />);

    await user.type(screen.getByLabelText(/^jumlah/i), "500000");
    await user.click(screen.getByRole("button", { name: /tambah pembayaran/i }));

    await waitFor(() => {
      expect(capturedBody).toEqual({ amount: 500000, payment_method: "transfer" });
    });
  });
});
