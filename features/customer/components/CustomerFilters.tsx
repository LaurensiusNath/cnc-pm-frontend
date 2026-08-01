"use client";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { customerTypeOptions } from "../schema";
import type { CustomerType } from "../types";

interface CustomerFiltersProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  customerType: CustomerType | "all";
  onCustomerTypeChange: (value: CustomerType | "all") => void;
}

export function CustomerFilters({
  searchValue,
  onSearchChange,
  customerType,
  onCustomerTypeChange,
}: CustomerFiltersProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <Input
        placeholder="Cari nama, email, atau perusahaan..."
        value={searchValue}
        onChange={(e) => onSearchChange(e.target.value)}
        className="sm:max-w-xs"
        aria-label="Cari customer"
      />
      <Select
        value={customerType}
        onValueChange={(value) =>
          onCustomerTypeChange(value as CustomerType | "all")
        }
      >
        <SelectTrigger className="sm:w-48" aria-label="Filter tipe customer">
          <SelectValue placeholder="Semua Tipe" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Semua Tipe</SelectItem>
          {customerTypeOptions.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
