"use client";

import { zodResolver } from "@hookform/resolvers/zod";
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
import { Textarea } from "@/components/ui/textarea";
import { getApiErrorMessage } from "@/lib/axios";

import { useUpdateJobStatus } from "../hooks/useUpdateJobStatus";
import {
  jobStatusOptions,
  updateJobStatusSchema,
  type UpdateJobStatusFormValues,
  type UpdateJobStatusInput,
} from "../schema";
import type { JobStatus } from "../types";

interface JobStatusChangeFormProps {
  jobId: string;
  currentStatus: JobStatus;
}

// No status ordering to enforce here - confirmed against domain.go/
// service.go/repository.go (see docs/api-contract.md), the backend
// accepts any of the other 4 statuses regardless of the current one.
export function JobStatusChangeForm({
  jobId,
  currentStatus,
}: JobStatusChangeFormProps) {
  const updateStatus = useUpdateJobStatus(jobId);
  const otherStatuses = jobStatusOptions.filter(
    (opt) => opt.value !== currentStatus,
  );

  const {
    handleSubmit,
    control,
    setValue,
    register,
    formState: { errors },
  } = useForm<UpdateJobStatusFormValues, unknown, UpdateJobStatusInput>({
    resolver: zodResolver(updateJobStatusSchema),
    defaultValues: { status: otherStatuses[0]?.value, notes: "" },
  });

  const status = useWatch({ control, name: "status" });

  function onSubmit(values: UpdateJobStatusInput) {
    updateStatus.mutate(values);
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-3 rounded-md border p-3"
    >
      <h2 className="text-lg font-semibold">Ubah Status</h2>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="status">Status Baru</Label>
        <Select
          value={status}
          onValueChange={(value) =>
            setValue("status", value as JobStatus, { shouldValidate: true })
          }
        >
          <SelectTrigger id="status" aria-label="Status Baru">
            <SelectValue placeholder="Pilih status">
              {(value: string | null) =>
                jobStatusOptions.find((opt) => opt.value === value)?.label ??
                value
              }
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {otherStatuses.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.status && (
          <p className="text-sm text-destructive">{errors.status.message}</p>
        )}
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="notes">Catatan</Label>
        <Textarea id="notes" {...register("notes")} />
      </div>
      {updateStatus.isError && (
        <p className="text-sm text-destructive">
          {getApiErrorMessage(updateStatus.error)}
        </p>
      )}
      {updateStatus.isSuccess && (
        <p className="text-sm text-emerald-600">Status berhasil diubah.</p>
      )}
      <Button type="submit" disabled={updateStatus.isPending} className="w-fit">
        {updateStatus.isPending ? "Menyimpan..." : "Ubah Status"}
      </Button>
    </form>
  );
}
