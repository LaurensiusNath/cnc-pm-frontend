"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getApiErrorMessage } from "@/lib/axios";

import { useGenerateInvoice } from "../hooks/useGenerateInvoice";
import {
  generateInvoiceSchema,
  type GenerateInvoiceFormValues,
  type GenerateInvoiceInput,
} from "../schema";

interface GenerateInvoicePageProps {
  jobId: string;
}

export function GenerateInvoicePage({ jobId }: GenerateInvoicePageProps) {
  const router = useRouter();
  const generateInvoice = useGenerateInvoice(jobId);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<GenerateInvoiceFormValues, unknown, GenerateInvoiceInput>({
    resolver: zodResolver(generateInvoiceSchema),
    defaultValues: { tax_percentage: undefined, due_date: "" },
  });

  function onSubmit(values: GenerateInvoiceInput) {
    generateInvoice.mutate(values, {
      onSuccess: (invoice) => router.push(`/invoices/${invoice.id}`),
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold">Generate Invoice</h1>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex max-w-lg flex-col gap-4"
      >
        <div className="flex flex-col gap-2">
          <Label htmlFor="tax_percentage">Persentase Pajak (opsional)</Label>
          <Input
            id="tax_percentage"
            type="number"
            step="any"
            placeholder="Kosongkan untuk pakai default company settings"
            {...register("tax_percentage", {
              // Blank must stay undefined (omitted from the request body),
              // never coerced to NaN or a guessed 0/11 - that's the
              // backend's default_tax_percentage to own, not ours to guess.
              setValueAs: (v) => (v === "" ? undefined : Number(v)),
            })}
          />
          {errors.tax_percentage && (
            <p className="text-sm text-destructive">
              {errors.tax_percentage.message}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="due_date">Jatuh Tempo (opsional)</Label>
          <Input id="due_date" type="date" {...register("due_date")} />
        </div>

        {generateInvoice.isError && (
          <p className="text-sm text-destructive">
            {getApiErrorMessage(generateInvoice.error)}
          </p>
        )}

        <Button type="submit" disabled={generateInvoice.isPending}>
          {generateInvoice.isPending ? "Membuat..." : "Generate Invoice"}
        </Button>
      </form>
    </div>
  );
}
