import { api } from "@/lib/axios";
import type { ApiSuccess } from "@/types/api";

import type {
  AddPaymentInput,
  FakturPajakInput,
  GenerateInvoiceInput,
  UpdateInvoiceStatusInput,
  UpdatePaymentBuktiPotongInput,
} from "../schema";
import type {
  Invoice,
  InvoiceListItem,
  InvoiceListMeta,
  InvoiceListParams,
  Payment,
} from "../types";

export const invoiceService = {
  // POST /jobs/{id}/invoice - invoice is generated FROM a job, hence the
  // nested URL, but the response is an Invoice, so this lives in
  // invoiceService (not jobService) same as getByJobId below.
  createFromJob: async (
    jobId: string,
    input: GenerateInvoiceInput,
  ): Promise<Invoice> => {
    const { data } = await api.post<ApiSuccess<Invoice>>(
      `/v1/jobs/${jobId}/invoice`,
      input,
    );
    return data.data;
  },

  // GET /jobs/{id}/invoice - 404 is a valid "no invoice yet" state, not an
  // error; callers should read isError from the query rather than treat it
  // as a network failure to toast.
  getByJobId: async (jobId: string): Promise<Invoice> => {
    const { data } = await api.get<ApiSuccess<Invoice>>(
      `/v1/jobs/${jobId}/invoice`,
    );
    return data.data;
  },

  list: async (
    params: InvoiceListParams,
  ): Promise<{ invoices: InvoiceListItem[]; meta: InvoiceListMeta }> => {
    const { data } = await api.get<ApiSuccess<InvoiceListItem[], InvoiceListMeta>>(
      "/v1/invoices",
      { params },
    );
    return { invoices: data.data, meta: data.meta! };
  },

  getById: async (id: string): Promise<Invoice> => {
    const { data } = await api.get<ApiSuccess<Invoice>>(`/v1/invoices/${id}`);
    return data.data;
  },

  updateFakturPajak: async (
    id: string,
    input: FakturPajakInput,
  ): Promise<Invoice> => {
    const { data } = await api.patch<ApiSuccess<Invoice>>(
      `/v1/invoices/${id}/faktur-pajak`,
      input,
    );
    return data.data;
  },

  updateStatus: async (
    id: string,
    input: UpdateInvoiceStatusInput,
  ): Promise<Invoice> => {
    const { data } = await api.patch<ApiSuccess<Invoice>>(
      `/v1/invoices/${id}/status`,
      input,
    );
    return data.data;
  },

  listPayments: async (invoiceId: string): Promise<Payment[]> => {
    const { data } = await api.get<ApiSuccess<Payment[]>>(
      `/v1/invoices/${invoiceId}/payments`,
    );
    return data.data;
  },

  createPayment: async (
    invoiceId: string,
    input: AddPaymentInput,
  ): Promise<Payment> => {
    const { data } = await api.post<ApiSuccess<Payment>>(
      `/v1/invoices/${invoiceId}/payments`,
      input,
    );
    return data.data;
  },

  // PATCH /invoices/{id}/payments/{payment_id}/bukti-potong-pph23 - backend
  // PR #23 (merged), live-verified end to end. Owner/admin only.
  updatePaymentBuktiPotong: async (
    invoiceId: string,
    paymentId: string,
    input: UpdatePaymentBuktiPotongInput,
  ): Promise<Payment> => {
    const { data } = await api.patch<ApiSuccess<Payment>>(
      `/v1/invoices/${invoiceId}/payments/${paymentId}/bukti-potong-pph23`,
      input,
    );
    return data.data;
  },
};
