import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import type { ReactElement } from "react";

import { server } from "@/mocks/server";

import { UserListPage } from "./UserListPage";

const replace = jest.fn();
const mockSearchParams = jest.fn(() => new URLSearchParams());

jest.mock("next/navigation", () => ({
  useRouter: () => ({ replace }),
  usePathname: () => "/users",
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

const ALL_USERS = [
  { id: "1", name: "Owner Satu", email: "owner@x.test", role: "owner", created_at: "", updated_at: "", deleted_at: null },
  { id: "2", name: "Teknisi Satu", email: "teknisi@x.test", role: "teknisi", created_at: "", updated_at: "", deleted_at: null },
];

describe("UserListPage", () => {
  beforeEach(() => {
    replace.mockClear();
    mockSearchParams.mockReturnValue(new URLSearchParams());
  });

  it("renders users returned by GET /users", async () => {
    server.use(
      http.get("/api/v1/users", () =>
        HttpResponse.json({ success: true, data: ALL_USERS }),
      ),
    );

    renderWithClient(<UserListPage />);

    expect(await screen.findByText("Owner Satu")).toBeInTheDocument();
    expect(screen.getByText("Teknisi Satu")).toBeInTheDocument();
  });

  it("filters to just the selected role, client-side, without a second GET /users call", async () => {
    let callCount = 0;
    server.use(
      http.get("/api/v1/users", () => {
        callCount += 1;
        return HttpResponse.json({ success: true, data: ALL_USERS });
      }),
    );

    const user = userEvent.setup();
    renderWithClient(<UserListPage />);
    await screen.findByText("Owner Satu");

    await user.click(screen.getByRole("combobox", { name: /filter role/i }));
    await user.click(await screen.findByRole("option", { name: "Teknisi" }));

    await waitFor(() => {
      expect(replace).toHaveBeenCalled();
      const lastUrl = replace.mock.calls.at(-1)?.[0] as string;
      expect(lastUrl).toContain("role=teknisi");
    });
    expect(callCount).toBe(1);
  });

  it("shows an explicit access-denied message on 403", async () => {
    server.use(
      http.get("/api/v1/users", () =>
        HttpResponse.json(
          { success: false, error: { code: "FORBIDDEN", message: "insufficient permissions for this action" } },
          { status: 403 },
        ),
      ),
    );

    renderWithClient(<UserListPage />);

    expect(
      await screen.findByText(/anda tidak punya akses ke halaman ini/i),
    ).toBeInTheDocument();
  });
});
