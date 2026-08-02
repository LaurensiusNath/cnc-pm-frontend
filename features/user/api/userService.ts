import { api } from "@/lib/axios";
import type { ApiSuccess } from "@/types/api";

import type { User, UserRole } from "../types";

export const userService = {
  // GET /users is adminGroup-only (owner/admin) on the backend - callers
  // must expect this to reject with 403 for a teknisi-role viewer, see
  // docs/api-contract.md's note under GET /users.
  list: async (role?: UserRole): Promise<User[]> => {
    const { data } = await api.get<ApiSuccess<User[]>>("/v1/users", {
      params: role ? { role } : undefined,
    });
    return data.data;
  },
};
