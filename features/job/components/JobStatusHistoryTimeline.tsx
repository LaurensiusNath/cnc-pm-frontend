import type { User } from "@/features/user/types";

import { jobStatusOptions } from "../schema";
import type { JobStatusHistoryEntry } from "../types";

function statusLabel(status: JobStatusHistoryEntry["status"]) {
  return jobStatusOptions.find((opt) => opt.value === status)?.label ?? status;
}

// Falls back to a truncated ID when the user can't be resolved - either
// GET /users hasn't loaded yet, or the viewer is a teknisi who got 403'd
// from it (see docs/api-contract.md's note on GET /users - any logged-in
// user can change a job's status, but only owner/admin can list users to
// resolve who did).
function resolveUserName(users: User[] | undefined, id: string): string {
  const user = users?.find((u) => u.id === id);
  if (user) return user.name;
  return `ID ${id.slice(0, 8)}...`;
}

interface JobStatusHistoryTimelineProps {
  history: JobStatusHistoryEntry[];
  users: User[] | undefined;
}

export function JobStatusHistoryTimeline({
  history,
  users,
}: JobStatusHistoryTimelineProps) {
  if (history.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">Belum ada riwayat status.</p>
    );
  }

  return (
    <ol className="flex flex-col gap-3">
      {history.map((entry) => (
        <li key={entry.id} className="rounded-md border p-3 text-sm">
          <div className="flex items-center justify-between">
            <span className="font-medium">{statusLabel(entry.status)}</span>
            <span className="text-xs text-muted-foreground">
              {new Date(entry.changed_at).toLocaleString("id-ID")}
            </span>
          </div>
          <p className="text-muted-foreground">
            oleh {resolveUserName(users, entry.changed_by)}
          </p>
          {entry.notes && <p className="mt-1">{entry.notes}</p>}
        </li>
      ))}
    </ol>
  );
}
