"use client";

import { useRouter } from "next/navigation";

import { getApiErrorMessage } from "@/lib/axios";

import { useCreateCustomer } from "../hooks/useCreateCustomer";
import type { CreateCustomerInput } from "../schema";
import { CustomerForm } from "./CustomerForm";

export function CreateCustomerPage() {
  const router = useRouter();
  const createCustomer = useCreateCustomer();

  function handleSubmit(values: CreateCustomerInput) {
    createCustomer.mutate(values, {
      onSuccess: (customer) => router.push(`/customers/${customer.id}`),
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold">Tambah Customer</h1>
      <CustomerForm
        mode="create"
        onSubmit={handleSubmit}
        isSubmitting={createCustomer.isPending}
        submitError={
          createCustomer.isError
            ? getApiErrorMessage(createCustomer.error)
            : null
        }
      />
    </div>
  );
}
