"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, type FieldValues, type Path, type Resolver } from "react-hook-form";
import type { ZodType } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

interface EditFieldPanelField<TValues extends FieldValues> {
  name: Path<TValues>;
  label: string;
  placeholder?: string;
}

interface EditFieldPanelProps<TValues extends FieldValues> {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  // Input === Output deliberately - see the "does NOT support .transform()"
  // note below.
  schema: ZodType<TValues, TValues>;
  defaultValues: TValues;
  fields: EditFieldPanelField<TValues>[];
  onSubmit: (values: TValues) => void;
  isPending: boolean;
  errorMessage?: string | null;
}

// Generic single/few-plain-text-field slide-over - built for "Isi Faktur
// Pajak" and "Isi Bukti Potong PPh23" on the Tax Report page (both are
// exactly one required text field), designed reusable but NOT wired into
// the Invoice page yet (that's separate follow-up work). Deliberately
// does NOT support Zod .transform()'d schemas (would need the
// z.input/z.output RHF 3-generic split used elsewhere in this app) or
// non-text inputs - extend it if/when a real consumer needs that, rather
// than building it speculatively now.
export function EditFieldPanel<TValues extends FieldValues>({
  open,
  onOpenChange,
  title,
  description,
  schema,
  defaultValues,
  fields,
  onSubmit,
  isPending,
  errorMessage,
}: EditFieldPanelProps<TValues>) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TValues>({
    // zodResolver's inferred generics don't unify with an arbitrary
    // TValues type param the same way they do for a concrete schema type
    // (this is the one place in the component that needs a cast - schema
    // and TValues are guaranteed to match by this component's own props
    // contract, TypeScript just can't prove it through the generic).
    resolver: zodResolver(schema as ZodType<FieldValues, FieldValues>) as Resolver<TValues>,
    defaultValues: defaultValues as never,
  });

  // Sheet content unmounts when closed (Base UI Dialog), so this mostly
  // matters when the same panel instance is reused for a different row
  // without a full unmount cycle in between - reset explicitly rather
  // than rely on remount timing.
  function handleOpenChange(next: boolean) {
    if (next) reset(defaultValues as never);
    onOpenChange(next);
  }

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
          {description && <SheetDescription>{description}</SheetDescription>}
        </SheetHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 px-4">
          {fields.map((field) => (
            <div key={String(field.name)} className="flex flex-col gap-1.5">
              <Label htmlFor={String(field.name)}>{field.label}</Label>
              <Input
                id={String(field.name)}
                placeholder={field.placeholder}
                {...register(field.name)}
              />
              {errors[field.name] && (
                <p className="text-sm text-destructive">
                  {String(errors[field.name]?.message ?? "")}
                </p>
              )}
            </div>
          ))}
          {errorMessage && (
            <p className="text-sm text-destructive">{errorMessage}</p>
          )}
          <SheetFooter className="px-0">
            <Button type="submit" disabled={isPending}>
              {isPending ? "Menyimpan..." : "Simpan"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
