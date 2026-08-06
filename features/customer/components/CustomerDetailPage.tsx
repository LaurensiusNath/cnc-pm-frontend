"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

import { useCustomer } from "../hooks/useCustomer";
import { customerTypeOptions } from "../schema";
import { DeleteCustomerDialog } from "./DeleteCustomerDialog";
import { MachinesSection } from "./MachinesSection";

interface CustomerDetailPageProps {
  customerId: string;
}

export function CustomerDetailPage({ customerId }: CustomerDetailPageProps) {
  const router = useRouter();
  const { data: customer, isLoading, isError } = useCustomer(customerId);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-6 w-full max-w-md" />
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

  const typeLabel =
    customerTypeOptions.find((opt) => opt.value === customer.customer_type)
      ?.label ?? customer.customer_type;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{customer.name}</h1>
          <Badge variant="outline" className="mt-1">
            {typeLabel}
          </Badge>
        </div>
        <div className="flex gap-2">
          <Link
            href={`/customers/${customer.id}/edit`}
            className={cn(buttonVariants({ variant: "outline" }))}
          >
            Edit
          </Link>
          <DeleteCustomerDialog
            customerId={customer.id}
            customerName={customer.name}
            onDeleted={() => router.push("/customers")}
          />
        </div>
      </div>

      <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <dt className="text-sm text-muted-foreground">Telepon</dt>
          <dd>{customer.phone ?? "-"}</dd>
        </div>
        <div>
          <dt className="text-sm text-muted-foreground">Email</dt>
          <dd>{customer.email ?? "-"}</dd>
        </div>
        <div>
          <dt className="text-sm text-muted-foreground">Alamat</dt>
          <dd>{customer.address ?? "-"}</dd>
        </div>
        <div>
          <dt className="text-sm text-muted-foreground">Nama Perusahaan</dt>
          <dd>{customer.company_name ?? "-"}</dd>
        </div>
      </dl>

      <MachinesSection customerId={customer.id} machines={customer.machines} />

      <Link
        href="/customers"
        className="text-sm text-muted-foreground hover:underline"
      >
        Kembali ke daftar customer
      </Link>
    </div>
  );
}
