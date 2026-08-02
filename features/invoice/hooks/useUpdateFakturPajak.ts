import { useMutation, useQueryClient } from "@tanstack/react-query";

import { invoiceService } from "../api/invoiceService";
import { invoiceKeys } from "../api/queryKeys";
import type { FakturPajakInput } from "../schema";

export function useUpdateFakturPajak(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: FakturPajakInput) =>
      invoiceService.updateFakturPajak(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: invoiceKeys.detail(id) });
    },
  });
}
