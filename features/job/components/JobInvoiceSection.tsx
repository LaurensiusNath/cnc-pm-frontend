import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { useJobInvoice } from "@/features/invoice/hooks/useJobInvoice";
import { cn } from "@/lib/utils";

import type { JobStatus } from "../types";

interface JobInvoiceSectionProps {
  jobId: string;
  jobStatus: JobStatus;
}

// Job must be "completed" before an invoice can exist at all (backend
// rejects POST /jobs/{id}/invoice otherwise, see ErrJobNotCompleted) - no
// point showing any invoice-related affordance before that.
export function JobInvoiceSection({ jobId, jobStatus }: JobInvoiceSectionProps) {
  const { data: invoice, isLoading, isSuccess, isError } = useJobInvoice(jobId);

  if (jobStatus !== "completed") return null;
  // Still resolving GET /jobs/{id}/invoice - avoid flashing "Generate
  // Invoice" and then swapping to "Lihat Invoice" a moment later.
  if (isLoading) return null;

  if (isSuccess) {
    return (
      <Link href={`/invoices/${invoice.id}`} className={cn(buttonVariants({ variant: "outline" }))}>
        Lihat Invoice
      </Link>
    );
  }

  // 404 from GET /jobs/{id}/invoice is the expected "belum di-invoice"
  // state here, not an error to surface - see useJobInvoice's comment.
  if (isError) {
    return (
      <Link href={`/jobs/${jobId}/invoice/new`} className={cn(buttonVariants())}>
        Generate Invoice
      </Link>
    );
  }

  return null;
}
