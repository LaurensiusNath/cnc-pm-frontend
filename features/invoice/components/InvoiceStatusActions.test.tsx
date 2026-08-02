import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import type { ReactElement } from "react";

import { server } from "@/mocks/server";

import { InvoiceStatusActions } from "./InvoiceStatusActions";

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

// Backend has no state-machine enforcement on PATCH /invoices/{id}/status
// (any of the 5 enum values is accepted from any current status, verified
// live - see docs/api-contract.md Catatan Desain #7). The restriction
// tested here is entirely a frontend decision: paid/overdue must NEVER be
// reachable as a click target, because unlike Job's status (pure workflow
// metadata), a wrong manual "paid" here means a real receivable gets
// marked settled with no payment on record.
describe("InvoiceStatusActions", () => {
  it("offers Kirim and Batalkan from draft, but never Lunas/Jatuh Tempo as buttons", () => {
    renderWithClient(
      <InvoiceStatusActions invoiceId="inv-1" currentStatus="draft" />,
    );

    expect(
      screen.getByRole("button", { name: /tandai terkirim/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /batalkan invoice/i }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /lunas/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /jatuh tempo/i }),
    ).not.toBeInTheDocument();
  });

  it("only offers Batalkan from sent (not Tandai Terkirim again, not Lunas)", () => {
    renderWithClient(
      <InvoiceStatusActions invoiceId="inv-1" currentStatus="sent" />,
    );

    expect(
      screen.getByRole("button", { name: /batalkan invoice/i }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /tandai terkirim/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /lunas/i }),
    ).not.toBeInTheDocument();
  });

  it("only offers Batalkan from overdue", () => {
    renderWithClient(
      <InvoiceStatusActions invoiceId="inv-1" currentStatus="overdue" />,
    );

    expect(
      screen.getByRole("button", { name: /batalkan invoice/i }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /tandai terkirim/i }),
    ).not.toBeInTheDocument();
  });

  it("offers no actions at all from paid - read-only badge only", () => {
    renderWithClient(
      <InvoiceStatusActions invoiceId="inv-1" currentStatus="paid" />,
    );

    expect(screen.queryByRole("button")).not.toBeInTheDocument();
    expect(screen.getByText("Lunas")).toBeInTheDocument();
  });

  it("offers no actions at all from cancelled - terminal state", () => {
    renderWithClient(
      <InvoiceStatusActions invoiceId="inv-1" currentStatus="cancelled" />,
    );

    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("submits only {status} to PATCH /invoices/{id}/status when Tandai Terkirim is clicked", async () => {
    let capturedBody: Record<string, unknown> | null = null;
    server.use(
      http.patch("/api/v1/invoices/inv-1/status", async ({ request }) => {
        capturedBody = (await request.json()) as Record<string, unknown>;
        return HttpResponse.json({
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
            status: "sent",
            due_date: null,
            created_at: "2026-08-01T00:00:00Z",
            updated_at: "2026-08-02T00:00:00Z",
          },
        });
      }),
    );

    const user = userEvent.setup();
    renderWithClient(
      <InvoiceStatusActions invoiceId="inv-1" currentStatus="draft" />,
    );

    await user.click(screen.getByRole("button", { name: /tandai terkirim/i }));

    await waitFor(() => {
      expect(capturedBody).toEqual({ status: "sent" });
    });
  });
});
