"use client";

import { useParams } from "next/navigation";

import { EditCustomerPage } from "@/features/customer/components/EditCustomerPage";

export default function CustomerEditRoute() {
  const params = useParams<{ id: string }>();
  return <EditCustomerPage customerId={params.id} />;
}
