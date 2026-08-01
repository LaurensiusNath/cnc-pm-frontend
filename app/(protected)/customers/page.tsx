import { Suspense } from "react";

import { CustomerListPage } from "@/features/customer/components/CustomerListPage";

export default function CustomersPage() {
  return (
    <Suspense fallback={null}>
      <CustomerListPage />
    </Suspense>
  );
}
