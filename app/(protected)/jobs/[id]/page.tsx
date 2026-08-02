"use client";

import { useParams } from "next/navigation";

import { JobDetailPage } from "@/features/job/components/JobDetailPage";

export default function JobDetailRoute() {
  const params = useParams<{ id: string }>();
  return <JobDetailPage jobId={params.id} />;
}
