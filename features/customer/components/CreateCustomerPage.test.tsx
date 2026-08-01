import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import type { ReactElement } from "react";

import { server } from "@/mocks/server";

import { CreateCustomerPage } from "./CreateCustomerPage";

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

describe("CreateCustomerPage", () => {
  beforeEach(() => {
    push.mockClear();
  });

  it("shows a Zod validation error instead of submitting when name is empty", async () => {
    const user = userEvent.setup();
    renderWithClient(<CreateCustomerPage />);

    await user.click(screen.getByRole("button", { name: /simpan customer/i }));

    expect(await screen.findByText(/nama wajib diisi/i)).toBeInTheDocument();
  });

  it("creates a customer and redirects to its detail page", async () => {
    server.use(
      http.post("/api/v1/customers", async ({ request }) => {
        const body = (await request.json()) as Record<string, unknown>;
        expect(body).toEqual({
          name: "Budi Santoso",
          customer_type: "perorangan",
        });
        return HttpResponse.json(
          {
            success: true,
            data: {
              id: "new-id",
              name: "Budi Santoso",
              customer_type: "perorangan",
              phone: null,
              email: null,
              address: null,
              company_name: null,
              created_at: "2026-01-01T00:00:00Z",
              updated_at: "2026-01-01T00:00:00Z",
              deleted_at: null,
            },
          },
          { status: 201 },
        );
      }),
    );

    const user = userEvent.setup();
    renderWithClient(<CreateCustomerPage />);

    await user.type(screen.getByLabelText(/nama \*/i), "Budi Santoso");
    await user.click(
      screen.getByRole("combobox", { name: /tipe customer/i }),
    );
    await user.click(await screen.findByRole("option", { name: "Perorangan" }));
    await user.click(screen.getByRole("button", { name: /simpan customer/i }));

    await waitFor(() =>
      expect(push).toHaveBeenCalledWith("/customers/new-id"),
    );
  });
});
