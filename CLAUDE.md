@AGENTS.md

# CNC Service Project Management App — Frontend Context

## Konteks Proyek

Frontend untuk aplikasi project management perusahaan servis mesin CNC (PT,
sudah PKP). Backend Go REST API sudah berjalan di repo terpisah. Sama seperti
backend: **tujuan utama proyek ini belajar software engineering tingkat lanjut**,
bukan cuma bikin aplikasi jadi — prioritas kedua baru soal aplikasi ini dipakai
riil oleh perusahaan.

Fokus belajar di sisi frontend: App Router Next.js, pemisahan tanggung jawab
yang jelas (service/hook/komponen), state management (server state vs client
state), form handling standar (React Hook Form + Zod), clean code/struktur
folder yang scalable.

## Referensi Dokumen (baca dulu sebelum kerja di modul terkait)

- `docs/api-contract.md` — API contract backend v3 (salinan dari repo backend,
  **read-only reference** — kalau ada mismatch antara dokumen ini dan behavior
  API yang sebenarnya, verifikasi dulu ke backend asli, jangan asumsikan dokumen
  ini selalu akurat 100% sampai dicek. **Kalau ketemu mismatch, perbaiki
  `docs/api-contract.md` di PR yang sama** tempat mismatch itu ditemukan/dipakai
  — bukan cuma dilaporkan verbal lalu dokumennya dibiarkan usang. Prinsip sama
  dengan aturan "update ERD/api-contract di commit yang sama" di CLAUDE.md
  backend; alasan yang sama juga: `docs/erd.md` di backend sempat cuma jadi
  gambar di chat, tidak pernah benar-benar jadi file — `docs/api-contract.md`
  di repo ini sendiri sempat mengalami versi kecil dari masalah itu: file-nya
  baru benar-benar dibuat tanggal 2026-08-01, padahal sudah direferensikan
  sejak skeleton awal 2026-07-31 seolah-olah ada)
- Auth: httpOnly cookie (`access_token`), same-origin via proxy (`next.config.js`
  rewrites saat dev, reverse proxy saat production) — **bukan Bearer token di
  localStorage**. Ini keputusan sudah final, jangan diubah tanpa didiskusikan.
  (Catatan penamaan: "proxy" di sini = reverse proxy/rewrite jaringan, bukan
  file `proxy.ts` Next.js — kebetulan sama nama, lihat bagian versi Next.js
  di bawah.)

> **Catatan penting**: dokumen ini adalah salinan manual dari repo backend.
> Kalau kontrak backend berubah (endpoint baru, field berubah, dst), dokumen ini
> perlu di-update manual juga — belum ada sinkronisasi otomatis antar repo.
> Kalau kamu curiga dokumen ini sudah usang, bilang, jangan lanjut asumsi.

> **Lesson learned (2026-07-31 → 2026-08-01)**: `/auth/login` path prefix
> sempat salah dibaca dari dokumen kontrak (lihat detail & perbaikannya
> langsung di `docs/api-contract.md`, bagian catatan di atas Base URL — bukan
> diduplikasi di sini, supaya cuma ada satu tempat yang perlu diperbarui kalau
> ada detail path lain yang perlu dikoreksi lagi). Verifikasi ke `handler.go`/
> `main.go` backend asli sebelum percaya baris "kecuali X dan Y" di dokumen
> kontrak, terutama untuk detail path.

## Catatan versi Next.js (penting, baca sebelum sentuh routing/proxy)

Project ini pakai **Next.js 16.2.12** — lebih baru dari training data banyak
model, ada breaking change nyata dari versi yang lebih familiar:

- **`middleware.ts` sudah deprecated, diganti `proxy.ts`** (fungsi diekspor
  dengan nama `proxy`, bukan `middleware`). Masih jalan kalau pakai nama lama,
  tapi jangan mulai file baru pakai konvensi lama. Lihat
  `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/proxy.md`.
- Sebelum menulis kode yang menyentuh area yang sering berubah antar versi
  (routing convention, config Turbopack, async request API seperti
  `cookies()`/`headers()`/`params`/`searchParams`), **cek dulu
  `node_modules/next/dist/docs/`** (persis seperti arahan di `AGENTS.md`),
  jangan asumsikan dari memori training.

## Tech Stack (Frontend)

- Next.js (App Router) + TypeScript (strict mode)
- **TanStack Query** — server state (semua data dari API), bukan `useState`/Zustand
- **React Hook Form + Zod** — form handling & validasi, tipe di-infer dari schema (`z.infer`)
- **Axios** — instance terpusat (`lib/axios.ts`), `baseURL: '/api'` (relative,
  same-origin lewat proxy), `withCredentials: true`
- **Tailwind + shadcn/ui** — styling & komponen dasar
- State client murni (modal, filter belum submit, dst) — `useState` lokal,
  Zustand/Context cuma kalau benar-benar lintas banyak komponen jauh

## Struktur Folder (Feature-based, Selaras dengan Modul Backend)

```
app/                 -> routing SAJA, tipis, komposisi dari features/
features/
  auth/, customer/, job/, invoice/
    api/            -> service layer (axios calls)
    hooks/          -> custom hook TanStack Query, bungkus service
    components/     -> komponen fitur ini
    schema.ts       -> Zod schema
    types.ts
components/ui/       -> shadcn primitives + komponen generic
lib/                 -> axios.ts, queryClient.ts, utils.ts
types/api.ts          -> tipe shared (ApiResponse<T>, dst)
```

**Alasan feature-based, bukan type-based** (`components/`, `hooks/`,
`services/` global): supaya struktur frontend selaras 1:1 dengan modul backend
(`internal/customer`, `internal/job`, dst) — mental model dua repo konsisten.

**Padanan istilah dengan backend** (biar tidak bolak-balik didiskusikan ulang):
`features/<domain>/api/*Service.ts` adalah padanan `repository.go` (satu-satunya
tempat yang tahu bentuk request/response mentah ke backend, komponen tidak pernah
fetch langsung) — **per-domain, bukan folder global `lib/api/`**. `hooks/use*.ts`
padanan `service.go` (logic, loading/error state, cache — terpisah dari tampilan).
Komponen padanan `handler.go` yang tipis (cuma orkestrasi/render).

## Status Saat Ini

Skeleton awal sudah dibuat (2026-07-31): init project, dependency
(TanStack Query, RHF+Zod, Axios, shadcn/ui), `next.config.js` rewrites,
`lib/axios.ts` + `lib/queryClient.ts`, `proxy.ts` (proteksi route berbasis
cookie), modul Auth minimal (login + logout + halaman dashboard placeholder
di route group `(protected)`), testing (Jest+RTL+MSW), Dockerfile +
docker-compose.yml, CI (GitHub Actions). `docs/api-contract.md` baru benar-benar
jadi file per 2026-08-01 (lihat catatan di "Referensi Dokumen" di atas).

**Modul Customer selesai** (2026-08-01): list+pagination+search+filter,
create, edit, delete, detail+machines read-only — jadi percontohan pola
service→hook→komponen yang diikuti modul berikutnya.

**Modul Job selesai** (2026-08-02, PR #4): list+filter status/customer
(searchable), create dengan cascading customer→machine, detail dengan
status_history+costs+assign teknisi (409 optimistic-lock conflict eksplisit
di-handle, bukan cuma di-generic-kan), navbar current-user via `GET /auth/me`.
Ini modul yang melahirkan sebagian besar pola di bagian "Pola & Gotcha
Teknis" di bawah — **wajib dibaca sebelum mulai modul baru**, jangan
"temukan ulang" dari nol.

**Modul Invoice/Costing** — sedang berjalan (2026-08-02), lihat
"Pola & Gotcha" di bawah plus `docs/api-contract.md` item 7 Catatan Desain
untuk keputusan pembatasan status manual di UI (beda dari pola Job).

Urutan implementasi modul yang direncanakan: **Auth (skeleton) → Customer →
Job → Costing/Invoice → Dashboard** — mengikuti urutan yang sama dengan
backend, supaya modul Customer tetap jadi percontohan pola di kedua sisi.

---

## PENTING — Cara Kerja yang Saya Inginkan dari Claude Code

Sama seperti kesepakatan di repo backend — saya belajar lewat proyek ini,
jangan cuma eksekusi task dan selesai:

### 1. Jelaskan sebelum eksekusi
Terutama untuk keputusan yang punya lebih dari satu cara valid (misal: taruh
logic di Server Component vs Client Component, kapan butuh Zustand vs cukup
`useState`, dst) — jelaskan pendekatan dan alasannya dulu, terutama kalau
menyimpang dari struktur feature-based yang sudah disepakati.

### 2. Version control tetap bahan belajar

**Git workflow konkret** (bukan cuma prinsip umum):
- `main` diperlakukan seolah protected — fitur baru **selalu** di branch
  terpisah, tidak pernah commit langsung ke `main`, meski kerja solo.
- Naming branch: `feature/<nama-modul>` (misal `feature/customer-module`),
  `fix/<ringkasan-bug>`, `chore/<ringkasan>` untuk kerjaan non-fitur (setup
  tooling, dependency bump).
- Commit kecil & sering pakai **Conventional Commits** (`feat:`, `fix:`,
  `refactor:`, `test:`, `chore:`, `docs:`). Riwayat di dalam branch boleh
  eksploratif/berantakan (itu gunanya branch) — yang penting rapi saat masuk `main`.
- Fitur selesai → buka Pull Request ke `main`, tunggu CI hijau (lint/typecheck/test/build).
- **Saya review diff-nya sendiri di GitHub UI sebelum merge** — bukan formalitas,
  ini supaya saya benar-benar paham perubahannya, bukan cuma percaya laporan.
  Jangan jalankan `gh pr merge` tanpa saya konfirmasi eksplisit.
- Merge strategy: **squash merge** — riwayat `main` jadi satu commit rapi per
  fitur, riwayat development yang berantakan tetap terekam di PR itu sendiri.
- Rebase vs merge untuk sync branch dari `main` yang sudah maju: jelaskan opsinya
  saat kejadian itu muncul, jangan asumsikan saya sudah tahu kapan pilih yang mana.

> **Catatan (2026-08-01)**: skeleton awal (8 commit pertama) sempat langsung
> masuk `main` sebelum aturan branch-protected ini eksplisit ditulis di sini.
> Diperlakukan sebagai bootstrap exception yang sudah disepakati, bukan
> dibongkar ulang — workflow branch+PR di atas berlaku penuh mulai dari
> perubahan berikutnya.

### 3. Testing dibangun bareng, bukan ditambahkan belakangan
Prinsip ini **sama persis dengan backend, tidak boleh lebih longgar**:
- Setup Jest + React Testing Library + MSW itu bagian dari skeleton awal,
  bukan modul terpisah nanti. Skeleton belum selesai kalau belum ada minimal
  1 test yang jalan (misal test form login) sebagai bukti infra testing-nya benar.
- MSW dipakai untuk mock network call di test (intercept di level network,
  bukan mock function `jest.fn()` manual) — jelaskan kenapa ini lebih baik
  waktu pertama kali dipakai, sama semangatnya dengan alasan `testcontainers-go`
  di backend: makin dekat ke kondisi nyata, makin sedikit asumsi salah yang lolos.
- **E2E (Playwright)**: padanan `testcontainers-go` di frontend, tapi
  diterjemahkan sesuai batas repo — testcontainers-go menyalakan Postgres
  **asli** karena Postgres adalah dependency yang backend sendiri miliki/
  kontrol. Backend (Go API + Postgres) **bukan** dependency yang repo frontend
  ini miliki — beda repo (lihat 3b soal docker-compose gabungan). Jadi versi
  frontend dari "test terhadap sesuatu yang nyata, bukan mock" adalah:
  Playwright menjalankan **browser sungguhan** terhadap **`next start`
  sungguhan** (bukan jsdom) — real rendering, real cookie/redirect behavior,
  real routing — sementara batas ke backend tetap di-intercept (pakai
  `page.route()` bawaan Playwright, bukan proses Go+Postgres beneran
  di-docker-compose dari CI repo ini). Real untuk semua yang repo ini miliki,
  mocked persis di batas repo yang sebenarnya beda kepemilikan.
- **Bukti verifikasi wajib konkret, bukan klaim naratif**: sebelum bilang
  "test/lint/build hijau" di laporan balik, benar-benar jalankan
  `npm run lint`, `npx tsc --noEmit`, `npx jest --ci`, `npm run build` dan
  sertakan ringkasan pass/fail-nya (jumlah test, error message kalau ada) —
  ini bukan formalitas, sempat ada kejadian di repo backend klaim hijau
  padahal ada package yang tidak compile. Sama berlaku untuk klaim "sudah
  diverifikasi live": sertakan output command asli (curl/browser), bukan
  cuma pernyataan "sudah dicoba dan jalan".

### 3b. Docker & CI — juga dari skeleton awal, bukan belakangan
- `Dockerfile` multi-stage untuk Next.js (`output: 'standalone'`) dari skeleton
  phase, bukan ditambah setelah banyak kode menumpuk
- `docker-compose.yml` di repo ini cukup untuk jalankan frontend sendiri
  (arahkan ke backend yang jalan terpisah, `BACKEND_URL` env var) — **bukan**
  compose gabungan dengan backend, karena beda repo. Compose gabungan untuk
  deployment nanti dibahas terpisah (kandidat: compose "infra" yang pull image
  jadi dari registry, bukan build dari source dua repo sekaligus)
- CI pipeline (GitHub Actions): mulai dari `lint → typecheck → test → build`,
  jelaskan tiap kali menambah step baru apa yang dicegah/dipastikan — sama
  seperti kesepakatan backend

### 4. Clean code & pemisahan tanggung jawab — ini concern utama saya di frontend
- Komponen kecil, single responsibility — kalau ada file `.tsx` mulai
  melakukan banyak hal sekaligus (fetch + render tabel + handle modal), pecah
- **Service (axios call) → hook (TanStack Query) → komponen (render)** — tiga
  layer terpisah, komponen tidak pernah panggil axios/service langsung
- TypeScript strict, hindari `any` — kalau tipe API belum jelas, verifikasi
  dulu ke backend asli (curl/baca handler), jangan tebak dari dokumentasi
  yang mungkin usang
- Tipe form di-infer dari Zod schema, jangan didefinisikan dobel manual
- **Tipe dari satu sumber, padanan `sqlc` di backend**: `sqlc` generate Go
  struct dari `db/queries/*.sql` supaya skema dan kode tidak pernah drift;
  frontend tidak punya codegen setara, tapi prinsipnya sama — tiap bentuk
  response `api-contract.md` (`Customer`, `Job`, `Invoice`, dst) didefinisikan
  **sekali** di `features/<domain>/types.ts` (pola yang sama dengan
  `types/api.ts` untuk `ApiResponse<T>`), dipakai di seluruh
  `features/<domain>/api/*Service.ts` dan komponennya. Jangan biarkan tiap
  komponen menulis ulang bentuk `Customer`/`Job` versinya sendiri-sendiri.

### 5. State management — pisahkan server state dari client state
Data dari API **selalu** lewat TanStack Query, jangan disalin ke `useState`
atau Zustand "biar gampang di-share" — itu bikin sumber kebenaran dobel dan
kehilangan cache invalidation otomatis. Kalau ragu suatu data itu server state
atau client state, tanya dulu sebelum implementasi.

### 6. Kalau saya salah paham konsep, koreksi
Sama seperti backend — saya lebih suka dikoreksi dengan penjelasan daripada
dibiarkan lanjut dengan pemahaman yang salah, termasuk soal React/Next.js
patterns, bukan cuma soal Go.

---

## Pola & Gotcha Teknis yang Sudah Ditemukan (Modul Customer & Job, 2026-08-01 → 2026-08-02)

Jangan biarkan Invoice (atau modul berikutnya) "menemukan ulang" ini dari nol
— pola berikut sudah terbukti dan wajib diikuti konsisten:

- **shadcn/ui di project ini berbasis `@base-ui/react`, BUKAN Radix.**
  Jangan pakai pola `asChild` ala Radix untuk render custom element (misal
  `<Button asChild><Link>...`) — Base UI pakai prop `render`, atau untuk
  kasus link cukup pakai `buttonVariants()` langsung ke `<Link>`. Salah pakai
  pola Radix di sini berisiko jadi bug aksesibilitas senyap.
- **List page state (search/filter/page) hidup di URL query param**,
  bukan `useState` lokal — supaya bisa di-bookmark, back/forward browser
  jalan benar, dan tidak kehilangan posisi saat navigasi ke halaman lain.
  Pola ini **wajib diikuti sama persis** untuk list Invoice.
- **Sinkronisasi state dari URL: pakai "adjust state during render"**,
  BUKAN `useEffect` + `setState` — `react-hooks/set-state-in-effect` akan
  error kalau dilanggar. Bandingkan value URL vs state sebelumnya langsung
  di badan komponen, panggil `setState` langsung kalau berubah.
- **Form dengan Zod `.transform()`**: `z.input<>` (tipe untuk state form,
  dipakai RHF) beda dari `z.output<>` (tipe hasil transform, dikirim ke API)
  — export dua tipe terpisah, pakai signature 3-generic
  `useForm<Values, Context, TransformedValues>` dari RHF. Sudah dipakai
  berulang di form Customer, Job, dan Job Costs (field numeric dari string
  input) — akan muncul lagi di form generate-invoice dan add-payment.
- **`watch()` dari RHF di-flag React Compiler** (tidak stabil untuk
  optimisasi) — pakai `useWatch({ control, name })` sebagai gantinya.
- **Field yang di-destructure-buang sebelum dikirim ke API** (misal
  `customer_type` yang immutable saat edit): `eslint.config.mjs` sudah
  punya `ignoreRestSiblings: true` untuk rule `no-unused-vars` — pola
  `const { fieldX, ...rest } = values` ini akan muncul lagi untuk field
  immutable lain, tidak perlu setup ulang.
- **Modal vs halaman terpisah untuk form**: pola project ini **halaman
  terpisah** (`/resource/new`, `/resource/[id]/edit`), bukan dialog — karena
  state list sudah di URL (alasan utama orang pakai modal jadi tidak
  relevan), dan supaya konsisten antara Create/Edit. `AlertDialog` cuma
  untuk konfirmasi aksi destruktif (delete).
- **Nilai uang dari backend adalah JSON number, bukan string** (dikonfirmasi
  dari `decimal.MarshalJSONWithoutQuotes = true` di backend, bukan tebakan).
  **JANGAN PERNAH lakukan aritmatika sendiri di sisi frontend terhadap nilai
  ini** — selalu tampilkan apa adanya dari backend (yang sudah presisi pakai
  `shopspring/decimal`). Kalau butuh preview/estimasi UI-only sebelum submit
  (misal "sisa tagihan" di halaman invoice), pakai library decimal-safe
  (`decimal.js`), jangan pengurangan/penjumlahan `number` biasa — itu balik
  lagi ke masalah presisi float yang sudah sengaja dihindari di backend.
- **Base UI `<Select.Value>` render raw stored value by default, BUKAN label
  yang sudah di-resolve** — kalau tidak ditangani, select akan tampilkan
  UUID/value mentah ke user, bukan nama. Selalu pakai pola children-render-function:
  `<SelectValue>{(value) => options.find(o => o.value === value)?.label ?? value}</SelectValue>`.
  Berlaku untuk SETIAP pemakaian Select di seluruh app, bukan cuma yang lagi dikerjakan.
- **RHF `valueAsNumber: true` menghasilkan `NaN` untuk input kosong, BUKAN
  `undefined`** — ini diam-diam mematahkan pengecekan `=== undefined` di
  Zod `superRefine`. Pakai `setValueAs: (v) => (v === "" ? undefined : Number(v))`
  sebagai gantinya untuk field numeric optional.
- **Untuk error 403/404 yang merupakan state valid** (permission denied
  deterministik, atau "belum ada data" seperti `GET /jobs/{id}/invoice`
  sebelum invoice dibuat), set `retry: false` di query/mutation TanStack
  Query — retry cuma buang request percuma untuk state yang tidak akan
  berubah dengan diulang. Untuk kasus 404-sebagai-state-valid (bukan
  error), tangani `isError` sebagai cabang render normal ("belum ada
  invoice"), **bukan** ditampilkan sebagai toast/error banner.
- **Searchable/async select**: gunakan komponen generic `RemoteSearchSelect<T>`
  (pola "hook-as-prop": komponen terima `useOptions(query)` sebagai prop,
  tidak tahu-menahu soal entity spesifik) — sudah ada di `components/` sejak
  modul Job, reuse untuk entity picker lain (jangan bikin versi khusus baru
  per modul). Debounce 400ms + skip re-search saat user memilih (bukan
  mengetik) sudah built-in di komponen ini.
- **Pagination generic**: `components/Pagination.tsx` (diekstrak dari
  modul Customer) menerima prop `itemLabel: string` untuk teks count —
  reuse ini, jangan bikin komponen pagination baru per modul.
- **Pembatasan opsi status di UI tidak selalu berarti backend menegakkan
  state-machine** — Job dan Invoice sama-sama tidak punya enforcement di
  backend, tapi UI-nya sengaja beda (Job bebas, Invoice dibatasi) karena
  beda kategori risiko (workflow metadata vs dampak finansial). Kalau ragu
  perlu dibatasi atau tidak untuk domain baru, lihat kerangka alasan di
  `docs/api-contract.md` Catatan Desain #6 vs #7, bukan asumsi salah satu
  polanya "yang benar" secara universal.
- **Brand color (`#1C6CC3`) hidup di namespace CSS `--sidebar-*`**
  (`app/globals.css` — pre-wired grayscale sejak skeleton awal, baru
  benar-benar dipakai mulai PR #7 shell redesign), **bukan** di
  `--primary`/`--secondary` yang dipakai `Button`/`Badge` default di
  semua halaman lama. Supaya shell baru bisa dipasang tanpa mengubah
  tampilan halaman lama sama sekali (nol perubahan visual di Job/
  Customer/Invoice/Dashboard). Butuh warna brand di luar shell/sidebar?
  Pakai token terpisah `--brand`/`--color-brand`, jangan ubah `--primary`.
- **Floating panel/slide-over pakai `Sheet`** (`npx shadcn add sheet`,
  Base UI) — khusus aksi sekunder yang cepat (edit satu field, dst),
  **bukan** pengganti pola "halaman terpisah untuk form" untuk entitas
  utama. Create Job/Customer/Invoice tetap halaman terpisah — `Sheet`
  adalah pola tambahan untuk kasus yang lebih ringan, bukan menggantikan
  pola lama.
- **Edit satu field teks lewat floating panel: reuse `EditFieldPanel`**
  (`components/EditFieldPanel.tsx`, generic, berbasis `Sheet` di atas) —
  sudah ada sejak modul Tax Report (isi faktur pajak, isi bukti potong
  PPh 23), jangan bikin varian baru per kebutuhan serupa.
- **Print-friendly pakai `print:` variant Tailwind v4 bawaan**
  (`print:hidden` dkk, lihat `TaxReportPage`/`AppSidebar`) — tidak perlu
  `@media print` custom terpisah.
- **Route slug tetap Inggris** (`/tax-report`, dst) meski label
  sidebar/UI-nya Indonesia ("Laporan Pajak") — konsisten dengan semua
  route existing (`/customers`, `/jobs`, `/invoices`), jangan campur
  bahasa di URL.
- **Komponen ber-API generic dipindah ke `components/` shared, bukan
  diduplikasi per modul** — precedent: `Pagination` (diekstrak dari
  Customer), `PeriodSelector` dan `AccessDenied` (diekstrak dari
  Dashboard, dipindah saat Tax Report butuh hal identik). Kalau nemu
  kebutuhan yang sama/nyaris sama lintas modul, pindahkan komponennya,
  jangan copy-paste versi baru.

## Konvensi Kode

- Response API selalu format `{ success, data, meta }` — definisikan
  `ApiResponse<T>` generic sekali di `types/api.ts`, pakai di semua service
- Naming: `useXxx` untuk hook, `XxxService` untuk API layer, PascalCase
  komponen, camelCase fungsi/variable
- Jangan taruh nilai finansial (hasil kalkulasi pajak, subtotal, dst) sebagai
  logic di frontend — itu tetap tanggung jawab backend, frontend cuma
  menampilkan hasil dari API, prinsip yang sama dengan backend
