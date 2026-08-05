interface AccessDeniedProps {
  /** e.g. "Dashboard", "Laporan Pajak" - both are owner/admin-only. */
  resource: string;
}

// Explicit access-denied state for a 403 from an owner/admin-only
// endpoint (GET /dashboard/summary, GET /reports/tax-summary) - not a
// redirect, not a generic error banner, so a teknisi-role viewer
// understands WHY rather than getting bounced or shown a scary "gagal
// memuat data". Shared between Dashboard and Tax Report since both hit
// this exact same shape of restriction.
export function AccessDenied({ resource }: AccessDeniedProps) {
  return (
    <div className="rounded-md border border-dashed p-8 text-center text-sm text-muted-foreground">
      Anda tidak punya akses ke halaman ini. {resource} hanya tersedia untuk
      role Owner/Admin.
    </div>
  );
}
