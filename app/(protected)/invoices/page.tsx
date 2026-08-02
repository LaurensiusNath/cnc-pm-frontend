import { Suspense } from "react";

import { InvoiceListPage } from "@/features/invoice/components/InvoiceListPage";

export default function InvoicesPage() {
  return (
    <Suspense fallback={null}>
      <InvoiceListPage />
    </Suspense>
  );
}
