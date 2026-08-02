import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import type { ReactElement } from "react";

import { server } from "@/mocks/server";

import type { InvoiceListItem } from "../types";
import { InvoiceListPage } from "./InvoiceListPage";

const replace = jest.fn();
const mockSearchParams = jest.fn(() => new URLSearchParams());

jest.mock("next/navigation", () => ({
  useRouter: () => ({ replace }),
  usePathname: () => "/invoices",
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

function makeInvoice(overrides: Partial<InvoiceListItem> = {}): InvoiceListItem {
  return {
    id: "inv-1",
    invoice_number: "INV-2026-0001",
    nomor_faktur_pajak: null,
    job_id: "job-1",
    subtotal: 1500000,
    tax_percentage: 11,
    tax_amount: 165000,
    total: 1665000,
    dpp_pph23: 800000,
    pph23_rate: 2,
    pph23_estimated_amount: 16000,
    expected_receivable: 1649000,
    status: "draft",
    due_date: "2026-08-15T00:00:00Z",
    created_at: "2026-08-01T00:00:00Z",
    updated_at: "2026-08-01T00:00:00Z",
    job_code: "JOB-2026-0001",
    customer_name: "Acme Corp",
    ...overrides,
  };
}

describe("InvoiceListPage", () => {
  beforeEach(() => {
    replace.mockClear();
    mockSearchParams.mockReturnValue(new URLSearchParams());
  });

  it("renders invoices returned by GET /invoices, including the flat job_code/customer_name fields", async () => {
    server.use(
      http.get("/api/v1/invoices", () =>
        HttpResponse.json({
          success: true,
          data: [makeInvoice()],
          meta: { page: 1, total: 1 },
        }),
      ),
    );

    renderWithClient(<InvoiceListPage />);

    expect(await screen.findByText("INV-2026-0001")).toBeInTheDocument();
    expect(screen.getByText("JOB-2026-0001")).toBeInTheDocument();
    expect(screen.getByText("Acme Corp")).toBeInTheDocument();
  });

  it("shows the empty state when there are no invoices and no active filter", async () => {
    server.use(
      http.get("/api/v1/invoices", () =>
        HttpResponse.json({ success: true, data: [], meta: { page: 1, total: 0 } }),
      ),
    );

    renderWithClient(<InvoiceListPage />);

    expect(await screen.findByText(/belum ada invoice/i)).toBeInTheDocument();
  });

  it("updates the status filter via router.replace", async () => {
    server.use(
      http.get("/api/v1/invoices", () =>
        HttpResponse.json({ success: true, data: [], meta: { page: 1, total: 0 } }),
      ),
    );

    const user = userEvent.setup();
    renderWithClient(<InvoiceListPage />);

    await user.click(screen.getByRole("combobox", { name: /filter status/i }));
    await user.click(await screen.findByRole("option", { name: "Dibatalkan" }));

    await waitFor(() => {
      expect(replace).toHaveBeenCalled();
      const lastUrl = replace.mock.calls.at(-1)?.[0] as string;
      expect(lastUrl).toContain("status=cancelled");
      expect(lastUrl).toContain("page=1");
    });
  });

  it("sends the status param from the URL to GET /invoices", async () => {
    mockSearchParams.mockReturnValue(new URLSearchParams("status=paid"));

    let capturedStatus: string | null = null;
    server.use(
      http.get("/api/v1/invoices", ({ request }) => {
        capturedStatus = new URL(request.url).searchParams.get("status");
        return HttpResponse.json({
          success: true,
          data: [makeInvoice({ status: "paid" })],
          meta: { page: 1, total: 1 },
        });
      }),
    );

    renderWithClient(<InvoiceListPage />);

    await screen.findByText("INV-2026-0001");
    expect(capturedStatus).toBe("paid");
  });
});
