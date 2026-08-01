"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  createCustomerSchema,
  customerTypeOptions,
  type CreateCustomerFormValues,
  type CreateCustomerInput,
} from "../schema";

interface CustomerFormProps {
  mode: "create" | "edit";
  defaultValues?: Partial<CreateCustomerFormValues>;
  onSubmit: (values: CreateCustomerInput) => void;
  isSubmitting: boolean;
  submitError?: string | null;
}

export function CustomerForm({
  mode,
  defaultValues,
  onSubmit,
  isSubmitting,
  submitError,
}: CustomerFormProps) {
  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<CreateCustomerFormValues, unknown, CreateCustomerInput>({
    resolver: zodResolver(createCustomerSchema),
    defaultValues: {
      name: "",
      customer_type: "badan_usaha",
      phone: "",
      email: "",
      address: "",
      company_name: "",
      ...defaultValues,
    },
  });

  // useWatch instead of the destructured watch() - watch() returns a
  // function RHF can't guarantee is stable, so React Compiler skips
  // memoizing this component; useWatch is a proper subscription hook.
  const customerType = useWatch({ control, name: "customer_type" });

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex max-w-lg flex-col gap-4"
    >
      <div className="flex flex-col gap-2">
        <Label htmlFor="name">Nama *</Label>
        <Input id="name" {...register("name")} />
        {errors.name && (
          <p className="text-sm text-destructive">{errors.name.message}</p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="customer_type">Tipe Customer *</Label>
        {mode === "edit" ? (
          <>
            <Input
              id="customer_type"
              disabled
              readOnly
              value={
                customerTypeOptions.find((o) => o.value === customerType)
                  ?.label ?? ""
              }
            />
            <p className="text-xs text-muted-foreground">
              Tipe customer tidak bisa diubah setelah dibuat (menyangkut
              kewajiban PPh 23).
            </p>
          </>
        ) : (
          <Select
            value={customerType}
            onValueChange={(value) =>
              setValue(
                "customer_type",
                value as CreateCustomerInput["customer_type"],
                { shouldValidate: true },
              )
            }
          >
            <SelectTrigger id="customer_type" aria-label="Tipe Customer">
              <SelectValue placeholder="Pilih tipe" />
            </SelectTrigger>
            <SelectContent>
              {customerTypeOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        {errors.customer_type && (
          <p className="text-sm text-destructive">
            {errors.customer_type.message}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="phone">Telepon</Label>
        <Input id="phone" {...register("phone")} />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" {...register("email")} />
        {errors.email && (
          <p className="text-sm text-destructive">{errors.email.message}</p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="address">Alamat</Label>
        <Input id="address" {...register("address")} />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="company_name">Nama Perusahaan</Label>
        <Input id="company_name" {...register("company_name")} />
      </div>

      {submitError && <p className="text-sm text-destructive">{submitError}</p>}

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting
          ? "Menyimpan..."
          : mode === "create"
            ? "Simpan Customer"
            : "Simpan Perubahan"}
      </Button>
    </form>
  );
}
