import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import type { ReactElement } from "react";

import { server } from "@/mocks/server";

import { EditCustomerPage } from "./EditCustomerPage";

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

const existingCustomer = {
  id: "cust-1",
  name: "Acme Corp",
  customer_type: "badan_usaha" as const,
  phone: "0812345",
  email: "acme@example.com",
  address: "Jl. Merdeka 1",
  company_name: "PT Acme",
  created_at: "2026-01-01T00:00:00Z",
  updated_at: "2026-01-01T00:00:00Z",
  deleted_at: null,
  machines: [],
};

describe("EditCustomerPage", () => {
  beforeEach(() => {
    push.mockClear();
    server.use(
      http.get("/api/v1/customers/cust-1", () =>
        HttpResponse.json({ success: true, data: existingCustomer }),
      ),
    );
  });

  it("shows customer_type as a disabled, read-only field with its existing value", async () => {
    renderWithClient(<EditCustomerPage customerId="cust-1" />);

    const typeField = await screen.findByDisplayValue("Badan Usaha");
    expect(typeField).toBeDisabled();
    // The editable name field must still be interactive, for contrast.
    expect(screen.getByDisplayValue("Acme Corp")).not.toBeDisabled();
  });

  it("submits an update without customer_type in the request body", async () => {
    server.use(
      http.put("/api/v1/customers/cust-1", async ({ request }) => {
        const body = (await request.json()) as Record<string, unknown>;
        expect(body).not.toHaveProperty("customer_type");
        expect(body).toEqual({
          name: "Acme Corp Updated",
          phone: "0812345",
          email: "acme@example.com",
          address: "Jl. Merdeka 1",
          company_name: "PT Acme",
        });
        return HttpResponse.json({
          success: true,
          data: { ...existingCustomer, name: "Acme Corp Updated" },
        });
      }),
    );

    const user = userEvent.setup();
    renderWithClient(<EditCustomerPage customerId="cust-1" />);

    const nameInput = await screen.findByDisplayValue("Acme Corp");
    await user.clear(nameInput);
    await user.type(nameInput, "Acme Corp Updated");
    await user.click(screen.getByRole("button", { name: /simpan perubahan/i }));

    await waitFor(() =>
      expect(push).toHaveBeenCalledWith("/customers/cust-1"),
    );
  });
});
