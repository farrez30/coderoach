# Portofolio /work — operasi

Peta berkas, aturan izin, dan urutan kerja untuk mengubah portofolio di coderoach.id/work.
Keputusannya ada di `docs/decisions/0001`–`0010`.

## Peta berkas

| Berkas | Isi |
| --- | --- |
| `src/lib/portfolio/projects.ts` | Sumber isi portofolio. Disinkronkan ke Payload, tidak diisi di admin. |
| `src/lib/portfolio/consent.ts` | Jenis izin: `studio`, `legacy`, atau ref `IZN-YYYY-NNN` dari Coderoach OS. |
| `src/lib/portfolio/legacy-baseline.ts` | Yang sudah tayang per 14 Okt 2026. Hanya boleh menyusut. |
| `src/lib/portfolio/metrics.ts` | Bentuk angka bersumber: nilai, satuan, tanggal, metode, sumber, izin. |
| `src/lib/portfolio/taxonomy.ts` | Daftar bidang untuk Projects dan Clients (nilainya sama dengan `klien.bidang` di Coderoach OS). |
| `src/lib/linkcheck/` | Pemeriksa link live beserta pagar SSRF-nya. |
| `src/lib/schema/` | Tes bahwa skema Payload hanya bertambah (`baseline.json`). |
| `scripts/portfolio-assets/` | Gambar dan video sumber. Nama berkas berversi: `laporta-tour.v1.mp4`. |

## Aturan izin

Repo ini publik. Apa pun yang di-commit dianggap sudah terbit.

- **Angka, logo, nama, tangkapan, testimoni, video, dan link klien hanya masuk dengan izin
  tercatat.** Izin dicatat di Coderoach OS (menu klien → Izin portofolio): siapa yang memberi,
  tanggal, lewat apa, dan buktinya. Di sini hanya ref-nya (`IZN-2026-001`).
- **Data yang belum berizin tidak di-commit sama sekali**, termasuk di komentar atau branch.
  Simpan di luar repo sampai izinnya ada.
- **`legacy` hanya untuk yang sudah tayang sebelum aturan ini.** Studi kasus klien berstatus
  legacy boleh ditulis ulang, tapi tidak boleh mendapat angka atau gambar baru. `npm test`
  menagihnya.
- **Angka target tidak ditulis sebagai hasil.** `status: 'target'` selalu tampil sebagai "Target …".
- **Setiap angka membawa sumber:** `sourceRef` (`repo@commit` atau path dokumen) atau `verifyUrl`
  publik, plus tanggal ukur dan metode dalam satu kalimat.

Pasang hook supaya tes jalan sebelum commit (repo ini tanpa CI):

```bash
git config core.hooksPath .githooks
```

## Menambah atau mengubah proyek

1. Ubah `projects.ts`. Aset baru masuk ke `scripts/portfolio-assets/` dengan nama baru (sync tidak
   pernah mengunggah ulang berkas dengan nama yang sama).
2. `npm test`.
3. Lokal: `npx tsx --env-file=.env.local scripts/portfolio-sync.ts`, lalu `--apply`.
4. Produksi, setelah deploy:
   `railway ssh --service web -- "npx tsx scripts/portfolio-sync.ts"`, periksa hasilnya, lalu
   ulangi dengan `--apply`.

## Mengubah skema (urutan wajib)

Skema produksi diubah dengan dev push, bukan migrasi (`docs/opsscore-ops.md`, bagian Database), dan
Railway auto-deploy `main`. Kode yang membutuhkan kolom yang belum ada akan gagal di setiap
halaman, jadi **push dilakukan sebelum merge**. Healthcheck `/api/health` membaca setiap collection
dan global, sehingga deploy yang terlanjur naik tanpa push gagal dan versi lama tetap melayani.

1. Hanya perubahan additive. `npm test` menolak kolom yang dihapus, diganti nama, berganti tipe,
   menjadi wajib, atau opsi select yang berkurang.
2. Gladi di DB lokal yang skemanya disalin dari produksi (dump **skema saja**, tanpa data):
   `npm run dev` di `main` harus "No changes", dan di branch harus tanpa prompt.
3. Sebelum merge, oleh wafi atau farrez dengan izin wafi:
   - backup: `railway ssh --service Postgres -- 'pg_dump -U postgres -Fc railway' > backup-YYYYMMDD.dump`;
   - `railway connect Postgres --tunnel-only`, lalu arahkan `DATABASE_URI` di `.env.local` ke tunnel itu;
   - `npm run dev` di head PR, buka `/admin` untuk memicu push. **Kalau muncul prompt apa pun, jawab
     No dan berhenti.**
   - matikan dev server, lalu kembalikan `DATABASE_URI` ke lokal.
4. Merge. Railway membangun, `/api/health` lolos, dan versi baru dipromosikan.
5. Sync portofolio (dry run, lalu `--apply`), kemudian landing sync.
6. `npm run schema:baseline`, lalu commit `baseline.json` baru.

Rollback lewat kode (revert), tidak pernah dengan "un-push" skema.
