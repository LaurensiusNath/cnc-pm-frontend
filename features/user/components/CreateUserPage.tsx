"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
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
import { getApiErrorMessage } from "@/lib/axios";

import { useCreateUser } from "../hooks/useCreateUser";
import { createUserSchema, userRoleOptions, type CreateUserInput } from "../schema";

export function CreateUserPage() {
  const router = useRouter();
  const createUser = useCreateUser();

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<CreateUserInput>({
    resolver: zodResolver(createUserSchema),
    defaultValues: { name: "", email: "", password: "", role: "teknisi" },
  });

  // useWatch, not watch() - React Compiler flags watch() as an unstable
  // reference (CLAUDE.md Pola & Gotcha).
  const role = useWatch({ control, name: "role" });

  function onSubmit(values: CreateUserInput) {
    createUser.mutate(values, {
      onSuccess: () => router.push("/users"),
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold">Tambah Pengguna</h1>
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
          <Label htmlFor="email">Email *</Label>
          <Input id="email" type="email" {...register("email")} />
          {errors.email && (
            <p className="text-sm text-destructive">{errors.email.message}</p>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="password">Password *</Label>
          <Input id="password" type="password" {...register("password")} />
          {errors.password && (
            <p className="text-sm text-destructive">{errors.password.message}</p>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="role">Role *</Label>
          <Select
            value={role}
            onValueChange={(value) =>
              setValue("role", value as CreateUserInput["role"], {
                shouldValidate: true,
              })
            }
          >
            <SelectTrigger id="role" aria-label="Role">
              <SelectValue placeholder="Pilih role">
                {(value: string | null) =>
                  userRoleOptions.find((opt) => opt.value === value)?.label ?? value
                }
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {userRoleOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.role && (
            <p className="text-sm text-destructive">{errors.role.message}</p>
          )}
        </div>

        {createUser.isError && (
          <p className="text-sm text-destructive">
            {getApiErrorMessage(createUser.error)}
          </p>
        )}

        <Button type="submit" disabled={createUser.isPending}>
          {createUser.isPending ? "Menyimpan..." : "Simpan Pengguna"}
        </Button>
      </form>
    </div>
  );
}
