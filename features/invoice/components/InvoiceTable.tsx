import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency, formatDateOnly } from "@/lib/utils";

import { invoiceStatusBadgeClassName, invoiceStatusOptions } from "../schema";
import type { InvoiceListItem } from "../types";

function statusLabel(status: InvoiceListItem["status"]) {
  return invoiceStatusOptions.find((opt) => opt.value === status)?.label ?? status;
}

interface InvoiceTableProps {
  invoices: InvoiceListItem[];
}

export function InvoiceTable({ invoices }: InvoiceTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Kode Job</TableHead>
          <TableHead>Customer</TableHead>
          <TableHead>No. Invoice</TableHead>
          <TableHead>Total</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Jatuh Tempo</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {invoices.map((invoice) => (
          <TableRow key={invoice.id}>
            <TableCell className="text-muted-foreground">
              {invoice.job_code}
            </TableCell>
            <TableCell>{invoice.customer_name}</TableCell>
            <TableCell>
              <Link
                href={`/invoices/${invoice.id}`}
                className="font-medium hover:underline"
              >
                {invoice.invoice_number}
              </Link>
            </TableCell>
            <TableCell>{formatCurrency(invoice.total)}</TableCell>
            <TableCell>
              <Badge
                variant="outline"
                className={invoiceStatusBadgeClassName[invoice.status]}
              >
                {statusLabel(invoice.status)}
              </Badge>
            </TableCell>
            <TableCell className="text-muted-foreground">
              {formatDateOnly(invoice.due_date) ?? "-"}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
