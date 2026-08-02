import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import type { ReactElement } from "react";

import { server } from "@/mocks/server";

import { AddJobCostForm } from "./AddJobCostForm";

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

describe("AddJobCostForm", () => {
  it("only shows the purchase price field when cost_type is spare_part", async () => {
    const user = userEvent.setup();
    renderWithClient(<AddJobCostForm jobId="job-1" />);

    expect(
      screen.queryByLabelText(/harga beli/i),
    ).not.toBeInTheDocument();

    await user.click(screen.getByRole("combobox", { name: /tipe biaya/i }));
    await user.click(await screen.findByRole("option", { name: "Spare Part" }));

    expect(await screen.findByLabelText(/harga beli/i)).toBeInTheDocument();
  });

  it("requires purchase price for spare_part before submitting", async () => {
    const user = userEvent.setup();
    renderWithClient(<AddJobCostForm jobId="job-1" />);

    await user.click(screen.getByRole("combobox", { name: /tipe biaya/i }));
    await user.click(await screen.findByRole("option", { name: "Spare Part" }));

    await user.type(screen.getByLabelText(/deskripsi/i), "Bearing spindle");
    await user.type(screen.getByLabelText(/kuantitas/i), "2");
    await user.type(screen.getByLabelText(/harga jual/i), "150000");
    await user.click(screen.getByRole("button", { name: /tambah biaya/i }));

    expect(
      await screen.findByText(/harga beli wajib diisi untuk spare part/i),
    ).toBeInTheDocument();
  });

  it("submits a labor cost without purchase_price in the request body", async () => {
    server.use(
      http.post("/api/v1/jobs/job-1/costs", async ({ request }) => {
        const body = (await request.json()) as Record<string, unknown>;
        expect(body).toEqual({
          cost_type: "labor",
          description: "Servis rutin",
          quantity: 2,
          selling_price: 100000,
        });
        return HttpResponse.json(
          {
            success: true,
            data: {
              id: "cost-1",
              job_id: "job-1",
              cost_type: "labor",
              description: "Servis rutin",
              quantity: 2,
              purchase_price: null,
              selling_price: 100000,
              subtotal: 200000,
              created_at: "2026-08-01T00:00:00Z",
            },
          },
          { status: 201 },
        );
      }),
    );

    const user = userEvent.setup();
    renderWithClient(<AddJobCostForm jobId="job-1" />);

    await user.type(screen.getByLabelText(/deskripsi/i), "Servis rutin");
    await user.type(screen.getByLabelText(/kuantitas/i), "2");
    await user.type(screen.getByLabelText(/harga jual/i), "100000");
    await user.click(screen.getByRole("button", { name: /tambah biaya/i }));

    await waitFor(() =>
      expect(
        screen.getByLabelText(/deskripsi/i),
      ).toHaveValue(""),
    );
  });

  it("submits a spare_part cost with purchase_price included", async () => {
    server.use(
      http.post("/api/v1/jobs/job-1/costs", async ({ request }) => {
        const body = (await request.json()) as Record<string, unknown>;
        expect(body).toEqual({
          cost_type: "spare_part",
          description: "Bearing spindle",
          quantity: 1,
          purchase_price: 50000,
          selling_price: 80000,
        });
        return HttpResponse.json(
          {
            success: true,
            data: {
              id: "cost-2",
              job_id: "job-1",
              cost_type: "spare_part",
              description: "Bearing spindle",
              quantity: 1,
              purchase_price: 50000,
              selling_price: 80000,
              subtotal: 80000,
              created_at: "2026-08-01T00:00:00Z",
            },
          },
          { status: 201 },
        );
      }),
    );

    const user = userEvent.setup();
    renderWithClient(<AddJobCostForm jobId="job-1" />);

    await user.click(screen.getByRole("combobox", { name: /tipe biaya/i }));
    await user.click(await screen.findByRole("option", { name: "Spare Part" }));

    await user.type(screen.getByLabelText(/deskripsi/i), "Bearing spindle");
    await user.type(screen.getByLabelText(/kuantitas/i), "1");
    await user.type(screen.getByLabelText(/harga beli/i), "50000");
    await user.type(screen.getByLabelText(/harga jual/i), "80000");
    await user.click(screen.getByRole("button", { name: /tambah biaya/i }));

    await waitFor(() =>
      expect(screen.getByLabelText(/deskripsi/i)).toHaveValue(""),
    );
  });
});
