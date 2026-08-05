"use client";

import { useState } from "react";

import { EditFieldPanel } from "@/components/EditFieldPanel";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  updatePaymentBuktiPotongSchema,
  type UpdatePaymentBuktiPotongInput,
} from "@/features/invoice/schema";
import { getApiErrorMessage } from "@/lib/axios";
import { formatCurrency, formatDateOnly } from "@/lib/utils";

import { useUpdatePaymentBuktiPotong } from "../hooks/useUpdatePaymentBuktiPotong";
import type { PPh23PaymentRef, PPh23Summary } from "../types";

interface PPh23SectionProps {
  pph23: PPh23Summary;
}

export function PPh23Section({ pph23 }: PPh23SectionProps) {
  const [editing, setEditing] = useState<PPh23PaymentRef | null>(null);
  const updateBuktiPotong = useUpdatePaymentBuktiPotong();

  // Rows with pph23_share_estimasi = 0 are hidden here (display decision
  // only), NOT filtered by customer_type - the backend deliberately
  // returns every payment in the period regardless of customer_type (see
  // internal/taxreport/domain.go), a perorangan customer's payment
  // legitimately has share 0 without a type check being the reason.
  const visiblePayments = pph23.payments.filter(
    (p) => p.pph23_share_estimasi !== 0,
  );

  function handleSubmit(values: UpdatePaymentBuktiPotongInput) {
    if (!editing) return;
    updateBuktiPotong.mutate(
      { invoiceId: editing.invoice_id, paymentId: editing.id, input: values },
      { onSuccess: () => setEditing(null) },
    );
  }

  return (
    <div className="flex flex-col gap-2 print:break-inside-avoid">
      <h2 className="text-lg font-semibold">PPh 23 Dipotong Customer</h2>
      {visiblePayments.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Tidak ada pembayaran dengan estimasi PPh 23 di periode ini.
        </p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tanggal Bayar</TableHead>
              <TableHead>No. Invoice</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Estimasi PPh 23</TableHead>
              <TableHead>Bukti Potong</TableHead>
              <TableHead className="print:hidden" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {visiblePayments.map((payment) => (
              <TableRow key={payment.id}>
                <TableCell className="text-muted-foreground">
                  {formatDateOnly(payment.payment_date)}
                </TableCell>
                <TableCell>{payment.invoice_number}</TableCell>
                <TableCell>{payment.customer_name}</TableCell>
                <TableCell>
                  {formatCurrency(payment.pph23_share_estimasi)}
                </TableCell>
                <TableCell>
                  {payment.bukti_potong_pph23_ref ?? (
                    <span className="text-muted-foreground">Belum diisi</span>
                  )}
                </TableCell>
                <TableCell className="print:hidden">
                  <Button variant="ghost" size="sm" onClick={() => setEditing(payment)}>
                    Isi Bukti Potong
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
      <p className="text-sm font-semibold">
        Total Estimasi PPh 23: {formatCurrency(pph23.total_estimasi)}
      </p>

      {editing && (
        <EditFieldPanel<UpdatePaymentBuktiPotongInput>
          key={editing.id}
          open
          onOpenChange={(open) => !open && setEditing(null)}
          title={`Isi Bukti Potong PPh 23 — ${editing.invoice_number}`}
          schema={updatePaymentBuktiPotongSchema}
          defaultValues={{
            bukti_potong_pph23_ref: editing.bukti_potong_pph23_ref ?? "",
          }}
          fields={[{ name: "bukti_potong_pph23_ref", label: "Nomor Bukti Potong" }]}
          onSubmit={handleSubmit}
          isPending={updateBuktiPotong.isPending}
          errorMessage={
            updateBuktiPotong.isError
              ? getApiErrorMessage(updateBuktiPotong.error)
              : null
          }
        />
      )}
    </div>
  );
}
