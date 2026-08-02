export type InvoiceStatus = "draft" | "sent" | "paid" | "overdue" | "cancelled";

export type PaymentMethod = "transfer" | "cash" | "other";

// Money fields are `number`, not `string` - same as Job/JobCost, confirmed
// via decimal.MarshalJSONWithoutQuotes = true (cmd/api/main.go). Never do
// arithmetic on these in the frontend - display as-is from the backend.
export interface Invoice {
  id: string;
  invoice_number: string;
  nomor_faktur_pajak: string | null;
  job_id: string;
  subtotal: number;
  tax_percentage: number;
  tax_amount: number;
  total: number;
  dpp_pph23: number;
  pph23_rate: number;
  pph23_estimated_amount: number;
  expected_receivable: number;
  status: InvoiceStatus;
  // Wire format is full RFC3339 ("2026-08-15T00:00:00Z"), not a bare date -
  // Invoice.DueDate is a plain Go *time.Time, encoding/json always includes
  // the time component regardless of it being zero. Format with
  // formatDateOnly() from lib/utils when displaying, don't assume the
  // api-contract.md example's bare "2026-08-15" is the literal wire shape.
  due_date: string | null;
  created_at: string;
  updated_at: string;
}

// GET /invoices (list) response shape - Invoice plus two flat fields from a
// JOIN to jobs+customers, so the list table doesn't need a request per row
// to show a human-readable job/customer identity. GET /invoices/{id}
// (detail) does NOT get these fields, stays a plain Invoice.
export interface InvoiceListItem extends Invoice {
  job_code: string;
  customer_name: string;
}

export interface InvoiceListMeta {
  page: number;
  total: number;
}

export interface InvoiceListParams {
  page?: number;
  limit?: number;
  status?: InvoiceStatus;
}

export interface Payment {
  id: string;
  invoice_id: string;
  amount: number;
  payment_method: PaymentMethod;
  bukti_potong_pph23_ref: string | null;
  notes: string | null;
  created_at: string;
}
