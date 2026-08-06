import { api } from "@/lib/axios";
import type { ApiSuccess } from "@/types/api";

import type { CompanySettingsInput } from "../schema";
import type { CompanySettings } from "../types";

export const settingsService = {
  // GET is open to every logged-in role (RegisterRoutes only guards PUT
  // with requireAdmin) - never expect a 403 from this call itself.
  get: async (): Promise<CompanySettings> => {
    const { data } = await api.get<ApiSuccess<CompanySettings>>(
      "/v1/settings/company",
    );
    return data.data;
  },

  // owner/admin only. No {id} in the path - implicit singleton.
  update: async (input: CompanySettingsInput): Promise<CompanySettings> => {
    const { data } = await api.put<ApiSuccess<CompanySettings>>(
      "/v1/settings/company",
      input,
    );
    return data.data;
  },
};
