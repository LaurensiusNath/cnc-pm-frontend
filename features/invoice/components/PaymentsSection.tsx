"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Decimal from "decimal.js";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getApiErrorMessage } from "@/lib/axios";
import { formatCurrency, formatDateOnly } from "@/lib/utils";

import { useCreatePayment } from "../hooks/useCreatePayment";
import { useInvoicePayments } from "../hooks/useInvoicePayments";
import {
  addPaymentSchema,
  paymentMethodOptions,
  type AddPaymentFormValues,
  type AddPaymentInput,
} from "../schema";
import type { Invoice } from "../types";

function paymentMethodLabel(value: string) {
  return paymentMethodOptions.find((opt) => opt.value === value)?.label ?? value;
}

interface PaymentsSectionProps {
  invoice: Invoice;
}

export function PaymentsSection({ invoice }: PaymentsSectionProps) {
  const { data: payments, isLoading } = useInvoicePayments(invoice.id);
  const createPayment = useCreatePayment(invoice.id);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    reset,
    formState: { errors },
  } = useForm<AddPaymentFormValues, unknown, AddPaymentInput>({
    resolver: zodResolver(addPaymentSchema),
    defaultValues: { payment_method: "transfer" },
  });

  const paymentMethod = useWatch({ control, name: "payment_method" });

  function onSubmit(values: AddPaymentInput) {
    createPayment.mutate(values, {
      onSuccess: () => reset({ payment_method: "transfer" }),
    });
  }

  // UI-only preview, never sent to the backend - decimal.js used instead
  // of plain `-`/`+` on JS numbers for the exact reason money is never
  // hand-computed client-side elsewhere in this app (see lib/utils'
  // formatCurrency comment / CLAUDE.md "Pola & Gotcha").
  const remaining = payments
    ? Decimal.sub(
        invoice.total,
        payments.reduce((sum, p) => sum.plus(p.amount), new Decimal(0)),
      )
    : null;

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-lg font-semibold">Pembayaran</h2>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Memuat...</p>
      ) : payments && payments.length > 0 ? (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tanggal</TableHead>
                <TableHead>Jumlah</TableHead>
                <TableHead>Metode</TableHead>
                <TableHead>Bukti Potong PPh 23</TableHead>
                <TableHead>Catatan</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell className="text-muted-foreground">
                    {formatDateOnly(payment.created_at)}
                  </TableCell>
                  <TableCell>{formatCurrency(payment.amount)}</TableCell>
                  <TableCell>
                    {paymentMethodLabel(payment.payment_method)}
                  </TableCell>
                  <TableCell>
                    {payment.bukti_potong_pph23_ref ?? "-"}
                  </TableCell>
                  <TableCell>{payment.notes ?? "-"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {remaining && (
            <p className="text-sm">
              Sisa tagihan (estimasi):{" "}
              <strong>
                {formatCurrency(
                  remaining.isNegative() ? 0 : remaining.toNumber(),
                )}
              </strong>
            </p>
          )}
        </>
      ) : (
        <p className="text-sm text-muted-foreground">Belum ada pembayaran.</p>
      )}

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-3 rounded-md border p-3"
      >
        <h3 className="text-sm font-semibold">Tambah Pembayaran</h3>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="amount">Jumlah *</Label>
            <Input
              id="amount"
              type="number"
              step="any"
              {...register("amount", { valueAsNumber: true })}
            />
            {errors.amount && (
              <p className="text-sm text-destructive">{errors.amount.message}</p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="payment_method">Metode *</Label>
            <Select
              value={paymentMethod}
              onValueChange={(value) =>
                setValue(
                  "payment_method",
                  value as AddPaymentFormValues["payment_method"],
                  { shouldValidate: true },
                )
              }
            >
              <SelectTrigger id="payment_method" aria-label="Metode Pembayaran">
                <SelectValue placeholder="Pilih metode">
                  {(value: string | null) =>
                    paymentMethodOptions.find((opt) => opt.value === value)
                      ?.label ?? value
                  }
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {paymentMethodOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.payment_method && (
              <p className="text-sm text-destructive">
                {errors.payment_method.message}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="bukti_potong_pph23_ref">
              Bukti Potong PPh 23 (opsional)
            </Label>
            <Input
              id="bukti_potong_pph23_ref"
              {...register("bukti_potong_pph23_ref")}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="notes">Catatan (opsional)</Label>
            <Input id="notes" {...register("notes")} />
          </div>
        </div>

        {createPayment.isError && (
          <p className="text-sm text-destructive">
            {getApiErrorMessage(createPayment.error)}
          </p>
        )}

        <Button type="submit" disabled={createPayment.isPending} className="w-fit">
          {createPayment.isPending ? "Menyimpan..." : "Tambah Pembayaran"}
        </Button>
      </form>
    </div>
  );
}
