import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import type { CustomerDetail } from "@/features/customer/types";
import type { User } from "@/features/user/types";

import { jobStatusOptions } from "../schema";
import type { JobDetail } from "../types";

function statusLabel(status: JobDetail["status"]) {
  return jobStatusOptions.find((opt) => opt.value === status)?.label ?? status;
}

interface JobInfoSectionProps {
  job: JobDetail;
  customer: CustomerDetail | undefined;
  users: User[] | undefined;
}

export function JobInfoSection({ job, customer, users }: JobInfoSectionProps) {
  const machine = customer?.machines.find((m) => m.id === job.machine_id);
  const technician = users?.find((u) => u.id === job.technician_id);

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-semibold">{job.title}</h1>
        <p className="text-sm text-muted-foreground">{job.job_code}</p>
        <Badge variant="outline" className="mt-1">
          {statusLabel(job.status)}
        </Badge>
      </div>

      {job.description && <p className="text-sm">{job.description}</p>}

      <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <dt className="text-sm text-muted-foreground">Customer</dt>
          <dd>
            {customer ? (
              <Link
                href={`/customers/${customer.id}`}
                className="hover:underline"
              >
                {customer.name}
              </Link>
            ) : (
              "-"
            )}
          </dd>
        </div>
        <div>
          <dt className="text-sm text-muted-foreground">Mesin</dt>
          <dd>{machine?.machine_name ?? "-"}</dd>
        </div>
        <div>
          <dt className="text-sm text-muted-foreground">Teknisi</dt>
          <dd>
            {technician?.name ??
              (job.technician_id ? "(tidak diketahui)" : "Belum ditugaskan")}
          </dd>
        </div>
        <div>
          <dt className="text-sm text-muted-foreground">Tanggal Jadwal</dt>
          <dd>{job.scheduled_date ?? "-"}</dd>
        </div>
        <div>
          <dt className="text-sm text-muted-foreground">Tanggal Selesai</dt>
          <dd>{job.completed_date ?? "-"}</dd>
        </div>
      </dl>
    </div>
  );
}
