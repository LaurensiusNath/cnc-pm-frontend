export type JobStatus =
  | "requested"
  | "scheduled"
  | "in_progress"
  | "completed"
  | "cancelled";

export type CostType = "labor" | "spare_part" | "transport" | "other";

export interface Job {
  id: string;
  job_code: string;
  customer_id: string;
  machine_id: string | null;
  technician_id: string | null;
  title: string;
  description: string | null;
  status: JobStatus;
  scheduled_date: string | null;
  completed_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface JobStatusHistoryEntry {
  id: string;
  job_id: string;
  status: JobStatus;
  changed_by: string;
  changed_at: string;
  notes: string | null;
}

// quantity/purchase_price/selling_price/subtotal are `number`, not
// `string` - backend sets decimal.MarshalJSONWithoutQuotes = true
// (cmd/api/main.go), confirmed before typing these as string like a naive
// "money = string" assumption would have gotten wrong.
export interface JobCost {
  id: string;
  job_id: string;
  cost_type: CostType;
  description: string;
  quantity: number;
  purchase_price: number | null;
  selling_price: number;
  subtotal: number;
  created_at: string;
}

// GET /jobs/{id} nests status_history but its `costs` field is unused by
// the UI - the Costs section sources both items and totals from a
// separate GET /jobs/{id}/costs call instead (see useJobCosts), so this
// type still reflects the real response shape even though one field goes
// deliberately unread.
export interface JobDetail extends Job {
  status_history: JobStatusHistoryEntry[];
  costs: JobCost[];
}

export interface JobListMeta {
  page: number;
  total: number;
}

export interface JobListParams {
  page?: number;
  limit?: number;
  status?: JobStatus;
  customer_id?: string;
}

export interface JobCostListMeta {
  total_selling: number;
  total_margin: number;
}
