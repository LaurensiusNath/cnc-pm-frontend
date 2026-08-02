"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { invoiceStatusOptions } from "../schema";
import type { InvoiceStatus } from "../types";

// Select.Value renders the raw value by default (Base UI docs) - without
// this, the trigger would show "cancelled"/"all" literally.
function statusLabel(value: string) {
  if (value === "all") return "Semua Status";
  return invoiceStatusOptions.find((opt) => opt.value === value)?.label ?? value;
}

interface InvoiceFiltersProps {
  status: InvoiceStatus | "all";
  onStatusChange: (value: InvoiceStatus | "all") => void;
}

// Only a status filter - GET /invoices only supports page/limit/status
// query params on the backend (no search), so no search box is offered
// here that the API couldn't actually honor.
export function InvoiceFilters({ status, onStatusChange }: InvoiceFiltersProps) {
  return (
    <Select
      value={status}
      onValueChange={(value) => onStatusChange(value as InvoiceStatus | "all")}
    >
      <SelectTrigger className="sm:w-48" aria-label="Filter status">
        <SelectValue placeholder="Semua Status">
          {(value: string | null) => (value ? statusLabel(value) : "Semua Status")}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">Semua Status</SelectItem>
        {invoiceStatusOptions.map((opt) => (
          <SelectItem key={opt.value} value={opt.value}>
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
