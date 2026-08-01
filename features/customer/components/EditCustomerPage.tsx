"use client";

import { useRouter } from "next/navigation";

import { Skeleton } from "@/components/ui/skeleton";
import { getApiErrorMessage } from "@/lib/axios";

import { useCustomer } from "../hooks/useCustomer";
import { useUpdateCustomer } from "../hooks/useUpdateCustomer";
import type { CreateCustomerInput } from "../schema";
import { CustomerForm } from "./CustomerForm";

interface EditCustomerPageProps {
  customerId: string;
}

export function EditCustomerPage({ customerId }: EditCustomerPageProps) {
  const router = useRouter();
  const { data: customer, isLoading, isError } = useCustomer(customerId);
  const updateCustomer = useUpdateCustomer(customerId);

  function handleSubmit(values: CreateCustomerInput) {
    // PUT /customers/{id} has no customer_type field at all (see
    // docs/api-contract.md) - stripped here rather than relied on the
    // backend to just ignore it.
    const { customer_type, ...input } = values;
    updateCustomer.mutate(input, {
      onSuccess: () => router.push(`/customers/${customerId}`),
    });
  }

  if (isLoading) {
    return (
      <div className="flex max-w-lg flex-col gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </div>
    );
  }

  if (isError || !customer) {
    return (
      <p className="text-sm text-destructive">
        Gagal memuat data customer. Coba muat ulang halaman.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold">Edit Customer</h1>
      <CustomerForm
        mode="edit"
        defaultValues={{
          name: customer.name,
          customer_type: customer.customer_type,
          phone: customer.phone ?? "",
          email: customer.email ?? "",
          address: customer.address ?? "",
          company_name: customer.company_name ?? "",
        }}
        onSubmit={handleSubmit}
        isSubmitting={updateCustomer.isPending}
        submitError={
          updateCustomer.isError
            ? getApiErrorMessage(updateCustomer.error)
            : null
        }
      />
    </div>
  );
}
