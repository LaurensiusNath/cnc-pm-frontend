import { Suspense } from "react";

import { DashboardPage } from "@/features/dashboard/components/DashboardPage";

export default function DashboardRoute() {
  return (
    <Suspense fallback={null}>
      <DashboardPage />
    </Suspense>
  );
}
