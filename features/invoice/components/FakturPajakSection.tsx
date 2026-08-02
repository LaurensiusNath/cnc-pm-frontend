"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getApiErrorMessage } from "@/lib/axios";

import { useUpdateFakturPajak } from "../hooks/useUpdateFakturPajak";
import { fakturPajakSchema, type FakturPajakInput } from "../schema";

interface FakturPajakSectionProps {
  invoiceId: string;
  nomorFakturPajak: string | null;
}

export function FakturPajakSection({
  invoiceId,
  nomorFakturPajak,
}: FakturPajakSectionProps) {
  const updateFakturPajak = useUpdateFakturPajak(invoiceId);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FakturPajakInput>({
    resolver: zodResolver(fakturPajakSchema),
    defaultValues: { nomor_faktur_pajak: nomorFakturPajak ?? "" },
  });

  function onSubmit(values: FakturPajakInput) {
    updateFakturPajak.mutate(values);
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-2 rounded-md border p-3"
    >
      <Label htmlFor="nomor_faktur_pajak">Nomor Faktur Pajak</Label>
      {/* Explicit "belum diisi" state, not just a blank input - null and
          "" are different things here and should read differently. */}
      {!nomorFakturPajak && (
        <p className="text-sm text-muted-foreground">Belum diisi.</p>
      )}
      <div className="flex gap-2">
        <Input
          id="nomor_faktur_pajak"
          className="max-w-xs"
          {...register("nomor_faktur_pajak")}
        />
        <Button
          type="submit"
          variant="outline"
          disabled={updateFakturPajak.isPending}
        >
          {updateFakturPajak.isPending ? "Menyimpan..." : "Simpan"}
        </Button>
      </div>
      {errors.nomor_faktur_pajak && (
        <p className="text-sm text-destructive">
          {errors.nomor_faktur_pajak.message}
        </p>
      )}
      {updateFakturPajak.isError && (
        <p className="text-sm text-destructive">
          {getApiErrorMessage(updateFakturPajak.error)}
        </p>
      )}
      {updateFakturPajak.isSuccess && (
        <p className="text-sm text-emerald-600">
          Nomor faktur pajak berhasil disimpan.
        </p>
      )}
    </form>
  );
}
