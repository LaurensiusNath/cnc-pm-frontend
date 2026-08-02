"use client";

import { useParams } from "next/navigation";

import { GenerateInvoicePage } from "@/features/invoice/components/GenerateInvoicePage";

export default function NewInvoiceRoute() {
  const params = useParams<{ id: string }>();
  return <GenerateInvoicePage jobId={params.id} />;
}
