# Wira Admin — Dashboard Owner & Karyawan (v1.0)

Dashboard web untuk **Wira AI**: owner dan karyawan memantau order yang masuk dari AI Agent (WhatsApp),
memverifikasi pembayaran, dan membagi tugas order — dengan tampilan seperti Notion untuk bisnis:
bersih, sederhana, nyaman di HP.

> Proyek induk: `~/Documents/project/AI_STARTUP` (monorepo Turbo: `apps/api` Fastify, `packages/db` Prisma + Supabase).
> Dashboard ini hanya **membaca & mengubah data di DB yang sama**; tidak mengubah alur AI Agent.

---

## Quick Start

```bash
git clone <repo-url> && cd ADMIN_PANEL_WIRA
npm install
cp .env.example .env        # isi VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, VITE_API_URL
npm run dev                 # http://localhost:5173
```

Syarat: Node 20+, API Wira AI jalan di `VITE_API_URL` (`npm run dev --workspace=apps/api` di repo AI_STARTUP),
Google provider aktif di Supabase, dan email login sudah ada di tabel `users`
(SQL: `AI_STARTUP/packages/db/prisma/add_admin_auth.sql`).

| Script | Fungsi |
|--------|--------|
| `npm run dev` | Dev server |
| `npm run build` | Type-check + build produksi ke `dist/` |
| `npm run lint` | oxlint |
| `npm run preview` | Preview hasil build |

---

## 1. Scope v1.0 (hanya ini)

| # | Fitur | Owner | Karyawan |
|---|-------|:----:|:-------:|
| 1 | Login Google (Supabase Auth) | ✅ | ✅ (email diundang owner) |
| 2 | Daftar order dari DB (realtime) + filter status | ✅ semua | ✅ miliknya |
| 3 | Detail order: item, customer, alamat, riwayat status | ✅ | ✅ |
| 4 | Status pembayaran + **Approve / Reject** | ✅ | ✅ |
| 5 | **Auto-assign** order ke karyawan | ✅ atur & override | ✅ lihat tugasnya |
| 6 | Update progress order (processing → shipped → done) | ✅ | ✅ |
| 7 | Ringkasan & grafik penjualan | ✅ | ❌ |
| 8 | Info DB lain: customer, produk/stok, karyawan | ✅ | read-only produk |

**Di luar scope v1.0:** chat takeover, edit persona AI, billing/subscription, laporan keuangan lanjutan,
notifikasi push, multi-bahasa.

---

## 2. Tech Stack (sengaja minimal)

| Layer | Pilihan | Alasan |
|-------|---------|--------|
| Build | **Vite + React 19 + TypeScript** | Cepat, SPA ringan, cocok untuk dashboard |
| UI | **shadcn/ui + Tailwind CSS v4** | Komponen rapi, mudah dikustom, mobile-first |
| Ikon | **lucide-react** | Bawaan shadcn |
| Routing | **TanStack Router** (atau React Router) | Route terproteksi per role |
| Data fetching | **TanStack Query** | Cache, refetch, optimistic update |
| Tabel | **TanStack Table** (via shadcn Data Table) | Sort / filter / paging |
| Grafik | **Recharts** (via shadcn `chart`) | Terintegrasi theme |
| Form | **react-hook-form + zod** | Validasi ringan |
| Auth | **Supabase Auth — Google OAuth** | Owner login pakai Gmail |
| Update otomatis | **Polling TanStack Query (10 dtk)** | Order baru muncul tanpa refresh; Supabase Realtime menyusul setelah RLS aktif |
| Backend | **Fastify** (pakai `apps/api` yang sudah ada) | Satu backend, tidak ada service baru |
| DB | **Supabase Postgres + Prisma** (sudah ada) | Skema `orders`, `payments`, dst. sudah tersedia |
| Deploy | FE: Vercel/Cloudflare Pages · API: tetap seperti sekarang | |

**Pembagian tugas FE ↔ BE:**
- **Baca data** (list order, detail, grafik): FE → Fastify `/admin/*`, difilter per `tenantId` + role di kode. (Rencana awal: baca langsung ke Supabase dengan RLS — ditunda karena API AI Agent memakai anon key; RLS baru aman setelah `SUPABASE_SERVICE_KEY` dipakai API.)
- **Aksi sensitif** (approve pembayaran, assign, ubah status): FE → Fastify `/admin/*`; Fastify memverifikasi
  **JWT Supabase**, cek role, lalu menulis DB + `activity_logs`. Jadi aturan bisnis ada di satu tempat.

---

## 3. Theme

Sumber: `ref/color_palette.png` → diterapkan di **`ref/theme.css`** (token shadcn, light + dark).
Salin ke `src/index.css` saat scaffold.

| Nama | Hex | Pemakaian |
|------|-----|-----------|
| Midnight | `#010736` | Teks utama (light), background (dark) |
| Navy | `#0D1C42` | Sidebar, card (dark) |
| Royal | `#22396F` | Primary, tombol, link, grafik utama |
| Cream | `#FCF1D0` | Background hangat (light), teks (dark), highlight |

Gaya: banyak ruang kosong, border tipis, radius 12px, bayangan hampir tidak ada, font **Inter**.
Warna status terpisah: hijau (paid/done), kuning (pending), merah (failed/cancelled), biru (processing).

---

## 4. Struktur Halaman (mobile-first)

```
/login                  Tombol "Masuk dengan Google"
/                       Beranda: kartu ringkas (order hari ini, perlu approval, omzet) — owner
                        Tugas saya — karyawan
/orders                 Daftar order (kartu di HP, tabel di desktop) + filter status/tanggal
/orders/:id             Detail: item, customer, pembayaran [Approve][Reject], assign, timeline
/sales                  Grafik penjualan: omzet harian/mingguan, top produk, per metode checkout (owner)
/customers              Daftar customer + total belanja (owner)
/products               Produk & stok (owner edit, karyawan lihat)
/team                   Karyawan: undang email, aktif/nonaktif, beban kerja (owner)
```

**Layout responsif**
- HP: **bottom navigation** (Beranda · Order · Penjualan · Menu), daftar order berupa kartu, detail sebagai halaman penuh.
- Tablet/desktop: **sidebar** collapsible (shadcn `Sidebar`), order berupa tabel + panel detail.
- Breakpoint Tailwind standar; desain dimulai dari 360px.

---

## 5. Auth & Role

1. Owner klik **Masuk dengan Google** → Supabase OAuth → sesi JWT.
2. Setelah login, FE memanggil `GET /admin/me`; API mencocokkan `email` Google ke tabel `users`
   (sumber `tenant_id` + `role`). Email tidak terdaftar → ditolak ("Hubungi owner").
3. Owner pertama dibuat saat onboarding tenant (seed). Karyawan **diundang owner** (input email di `/team`),
   lalu login dengan Google juga — tanpa password.
4. Role: `OWNER` (semua) · `STAFF` (order miliknya + produk read-only). RLS + pengecekan di Fastify.

**Perubahan skema yang dibutuhkan** (`packages/db/prisma/schema.prisma`):
- `User.passwordHash` → opsional (login via Google).
- `User.authUserId` (uuid Supabase), `User.isActive`.
- Tabel baru `order_events` (timeline: siapa approve/reject, penugasan, perubahan status) — `add_order_events.sql`. Pelaku & alasan reject disimpan di sini, bukan di kolom `payments`.
- `Order.assignedTo` sudah ada → pakai apa adanya.

---

## 6. Alur Order, Pembayaran & Auto-Assign

```
AI Agent menutup deal ──► INSERT orders (pending_payment) + payments (pending)
                              │  Supabase Realtime
                              ▼
                   Dashboard: order baru muncul
                              │
        Pembayaran masuk (QRIS/transfer) ── status payment: pending → "perlu verifikasi"
                              │
                 Owner / karyawan klik [Approve]
                              ▼
             API: payment=paid, order=paid, catat activity_log
                              │
                         AUTO-ASSIGN
                              ▼
            order.assignedTo = karyawan aktif dengan order terbuka paling sedikit
            (seri → round-robin berdasar penugasan terakhir)
                              │
        Karyawan: processing → shipped → done   (setiap perubahan tercatat di timeline)
```

Aturan auto-assign v1.0 (sederhana, bisa diubah owner):
- Hanya karyawan `isActive = true`.
- Pilih yang **jumlah order `paid`/`processing` terbuka paling sedikit**.
- Owner dapat **override** manual di detail order; tidak ada karyawan aktif → order tetap *belum ditugaskan*.
- Dijalankan di Fastify, di transaksi yang sama dengan approve (cegah double-assign).

**Endpoint Fastify (baru, prefix `/admin`, semua butuh Bearer JWT Supabase):**

| Method | Path | Fungsi |
|--------|------|--------|
| GET | `/admin/me` | Profil + role + tenant |
| GET | `/admin/orders?status=` | Daftar order (staff: miliknya + belum ditugaskan) |
| GET | `/admin/orders/:id` | Detail order + item + pembayaran |
| POST | `/admin/payments/:id/approve` | Approve → payment & order PAID + auto-assign |
| POST | `/admin/payments/:id/reject` | Reject + alasan → order CANCELLED, stok dikembalikan |
| POST | `/admin/orders/:id/assign` | Override penugasan (owner) |
| PATCH | `/admin/orders/:id/status` | Maju satu langkah: PAID→PROCESSING→SHIPPED→DONE |
| GET | `/admin/assignees` | Daftar petugas untuk dropdown (owner) |
| GET | `/admin/stats/sales?range=` | Agregat grafik (omzet, jumlah order, top produk) |
| POST/PATCH | `/admin/team` | Undang & aktif/nonaktifkan karyawan (owner) |

---

## 7. Struktur Folder

```
ADMIN_PANEL_WIRA/
├── ref/                  # palet & theme.css
├── src/
│   ├── components/ui/    # shadcn
│   ├── components/       # OrderCard, StatusBadge, PaymentActions, SalesChart, BottomNav
│   ├── routes/           # halaman (lihat §4)
│   ├── lib/              # supabase client, api client, utils
│   ├── hooks/            # useOrders, useSession, dst. (TanStack Query)
│   └── index.css         # import ref/theme.css
├── index.html
├── vite.config.ts
└── README.md
```
Backend: tambah `apps/api/src/routes/admin/*` + `services/assign.ts` di repo AI_STARTUP.

---

## 8. Roadmap Eksekusi

| Tahap | Hasil | Estimasi |
|-------|-------|----------|
| **0. Setup** | Scaffold Vite + Tailwind + shadcn, pasang theme, kerangka layout (sidebar/bottom-nav) | 0.5 hari |
| **1. Auth** | Google OAuth di Supabase, `/admin/me`, route guard per role, migrasi skema User | 1 hari |
| **2. Order** | RLS + list/detail order, filter, realtime | 1.5 hari |
| **3. Pembayaran & assign** | Approve/reject, auto-assign, update status, timeline log | 1.5 hari |
| **4. Owner insight** | Beranda ringkas, grafik penjualan, customer, produk, team | 1.5 hari |
| **5. Polish & deploy** | Uji di HP nyata, empty/loading state, deploy | 1 hari |

---

## 9. Setup yang Perlu Disiapkan (sekali)

1. Supabase → *Authentication → Providers → Google*: isi Client ID/Secret dari Google Cloud Console
   (redirect URI: `https://<project>.supabase.co/auth/v1/callback`).
2. Env FE (`.env`): `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_API_URL`.
3. Env API: `SUPABASE_JWT_SECRET` (verifikasi token), CORS izinkan domain dashboard.
4. Aktifkan **Realtime** untuk tabel `orders` dan `payments`; tulis kebijakan **RLS** per `tenant_id`.

## 10. Keputusan Terbuka (default yang saya pakai bila tidak ada keberatan)

- Verifikasi pembayaran: **manual approve** oleh owner/karyawan (QRIS statis). Auto-approve via Midtrans webhook ditunda.
- Satu owner per tenant di v1.0; karyawan tanpa batas.
- Bahasa UI: Indonesia.
- Karyawan boleh approve pembayaran (sesuai permintaan: "employee dan owner bisa approve").
