"use client";

import { RemoteSearchSelect } from "@/components/RemoteSearchSelect";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCustomerOptions } from "@/features/customer/hooks/useCustomerOptions";
import type { Customer } from "@/features/customer/types";

import { jobStatusOptions } from "../schema";
import type { JobStatus } from "../types";

interface JobFiltersProps {
  status: JobStatus | "all";
  onStatusChange: (value: JobStatus | "all") => void;
  customer: Customer | null;
  onCustomerChange: (value: Customer | null) => void;
}

export function JobFilters({
  status,
  onStatusChange,
  customer,
  onCustomerChange,
}: JobFiltersProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <RemoteSearchSelect<Customer>
        value={customer}
        onValueChange={onCustomerChange}
        useOptions={useCustomerOptions}
        getOptionLabel={(c) => c.name}
        getOptionId={(c) => c.id}
        placeholder="Filter customer..."
        aria-label="Filter customer"
      />
      <Select
        value={status}
        onValueChange={(value) => onStatusChange(value as JobStatus | "all")}
      >
        <SelectTrigger className="sm:w-48" aria-label="Filter status">
          <SelectValue placeholder="Semua Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Semua Status</SelectItem>
          {jobStatusOptions.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
