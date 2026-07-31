import { api } from "@/lib/axios";
import type { ApiSuccess } from "@/types/api";

import type { LoginInput } from "../schema";
import type { AuthUser } from "../types";

export const authService = {
  login: async (input: LoginInput): Promise<AuthUser> => {
    const { data } = await api.post<ApiSuccess<{ user: AuthUser }>>(
      "/v1/auth/login",
      input,
    );
    return data.data.user;
  },

  logout: async (): Promise<void> => {
    await api.post("/v1/auth/logout");
  },
};
