"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuthMe } from "@/features/auth/hooks/useAuthMe";
import { getApiErrorMessage } from "@/lib/axios";

import { useCompanySettings } from "../hooks/useCompanySettings";
import { useUpdateCompanySettings } from "../hooks/useUpdateCompanySettings";
import {
  companySettingsSchema,
  type CompanySettingsFormValues,
  type CompanySettingsInput,
} from "../schema";
import type { CompanySettings } from "../types";

// GET /settings/company is open to every logged-in role (only PUT is
// requireAdmin) - a teknisi viewer landing here directly via URL is NOT
// a 403/AccessDenied case, unlike Dashboard/Tax Report/Users. Render the
// real data read-only instead of pretending access was denied - see
// CLAUDE.md's "AccessDenied vs read-only" Pola & Gotcha entry for the
// full reasoning.
export function CompanySettingsPage() {
  const { data: settings, isLoading, isError } = useCompanySettings();
  const { data: currentUser } = useAuthMe();

  if (isLoading) {
    return (
      <div className="flex max-w-lg flex-col gap-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </div>
    );
  }

  if (isError || !settings) {
    return (
      <p className="text-sm text-destructive">
        Gagal memuat pengaturan perusahaan. Coba muat ulang halaman.
      </p>
    );
  }

  const canEdit = currentUser?.role === "owner" || currentUser?.role === "admin";

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold">Pengaturan Perusahaan</h1>

      {!canEdit && (
        <p className="text-sm text-muted-foreground">
          Hanya role Owner/Admin yang bisa mengubah pengaturan ini - data di
          bawah ditampilkan apa adanya (read-only).
        </p>
      )}

      <CompanySettingsForm settings={settings} canEdit={canEdit} />
    </div>
  );
}

interface CompanySettingsFormProps {
  settings: CompanySettings;
  canEdit: boolean;
}

// Split from CompanySettingsPage deliberately - useForm's defaultValues
// are only read once, at mount. Calling useForm directly in
// CompanySettingsPage (before the isLoading guard resolves) would mount
// it with defaultValues: undefined on the first render and never pick up
// `settings` once the query resolves. This component only ever mounts
// AFTER settings is guaranteed to exist (same "delay mount until data is
// ready" pattern as EditCustomerPage/CustomerForm).
function CompanySettingsForm({ settings, canEdit }: CompanySettingsFormProps) {
  const updateSettings = useUpdateCompanySettings();

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<CompanySettingsFormValues, unknown, CompanySettingsInput>({
    resolver: zodResolver(companySettingsSchema),
    defaultValues: {
      company_name: settings.company_name,
      npwp: settings.npwp ?? "",
      is_pkp: settings.is_pkp,
      default_tax_percentage: settings.default_tax_percentage,
      default_pph23_rate: settings.default_pph23_rate,
    },
  });

  const isPkp = useWatch({ control, name: "is_pkp" });

  function onSubmit(values: CompanySettingsInput) {
    updateSettings.mutate(values);
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex max-w-lg flex-col gap-4"
    >
      <div className="flex flex-col gap-2">
        <Label htmlFor="company_name">Nama Perusahaan *</Label>
        <Input
          id="company_name"
          disabled={!canEdit}
          {...register("company_name")}
        />
        {errors.company_name && (
          <p className="text-sm text-destructive">
            {errors.company_name.message}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="npwp">NPWP</Label>
        <Input id="npwp" disabled={!canEdit} {...register("npwp")} />
      </div>

      <div className="flex items-center gap-2">
        <Checkbox
          id="is_pkp"
          checked={isPkp}
          disabled={!canEdit}
          onCheckedChange={(checked) =>
            setValue("is_pkp", checked, { shouldValidate: true })
          }
        />
        <Label htmlFor="is_pkp">Perusahaan sudah PKP</Label>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="default_tax_percentage">Persentase PPN Default (%) *</Label>
        <Input
          id="default_tax_percentage"
          type="number"
          step="any"
          disabled={!canEdit}
          {...register("default_tax_percentage", { valueAsNumber: true })}
        />
        {errors.default_tax_percentage && (
          <p className="text-sm text-destructive">
            {errors.default_tax_percentage.message}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="default_pph23_rate">Rate PPh 23 Default (%) *</Label>
        <Input
          id="default_pph23_rate"
          type="number"
          step="any"
          disabled={!canEdit}
          {...register("default_pph23_rate", { valueAsNumber: true })}
        />
        {errors.default_pph23_rate && (
          <p className="text-sm text-destructive">
            {errors.default_pph23_rate.message}
          </p>
        )}
      </div>

      {updateSettings.isError && (
        <p className="text-sm text-destructive">
          {getApiErrorMessage(updateSettings.error)}
        </p>
      )}
      {updateSettings.isSuccess && (
        <p className="text-sm text-emerald-600">Pengaturan berhasil disimpan.</p>
      )}

      {/* Hidden entirely for a non-admin, not disabled-with-tooltip - the
          muted-text note in CompanySettingsPage already explains why, and
          a disabled native <button> doesn't reliably fire hover/tooltip
          events anyway without extra wrapper plumbing. */}
      {canEdit && (
        <Button type="submit" disabled={updateSettings.isPending} className="w-fit">
          {updateSettings.isPending ? "Menyimpan..." : "Simpan Pengaturan"}
        </Button>
      )}
    </form>
  );
}
