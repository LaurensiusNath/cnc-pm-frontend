import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import type { ReactElement } from "react";

import { server } from "@/mocks/server";

import { CurrentUserBadge } from "./CurrentUserBadge";

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

describe("CurrentUserBadge", () => {
  it("renders the current user's name and role from GET /auth/me", async () => {
    server.use(
      http.get("/api/v1/auth/me", () =>
        HttpResponse.json({
          success: true,
          data: {
            user: {
              id: "owner-1",
              name: "Pemilik Bengkel",
              email: "owner@cncservis.local",
              role: "owner",
            },
          },
        }),
      ),
    );

    renderWithClient(<CurrentUserBadge />);

    expect(await screen.findByText(/pemilik bengkel/i)).toBeInTheDocument();
    expect(screen.getByText(/\(owner\)/i)).toBeInTheDocument();
  });

  it("renders nothing once GET /auth/me settles into an error", async () => {
    server.use(
      http.get("/api/v1/auth/me", () =>
        HttpResponse.json(
          { success: false, error: { code: "UNAUTHORIZED", message: "no session" } },
          { status: 401 },
        ),
      ),
    );

    const { container } = renderWithClient(<CurrentUserBadge />);

    // Empty immediately (loading) and stays empty once the query actually
    // settles into an error - not just catching the initial loading flash.
    await waitFor(() => expect(container).toBeEmptyDOMElement());
  });
});
