"use client";

import { useState } from "react";

import { EditFieldPanel } from "@/components/EditFieldPanel";
import { Button } from "@/components/ui/button";
import { getApiErrorMessage } from "@/lib/axios";

import { useCreateMachine } from "../hooks/useCreateMachine";
import {
  createMachineSchema,
  type CreateMachineFormValues,
  type CreateMachineInput,
} from "../schema";
import type { Machine } from "../types";

interface MachinesSectionProps {
  customerId: string;
  machines: Machine[];
}

// Extracted from CustomerDetailPage's previously-inline "Mesin" block -
// same read-only list as before, plus "Tambah Mesin". No edit/delete UI:
// PUT/DELETE /customers/{id}/machines/{machine_id} don't exist on the
// backend yet (confirmed live in Tahap 1, both 404 "route not found"),
// this is create-only until that lands.
export function MachinesSection({ customerId, machines }: MachinesSectionProps) {
  const [isAdding, setIsAdding] = useState(false);
  const createMachine = useCreateMachine(customerId);

  // EditFieldPanel is single-generic (no z.input/z.output split, see its
  // own doc comment on why) - its onSubmit prop is typed as
  // (values: TValues) => void, i.e. the PRE-transform form-values shape
  // (CreateMachineFormValues, optional keys), not the validated/
  // transformed output createMachine.mutate() actually needs
  // (CreateMachineInput, required-but-possibly-undefined keys). At
  // RUNTIME, zodResolver already ran the transform by the time this
  // fires (blank optional fields really are `undefined` here, not `""`)
  // - only the TYPE is imprecise, which is exactly the documented
  // limitation. Asserting the type here (not touching EditFieldPanel)
  // is the correct minimal fix.
  function handleSubmit(values: CreateMachineFormValues) {
    createMachine.mutate(values as CreateMachineInput, {
      onSuccess: () => setIsAdding(false),
    });
  }

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Mesin</h2>
        <Button type="button" variant="outline" size="sm" onClick={() => setIsAdding(true)}>
          Tambah Mesin
        </Button>
      </div>

      {machines.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Belum ada mesin terdaftar untuk customer ini.
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {machines.map((machine) => (
            <li key={machine.id} className="rounded-md border p-3 text-sm">
              <p className="font-medium">{machine.machine_name}</p>
              <p className="text-muted-foreground">
                {[machine.machine_type, machine.serial_number]
                  .filter(Boolean)
                  .join(" - ") || "-"}
              </p>
            </li>
          ))}
        </ul>
      )}

      <EditFieldPanel<CreateMachineFormValues>
        open={isAdding}
        onOpenChange={setIsAdding}
        title="Tambah Mesin"
        schema={createMachineSchema}
        defaultValues={{
          machine_name: "",
          machine_type: "",
          serial_number: "",
          notes: "",
        }}
        fields={[
          { name: "machine_name", label: "Nama Mesin" },
          { name: "machine_type", label: "Tipe Mesin (opsional)" },
          { name: "serial_number", label: "Nomor Seri (opsional)" },
          { name: "notes", label: "Catatan (opsional)" },
        ]}
        onSubmit={handleSubmit}
        isPending={createMachine.isPending}
        errorMessage={
          createMachine.isError ? getApiErrorMessage(createMachine.error) : null
        }
      />
    </div>
  );
}
