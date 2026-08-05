import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import type { ReactElement } from "react";

import { server } from "@/mocks/server";

import type { PPh23Summary } from "../types";
import { PPh23Section } from "./PPh23Section";

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

function makePPh23(overrides: Partial<PPh23Summary> = {}): PPh23Summary {
  return {
    total_estimasi: 16000,
    payments: [
      {
        id: "pay-badan-usaha",
        invoice_id: "inv-1",
        invoice_number: "INV-2026-0001",
        customer_name: "Acme Corp (Badan Usaha)",
        customer_type: "badan_usaha",
        payment_date: "2026-08-02T10:00:00Z",
        pph23_share_estimasi: 16000,
        bukti_potong_pph23_ref: null,
      },
      {
        id: "pay-perorangan",
        invoice_id: "inv-2",
        invoice_number: "INV-2026-0002",
        customer_name: "Budi Perorangan",
        customer_type: "perorangan",
        payment_date: "2026-08-03T10:00:00Z",
        pph23_share_estimasi: 0,
        bukti_potong_pph23_ref: null,
      },
    ],
    ...overrides,
  };
}

describe("PPh23Section", () => {
  it("hides rows with pph23_share_estimasi = 0 (display-only filter, not customer_type)", () => {
    renderWithClient(<PPh23Section pph23={makePPh23()} />);

    expect(screen.getByText("Acme Corp (Badan Usaha)")).toBeInTheDocument();
    expect(screen.queryByText("Budi Perorangan")).not.toBeInTheDocument();
    expect(screen.queryByText("INV-2026-0002")).not.toBeInTheDocument();
  });

  it("shows the empty message when every payment has zero share (not a crash)", () => {
    renderWithClient(
      <PPh23Section
        pph23={makePPh23({
          payments: [
            {
              id: "pay-perorangan",
              invoice_id: "inv-2",
              invoice_number: "INV-2026-0002",
              customer_name: "Budi Perorangan",
              customer_type: "perorangan",
              payment_date: "2026-08-03T10:00:00Z",
              pph23_share_estimasi: 0,
              bukti_potong_pph23_ref: null,
            },
          ],
        })}
      />,
    );

    expect(
      screen.getByText(/tidak ada pembayaran dengan estimasi pph 23/i),
    ).toBeInTheDocument();
  });

  it("submits bukti_potong_pph23_ref via PATCH .../payments/{payment_id}/bukti-potong-pph23", async () => {
    let capturedBody: Record<string, unknown> | null = null;
    let capturedUrl = "";
    server.use(
      http.patch(
        "/api/v1/invoices/inv-1/payments/pay-badan-usaha/bukti-potong-pph23",
        async ({ request }) => {
          capturedUrl = request.url;
          capturedBody = (await request.json()) as Record<string, unknown>;
          return HttpResponse.json({
            success: true,
            data: {
              id: "pay-badan-usaha",
              invoice_id: "inv-1",
              amount: 1000000,
              payment_method: "transfer",
              bukti_potong_pph23_ref: "BP-001",
              notes: null,
              created_at: "2026-08-02T10:00:00Z",
            },
          });
        },
      ),
    );

    const user = userEvent.setup();
    renderWithClient(<PPh23Section pph23={makePPh23()} />);

    await user.click(screen.getByRole("button", { name: /isi bukti potong/i }));
    await user.type(screen.getByLabelText(/nomor bukti potong/i), "BP-001");
    await user.click(screen.getByRole("button", { name: /^simpan$/i }));

    await waitFor(() => {
      expect(capturedUrl).toContain(
        "/invoices/inv-1/payments/pay-badan-usaha/bukti-potong-pph23",
      );
      expect(capturedBody).toEqual({ bukti_potong_pph23_ref: "BP-001" });
    });
  });
});
