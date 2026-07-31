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
  ini selalu akurat 100% sampai dicek. Kalau ketemu mismatch, laporkan balik,
  jangan diam-diam kerja sesuai asumsi sendiri)
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

> **Lesson learned (2026-07-31, setup skeleton awal)**: dokumen `api-contract.md`
> sempat membingungkan soal path `/auth/login` — tertulis seolah endpoint itu
> tanpa prefix `/api/v1` (disamakan dengan `/health`), padahal di
> `cmd/api/main.go` route ini didaftarkan lewat `router.Group("/api/v1")` juga,
> sama seperti endpoint bisnis lain. Yang benar-benar tanpa prefix cuma
> `/health`; `/auth/login` cuma tanpa **token**, bukan tanpa prefix. Verifikasi
> ke `handler.go`/`main.go` backend asli sebelum percaya baris "kecuali X dan Y"
> di dokumen kontrak, terutama untuk detail path.

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

## Status Saat Ini

Skeleton awal sudah dibuat (2026-07-31): init project, dependency
(TanStack Query, RHF+Zod, Axios, shadcn/ui), `next.config.js` rewrites,
`lib/axios.ts` + `lib/queryClient.ts`, `proxy.ts` (proteksi route berbasis
cookie), modul Auth minimal (login + logout + halaman dashboard placeholder
di route group `(protected)`). **Belum ada modul Customer/Job/Invoice** —
folder `features/customer`, `features/job`, `features/invoice` sengaja belum
dibuat kosong (git tidak melacak folder kosong, dan belum ada isinya) — akan
dibuat saat modul itu mulai dikerjakan, mengikuti pola `features/auth` sebagai
percontohan.

Urutan implementasi modul yang direncanakan: **Auth (skeleton) → Customer →
Job → Costing/Invoice → Dashboard** — mengikuti urutan yang sama dengan
backend, supaya modul Customer tetap jadi percontohan pola di kedua sisi.

**Known gap yang sudah dicatat, jangan bikin workaround sendiri**: backend
belum punya `GET /auth/me`, jadi frontend belum bisa tahu "siapa user yang
sedang login" setelah refresh halaman/tab baru. Ini akan ditambahkan di
backend dulu sebelum dikerjakan di sini — jangan simpan data user di cookie
non-httpOnly atau localStorage sebagai workaround tanpa didiskusikan dulu.

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
Commit kecil, Conventional Commits (`feat:`, `fix:`, `refactor:`, `test:`,
`chore:`, `docs:`), branching dijelaskan tiap kali dipakai — sama seperti
kesepakatan di backend.

### 3. Testing dibangun bareng
- Component test pakai React Testing Library, MSW untuk mock network call
  (bukan mock function manual) — jelaskan kenapa MSW lebih baik waktu pertama
  kali dipakai, sama semangatnya dengan alasan `testcontainers-go` di backend
- E2E (Playwright) menyusul di fase lanjut, belum sekarang

### 4. Clean code & pemisahan tanggung jawab — ini concern utama saya di frontend
- Komponen kecil, single responsibility — kalau ada file `.tsx` mulai
  melakukan banyak hal sekaligus (fetch + render tabel + handle modal), pecah
- **Service (axios call) → hook (TanStack Query) → komponen (render)** — tiga
  layer terpisah, komponen tidak pernah panggil axios/service langsung
- TypeScript strict, hindari `any` — kalau tipe API belum jelas, verifikasi
  dulu ke backend asli (curl/baca handler), jangan tebak dari dokumentasi
  yang mungkin usang
- Tipe form di-infer dari Zod schema, jangan didefinisikan dobel manual

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

## Konvensi Kode

- Response API selalu format `{ success, data, meta }` — definisikan
  `ApiResponse<T>` generic sekali di `types/api.ts`, pakai di semua service
- Naming: `useXxx` untuk hook, `XxxService` untuk API layer, PascalCase
  komponen, camelCase fungsi/variable
- Jangan taruh nilai finansial (hasil kalkulasi pajak, subtotal, dst) sebagai
  logic di frontend — itu tetap tanggung jawab backend, frontend cuma
  menampilkan hasil dari API, prinsip yang sama dengan backend
