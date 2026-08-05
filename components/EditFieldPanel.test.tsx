import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { z } from "zod";

import { EditFieldPanel } from "./EditFieldPanel";

const schema = z.object({
  value: z.string().trim().min(1, "Wajib diisi"),
});
type Values = z.infer<typeof schema>;

describe("EditFieldPanel", () => {
  it("validates a required field before calling onSubmit", async () => {
    const onSubmit = jest.fn();
    const user = userEvent.setup();
    render(
      <EditFieldPanel<Values>
        open
        onOpenChange={jest.fn()}
        title="Edit Test"
        schema={schema}
        defaultValues={{ value: "" }}
        fields={[{ name: "value", label: "Nilai" }]}
        onSubmit={onSubmit}
        isPending={false}
      />,
    );

    await user.click(screen.getByRole("button", { name: /simpan/i }));

    expect(await screen.findByText(/wajib diisi/i)).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("calls onSubmit with the entered value when valid", async () => {
    const onSubmit = jest.fn();
    const user = userEvent.setup();
    render(
      <EditFieldPanel<Values>
        open
        onOpenChange={jest.fn()}
        title="Edit Test"
        schema={schema}
        defaultValues={{ value: "" }}
        fields={[{ name: "value", label: "Nilai" }]}
        onSubmit={onSubmit}
        isPending={false}
      />,
    );

    await user.type(screen.getByLabelText(/nilai/i), "BP-001");
    await user.click(screen.getByRole("button", { name: /simpan/i }));

    // RHF's handleSubmit calls onValid(data, event) - two args, not one -
    // assert just the parsed data (first arg), not an exact-arity match.
    expect(onSubmit.mock.calls[0][0]).toEqual({ value: "BP-001" });
  });

  it("pre-fills the field from defaultValues", () => {
    render(
      <EditFieldPanel<Values>
        open
        onOpenChange={jest.fn()}
        title="Edit Test"
        schema={schema}
        defaultValues={{ value: "existing-ref" }}
        fields={[{ name: "value", label: "Nilai" }]}
        onSubmit={jest.fn()}
        isPending={false}
      />,
    );

    expect(screen.getByLabelText(/nilai/i)).toHaveValue("existing-ref");
  });

  it("shows the pending label and disables submit while isPending", () => {
    render(
      <EditFieldPanel<Values>
        open
        onOpenChange={jest.fn()}
        title="Edit Test"
        schema={schema}
        defaultValues={{ value: "" }}
        fields={[{ name: "value", label: "Nilai" }]}
        onSubmit={jest.fn()}
        isPending
      />,
    );

    expect(screen.getByRole("button", { name: /menyimpan/i })).toBeDisabled();
  });

  it("shows errorMessage when provided", () => {
    render(
      <EditFieldPanel<Values>
        open
        onOpenChange={jest.fn()}
        title="Edit Test"
        schema={schema}
        defaultValues={{ value: "" }}
        fields={[{ name: "value", label: "Nilai" }]}
        onSubmit={jest.fn()}
        isPending={false}
        errorMessage="Gagal menyimpan"
      />,
    );

    expect(screen.getByText("Gagal menyimpan")).toBeInTheDocument();
  });
});
