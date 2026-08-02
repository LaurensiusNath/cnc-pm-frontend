"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getApiErrorMessage } from "@/lib/axios";

import { useUpdateInvoiceStatus } from "../hooks/useUpdateInvoiceStatus";
import {
  getInvoiceStatusActions,
  invoiceStatusBadgeClassName,
  invoiceStatusOptions,
} from "../schema";
import type { InvoiceStatus } from "../types";

const actionLabel: Record<"sent" | "cancelled", string> = {
  sent: "Tandai Terkirim",
  cancelled: "Batalkan Invoice",
};

interface InvoiceStatusActionsProps {
  invoiceId: string;
  currentStatus: InvoiceStatus;
}

// `paid`/`overdue` never appear here as clickable buttons - by design, not
// an oversight. See getInvoiceStatusActions in schema.ts for the full
// reasoning (backend doesn't enforce this, this restriction is UI-only,
// and it's deliberately stricter than Job's status form because a wrong
// manual `paid` here means a real receivable gets marked settled when it
// isn't).
export function InvoiceStatusActions({
  invoiceId,
  currentStatus,
}: InvoiceStatusActionsProps) {
  const updateStatus = useUpdateInvoiceStatus(invoiceId);
  const actions = getInvoiceStatusActions(currentStatus);
  const currentLabel =
    invoiceStatusOptions.find((opt) => opt.value === currentStatus)?.label ??
    currentStatus;

  return (
    <div className="flex flex-col gap-2 rounded-md border p-3">
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Status saat ini:</span>
        <Badge
          variant="outline"
          className={invoiceStatusBadgeClassName[currentStatus]}
        >
          {currentLabel}
        </Badge>
      </div>

      {actions.length > 0 && (
        <div className="flex gap-2">
          {actions.map((status) => (
            <Button
              key={status}
              type="button"
              variant={status === "cancelled" ? "destructive" : "default"}
              size="sm"
              disabled={updateStatus.isPending}
              onClick={() => updateStatus.mutate({ status })}
            >
              {actionLabel[status]}
            </Button>
          ))}
        </div>
      )}

      {updateStatus.isError && (
        <p className="text-sm text-destructive">
          {getApiErrorMessage(updateStatus.error)}
        </p>
      )}
    </div>
  );
}
