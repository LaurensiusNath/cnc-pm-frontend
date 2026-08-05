// Period is dateonly.Date on the backend since day one (this endpoint was
// built AFTER the RFC3339-vs-date-only fix, unlike Job/Invoice's date
// fields) - wire format is always plain "YYYY-MM-DD", no formatDateOnly()
// slicing needed for this field specifically.
export interface Period {
  from: string;
  to: string;
}

export interface PPNInvoiceRef {
  id: string;
  invoice_number: string;
  job_code: string;
  customer_name: string;
  subtotal: number;
  tax_amount: number;
  nomor_faktur_pajak: string | null;
}

export interface PPNSummary {
  total_ppn_keluaran: number;
  invoices: PPNInvoiceRef[];
}

export interface PPh23PaymentRef {
  id: string;
  invoice_id: string;
  invoice_number: string;
  customer_name: string;
  // Raw string from customers.customer_type ("badan_usaha"/"perorangan"),
  // not the CustomerType union from features/customer/types - taxreport
  // deliberately doesn't import the customer package on the backend
  // either, see internal/taxreport/domain.go.
  customer_type: string;
  // Unlike Period above, PaymentDate is a plain Go time.Time on the
  // backend (NOT dateonly.Date) - full RFC3339 wire format, needs
  // formatDateOnly() when displaying. Verified directly against
  // internal/taxreport/domain.go, not assumed uniform with Period.
  payment_date: string;
  pph23_share_estimasi: number;
  bukti_potong_pph23_ref: string | null;
}

export interface PPh23Summary {
  total_estimasi: number;
  payments: PPh23PaymentRef[];
}

export interface TaxSummary {
  period: Period;
  ppn: PPNSummary;
  pph23: PPh23Summary;
}

export interface TaxSummaryParams {
  period_from?: string;
  period_to?: string;
}
