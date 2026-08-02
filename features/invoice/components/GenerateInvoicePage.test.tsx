import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import type { ReactElement } from "react";

import { server } from "@/mocks/server";

import { GenerateInvoicePage } from "./GenerateInvoicePage";

const push = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
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

describe("GenerateInvoicePage", () => {
  beforeEach(() => {
    push.mockClear();
  });

  it("rejects a negative tax percentage", async () => {
    const user = userEvent.setup();
    renderWithClient(<GenerateInvoicePage jobId="job-1" />);

    await user.type(screen.getByLabelText(/persentase pajak/i), "-5");
    await user.click(screen.getByRole("button", { name: /generate invoice/i }));

    expect(
      await screen.findByText(/persentase pajak tidak boleh negatif/i),
    ).toBeInTheDocument();
  });

  it("omits tax_percentage and due_date from the request body when left blank", async () => {
    let capturedBody: Record<string, unknown> | null = null;
    server.use(
      http.post("/api/v1/jobs/job-1/invoice", async ({ request }) => {
        capturedBody = (await request.json()) as Record<string, unknown>;
        return HttpResponse.json(
          {
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
              created_at: "2026-08-02T00:00:00Z",
              updated_at: "2026-08-02T00:00:00Z",
            },
          },
          { status: 201 },
        );
      }),
    );

    const user = userEvent.setup();
    renderWithClient(<GenerateInvoicePage jobId="job-1" />);

    await user.click(screen.getByRole("button", { name: /generate invoice/i }));

    await waitFor(() => {
      expect(capturedBody).toEqual({});
    });
    await waitFor(() => {
      expect(push).toHaveBeenCalledWith("/invoices/inv-1");
    });
  });

  it("sends tax_percentage and due_date when filled in, and redirects to the created invoice", async () => {
    let capturedBody: Record<string, unknown> | null = null;
    server.use(
      http.post("/api/v1/jobs/job-1/invoice", async ({ request }) => {
        capturedBody = (await request.json()) as Record<string, unknown>;
        return HttpResponse.json(
          {
            success: true,
            data: {
              id: "inv-2",
              invoice_number: "INV-2026-0002",
              nomor_faktur_pajak: null,
              job_id: "job-1",
              subtotal: 0,
              tax_percentage: 8,
              tax_amount: 0,
              total: 0,
              dpp_pph23: 0,
              pph23_rate: 2,
              pph23_estimated_amount: 0,
              expected_receivable: 0,
              status: "draft",
              due_date: "2026-09-01",
              created_at: "2026-08-02T00:00:00Z",
              updated_at: "2026-08-02T00:00:00Z",
            },
          },
          { status: 201 },
        );
      }),
    );

    const user = userEvent.setup();
    renderWithClient(<GenerateInvoicePage jobId="job-1" />);

    await user.type(screen.getByLabelText(/persentase pajak/i), "8");
    await user.type(screen.getByLabelText(/jatuh tempo/i), "2026-09-01");
    await user.click(screen.getByRole("button", { name: /generate invoice/i }));

    await waitFor(() => {
      expect(capturedBody).toEqual({ tax_percentage: 8, due_date: "2026-09-01" });
    });
    await waitFor(() => {
      expect(push).toHaveBeenCalledWith("/invoices/inv-2");
    });
  });
});
