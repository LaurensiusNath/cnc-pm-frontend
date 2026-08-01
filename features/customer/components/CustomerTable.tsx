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

import { customerTypeOptions } from "../schema";
import type { Customer } from "../types";

function typeLabel(type: Customer["customer_type"]) {
  return customerTypeOptions.find((opt) => opt.value === type)?.label ?? type;
}

interface CustomerTableProps {
  customers: Customer[];
}

export function CustomerTable({ customers }: CustomerTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nama</TableHead>
          <TableHead>Tipe</TableHead>
          <TableHead>Kontak</TableHead>
          <TableHead>Perusahaan</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {customers.map((customer) => (
          <TableRow key={customer.id}>
            <TableCell>
              <Link
                href={`/customers/${customer.id}`}
                className="font-medium hover:underline"
              >
                {customer.name}
              </Link>
            </TableCell>
            <TableCell>
              <Badge variant="outline">
                {typeLabel(customer.customer_type)}
              </Badge>
            </TableCell>
            <TableCell className="text-muted-foreground">
              {customer.phone ?? customer.email ?? "-"}
            </TableCell>
            <TableCell className="text-muted-foreground">
              {customer.company_name ?? "-"}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
