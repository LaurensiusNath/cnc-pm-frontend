"use client";

import Link from "next/link";

import { Skeleton } from "@/components/ui/skeleton";
import { useAuthMe } from "@/features/auth/hooks/useAuthMe";
import { useCustomer } from "@/features/customer/hooks/useCustomer";
import { useUsers } from "@/features/user/hooks/useUsers";

import { useJob } from "../hooks/useJob";
import { JobAssignTechnicianForm } from "./JobAssignTechnicianForm";
import { JobCostsSection } from "./JobCostsSection";
import { JobInfoSection } from "./JobInfoSection";
import { JobInvoiceSection } from "./JobInvoiceSection";
import { JobStatusChangeForm } from "./JobStatusChangeForm";
import { JobStatusHistoryTimeline } from "./JobStatusHistoryTimeline";

interface JobDetailPageProps {
  jobId: string;
}

export function JobDetailPage({ jobId }: JobDetailPageProps) {
  const { data: job, isLoading, isError } = useJob(jobId);
  const { data: customer } = useCustomer(job?.customer_id ?? "");
  // No role filter - reused for technician-name resolution in both the
  // info section and the status history timeline, not just the assign
  // dropdown (see useUsers' own comment on why this is one shared query).
  const { data: users } = useUsers();
  const { data: currentUser } = useAuthMe();

  if (isLoading) {
    return (
      <div className="flex flex-col gap-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-6 w-full max-w-md" />
        ))}
      </div>
    );
  }

  if (isError || !job) {
    return (
      <p className="text-sm text-destructive">
        Gagal memuat data job. Coba muat ulang halaman.
      </p>
    );
  }

  const technicians = users?.filter((u) => u.role === "teknisi") ?? [];
  // Assigning a technician is an admin/owner decision by business rule,
  // not just an API permission detail - hidden entirely for a teknisi
  // viewer rather than shown disabled, since GET /users (needed for the
  // dropdown options) also 403s for them regardless.
  const canManageAssignment =
    currentUser?.role === "owner" || currentUser?.role === "admin";

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-4">
        <JobInfoSection job={job} customer={customer} users={users} />
        <JobInvoiceSection jobId={jobId} jobStatus={job.status} />
      </div>

      <div>
        <h2 className="mb-2 text-lg font-semibold">Riwayat Status</h2>
        <JobStatusHistoryTimeline history={job.status_history} users={users} />
      </div>

      <JobCostsSection jobId={jobId} />

      <JobStatusChangeForm jobId={jobId} currentStatus={job.status} />

      {canManageAssignment && (
        <JobAssignTechnicianForm
          jobId={jobId}
          currentUpdatedAt={job.updated_at}
          technicians={technicians}
        />
      )}

      <Link
        href="/jobs"
        className="text-sm text-muted-foreground hover:underline"
      >
        Kembali ke daftar job
      </Link>
    </div>
  );
}
