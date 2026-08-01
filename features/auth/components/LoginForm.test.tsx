import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import type { ReactElement } from "react";

import { server } from "@/mocks/server";

import { LoginForm } from "./LoginForm";

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

describe("LoginForm", () => {
  beforeEach(() => {
    push.mockClear();
  });

  it("shows Zod validation errors instead of submitting for empty fields", async () => {
    const user = userEvent.setup();
    renderWithClient(<LoginForm />);

    await user.click(screen.getByRole("button", { name: /masuk/i }));

    expect(await screen.findByText(/email tidak valid/i)).toBeInTheDocument();
    expect(screen.getByText(/password wajib diisi/i)).toBeInTheDocument();
  });

  it("logs in and redirects to /dashboard on success", async () => {
    server.use(
      http.post("/api/v1/auth/login", async ({ request }) => {
        const body = (await request.json()) as {
          email: string;
          password: string;
        };
        expect(body).toEqual({
          email: "owner@cnc.test",
          password: "secret123",
        });
        return HttpResponse.json({
          success: true,
          data: {
            user: {
              id: "1",
              name: "Owner",
              email: body.email,
              role: "owner",
            },
          },
        });
      }),
    );

    const user = userEvent.setup();
    renderWithClient(<LoginForm />);

    await user.type(screen.getByLabelText(/email/i), "owner@cnc.test");
    await user.type(screen.getByLabelText(/password/i), "secret123");
    await user.click(screen.getByRole("button", { name: /masuk/i }));

    await waitFor(() => expect(push).toHaveBeenCalledWith("/dashboard"));
  });

  it("shows the backend's error message on invalid credentials, without redirecting", async () => {
    server.use(
      http.post("/api/v1/auth/login", () =>
        HttpResponse.json(
          {
            success: false,
            error: {
              code: "UNAUTHORIZED",
              message: "Email atau password salah",
            },
          },
          { status: 401 },
        ),
      ),
    );

    const user = userEvent.setup();
    renderWithClient(<LoginForm />);

    await user.type(screen.getByLabelText(/email/i), "owner@cnc.test");
    await user.type(screen.getByLabelText(/password/i), "wrong");
    await user.click(screen.getByRole("button", { name: /masuk/i }));

    expect(
      await screen.findByText(/email atau password salah/i),
    ).toBeInTheDocument();
    expect(push).not.toHaveBeenCalled();
  });
});
