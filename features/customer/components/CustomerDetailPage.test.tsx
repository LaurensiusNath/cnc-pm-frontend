import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import type { ReactElement } from "react";

import { server } from "@/mocks/server";

import { CustomerDetailPage } from "./CustomerDetailPage";

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

function baseCustomer(machines: unknown[]) {
  return {
    id: "cust-1",
    name: "Acme Corp",
    customer_type: "badan_usaha",
    phone: null,
    email: null,
    address: null,
    company_name: null,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
    deleted_at: null,
    machines,
  };
}

describe("CustomerDetailPage - MachinesSection", () => {
  it("adds a new machine: submit -> invalidate -> new machine appears in the list", async () => {
    // Mutable in-memory "DB" for this test - GET reflects whatever POST
    // has created so far, same as the real backend would.
    let machines: Array<Record<string, unknown>> = [];

    server.use(
      http.get("/api/v1/customers/cust-1", () =>
        HttpResponse.json({ success: true, data: baseCustomer(machines) }),
      ),
      http.post("/api/v1/customers/cust-1/machines", async ({ request }) => {
        const body = (await request.json()) as Record<string, unknown>;
        const created = {
          id: "machine-1",
          customer_id: "cust-1",
          machine_name: body.machine_name,
          machine_type: body.machine_type ?? null,
          serial_number: body.serial_number ?? null,
          notes: body.notes ?? null,
          created_at: "2026-08-06T00:00:00Z",
          updated_at: "2026-08-06T00:00:00Z",
        };
        machines = [...machines, created];
        return HttpResponse.json({ success: true, data: created }, { status: 201 });
      }),
    );

    const user = userEvent.setup();
    renderWithClient(<CustomerDetailPage customerId="cust-1" />);

    expect(await screen.findByText("Acme Corp")).toBeInTheDocument();
    expect(
      screen.getByText(/belum ada mesin terdaftar/i),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /tambah mesin/i }));
    await user.type(screen.getByLabelText(/nama mesin/i), "CNC Mill A");
    await user.click(screen.getByRole("button", { name: /^simpan$/i }));

    expect(await screen.findByText("CNC Mill A")).toBeInTheDocument();
    expect(
      screen.queryByText(/belum ada mesin terdaftar/i),
    ).not.toBeInTheDocument();
  });
});
