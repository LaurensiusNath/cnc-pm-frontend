import { api } from "@/lib/axios";
import type { ApiSuccess } from "@/types/api";

import type { CreateCustomerInput, UpdateCustomerInput } from "../schema";
import type {
  Customer,
  CustomerDetail,
  CustomerListMeta,
  CustomerListParams,
  Machine,
} from "../types";

export const customerService = {
  list: async (
    params: CustomerListParams,
  ): Promise<{ customers: Customer[]; meta: CustomerListMeta }> => {
    const { data } = await api.get<ApiSuccess<Customer[], CustomerListMeta>>(
      "/v1/customers",
      { params },
    );
    // meta is optional on ApiSuccess in general, but the backend always
    // includes it for this list endpoint (see docs/api-contract.md).
    return { customers: data.data, meta: data.meta! };
  },

  getById: async (id: string): Promise<CustomerDetail> => {
    const { data } = await api.get<ApiSuccess<CustomerDetail>>(
      `/v1/customers/${id}`,
    );
    return data.data;
  },

  create: async (input: CreateCustomerInput): Promise<Customer> => {
    const { data } = await api.post<ApiSuccess<Customer>>(
      "/v1/customers",
      input,
    );
    return data.data;
  },

  update: async (
    id: string,
    input: UpdateCustomerInput,
  ): Promise<Customer> => {
    const { data } = await api.put<ApiSuccess<Customer>>(
      `/v1/customers/${id}`,
      input,
    );
    return data.data;
  },

  remove: async (id: string): Promise<void> => {
    await api.delete(`/v1/customers/${id}`);
  },

  // Standalone endpoint (not the nested `machines` on customer detail) -
  // used for the create-job cascading select, which only needs machines
  // for one customer without fetching that customer's full detail.
  listMachines: async (customerId: string): Promise<Machine[]> => {
    const { data } = await api.get<ApiSuccess<Machine[]>>(
      `/v1/customers/${customerId}/machines`,
    );
    return data.data;
  },
};
