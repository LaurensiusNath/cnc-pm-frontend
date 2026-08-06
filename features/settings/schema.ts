import { z } from "zod";

const optionalText = z
  .string()
  .trim()
  .optional()
  .transform((v) => (v ? v : undefined));

// All fields required by the backend (company_name/default_tax_percentage/
// default_pph23_rate have binding:"required" in updateRequest, npwp/is_pkp
// don't but npwp is nullable so still optional here) - this form is
// always pre-filled from GET before being editable, never starts blank
// like a create form, so required-numeric fields use plain
// valueAsNumber:true (same as Job Costs' quantity/selling_price), not the
// setValueAs blank-to-undefined pattern reserved for truly optional
// numeric fields.
export const companySettingsSchema = z.object({
  company_name: z.string().trim().min(1, "Nama perusahaan wajib diisi"),
  npwp: optionalText,
  is_pkp: z.boolean(),
  default_tax_percentage: z
    .number({ error: "Persentase pajak wajib diisi" })
    .nonnegative("Persentase pajak tidak boleh negatif"),
  default_pph23_rate: z
    .number({ error: "Rate PPh 23 wajib diisi" })
    .nonnegative("Rate PPh 23 tidak boleh negatif"),
});

export type CompanySettingsFormValues = z.input<typeof companySettingsSchema>;
export type CompanySettingsInput = z.output<typeof companySettingsSchema>;
