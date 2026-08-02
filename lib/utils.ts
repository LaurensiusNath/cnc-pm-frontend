import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value)
}

// Several backend date fields (Invoice.due_date, Job.scheduled_date/
// completed_date) are plain Go *time.Time, so encoding/json always
// serializes full RFC3339 ("2026-08-15T00:00:00Z") even when the time
// component is zero - slicing the first 10 chars is safe for both that
// shape and a bare "2026-08-15", so it doesn't assume either wire format.
export function formatDateOnly(value: string | null | undefined) {
  if (!value) return null
  return value.slice(0, 10)
}
