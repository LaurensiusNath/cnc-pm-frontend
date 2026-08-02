import { useQuery } from "@tanstack/react-query";

import { authService } from "../api/authService";

// Called once at (protected)/layout.tsx and reused anywhere else that
// needs the current user (e.g. gating the assign-technician section on
// the job detail page to owner/admin) - staleTime: Infinity because the
// logged-in identity doesn't change mid-session without a fresh login,
// so later calls from other components just read the cached value
// instead of re-fetching.
export function useAuthMe() {
  return useQuery({
    queryKey: ["auth", "me"] as const,
    queryFn: authService.me,
    staleTime: Infinity,
  });
}
