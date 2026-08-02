import { Suspense } from "react";

import { JobListPage } from "@/features/job/components/JobListPage";

export default function JobsPage() {
  return (
    <Suspense fallback={null}>
      <JobListPage />
    </Suspense>
  );
}
