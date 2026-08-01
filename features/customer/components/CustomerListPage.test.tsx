import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import type { ReactElement } from "react";

import { server } from "@/mocks/server";

import type { Customer } from "../types";
import { CustomerListPage } from "./CustomerListPage";

const replace = jest.fn();
const push = jest.fn();
const mockSearchParams = jest.fn(() => new URLSearchParams());

jest.mock("next/navigation", () => ({
  useRouter: () => ({ replace, push }),
  usePathname: () => "/customers",
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

function makeCustomer(overrides: Partial<Customer> = {}): Customer {
  return {
    id: "1",
    name: "Acme Corp",
    customer_type: "badan_usaha",
    phone: "0812345",
    email: null,
    address: null,
    company_name: "PT Acme",
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
    deleted_at: null,
    ...overrides,
  };
}

describe("CustomerListPage", () => {
  beforeEach(() => {
    replace.mockClear();
    push.mockClear();
    mockSearchParams.mockReturnValue(new URLSearchParams());
  });

  it("renders customers returned by GET /customers", async () => {
    server.use(
      http.get("/api/v1/customers", () =>
        HttpResponse.json({
          success: true,
          data: [makeCustomer()],
          meta: { page: 1, total: 1 },
        }),
      ),
    );

    renderWithClient(<CustomerListPage />);

    expect(await screen.findByText("Acme Corp")).toBeInTheDocument();
  });

  it("shows the empty state when there are no customers and no active filter", async () => {
    server.use(
      http.get("/api/v1/customers", () =>
        HttpResponse.json({
          success: true,
          data: [],
          meta: { page: 1, total: 0 },
        }),
      ),
    );

    renderWithClient(<CustomerListPage />);

    expect(await screen.findByText(/belum ada customer/i)).toBeInTheDocument();
  });

  it("debounces typed search and pushes it into the URL via router.replace", async () => {
    server.use(
      http.get("/api/v1/customers", () =>
        HttpResponse.json({
          success: true,
          data: [],
          meta: { page: 1, total: 0 },
        }),
      ),
    );

    const user = userEvent.setup();
    renderWithClient(<CustomerListPage />);

    await user.type(screen.getByLabelText(/cari customer/i), "acme");

    // Not called immediately - debounce hasn't elapsed yet.
    expect(replace).not.toHaveBeenCalled();

    await waitFor(
      () => {
        expect(replace).toHaveBeenCalled();
        const lastUrl = replace.mock.calls.at(-1)?.[0] as string;
        expect(lastUrl).toContain("search=acme");
        expect(lastUrl).toContain("page=1");
      },
      { timeout: 2000 },
    );
  });

  it("sends the search param from the URL to GET /customers", async () => {
    mockSearchParams.mockReturnValue(new URLSearchParams("search=acme"));

    let capturedSearch: string | null = null;
    server.use(
      http.get("/api/v1/customers", ({ request }) => {
        capturedSearch = new URL(request.url).searchParams.get("search");
        return HttpResponse.json({
          success: true,
          data: [makeCustomer()],
          meta: { page: 1, total: 1 },
        });
      }),
    );

    renderWithClient(<CustomerListPage />);

    await screen.findByText("Acme Corp");
    expect(capturedSearch).toBe("acme");
  });

  it("updates the customer_type filter via router.replace when a filter option is picked", async () => {
    server.use(
      http.get("/api/v1/customers", () =>
        HttpResponse.json({
          success: true,
          data: [],
          meta: { page: 1, total: 0 },
        }),
      ),
    );

    const user = userEvent.setup();
    renderWithClient(<CustomerListPage />);

    await user.click(
      screen.getByRole("combobox", { name: /filter tipe customer/i }),
    );
    await user.click(await screen.findByRole("option", { name: "Perorangan" }));

    await waitFor(() => {
      expect(replace).toHaveBeenCalled();
      const lastUrl = replace.mock.calls.at(-1)?.[0] as string;
      expect(lastUrl).toContain("customer_type=perorangan");
      expect(lastUrl).toContain("page=1");
    });
  });

  it("sends the customer_type param from the URL to GET /customers", async () => {
    mockSearchParams.mockReturnValue(
      new URLSearchParams("customer_type=perorangan"),
    );

    let capturedType: string | null = null;
    server.use(
      http.get("/api/v1/customers", ({ request }) => {
        capturedType = new URL(request.url).searchParams.get("customer_type");
        return HttpResponse.json({
          success: true,
          data: [makeCustomer({ customer_type: "perorangan" })],
          meta: { page: 1, total: 1 },
        });
      }),
    );

    renderWithClient(<CustomerListPage />);

    await screen.findByText("Acme Corp");
    expect(capturedType).toBe("perorangan");
  });
});
