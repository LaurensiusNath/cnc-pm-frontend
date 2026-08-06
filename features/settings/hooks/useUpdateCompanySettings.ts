import { useMutation, useQueryClient } from "@tanstack/react-query";

import { settingsService } from "../api/settingsService";
import { settingsKeys } from "../api/queryKeys";
import type { CompanySettingsInput } from "../schema";

export function useUpdateCompanySettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CompanySettingsInput) => settingsService.update(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.company });
    },
  });
}
