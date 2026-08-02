"use client";

import Link from "next/link";

import { Skeleton } from "@/components/ui/skeleton";

import { useInvoice } from "../hooks/useInvoice";
import { FakturPajakSection } from "./FakturPajakSection";
import { InvoiceInfoSection } from "./InvoiceInfoSection";
import { InvoiceStatusActions } from "./InvoiceStatusActions";
import { PaymentsSection } from "./PaymentsSection";

interface InvoiceDetailPageProps {
  invoiceId: string;
}

export function InvoiceDetailPage({ invoiceId }: InvoiceDetailPageProps) {
  const { data: invoice, isLoading, isError } = useInvoice(invoiceId);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-6 w-full max-w-md" />
        ))}
      </div>
    );
  }

  if (isError || !invoice) {
    return (
      <p className="text-sm text-destructive">
        Gagal memuat data invoice. Coba muat ulang halaman.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <InvoiceInfoSection invoice={invoice} />

      <InvoiceStatusActions invoiceId={invoice.id} currentStatus={invoice.status} />

      <FakturPajakSection
        invoiceId={invoice.id}
        nomorFakturPajak={invoice.nomor_faktur_pajak}
      />

      <PaymentsSection invoice={invoice} />

      <Link
        href="/invoices"
        className="text-sm text-muted-foreground hover:underline"
      >
        Kembali ke daftar invoice
      </Link>
    </div>
  );
}
