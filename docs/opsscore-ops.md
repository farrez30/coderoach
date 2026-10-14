# OpsScore — panduan operasional

Brief dan aturan skor: [`opsscore-brief.md`](./opsscore-brief.md). Dokumen ini menjelaskan cara menjalankan fitur setelah rilis.

## Peta file

| Yang diubah | File |
| --- | --- |
| Pertanyaan, opsi, area, opsi profil | `src/lib/opsscore/questions.ts` |
| Urutan layar, posisi layar profil | `src/lib/opsscore/flow.ts` |
| Validasi profil, alamat website, format nomor WA, email | `src/lib/opsscore/profile.ts`, `phone.ts`, `email.ts`, `email-server.ts` |
| Rate limit, origin check, upsert lead | `src/lib/opsscore/api.ts` |
| Turnstile | `src/lib/turnstile.ts`, `_components/TurnstileField.tsx` |
| Bobot, ambang fase, aturan prioritas dan kelas layanan | `src/lib/opsscore/scoring.ts` |
| Semua teks: fase, feedback, tindakan, fakta sekilas, benchmark, landing, quiz, gate, report, admin | `src/lib/opsscore/copy.ts` |
| Estimasi benchmark per bidang, ambang 30 sesi | `src/lib/opsscore/benchmark.ts` |
| Langkah naik fase, pilihan quick win dan area rencana 90 hari | `src/lib/opsscore/plan.ts` |
| Adegan animasi kartu skor per bagian di kuis | `_components/SectionScene.tsx`, `scene-engine.ts` |
| Gambar karakter fase: landing, hasil, share, gate, OG | `public/assets/opsscore/phase-{1..4}.webp`, `_components/PersonaHero.tsx` ([prompt-nya](opsscore-phase-art.md)) |
| Diagram kecil di daftar benefit landing | `_components/BenefitVisual.tsx` |
| Nama produk, slug, `INSTRUMENT_VERSION` | `src/lib/opsscore/config.ts` |
| Route publik | `src/app/(frontend)/opsscore/` |
| API sesi, gate, CSV | `src/app/(frontend)/api/opsscore/` |
| Admin | `src/components/admin/OpsScoreView.tsx` |
| Koleksi Payload | `src/collections/AssessmentSessions.ts`, `AssessmentLeads.ts` |

Baris copy bertanda `// REVIEW` masih draf dan perlu dibaca manusia. Keputusan yang belum final ditandai `TODO(decision)` di kode.

## Membaca admin

Buka `/admin/opsscore` (login Payload biasa). Link-nya ada di navigasi admin, grup **OpsScore**.

**Kotak funnel (7 dan 30 hari terakhir)**

| Angka | Arti | Kill criteria di brief |
| --- | --- | --- |
| Mulai | Sesi yang dibuat (klik Mulai di quiz) dalam jendela waktu | — |
| Selesai | Dari sesi tersebut, yang menyelesaikan quiz | — |
| Isi gate | Dari sesi tersebut, yang mengisi nomor WA | — |
| Completion rate | Selesai ÷ Mulai | < 25% → potong pertanyaan |
| Gate conversion | Isi gate ÷ Selesai | < 30% → geser gate atau ubah copy |

Angka dihitung per kohort: semua sesi yang **mulai** dalam 7 atau 30 hari terakhir, lalu berapa di antaranya yang selesai dan mengisi gate. Karena itu rate tidak pernah lebih dari 100%, dan sesi yang baru mulai hari ini bisa saja belum selesai.

**Tabel lead**

- Lead dibuat begitu pengunjung selesai mengisi nama dan nama usaha, lalu terisi bertahap. Jadi tabel juga memuat orang yang berhenti di tengah; kolom **Progres** menunjukkan sampai mana ("Berhenti di Keuangan & kas", "Selesai, belum isi WA", "Isi WA"). Hanya baris dengan WA yang bisa dihubungi.
- Filter: omset ≥ 50 jt, sudah isi WA, fase, dan status follow-up. Urutan terbaru dulu.
- Kolom WA langsung membuka `wa.me`. Status follow-up tersimpan begitu dropdown diganti.
- **Buka** menampilkan detail sesi: kontak, UTM, waktu mulai/selesai/gate, skor per area, prioritas beserta tindakannya, dan semua jawaban mentah. Baca ini sebelum menghubungi.
- **Ekspor CSV** mengunduh lead sesuai filter yang aktif. File memakai UTF-8 dengan BOM, jadi bisa langsung dibuka di Google Sheets atau diimpor ke Notion.

Brief yang dikirim dari tombol CTA report masuk ke **Inbox → Submissions** seperti biasa. Field `assessmentSession` di sidebar menunjuk ke sesinya.

## Alur quiz dan autosave

| Bagian | Layar |
| --- | --- |
| Intro | Nama → nama usaha (dengan sapaan) |
| Penjualan & prospek | Bidang usaha → A1–A4 → skor Penjualan & prospek |
| Operasional & stok | B1–B4 → D0 (–D2) → skor Operasional harian dan Stok & pembelian |
| Keuangan & kas | Omset → C1–C4 → skor Keuangan & kas |
| Tim & peran owner | Jumlah karyawan → E1–E3 → F1–F3 → skor Tim & SDM dan Ketergantungan owner |
| Digitalisasi & AI | G1–G3 → H1–H3 → skor Kehadiran online dan Kesiapan AI |
| Hasil | Pratinjau terkunci + gate nomor WA → skor, fase, dan report lengkap |

Bagian hanya mengelompokkan layar. Skor, prioritas, report, dan admin tetap per 8 area. Kalau D0 = Tidak, D1–D2 dan skor stok dilewati, tapi bagian Operasional & stok tetap ada.

Penyimpanan berjalan tanpa terlihat oleh pengunjung:

- Setiap perubahan disimpan di localStorage perangkat, untuk tawaran "Lanjutkan dari …".
- Jawaban dan profil dikirim ke server setiap satu bagian selesai, dan sekali lagi saat tab disembunyikan atau ditutup. Kalau pengiriman gagal, dicoba lagi di kesempatan berikutnya.
- Nomor WA hanya dikirim di gate dan tidak pernah disimpan di localStorage.

Urutan bagian, area di tiap bagian, dan layar profil pembukanya diatur di `SECTIONS` (`flow.ts`); teksnya di `PROFILE_COPY` (`copy.ts`). Kalimat versi Jasa untuk A4 dan H2 ada di `promptJasa` (`questions.ts`). Contoh atau analogi di bawah setiap pertanyaan ada di field `hint` (`questions.ts`); test gagal kalau ada pertanyaan tanpa `hint`.

Adegan animasi di kepala kartu skor ada di `SectionScene.tsx`, satu per bagian; kondisinya mengikuti skor area. Sebelum nomor WA diisi, halaman hasil hanya menampilkan pratinjau terkunci (`LockedResult.tsx`) dan form gate.

## Mengubah bobot atau ambang

1. Ubah konstanta di `src/lib/opsscore/scoring.ts`.
2. Naikkan `INSTRUMENT_VERSION` di `src/lib/opsscore/config.ts` (1 → 2).
3. Jalankan `npm test`. Test lima profil sintetis akan gagal kalau hasilnya berubah; perbarui angka di test dengan sadar, jangan sekadar disamakan.
4. Catat perubahan dan alasannya di `docs/opsscore-brief.md`.

Apa yang terjadi setelah versi naik:

- Sesi lama tetap menyimpan `scores` dan `instrumentVersion` saat itu. Report lama tidak berubah.
- Progres quiz yang tersimpan di browser memakai kunci per versi, jadi pengunjung dengan progres versi lama mulai dari awal.
- Jawaban mentah (`answers`) selalu tersimpan. Kalau perlu menghitung ulang sesi lama dengan aturan baru, pakai `scoreAnswers()` di skrip terpisah dan simpan hasilnya di tempat lain, jangan menimpa `scores` historis.

## Menambah atau mengubah pertanyaan

1. Tambahkan pertanyaan di `QUESTIONS` (`questions.ts`), di dalam blok area yang benar. Urutan di array = urutan di quiz; urutan area dan bagian mengikuti `SECTIONS` (`flow.ts`).
2. Untuk `single`, tulis opsi dari skor 0 ke skor tertinggi. Jumlah opsi menentukan skor maksimum.
3. `id` pertanyaan dan `id` opsi yang sudah dipakai jangan diganti. Itu yang tersimpan di `answers`, dan admin memakainya untuk menampilkan label.
4. Pertanyaan berskor wajib punya kalimat tindakan di `ACTIONS` (`copy.ts`); test akan gagal kalau belum. Kalimat yang sama dipakai di "Langkah naik fase".
5. Naikkan `INSTRUMENT_VERSION`, perbarui test jumlah pertanyaan di `scoring.test.ts`, lalu jalankan `npm test`.
6. Cek layar pertanyaan baru di ukuran 360×640 tanpa scroll.

Mengganti teks pertanyaan atau label opsi tanpa mengubah urutan dan jumlahnya tidak mengubah skor, jadi tidak perlu naik versi.

## Gambar share (OG)

Empat gambar statis ada di `public/assets/opsscore/og-fase-{1..4}.png`, memakai gambar karakter `phase-{1..4}.webp`. Setelah mengubah `PHASE_COPY` atau gambar karakternya, render ulang:

```bash
npm run opsscore:og
```

Butuh Google Chrome. Kalau Chrome tidak di lokasi default macOS, set `CHROME_PATH`.

## Keamanan form

Lapisan yang sudah terpasang di jalur kuis, gate, dan form brief:

- **Cloudflare Turnstile** di form gate dan form brief. Mati selama `NEXT_PUBLIC_TURNSTILE_SITE_KEY` dan `TURNSTILE_SECRET_KEY` kosong, jadi aman dipakai sebelum key-nya diisi. Mode `interaction-only`: pengunjung normal tidak melihat apa pun. Kalau Cloudflare tidak bisa dihubungi, submit tetap diloloskan supaya lead tidak hilang karena gangguan di luar kita.
- **Rate limit per IP** di memori proses: buat sesi 10, autosave 120, complete 30, gate 10 per 10 menit. Hitungannya ikut reset tiap deploy, dan itu disengaja. Versi yang disimpan di database pernah dicoba pada 18 September 2026 dan dicabut lagi: menjadikannya koleksi Payload membuat setiap penulisan dokumen ikut join ke tabelnya, dan skema production yang dikelola dev push tidak punya kolom relasinya, sehingga kuis gagal di langkah terakhir. Untuk pembatas yang tahan restart, pakai **rate limiting rule di Cloudflare**: request ditolak di edge sebelum sampai ke aplikasi.
- **Origin check**: POST dari situs lain ditolak 403. Request tanpa header Origin diserahkan ke rate limit.
- **Honeypot** `company_url` di kedua form: kalau terisi, server menjawab sukses tanpa menyimpan apa pun.
- **Batas body** 32 KB dan hanya JSON object; id sesi wajib berformat UUID.
- **Nomor WA** wajib format Indonesia, dan nomor isian asal seperti `081111111111` atau `081234567890` ditolak (`phone.ts`).
- **Email** opsional, tapi kalau diisi: formatnya divalidasi, domain sekali pakai ditolak, domain tanpa MX record ditolak, dan salah ketik seperti `gmial.com` ditawarkan koreksinya di form.
- **Nomor berulang**: kalau nomor yang sama sudah pernah masuk dari sesi lain, lead-nya ditandai `repeatContact`. Tidak diblokir, hanya ditandai untuk tim.
- **Security header** di semua halaman: CSP (kecuali `/admin` dan `/api`), `X-Content-Type-Options`, `Referrer-Policy`, `X-Frame-Options`, `Permissions-Policy`, dan HSTS di production.

Menyalakan Turnstile:

1. Cloudflare → Turnstile → Add site, domain `coderoach.id`, widget mode **Managed**.
2. Isi `NEXT_PUBLIC_TURNSTILE_SITE_KEY` dan `TURNSTILE_SECRET_KEY` di variabel service `web` Railway, lalu deploy ulang (site key dibaca saat build).
3. Cek di halaman gate: normalnya tidak ada widget yang terlihat, dan submit tetap jalan.

Retensi data:

```bash
npx tsx --env-file=.env.local scripts/opsscore-prune.ts             # lihat dulu
npx tsx --env-file=.env.local scripts/opsscore-prune.ts --apply     # hapus
```

Menghapus sesi yang tidak pernah sampai gate dan lebih tua dari 12 bulan, beserta lead parsialnya. Sesi yang sudah gated tidak disentuh.

Rate limiting rule yang disarankan di Cloudflare (plan gratis dapat satu rule): path `/api/opsscore/*`, 30 request per menit per IP, aksi Block. Sisanya di dashboard: Cloudflare Access untuk mengunci `/admin`.

Pelajaran yang jangan diulang: skema production dikelola lewat dev push, bukan migrasi, jadi **menambah koleksi Payload baru berarti menambah kolom relasi di `payload_locked_documents_rels` juga**. Kalau kolom itu tidak ikut dibuat di production, semua penulisan dokumen gagal. Untuk data yang bukan dokumen, jangan dijadikan koleksi.

## Tracking

Isi di environment (variabel service `web` Railway dan `.env.local`):

```
NEXT_PUBLIC_GA4_ID=G-XXXXXXXXXX
NEXT_PUBLIC_META_PIXEL_ID=123456789012345
```

Tanpa ID, script tidak dimuat dan semua event diam-diam dilewati. Di mode dev setiap event juga tercetak di console (`[opsscore] track …`).

| Event | Kapan | Parameter |
| --- | --- | --- |
| `assessment_view` | Landing dimuat | utm_source, utm_medium, utm_campaign |
| `assessment_start` | Klik Mulai di quiz | session_id |
| `assessment_area_done` | Layar skor bagian tampil, sekali per area di bagian itu. `index` mengikuti urutan tampil (stok 3, keuangan 4; tanpa stok, keuangan 3) | area, index |
| `assessment_complete` | Halaman hasil terkunci tampil setelah quiz (sekali per sesi) | fase, total |
| `assessment_gate_submit` | Gate terkirim — di Meta dikirim sebagai `Lead` | fase, revenue_band |
| `assessment_pdf` | Klik Simpan PDF | fase |
| `assessment_cta_brief` | Klik CTA brief | fase, kelas |

Cara memeriksa setelah deploy:

- **GA4**: Admin → DebugView, dengan ekstensi Google Analytics Debugger aktif atau parameter `debug_mode`.
- **Meta**: Events Manager → Test Events, masukkan URL situs.

UTM (`utm_*`, `fbclid`, `gclid`) dan referrer eksternal disimpan di cookie `opsscore_attr` selama 30 hari saat landing atau quiz dibuka, lalu disalin ke `assessment_sessions.utm` ketika sesi dibuat. Tombol CTA di halaman share menambahkan `utm_source=opsscore_share`.

## Benchmark

Halaman hasil membandingkan skor pengisi dengan rata-rata usaha sebidang ("Gambaran kompetisi").

- Sampai ada 30 sesi selesai di satu bidang, angkanya estimasi dari `benchmark.ts`, dengan label "estimasi" dan daftar sumber di akhir halaman. Setelah itu rata-rata asli dipakai otomatis, dihitung ulang paling lama tiap satu jam.
- Sesi uji atau internal: buka lead-nya di **OpsScore → Assessment leads** dan centang **Exclude from benchmark**.
- Mengubah estimasi: edit `ESTIMATES` di `benchmark.ts`. Fakta per bidang ada di `INDUSTRY_FACTS`, fakta sekilas di kartu skor quiz di `SECTION_FACTS`, sumber di `BENCHMARK_SOURCES` (semuanya `copy.ts`). Setiap angka baru harus bisa ditunjukkan sumbernya.

## Deploy (Railway)

Situs berjalan di project Railway **coderoach-web** (workspace Coderoach):

| Service | Isi |
| --- | --- |
| `web` | Deploy otomatis dari branch `main` di GitHub. Build `npm run build`, start `npm run start`, healthcheck `/api/health` (`railway.json`), yang membaca satu baris dari setiap collection dan global, sehingga build yang butuh kolom yang belum di-push gagal dan tidak dipromosikan. Volume di `/app/media` untuk upload Media. |
| `Postgres` | PostgreSQL 18, hanya jaringan privat (tanpa akses publik). |

Variabel `web`: `DATABASE_URI` (`${{Postgres.DATABASE_URL}}`), `NEXT_PUBLIC_SERVER_URL` (`https://${{RAILWAY_PUBLIC_DOMAIN}}`), `NEXT_PUBLIC_SITE_NAME`, `PAYLOAD_SECRET`, `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `RESEND_TO_EMAIL`, dan opsional `NEXT_PUBLIC_GA4_ID` serta `NEXT_PUBLIC_META_PIXEL_ID`. Variabel `NEXT_PUBLIC_*` dibaca saat build, jadi redeploy setelah mengubahnya.

- Membuka database dari laptop: `railway connect Postgres` (lewat SSH, butuh SSH key terdaftar di Railway). Untuk operasi panjang seperti restore, jalankan perintahnya di dalam container: `cat file.dump | railway ssh --service Postgres -- 'pg_restore -U postgres -d railway ...'`.
- Build tidak bisa menjangkau jaringan privat Railway, jadi tidak ada halaman yang boleh membaca database saat build. Halaman dan route yang membaca Payload memakai `export const dynamic = 'force-dynamic'`, dan `generateStaticParams` mengembalikan daftar kosong kalau database tidak terjangkau. Sebelum menambah halaman statis, cek tidak ada query Payload di jalurnya, termasuk `SectionShell` yang ikut dirender lewat `not-found.tsx`. Build tetap butuh `PAYLOAD_SECRET`.

## Database

- Data dipindah dari Neon ke Postgres Railway pada 2026-09-17 (skema `public` saja; skema `neon_auth` milik Neon tidak dipakai aplikasi).
- Skema DB diperbarui lewat dev push Payload, bukan migrasi: tabel `payload_migrations` hanya berisi baris `dev`. Jangan jalankan `npm run migrate` di production tanpa menandai migrasi lama sebagai sudah jalan; Payload akan memperingatkan kehilangan data. Untuk perubahan skema, jalankan `npm run dev` dengan `DATABASE_URI` yang mengarah ke database production (lewat `railway connect Postgres --tunnel-only`), atau pindah ke migrasi.
- Menghapus sesi di admin (**OpsScore → Assessment sessions**) ikut menghapus lead-nya.

## Sebelum rilis

- [ ] Hapus sesi dan lead uji dari DB.
- [ ] Baca semua baris `// REVIEW` di `copy.ts`, termasuk 22 kalimat tindakan.
- [ ] Cocokkan angka sub-industri di `INDUSTRY_FACTS` (Fashion, Kriya, Kuliner) dengan PDF BPS Profil IMK 2024 dan Statistik Penyediaan Makanan dan Minuman 2024.
- [ ] Putuskan setiap `TODO(decision)` (lihat `rg "TODO\(decision\)" src`).
- [ ] Isi `NEXT_PUBLIC_GA4_ID` dan `NEXT_PUBLIC_META_PIXEL_ID` di variabel service `web` Railway, deploy ulang, lalu cek event di DebugView dan Test Events.
- [ ] Uji di Safari iOS dan Chrome Android, termasuk "Simpan sebagai PDF" dan "Bagikan → Cetak".
- [ ] Putuskan tautan ke `/opsscore` di navigasi atau footer.
