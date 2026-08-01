"use client";

import { useParams } from "next/navigation";

import { CustomerDetailPage } from "@/features/customer/components/CustomerDetailPage";

export default function CustomerDetailRoute() {
  const params = useParams<{ id: string }>();
  return <CustomerDetailPage customerId={params.id} />;
}
