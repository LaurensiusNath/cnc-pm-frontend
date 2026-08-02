"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { useForm, useWatch } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { User } from "@/features/user/types";

import { useAssignTechnician } from "../hooks/useAssignTechnician";
import {
  assignTechnicianSchema,
  type AssignTechnicianFormInput,
} from "../schema";

interface JobAssignTechnicianFormProps {
  jobId: string;
  /** updated_at from the currently-cached job detail, NOT refetched before
   * submit - this is the optimistic-locking contract PATCH /jobs/{id}/assign
   * expects (see docs/api-contract.md). */
  currentUpdatedAt: string;
  technicians: User[];
}

export function JobAssignTechnicianForm({
  jobId,
  currentUpdatedAt,
  technicians,
}: JobAssignTechnicianFormProps) {
  const assignTechnician = useAssignTechnician(jobId);

  const {
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<AssignTechnicianFormInput>({
    resolver: zodResolver(assignTechnicianSchema),
    defaultValues: { technician_id: "" },
  });

  const technicianId = useWatch({ control, name: "technician_id" });

  function onSubmit(values: AssignTechnicianFormInput) {
    assignTechnician.mutate({
      ...values,
      expectedUpdatedAt: currentUpdatedAt,
    });
  }

  // 409 is a distinct, expected case (optimistic locking conflict) - not
  // a generic error, needs its own message per the assign contract, not
  // just getApiErrorMessage's fallback text.
  const isConflict =
    assignTechnician.isError &&
    axios.isAxiosError(assignTechnician.error) &&
    assignTechnician.error.response?.status === 409;

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-3 rounded-md border p-3"
    >
      <h2 className="text-lg font-semibold">Assign Teknisi</h2>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="technician">Teknisi</Label>
        <Select
          value={technicianId}
          onValueChange={(value) =>
            setValue("technician_id", value ?? "", { shouldValidate: true })
          }
        >
          <SelectTrigger id="technician" aria-label="Teknisi">
            <SelectValue placeholder="Pilih teknisi">
              {(value: string | null) =>
                technicians.find((tech) => tech.id === value)?.name ?? value
              }
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {technicians.map((tech) => (
              <SelectItem key={tech.id} value={tech.id}>
                {tech.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.technician_id && (
          <p className="text-sm text-destructive">
            {errors.technician_id.message}
          </p>
        )}
      </div>

      {isConflict ? (
        <p className="text-sm text-destructive">
          Job ini sudah diubah pihak lain sejak halaman ini dimuat. Data
          sudah dimuat ulang - silakan periksa kondisi terbaru lalu coba
          lagi.
        </p>
      ) : assignTechnician.isError ? (
        <p className="text-sm text-destructive">
          Gagal menugaskan teknisi. Coba lagi.
        </p>
      ) : null}

      <Button
        type="submit"
        disabled={assignTechnician.isPending}
        className="w-fit"
      >
        {assignTechnician.isPending ? "Menugaskan..." : "Assign"}
      </Button>
    </form>
  );
}
