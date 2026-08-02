import { z } from "zod";

export const jobStatusOptions = [
  { value: "requested", label: "Diminta" },
  { value: "scheduled", label: "Terjadwal" },
  { value: "in_progress", label: "Dikerjakan" },
  { value: "completed", label: "Selesai" },
  { value: "cancelled", label: "Dibatalkan" },
] as const;

export const costTypeOptions = [
  { value: "labor", label: "Jasa/Labor" },
  { value: "spare_part", label: "Spare Part" },
  { value: "transport", label: "Transport" },
  { value: "other", label: "Lainnya" },
] as const;

const optionalText = z
  .string()
  .trim()
  .optional()
  .transform((v) => (v ? v : undefined));

// customer_id/machine_id are set via setValue() from RemoteSearchSelect/
// Select (object-driven widgets), not typed directly into a native input -
// still validated the same way as any other form field.
export const createJobSchema = z.object({
  customer_id: z.string().min(1, "Customer wajib dipilih"),
  machine_id: z.string().optional(),
  title: z.string().trim().min(1, "Judul wajib diisi"),
  description: optionalText,
  scheduled_date: z.string().optional(),
});

export type CreateJobInput = z.infer<typeof createJobSchema>;

export const updateJobStatusSchema = z.object({
  status: z.enum(
    ["requested", "scheduled", "in_progress", "completed", "cancelled"],
    { message: "Status wajib dipilih" },
  ),
  notes: optionalText,
});

export type UpdateJobStatusInput = z.infer<typeof updateJobStatusSchema>;

export const assignTechnicianSchema = z.object({
  technician_id: z.string().min(1, "Teknisi wajib dipilih"),
});

export type AssignTechnicianFormInput = z.infer<
  typeof assignTechnicianSchema
>;

// purchase_price is only meaningful (and only sent) when cost_type is
// spare_part - the UI only mounts/registers that field in that case (see
// AddJobCostForm), and the transform below strips it regardless as a
// second line of defense, since the backend rejects the request with 400
// if purchase_price is present for any other cost_type.
//
// Backend itself doesn't strictly require purchase_price for spare_part
// (only forbids it for non-spare_part, see docs/api-contract.md) - the
// superRefine below is a stricter UI-level rule, not a backend rule we're
// just mirroring.
export const createJobCostSchema = z
  .object({
    cost_type: z.enum(["labor", "spare_part", "transport", "other"], {
      message: "Tipe biaya wajib dipilih",
    }),
    description: z.string().trim().min(1, "Deskripsi wajib diisi"),
    quantity: z
      .number({ error: "Kuantitas wajib diisi" })
      .positive("Kuantitas harus lebih dari 0"),
    purchase_price: z.number().nonnegative().optional(),
    selling_price: z
      .number({ error: "Harga jual wajib diisi" })
      .nonnegative("Harga jual tidak boleh negatif"),
  })
  .superRefine((val, ctx) => {
    if (val.cost_type === "spare_part" && val.purchase_price === undefined) {
      ctx.addIssue({
        code: "custom",
        path: ["purchase_price"],
        message: "Harga beli wajib diisi untuk spare part",
      });
    }
  })
  .transform((val) => ({
    ...val,
    purchase_price:
      val.cost_type === "spare_part" ? val.purchase_price : undefined,
  }));

export type CreateJobCostFormValues = z.input<typeof createJobCostSchema>;
export type CreateJobCostInput = z.output<typeof createJobCostSchema>;
