import axios from "axios";

import type { ApiError } from "@/types/api";

export const api = axios.create({
  baseURL: "/api",
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = axios.isAxiosError(error) ? error.response?.status : undefined;
    // Login itself can 401 (wrong credentials) - that must surface as a
    // form error, not trigger a redirect loop back to /login.
    const isLoginRequest = error.config?.url?.includes("/auth/login");

    if (status === 401 && !isLoginRequest && typeof window !== "undefined") {
      window.location.href = "/login";
    }

    return Promise.reject(error);
  },
);

export function getApiErrorMessage(
  error: unknown,
  fallback = "Terjadi kesalahan, coba lagi.",
): string {
  if (axios.isAxiosError<ApiError>(error) && error.response?.data?.error?.message) {
    return error.response.data.error.message;
  }
  return fallback;
}

export default api;
