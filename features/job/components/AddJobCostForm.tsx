"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";

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
import { getApiErrorMessage } from "@/lib/axios";

import { useCreateJobCost } from "../hooks/useCreateJobCost";
import {
  costTypeOptions,
  createJobCostSchema,
  type CreateJobCostFormValues,
  type CreateJobCostInput,
} from "../schema";

interface AddJobCostFormProps {
  jobId: string;
}

export function AddJobCostForm({ jobId }: AddJobCostFormProps) {
  const createCost = useCreateJobCost(jobId);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    reset,
    formState: { errors },
  } = useForm<CreateJobCostFormValues, unknown, CreateJobCostInput>({
    resolver: zodResolver(createJobCostSchema),
    defaultValues: {
      cost_type: "labor",
      description: "",
    },
  });

  const costType = useWatch({ control, name: "cost_type" });

  function onSubmit(values: CreateJobCostInput) {
    createCost.mutate(values, {
      onSuccess: () => reset({ cost_type: "labor", description: "" }),
    });
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-3 rounded-md border p-3"
    >
      <h3 className="text-sm font-semibold">Tambah Item Biaya</h3>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="cost_type">Tipe Biaya *</Label>
          <Select
            value={costType}
            onValueChange={(value) =>
              setValue(
                "cost_type",
                value as CreateJobCostFormValues["cost_type"],
                { shouldValidate: true },
              )
            }
          >
            <SelectTrigger id="cost_type" aria-label="Tipe Biaya">
              <SelectValue placeholder="Pilih tipe">
                {(value: string | null) =>
                  costTypeOptions.find((opt) => opt.value === value)?.label ??
                  value
                }
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {costTypeOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.cost_type && (
            <p className="text-sm text-destructive">
              {errors.cost_type.message}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="description">Deskripsi *</Label>
          <Input id="description" {...register("description")} />
          {errors.description && (
            <p className="text-sm text-destructive">
              {errors.description.message}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="quantity">Kuantitas *</Label>
          <Input
            id="quantity"
            type="number"
            step="any"
            {...register("quantity", { valueAsNumber: true })}
          />
          {errors.quantity && (
            <p className="text-sm text-destructive">
              {errors.quantity.message}
            </p>
          )}
        </div>

        {costType === "spare_part" && (
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="purchase_price">Harga Beli *</Label>
            <Input
              id="purchase_price"
              type="number"
              step="any"
              {...register("purchase_price", {
                // Not valueAsNumber: true - an untouched/blank input would
                // become NaN, not undefined, which slips past both the
                // superRefine's `=== undefined` check below and quietly
                // fails the wrong validator (.nonnegative()) with the
                // wrong message instead. Blank must mean "not provided".
                setValueAs: (v) => (v === "" ? undefined : Number(v)),
              })}
            />
            {errors.purchase_price && (
              <p className="text-sm text-destructive">
                {errors.purchase_price.message}
              </p>
            )}
          </div>
        )}

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="selling_price">Harga Jual *</Label>
          <Input
            id="selling_price"
            type="number"
            step="any"
            {...register("selling_price", { valueAsNumber: true })}
          />
          {errors.selling_price && (
            <p className="text-sm text-destructive">
              {errors.selling_price.message}
            </p>
          )}
        </div>
      </div>

      {createCost.isError && (
        <p className="text-sm text-destructive">
          {getApiErrorMessage(createCost.error)}
        </p>
      )}

      <Button type="submit" disabled={createCost.isPending} className="w-fit">
        {createCost.isPending ? "Menambahkan..." : "Tambah Biaya"}
      </Button>
    </form>
  );
}
