import { z } from "zod";

import type { InvoiceStatus } from "./types";

export const invoiceStatusOptions = [
  { value: "draft", label: "Draft" },
  { value: "sent", label: "Terkirim" },
  { value: "paid", label: "Lunas" },
  { value: "overdue", label: "Jatuh Tempo" },
  { value: "cancelled", label: "Dibatalkan" },
] as const;

// Badge color per status - purely visual, doesn't affect which statuses are
// clickable (see getInvoiceStatusActions below for that).
export const invoiceStatusBadgeClassName: Record<InvoiceStatus, string> = {
  draft: "border-border text-muted-foreground",
  sent: "border-sky-500 text-sky-600 dark:border-sky-400 dark:text-sky-400",
  paid: "border-emerald-500 text-emerald-600 dark:border-emerald-400 dark:text-emerald-400",
  overdue: "border-red-500 text-red-600 dark:border-red-400 dark:text-red-400",
  cancelled: "border-neutral-400 text-neutral-500 line-through",
};

export const paymentMethodOptions = [
  { value: "transfer", label: "Transfer" },
  { value: "cash", label: "Tunai" },
  { value: "other", label: "Lainnya" },
] as const;

// Backend PATCH /invoices/{id}/status accepts any of the 5 enum values with
// no transition/state-machine enforcement (verified live against
// cnc-pm-backend, see docs/api-contract.md Catatan Desain #7) - this
// restriction is a deliberate FRONTEND-ONLY decision, not a mirror of a
// backend rule. `paid` must only ever be reached by the backend deriving it
// from SUM(payments) >= total (see POST /invoices/{id}/payments), and
// `overdue` only by ReminderService's auto-transition ticker - allowing a
// manual override to either from this UI would let someone mark a debt
// "lunas" with no payment on record, which is a real financial-reporting
// risk, not just a workflow metadata slip like Job's status has.
// `cancelled` is a legitimate manual action from any non-terminal status.
//
// Do NOT loosen this to "just show all 5 like Job's status form" without
// re-reading this comment and the Catatan Desain #7 reasoning first - the
// two modules look similar but the risk category is deliberately different.
export function getInvoiceStatusActions(
  currentStatus: InvoiceStatus,
): Extract<InvoiceStatus, "sent" | "cancelled">[] {
  switch (currentStatus) {
    case "draft":
      return ["sent", "cancelled"];
    case "sent":
    case "overdue":
      return ["cancelled"];
    case "paid":
    case "cancelled":
      return [];
  }
}

const optionalText = z
  .string()
  .trim()
  .optional()
  .transform((v) => (v ? v : undefined));

export const generateInvoiceSchema = z.object({
  // Left undefined -> omitted from the request body -> backend falls back
  // to company_settings.default_tax_percentage. Never pre-fill a guessed
  // number here, that's the backend's default to own.
  tax_percentage: z.number().nonnegative("Persentase pajak tidak boleh negatif").optional(),
  due_date: optionalText,
});

export type GenerateInvoiceFormValues = z.input<typeof generateInvoiceSchema>;
export type GenerateInvoiceInput = z.output<typeof generateInvoiceSchema>;

export const fakturPajakSchema = z.object({
  nomor_faktur_pajak: z
    .string()
    .trim()
    .min(1, "Nomor faktur pajak wajib diisi"),
});

export type FakturPajakInput = z.infer<typeof fakturPajakSchema>;

// Only ever submits "sent" or "cancelled" (see getInvoiceStatusActions) -
// the schema itself is scoped to those two values rather than the full
// 5-value enum, so a bug that accidentally renders a paid/overdue option
// would fail validation here too, not just be a UI oversight.
export const updateInvoiceStatusSchema = z.object({
  status: z.enum(["sent", "cancelled"], { message: "Status wajib dipilih" }),
});

export type UpdateInvoiceStatusInput = z.infer<typeof updateInvoiceStatusSchema>;

export const addPaymentSchema = z.object({
  amount: z
    .number({ error: "Jumlah wajib diisi" })
    .positive("Jumlah harus lebih dari 0"),
  payment_method: z.enum(["transfer", "cash", "other"], {
    message: "Metode pembayaran wajib dipilih",
  }),
  bukti_potong_pph23_ref: optionalText,
  notes: optionalText,
});

export type AddPaymentFormValues = z.input<typeof addPaymentSchema>;
export type AddPaymentInput = z.output<typeof addPaymentSchema>;

// PATCH /invoices/{id}/payments/{payment_id}/bukti-potong-pph23 - lets an
// owner/admin fill in bukti_potong_pph23_ref AFTER a payment already
// exists (distinct from addPaymentSchema's optional field above, which
// only covers setting it at payment-creation time). Backend PR #23
// (merged) - shape confirmed via a live end-to-end request against the
// running endpoint, not just read from source.
export const updatePaymentBuktiPotongSchema = z.object({
  bukti_potong_pph23_ref: z
    .string()
    .trim()
    .min(1, "Nomor bukti potong wajib diisi"),
});

export type UpdatePaymentBuktiPotongInput = z.infer<
  typeof updatePaymentBuktiPotongSchema
>;
