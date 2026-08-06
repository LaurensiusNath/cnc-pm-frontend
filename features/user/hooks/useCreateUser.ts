import { useMutation, useQueryClient } from "@tanstack/react-query";

import { userService } from "../api/userService";
import type { CreateUserInput } from "../schema";

export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateUserInput) => userService.create(input),
    onSuccess: () => {
      // Matches useUsers' own query key (["users"] as const) - that hook
      // doesn't have a queryKeys.ts module of its own (small, single
      // query, added back when the Job module needed it), so this key is
      // duplicated literally here rather than importing a factory that
      // doesn't exist yet.
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}
