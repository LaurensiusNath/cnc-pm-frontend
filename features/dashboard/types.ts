export type InvoiceStatus = "draft" | "sent" | "paid" | "overdue" | "cancelled";

export interface Period {
  // Wire format is full RFC3339 ("2026-08-01T00:00:00Z"), same pattern as
  // Invoice.due_date - use formatDateOnly() from lib/utils when displaying.
  from: string;
  to: string;
}

export interface InvoiceStatusAmount {
  count: number;
  total: number;
}

export interface FinancialByStatus {
  draft: InvoiceStatusAmount;
  sent: InvoiceStatusAmount;
  paid: InvoiceStatusAmount;
  overdue: InvoiceStatusAmount;
  cancelled: InvoiceStatusAmount;
}

// Money fields are `number`, not `string` - same as every other module,
// confirmed via decimal.MarshalJSONWithoutQuotes = true. Never do
// arithmetic on these in the frontend - display as-is from the backend,
// INCLUDING outstanding_total when negative (see FinancialSummaryCards -
// that's a deliberate diagnostic signal from the backend, not a display
// bug to "fix" by clamping).
export interface FinancialSummary {
  period: Period;
  invoiced_total: number;
  received_total: number;
  outstanding_total: number;
  by_status: FinancialByStatus;
}

export interface JobsByStatus {
  requested: number;
  scheduled: number;
  in_progress: number;
  completed: number;
  cancelled: number;
}

// job_code/customer_name flat via JOIN, same pattern as InvoiceListItem.
export interface ScheduledJobRef {
  id: string;
  job_code: string;
  customer_name: string;
  scheduled_date: string | null;
}

export interface JobsSummary {
  by_status: JobsByStatus;
  upcoming_7_days: ScheduledJobRef[];
  overdue_scheduled: ScheduledJobRef[];
}

export interface DashboardSummary {
  financial: FinancialSummary;
  jobs: JobsSummary;
}

// Both optional - omitted entirely (not sent as empty strings) means the
// backend defaults to the current calendar month (resolvePeriod). The
// frontend never computes "current month" itself - always displays
// financial.period.from/to echoed back in the response instead.
export interface DashboardSummaryParams {
  period_from?: string;
  period_to?: string;
}
