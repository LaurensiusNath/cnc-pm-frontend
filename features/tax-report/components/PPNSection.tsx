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
import { fakturPajakSchema, type FakturPajakInput } from "@/features/invoice/schema";
import { getApiErrorMessage } from "@/lib/axios";
import { formatCurrency } from "@/lib/utils";

import { useUpdateFakturPajakForReport } from "../hooks/useUpdateFakturPajakForReport";
import type { PPNInvoiceRef, PPNSummary } from "../types";

interface PPNSectionProps {
  ppn: PPNSummary;
}

export function PPNSection({ ppn }: PPNSectionProps) {
  const [editing, setEditing] = useState<PPNInvoiceRef | null>(null);
  const updateFakturPajak = useUpdateFakturPajakForReport();

  function handleSubmit(values: FakturPajakInput) {
    if (!editing) return;
    updateFakturPajak.mutate(
      { invoiceId: editing.id, input: values },
      { onSuccess: () => setEditing(null) },
    );
  }

  return (
    <div className="flex flex-col gap-2 print:break-inside-avoid">
      <h2 className="text-lg font-semibold">PPN Keluaran</h2>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>No. Invoice</TableHead>
            <TableHead>Kode Job</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Subtotal</TableHead>
            <TableHead>PPN</TableHead>
            <TableHead>No. Faktur Pajak</TableHead>
            <TableHead className="print:hidden" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {ppn.invoices.map((inv) => (
            <TableRow key={inv.id}>
              <TableCell>{inv.invoice_number}</TableCell>
              <TableCell className="text-muted-foreground">{inv.job_code}</TableCell>
              <TableCell>{inv.customer_name}</TableCell>
              <TableCell>{formatCurrency(inv.subtotal)}</TableCell>
              <TableCell>{formatCurrency(inv.tax_amount)}</TableCell>
              <TableCell>
                {inv.nomor_faktur_pajak ?? (
                  <span className="text-muted-foreground">Belum diisi</span>
                )}
              </TableCell>
              <TableCell className="print:hidden">
                <Button variant="ghost" size="sm" onClick={() => setEditing(inv)}>
                  Isi Faktur Pajak
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <p className="text-sm font-semibold">
        Total PPN Keluaran: {formatCurrency(ppn.total_ppn_keluaran)}
      </p>

      {editing && (
        <EditFieldPanel<FakturPajakInput>
          key={editing.id}
          open
          onOpenChange={(open) => !open && setEditing(null)}
          title={`Isi Faktur Pajak — ${editing.invoice_number}`}
          schema={fakturPajakSchema}
          defaultValues={{ nomor_faktur_pajak: editing.nomor_faktur_pajak ?? "" }}
          fields={[{ name: "nomor_faktur_pajak", label: "Nomor Faktur Pajak" }]}
          onSubmit={handleSubmit}
          isPending={updateFakturPajak.isPending}
          errorMessage={
            updateFakturPajak.isError
              ? getApiErrorMessage(updateFakturPajak.error)
              : null
          }
        />
      )}
    </div>
  );
}
