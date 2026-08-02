import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { useJob } from "@/features/job/hooks/useJob";
import { cn, formatCurrency, formatDateOnly } from "@/lib/utils";

import { invoiceStatusBadgeClassName, invoiceStatusOptions } from "../schema";
import type { Invoice } from "../types";

function statusLabel(status: Invoice["status"]) {
  return invoiceStatusOptions.find((opt) => opt.value === status)?.label ?? status;
}

interface InvoiceInfoSectionProps {
  invoice: Invoice;
}

export function InvoiceInfoSection({ invoice }: InvoiceInfoSectionProps) {
  // GET /invoices/{id} doesn't include job_code (only the list's
  // InvoiceListItem does) - fetching the job itself so the link back can
  // show a human label instead of the raw job_id UUID.
  const { data: job } = useJob(invoice.job_id);

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-semibold">{invoice.invoice_number}</h1>
        <p className="text-sm text-muted-foreground">
          Job:{" "}
          {job ? (
            <Link href={`/jobs/${job.id}`} className="hover:underline">
              {job.job_code}
            </Link>
          ) : (
            "-"
          )}
        </p>
        <Badge
          variant="outline"
          className={cn("mt-1", invoiceStatusBadgeClassName[invoice.status])}
        >
          {statusLabel(invoice.status)}
        </Badge>
      </div>

      {/* All money values shown exactly as returned by the backend, never
          recomputed client-side - see lib/utils' formatCurrency comment
          and CLAUDE.md's "Pola & Gotcha" section. */}
      <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <div>
          <dt className="text-sm text-muted-foreground">Subtotal</dt>
          <dd>{formatCurrency(invoice.subtotal)}</dd>
        </div>
        <div>
          <dt className="text-sm text-muted-foreground">
            PPN ({invoice.tax_percentage}%)
          </dt>
          <dd>{formatCurrency(invoice.tax_amount)}</dd>
        </div>
        <div>
          <dt className="text-sm text-muted-foreground">Total</dt>
          <dd className="font-semibold">{formatCurrency(invoice.total)}</dd>
        </div>
        <div>
          <dt className="text-sm text-muted-foreground">DPP PPh 23</dt>
          <dd>{formatCurrency(invoice.dpp_pph23)}</dd>
        </div>
        <div>
          <dt className="text-sm text-muted-foreground">
            PPh 23 ({invoice.pph23_rate}%)
          </dt>
          <dd>{formatCurrency(invoice.pph23_estimated_amount)}</dd>
        </div>
        <div>
          <dt className="text-sm text-muted-foreground">Estimasi Diterima</dt>
          <dd className="font-semibold">
            {formatCurrency(invoice.expected_receivable)}
          </dd>
        </div>
        <div>
          <dt className="text-sm text-muted-foreground">Jatuh Tempo</dt>
          <dd>{formatDateOnly(invoice.due_date) ?? "-"}</dd>
        </div>
      </dl>
    </div>
  );
}
