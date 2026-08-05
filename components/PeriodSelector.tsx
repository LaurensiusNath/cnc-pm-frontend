"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface PeriodSelectorProps {
  periodFrom: string | null;
  periodTo: string | null;
  onChange: (patch: { period_from: string | null; period_to: string | null }) => void;
}

// Mirrors the backend's own ErrInvalidPeriod rule (period_from must not be
// after period_to) client-side, purely to avoid a wasted round-trip - the
// backend still enforces this independently, this isn't a replacement for
// that. Validation only kicks in once BOTH ends are set (a half-filled
// field isn't invalid yet, same as the backend which only compares once
// both bounds resolve).
export function PeriodSelector({
  periodFrom,
  periodTo,
  onChange,
}: PeriodSelectorProps) {
  const [error, setError] = useState<string | null>(null);

  function handleFromChange(value: string) {
    const nextFrom = value || null;
    if (nextFrom && periodTo && nextFrom > periodTo) {
      setError("Tanggal awal tidak boleh setelah tanggal akhir");
      return;
    }
    setError(null);
    onChange({ period_from: nextFrom, period_to: periodTo });
  }

  function handleToChange(value: string) {
    const nextTo = value || null;
    if (periodFrom && nextTo && periodFrom > nextTo) {
      setError("Tanggal awal tidak boleh setelah tanggal akhir");
      return;
    }
    setError(null);
    onChange({ period_from: periodFrom, period_to: nextTo });
  }

  function handleReset() {
    setError(null);
    onChange({ period_from: null, period_to: null });
  }

  return (
    <div className="flex flex-col gap-1">
      <div className="flex flex-wrap items-end gap-2">
        <div className="flex flex-col gap-1">
          <Label htmlFor="period_from" className="text-xs">
            Dari
          </Label>
          <Input
            id="period_from"
            type="date"
            value={periodFrom ?? ""}
            onChange={(e) => handleFromChange(e.target.value)}
            className="w-40"
          />
        </div>
        <div className="flex flex-col gap-1">
          <Label htmlFor="period_to" className="text-xs">
            Sampai
          </Label>
          <Input
            id="period_to"
            type="date"
            value={periodTo ?? ""}
            onChange={(e) => handleToChange(e.target.value)}
            className="w-40"
          />
        </div>
        <Button type="button" variant="outline" size="sm" onClick={handleReset}>
          Bulan Ini
        </Button>
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
