import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import type { ReactElement } from "react";

import { server } from "@/mocks/server";

import { DeleteCustomerDialog } from "./DeleteCustomerDialog";

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

describe("DeleteCustomerDialog", () => {
  it("opens a confirmation dialog naming the customer before deleting anything", async () => {
    const user = userEvent.setup();
    renderWithClient(
      <DeleteCustomerDialog
        customerId="cust-1"
        customerName="Acme Corp"
        onDeleted={jest.fn()}
      />,
    );

    await user.click(screen.getByRole("button", { name: /hapus customer/i }));

    expect(
      await screen.findByText(/hapus acme corp\?/i),
    ).toBeInTheDocument();
  });

  it("does not call the API when the confirmation is cancelled", async () => {
    let deleteCallCount = 0;
    server.use(
      http.delete("/api/v1/customers/cust-1", () => {
        deleteCallCount += 1;
        return new HttpResponse(null, { status: 204 });
      }),
    );

    const onDeleted = jest.fn();
    const user = userEvent.setup();
    renderWithClient(
      <DeleteCustomerDialog
        customerId="cust-1"
        customerName="Acme Corp"
        onDeleted={onDeleted}
      />,
    );

    await user.click(screen.getByRole("button", { name: /hapus customer/i }));
    await screen.findByText(/hapus acme corp\?/i);
    await user.click(screen.getByRole("button", { name: /^batal$/i }));

    await waitFor(() =>
      expect(screen.queryByText(/hapus acme corp\?/i)).not.toBeInTheDocument(),
    );
    expect(deleteCallCount).toBe(0);
    expect(onDeleted).not.toHaveBeenCalled();
  });

  it("calls DELETE and onDeleted when the deletion is confirmed", async () => {
    let deleteCallCount = 0;
    server.use(
      http.delete("/api/v1/customers/cust-1", () => {
        deleteCallCount += 1;
        return new HttpResponse(null, { status: 204 });
      }),
    );

    const onDeleted = jest.fn();
    const user = userEvent.setup();
    renderWithClient(
      <DeleteCustomerDialog
        customerId="cust-1"
        customerName="Acme Corp"
        onDeleted={onDeleted}
      />,
    );

    await user.click(screen.getByRole("button", { name: /hapus customer/i }));
    await screen.findByText(/hapus acme corp\?/i);
    // Two "Hapus"-ish buttons exist (trigger + confirm) once the dialog is
    // open; the confirm action is the exact-match "Hapus" button.
    await user.click(screen.getByRole("button", { name: /^hapus$/i }));

    await waitFor(() => expect(onDeleted).toHaveBeenCalled());
    expect(deleteCallCount).toBe(1);
  });
});
