import Link from "next/link";

import { formatDateOnly } from "@/lib/utils";

import type { ScheduledJobRef } from "../types";

interface ScheduledJobListProps {
  title: string;
  jobs: ScheduledJobRef[];
  emptyMessage: string;
  /** Styles entries as an attention-needed list (used for overdue_scheduled). */
  emphasize?: boolean;
}

// Shared by both upcoming_7_days and overdue_scheduled - identical shape
// (ScheduledJobRef), only the title/emptyMessage/emphasis differ, so one
// component covers both instead of two near-duplicate files.
export function ScheduledJobList({
  title,
  jobs,
  emptyMessage,
  emphasize = false,
}: ScheduledJobListProps) {
  return (
    <div className="flex flex-col gap-2">
      <h2 className="text-lg font-semibold">{title}</h2>
      {jobs.length === 0 ? (
        <p className="text-sm text-muted-foreground">{emptyMessage}</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {jobs.map((job) => (
            <li
              key={job.id}
              className={
                emphasize
                  ? "rounded-md border border-destructive/30 bg-destructive/5 p-2 text-sm"
                  : "rounded-md border p-2 text-sm"
              }
            >
              <Link href={`/jobs/${job.id}`} className="font-medium hover:underline">
                {job.job_code}
              </Link>
              <span className="text-muted-foreground"> — {job.customer_name}</span>
              <div className="text-xs text-muted-foreground">
                {formatDateOnly(job.scheduled_date) ?? "-"}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
