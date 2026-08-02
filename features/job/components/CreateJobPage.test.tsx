import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import type { ReactElement } from "react";

import { server } from "@/mocks/server";

import { CreateJobPage } from "./CreateJobPage";

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

const acmeCustomer = {
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
};

describe("CreateJobPage", () => {
  beforeEach(() => {
    push.mockClear();
  });

  it("shows a Zod validation error instead of submitting when title is empty", async () => {
    const user = userEvent.setup();
    renderWithClient(<CreateJobPage />);

    await user.click(screen.getByRole("button", { name: /simpan job/i }));

    expect(await screen.findByText(/customer wajib dipilih/i)).toBeInTheDocument();
    expect(screen.getByText(/judul wajib diisi/i)).toBeInTheDocument();
  });

  it("disables the machine select until a customer is chosen", () => {
    renderWithClient(<CreateJobPage />);

    expect(screen.getByRole("combobox", { name: /mesin/i })).toBeDisabled();
  });

  it("cascades customer -> machine, and submits the job with both ids", async () => {
    server.use(
      http.get("/api/v1/customers", () =>
        HttpResponse.json({
          success: true,
          data: [acmeCustomer],
          meta: { page: 1, total: 1 },
        }),
      ),
      http.get("/api/v1/customers/cust-1/machines", () =>
        HttpResponse.json({
          success: true,
          data: [
            {
              id: "machine-1",
              customer_id: "cust-1",
              machine_name: "CNC Mill A",
              machine_type: null,
              serial_number: null,
              notes: null,
              created_at: "2026-01-01T00:00:00Z",
              updated_at: "2026-01-01T00:00:00Z",
            },
          ],
        }),
      ),
      http.post("/api/v1/jobs", async ({ request }) => {
        const body = (await request.json()) as Record<string, unknown>;
        expect(body).toEqual({
          customer_id: "cust-1",
          machine_id: "machine-1",
          title: "Servis rutin",
        });
        return HttpResponse.json(
          {
            success: true,
            data: {
              id: "job-1",
              job_code: "JOB-2026-0001",
              customer_id: "cust-1",
              machine_id: "machine-1",
              technician_id: null,
              title: "Servis rutin",
              description: null,
              status: "requested",
              scheduled_date: null,
              completed_date: null,
              created_at: "2026-08-01T00:00:00Z",
              updated_at: "2026-08-01T00:00:00Z",
            },
          },
          { status: 201 },
        );
      }),
    );

    const user = userEvent.setup();
    renderWithClient(<CreateJobPage />);

    const customerCombobox = screen.getByRole("combobox", { name: "Customer" });
    await user.click(customerCombobox);
    await user.type(customerCombobox, "Acme");
    await user.click(await screen.findByRole("option", { name: "Acme Corp" }));

    const machineSelect = screen.getByRole("combobox", { name: /mesin/i });
    await waitFor(() => expect(machineSelect).not.toBeDisabled());
    await user.click(machineSelect);
    await user.click(await screen.findByRole("option", { name: "CNC Mill A" }));

    await user.type(screen.getByLabelText(/judul \*/i), "Servis rutin");
    await user.click(screen.getByRole("button", { name: /simpan job/i }));

    await waitFor(() => expect(push).toHaveBeenCalledWith("/jobs/job-1"));
  });
});
