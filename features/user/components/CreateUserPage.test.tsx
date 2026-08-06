import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import type { ReactElement } from "react";

import { server } from "@/mocks/server";

import { CreateUserPage } from "./CreateUserPage";

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

describe("CreateUserPage", () => {
  beforeEach(() => {
    push.mockClear();
  });

  it("rejects a password shorter than 8 characters", async () => {
    const user = userEvent.setup();
    renderWithClient(<CreateUserPage />);

    await user.type(screen.getByLabelText(/nama/i), "Teknisi Baru");
    await user.type(screen.getByLabelText(/email/i), "teknisi@example.test");
    await user.type(screen.getByLabelText(/password/i), "short1");
    await user.click(screen.getByRole("button", { name: /simpan pengguna/i }));

    expect(await screen.findByText(/minimal 8 karakter/i)).toBeInTheDocument();
  });

  it("submits name/email/password/role to POST /users and redirects to /users", async () => {
    let capturedBody: Record<string, unknown> | null = null;
    server.use(
      http.post("/api/v1/users", async ({ request }) => {
        capturedBody = (await request.json()) as Record<string, unknown>;
        return HttpResponse.json(
          {
            success: true,
            data: {
              id: "user-1",
              name: "Teknisi Baru",
              email: "teknisi@example.test",
              role: "teknisi",
              created_at: "2026-08-06T00:00:00Z",
              updated_at: "2026-08-06T00:00:00Z",
              deleted_at: null,
            },
          },
          { status: 201 },
        );
      }),
    );

    const user = userEvent.setup();
    renderWithClient(<CreateUserPage />);

    await user.type(screen.getByLabelText(/nama/i), "Teknisi Baru");
    await user.type(screen.getByLabelText(/email/i), "teknisi@example.test");
    await user.type(screen.getByLabelText(/password/i), "password123");
    await user.click(screen.getByRole("button", { name: /simpan pengguna/i }));

    await waitFor(() => {
      expect(capturedBody).toEqual({
        name: "Teknisi Baru",
        email: "teknisi@example.test",
        password: "password123",
        role: "teknisi",
      });
    });
    expect(push).toHaveBeenCalledWith("/users");
  });
});
