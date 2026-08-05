// Explicit access-denied state for a 403 from GET /dashboard/summary
// (owner/admin-only, see adminGroup in cmd/api/main.go) - not a redirect,
// not a generic error banner, so a teknisi-role viewer understands WHY
// rather than getting bounced or shown a scary "gagal memuat data".
export function DashboardAccessDenied() {
  return (
    <div className="rounded-md border border-dashed p-8 text-center text-sm text-muted-foreground">
      Anda tidak punya akses ke halaman ini. Dashboard hanya tersedia untuk
      role Owner/Admin.
    </div>
  );
}
