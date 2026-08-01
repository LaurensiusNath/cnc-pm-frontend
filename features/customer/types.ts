export type CustomerType = "badan_usaha" | "perorangan";

export interface Customer {
  id: string;
  name: string;
  customer_type: CustomerType;
  phone: string | null;
  email: string | null;
  address: string | null;
  company_name: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface Machine {
  id: string;
  customer_id: string;
  machine_name: string;
  machine_type: string | null;
  serial_number: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface CustomerDetail extends Customer {
  machines: Machine[];
}

export interface CustomerListMeta {
  page: number;
  total: number;
}

export interface CustomerListParams {
  page?: number;
  limit?: number;
  search?: string;
  customer_type?: CustomerType;
}
