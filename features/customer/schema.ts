import { z } from "zod";

export const customerTypeOptions = [
  { value: "badan_usaha", label: "Badan Usaha" },
  { value: "perorangan", label: "Perorangan" },
] as const;

// Optional text fields: empty string (the default RHF gives an untouched
// input) is transformed to undefined, so the request omits the key rather
// than sending an explicit empty string - matches the backend's *string
// (nil = "not provided") semantics rather than "provided but blank".
const optionalText = z
  .string()
  .trim()
  .optional()
  .transform((v) => (v ? v : undefined));

const optionalEmail = z
  .union([z.literal(""), z.string().trim().email("Email tidak valid")])
  .optional()
  .transform((v) => (v ? v : undefined));

export const createCustomerSchema = z.object({
  name: z.string().trim().min(1, "Nama wajib diisi"),
  customer_type: z.enum(["badan_usaha", "perorangan"], {
    message: "Tipe customer wajib dipilih",
  }),
  phone: optionalText,
  email: optionalEmail,
  address: optionalText,
  company_name: optionalText,
});

// The transform above (empty string -> undefined) makes Zod's output type
// have required-but-possibly-undefined keys, different from the pre-transform
// optional keys RHF's form state actually holds - CreateCustomerFormValues
// (z.input) is what useForm's generic needs; CreateCustomerInput (z.output)
// is the validated/transformed payload the submit handler receives.
export type CreateCustomerFormValues = z.input<typeof createCustomerSchema>;
export type CreateCustomerInput = z.output<typeof createCustomerSchema>;

// PUT /customers/{id} doesn't accept customer_type at all (see
// docs/api-contract.md) - not just "disabled in the UI", the backend
// request struct genuinely has no field for it.
export const updateCustomerSchema = createCustomerSchema.omit({
  customer_type: true,
});

export type UpdateCustomerInput = z.output<typeof updateCustomerSchema>;
