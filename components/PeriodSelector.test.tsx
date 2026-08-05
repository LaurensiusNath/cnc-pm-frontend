import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { PeriodSelector } from "./PeriodSelector";

describe("PeriodSelector", () => {
  it("calls onChange with the new date when a valid 'from' is picked", async () => {
    const onChange = jest.fn();
    const user = userEvent.setup();
    render(
      <PeriodSelector periodFrom={null} periodTo="2026-08-31" onChange={onChange} />,
    );

    await user.type(screen.getByLabelText(/^dari$/i), "2026-08-01");

    expect(onChange).toHaveBeenCalledWith({
      period_from: "2026-08-01",
      period_to: "2026-08-31",
    });
  });

  it("rejects a 'from' date after the current 'to' date and does not call onChange", async () => {
    const onChange = jest.fn();
    const user = userEvent.setup();
    render(
      <PeriodSelector periodFrom={null} periodTo="2026-08-01" onChange={onChange} />,
    );

    await user.type(screen.getByLabelText(/^dari$/i), "2026-08-31");

    expect(
      await screen.findByText(/tanggal awal tidak boleh setelah tanggal akhir/i),
    ).toBeInTheDocument();
    expect(onChange).not.toHaveBeenCalled();
  });

  it("rejects a 'to' date before the current 'from' date and does not call onChange", async () => {
    const onChange = jest.fn();
    const user = userEvent.setup();
    render(
      <PeriodSelector periodFrom="2026-08-15" periodTo={null} onChange={onChange} />,
    );

    await user.type(screen.getByLabelText(/^sampai$/i), "2026-08-01");

    expect(
      await screen.findByText(/tanggal awal tidak boleh setelah tanggal akhir/i),
    ).toBeInTheDocument();
    expect(onChange).not.toHaveBeenCalled();
  });

  it('"Bulan Ini" resets both dates to null', async () => {
    const onChange = jest.fn();
    const user = userEvent.setup();
    render(
      <PeriodSelector periodFrom="2026-08-01" periodTo="2026-08-31" onChange={onChange} />,
    );

    await user.click(screen.getByRole("button", { name: /bulan ini/i }));

    expect(onChange).toHaveBeenCalledWith({ period_from: null, period_to: null });
  });
});
