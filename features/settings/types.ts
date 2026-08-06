// No `id` field - GET/PUT /settings/company operate on an implicit
// singleton row (no id in the path or the response), confirmed live -
// simpler than "singleton with id always 1", the frontend never needs to
// know/handle an id for this resource at all.
export interface CompanySettings {
  company_name: string;
  npwp: string | null;
  is_pkp: boolean;
  // Money-adjacent decimal fields - number, not string, same
  // decimal.MarshalJSONWithoutQuotes precedent as every other decimal
  // field in this app.
  default_tax_percentage: number;
  default_pph23_rate: number;
  updated_at: string;
}
