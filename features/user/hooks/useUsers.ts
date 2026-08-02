import { useQuery } from "@tanstack/react-query";

import { userService } from "../api/userService";

// No role filter: fetched once and reused for every name-resolution need
// on the job detail page (technician name, status_history "changed by",
// and the assign-technician dropdown options via a client-side role
// filter) - one query instead of three.
export function useUsers() {
  return useQuery({
    queryKey: ["users"] as const,
    queryFn: () => userService.list(),
    staleTime: 5 * 60 * 1000,
    // 403 for a teknisi-role viewer is a deterministic permission state,
    // not a transient failure - retrying it a few times over is pure
    // waste. Consumers should degrade gracefully on isError, not surface
    // a scary error banner for this specific, expected case.
    retry: false,
  });
}
