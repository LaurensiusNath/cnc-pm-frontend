import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import type { ReactElement } from "react";

import { server } from "@/mocks/server";

import { TaxReportPage } from "./TaxReportPage";

const replace = jest.fn();
const mockSearchParams = jest.fn(() => new URLSearchParams());

jest.mock("next/navigation", () => ({
  useRouter: () => ({ replace }),
  usePathname: () => "/tax-report",
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

// Shape verified against internal/taxreport/domain.go (backend PR #22, merged).
function makeSummary() {
  return {
    period: { from: "2026-08-01", to: "2026-08-31" },
    ppn: {
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
    },
    pph23: {
      total_estimasi: 16000,
      payments: [
        {
          id: "pay-1",
          invoice_id: "inv-1",
          invoice_number: "INV-2026-0001",
          customer_name: "Acme Corp",
          customer_type: "badan_usaha",
          payment_date: "2026-08-02T10:00:00Z",
          pph23_share_estimasi: 16000,
          bukti_potong_pph23_ref: null,
        },
      ],
    },
  };
}

describe("TaxReportPage", () => {
  beforeEach(() => {
    replace.mockClear();
    mockSearchParams.mockReturnValue(new URLSearchParams());
  });

  it("renders PPN and PPh23 sections from GET /reports/tax-summary", async () => {
    server.use(
      http.get("/api/v1/reports/tax-summary", () =>
        HttpResponse.json({ success: true, data: makeSummary() }),
      ),
    );

    renderWithClient(<TaxReportPage />);

    // INV-2026-0001 appears in both the PPN and PPh23 tables (same
    // invoice) - assert count instead of a single unique match.
    expect(await screen.findAllByText("INV-2026-0001")).toHaveLength(2);
    expect(screen.getByText("JOB-2026-0001")).toBeInTheDocument();
    expect(screen.getByText(/total ppn keluaran/i)).toBeInTheDocument();
    expect(screen.getByText(/total estimasi pph 23/i)).toBeInTheDocument();
  });

  it("sends period_from/period_to from the URL to GET /reports/tax-summary", async () => {
    mockSearchParams.mockReturnValue(
      new URLSearchParams("period_from=2026-01-01&period_to=2026-12-31"),
    );

    let captured: { from: string | null; to: string | null } = { from: null, to: null };
    server.use(
      http.get("/api/v1/reports/tax-summary", ({ request }) => {
        const url = new URL(request.url);
        captured = {
          from: url.searchParams.get("period_from"),
          to: url.searchParams.get("period_to"),
        };
        return HttpResponse.json({ success: true, data: makeSummary() });
      }),
    );

    renderWithClient(<TaxReportPage />);

    await waitFor(() => {
      expect(captured).toEqual({ from: "2026-01-01", to: "2026-12-31" });
    });
  });

  it("shows an explicit access-denied message on 403, not the generic error banner", async () => {
    server.use(
      http.get("/api/v1/reports/tax-summary", () =>
        HttpResponse.json(
          { success: false, error: { code: "FORBIDDEN", message: "insufficient permissions for this action" } },
          { status: 403 },
        ),
      ),
    );

    renderWithClient(<TaxReportPage />);

    expect(
      await screen.findByText(/anda tidak punya akses ke halaman ini/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/laporan pajak hanya tersedia/i)).toBeInTheDocument();
    expect(
      screen.queryByText(/gagal memuat laporan pajak/i),
    ).not.toBeInTheDocument();
  });
});
