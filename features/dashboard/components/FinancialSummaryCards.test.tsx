import { render, screen } from "@testing-library/react";

import type { FinancialSummary } from "../types";
import { FinancialSummaryCards } from "./FinancialSummaryCards";

function makeFinancial(overrides: Partial<FinancialSummary> = {}): FinancialSummary {
  return {
    period: { from: "2026-08-01T00:00:00Z", to: "2026-08-31T00:00:00Z" },
    invoiced_total: 1665000,
    received_total: 600000,
    outstanding_total: 1065000,
    by_status: {
      draft: { count: 0, total: 0 },
      sent: { count: 1, total: 1665000 },
      paid: { count: 0, total: 0 },
      overdue: { count: 0, total: 0 },
      cancelled: { count: 1, total: 333000 },
    },
    ...overrides,
  };
}

describe("FinancialSummaryCards", () => {
  it("renders invoiced/received/outstanding totals as-is", () => {
    render(<FinancialSummaryCards financial={makeFinancial()} />);

    expect(screen.getByText(/Rp\s*1\.665\.000/)).toBeInTheDocument();
    expect(screen.getByText(/Rp\s*600\.000/)).toBeInTheDocument();
    expect(screen.getByText(/Rp\s*1\.065\.000/)).toBeInTheDocument();
  });

  // WAJIB (instruksi eksplisit): outstanding_total negatif adalah sinyal
  // diagnostik sengaja dari backend (invoice status tanpa state-machine,
  // lihat docs/api-contract.md Catatan Desain #6/#7) - bukan bug tampilan.
  // Test ini memastikan tidak ada Math.abs()/clamp yang menyembunyikannya.
  it("renders a negative outstanding_total exactly as returned, not clamped or abs'd", () => {
    render(
      <FinancialSummaryCards
        financial={makeFinancial({ outstanding_total: -250000 })}
      />,
    );

    expect(screen.getByText(/-Rp\s*250\.000/)).toBeInTheDocument();
    expect(screen.queryByText(/^Rp\s*250\.000$/)).not.toBeInTheDocument();
    expect(screen.queryByText(/^Rp\s*0$/)).not.toBeInTheDocument();
  });
});
