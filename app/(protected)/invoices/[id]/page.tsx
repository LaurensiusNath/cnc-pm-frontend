"use client";

import { useParams } from "next/navigation";

import { InvoiceDetailPage } from "@/features/invoice/components/InvoiceDetailPage";

export default function InvoiceDetailRoute() {
  const params = useParams<{ id: string }>();
  return <InvoiceDetailPage invoiceId={params.id} />;
}
