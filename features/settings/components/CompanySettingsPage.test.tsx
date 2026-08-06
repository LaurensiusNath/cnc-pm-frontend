import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import type { ReactElement } from "react";

import { server } from "@/mocks/server";

import { CompanySettingsPage } from "./CompanySettingsPage";

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

const SETTINGS = {
  company_name: "PT Servis CNC Sejahtera",
  npwp: "01.234.567.8-901.000",
  is_pkp: true,
  default_tax_percentage: 11,
  default_pph23_rate: 2,
  updated_at: "2026-08-02T09:14:08.945Z",
};

function mockAuthMe(role: "owner" | "admin" | "teknisi") {
  server.use(
    http.get("/api/v1/auth/me", () =>
      HttpResponse.json({
        success: true,
        data: { user: { id: "u-1", name: "Test User", email: "u@x.test", role } },
      }),
    ),
  );
}

describe("CompanySettingsPage", () => {
  it("renders read-only for a teknisi viewer: fields disabled, no submit button, NOT AccessDenied", async () => {
    mockAuthMe("teknisi");
    server.use(
      http.get("/api/v1/settings/company", () =>
        HttpResponse.json({ success: true, data: SETTINGS }),
      ),
    );

    renderWithClient(<CompanySettingsPage />);

    const nameInput = await screen.findByLabelText(/nama perusahaan/i);
    expect(nameInput).toHaveValue("PT Servis CNC Sejahtera");
    expect(nameInput).toBeDisabled();
    expect(screen.getByLabelText(/npwp/i)).toBeDisabled();
    expect(
      screen.queryByRole("button", { name: /simpan pengaturan/i }),
    ).not.toBeInTheDocument();
    // Data is genuinely shown (GET is open to every role), not hidden
    // behind an access-denied wall - see CLAUDE.md's "AccessDenied vs
    // read-only" note.
    expect(
      screen.queryByText(/anda tidak punya akses ke halaman ini/i),
    ).not.toBeInTheDocument();
    expect(
      screen.getByText(/hanya role owner\/admin yang bisa mengubah/i),
    ).toBeInTheDocument();
  });

  it("allows an owner to edit and submit PUT /settings/company", async () => {
    mockAuthMe("owner");
    server.use(
      http.get("/api/v1/settings/company", () =>
        HttpResponse.json({ success: true, data: SETTINGS }),
      ),
    );

    let capturedBody: Record<string, unknown> | null = null;
    server.use(
      http.put("/api/v1/settings/company", async ({ request }) => {
        capturedBody = (await request.json()) as Record<string, unknown>;
        return HttpResponse.json({
          success: true,
          data: { ...SETTINGS, company_name: "PT Servis CNC Baru" },
        });
      }),
    );

    const user = userEvent.setup();
    renderWithClient(<CompanySettingsPage />);

    const nameInput = await screen.findByLabelText(/nama perusahaan/i);
    expect(nameInput).not.toBeDisabled();
    await user.clear(nameInput);
    await user.type(nameInput, "PT Servis CNC Baru");
    await user.click(screen.getByRole("button", { name: /simpan pengaturan/i }));

    await waitFor(() => {
      expect(capturedBody).toEqual({
        company_name: "PT Servis CNC Baru",
        npwp: "01.234.567.8-901.000",
        is_pkp: true,
        default_tax_percentage: 11,
        default_pph23_rate: 2,
      });
    });
    expect(
      await screen.findByText(/pengaturan berhasil disimpan/i),
    ).toBeInTheDocument();
  });
});
