"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";

import { RemoteSearchSelect } from "@/components/RemoteSearchSelect";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useCustomerMachines } from "@/features/customer/hooks/useCustomerMachines";
import { useCustomerOptions } from "@/features/customer/hooks/useCustomerOptions";
import type { Customer } from "@/features/customer/types";
import { getApiErrorMessage } from "@/lib/axios";

import { useCreateJob } from "../hooks/useCreateJob";
import {
  createJobSchema,
  type CreateJobFormValues,
  type CreateJobInput,
} from "../schema";

export function CreateJobPage() {
  const router = useRouter();
  const createJob = useCreateJob();
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null,
  );

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<CreateJobFormValues, unknown, CreateJobInput>({
    resolver: zodResolver(createJobSchema),
    defaultValues: {
      customer_id: "",
      machine_id: undefined,
      title: "",
      description: "",
      scheduled_date: "",
    },
  });

  const machineId = useWatch({ control, name: "machine_id" });
  const { data: machines } = useCustomerMachines(selectedCustomer?.id);

  function handleCustomerChange(customer: Customer | null) {
    setSelectedCustomer(customer);
    setValue("customer_id", customer?.id ?? "", { shouldValidate: true });
    // Machine belongs to the previous customer - reset it, cascading
    // select can't keep a selection that no longer makes sense.
    setValue("machine_id", undefined);
  }

  function onSubmit(values: CreateJobInput) {
    createJob.mutate(values, {
      onSuccess: (job) => router.push(`/jobs/${job.id}`),
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold">Tambah Job</h1>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex max-w-lg flex-col gap-4"
      >
        <div className="flex flex-col gap-2">
          <Label htmlFor="customer">Customer *</Label>
          <RemoteSearchSelect<Customer>
            value={selectedCustomer}
            onValueChange={handleCustomerChange}
            useOptions={useCustomerOptions}
            getOptionLabel={(c) => c.name}
            getOptionId={(c) => c.id}
            placeholder="Cari customer..."
            aria-label="Customer"
          />
          {errors.customer_id && (
            <p className="text-sm text-destructive">
              {errors.customer_id.message}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="machine">Mesin</Label>
          <Select
            value={machineId ?? ""}
            onValueChange={(value) =>
              setValue("machine_id", value || undefined)
            }
            disabled={!selectedCustomer}
          >
            <SelectTrigger id="machine" aria-label="Mesin">
              <SelectValue
                placeholder={
                  selectedCustomer ? "Pilih mesin (opsional)" : "Pilih customer dulu"
                }
              />
            </SelectTrigger>
            <SelectContent>
              {machines?.map((machine) => (
                <SelectItem key={machine.id} value={machine.id}>
                  {machine.machine_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="title">Judul *</Label>
          <Input id="title" {...register("title")} />
          {errors.title && (
            <p className="text-sm text-destructive">{errors.title.message}</p>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="description">Deskripsi</Label>
          <Textarea id="description" {...register("description")} />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="scheduled_date">Tanggal Jadwal</Label>
          <Input
            id="scheduled_date"
            type="date"
            {...register("scheduled_date")}
          />
        </div>

        {createJob.isError && (
          <p className="text-sm text-destructive">
            {getApiErrorMessage(createJob.error)}
          </p>
        )}

        <Button type="submit" disabled={createJob.isPending}>
          {createJob.isPending ? "Menyimpan..." : "Simpan Job"}
        </Button>
      </form>
    </div>
  );
}
