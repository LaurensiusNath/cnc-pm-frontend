import { useMutation } from "@tanstack/react-query";

import { authService } from "../api/authService";

export function useLogout() {
  return useMutation({
    mutationFn: authService.logout,
  });
}
