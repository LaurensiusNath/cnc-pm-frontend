import { api } from "@/lib/axios";
import type { ApiSuccess } from "@/types/api";

import type {
  AssignTechnicianFormInput,
  CreateJobCostInput,
  CreateJobInput,
  UpdateJobStatusInput,
} from "../schema";
import type {
  Job,
  JobCost,
  JobCostListMeta,
  JobDetail,
  JobListMeta,
  JobListParams,
} from "../types";

interface AssignTechnicianRequest extends AssignTechnicianFormInput {
  expected_updated_at: string;
}

export const jobService = {
  list: async (
    params: JobListParams,
  ): Promise<{ jobs: Job[]; meta: JobListMeta }> => {
    const { data } = await api.get<ApiSuccess<Job[], JobListMeta>>(
      "/v1/jobs",
      { params },
    );
    return { jobs: data.data, meta: data.meta! };
  },

  getById: async (id: string): Promise<JobDetail> => {
    const { data } = await api.get<ApiSuccess<JobDetail>>(`/v1/jobs/${id}`);
    return data.data;
  },

  create: async (input: CreateJobInput): Promise<Job> => {
    const { data } = await api.post<ApiSuccess<Job>>("/v1/jobs", input);
    return data.data;
  },

  updateStatus: async (
    id: string,
    input: UpdateJobStatusInput,
  ): Promise<Job> => {
    const { data } = await api.patch<ApiSuccess<Job>>(
      `/v1/jobs/${id}/status`,
      input,
    );
    return data.data;
  },

  assignTechnician: async (
    id: string,
    input: AssignTechnicianRequest,
  ): Promise<Job> => {
    const { data } = await api.patch<ApiSuccess<Job>>(
      `/v1/jobs/${id}/assign`,
      input,
    );
    return data.data;
  },

  listCosts: async (
    jobId: string,
  ): Promise<{ costs: JobCost[]; meta: JobCostListMeta }> => {
    const { data } = await api.get<ApiSuccess<JobCost[], JobCostListMeta>>(
      `/v1/jobs/${jobId}/costs`,
    );
    return { costs: data.data, meta: data.meta! };
  },

  createCost: async (
    jobId: string,
    input: CreateJobCostInput,
  ): Promise<JobCost> => {
    const { data } = await api.post<ApiSuccess<JobCost>>(
      `/v1/jobs/${jobId}/costs`,
      input,
    );
    return data.data;
  },

  deleteCost: async (jobId: string, costId: string): Promise<void> => {
    await api.delete(`/v1/jobs/${jobId}/costs/${costId}`);
  },
};
