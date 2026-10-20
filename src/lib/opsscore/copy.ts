/**
 * OpsScore report copy (docs/opsscore-brief.md §6). Components read every string from here or
 * from questions.ts. Lines marked `// REVIEW` are drafts written during the build and need a human
 * pass before release; everything else is taken verbatim from the brief.
 */
import type { IndustryId } from './benchmark';
import type { SectionId } from './flow';
import type { AreaId } from './questions';
import type { Band, Phase, ServiceClass } from './scoring';

/**
 * The four phases as personas: an English name with an Indonesian nickname, what the stage does well,
 * and what holds it back. `name` is the short label on the phase ladder; `data` says where data lives.
 */
export const PHASE_COPY: Record<
  Phase,
  { name: string; title: string; nickname: string; data: string; key: string; strength: string; blocker: string }
> = {
  1: {
    name: 'Juggler',
    title: 'The Juggler', // REVIEW
    nickname: 'Si Paling Hafal', // REVIEW
    data: 'data di kepala',
    key: 'Bisnis Anda berjalan di kepala Anda. AI belum bisa membantu karena belum ada yang bisa dibaca.',
    strength: 'Anda hafal detail bisnis dan bisa memutuskan dengan cepat.', // REVIEW
    blocker: 'Semuanya bergantung pada ingatan Anda. Kalau Anda berhenti, bisnis ikut berhenti.', // REVIEW
  },
  2: {
    name: 'Connector',
    title: 'The Connector', // REVIEW
    nickname: 'Si Paling Fast Response', // REVIEW
    data: 'data di chat',
    key: 'Datanya ada, berserakan di ratusan grup WA. Kalau ditanya, harus scroll.',
    strength: 'Tim responsif dan koordinasi jalan cepat lewat chat.', // REVIEW
    blocker: 'Angka penting tenggelam di ratusan pesan dan harus dicari dengan scroll.', // REVIEW
  },
  3: {
    name: 'Organizer',
    title: 'The Organizer', // REVIEW
    nickname: 'Si Paling Excel', // REVIEW
    data: 'data di spreadsheet',
    key: 'Anda sudah mencatat. Tapi setiap laporan masih butuh satu orang yang menyusunnya.',
    strength: 'Data sudah tercatat rapi dan bisa dicari.', // REVIEW
    blocker: 'Setiap laporan masih disalin dan disusun dengan tangan.', // REVIEW
  },
  4: {
    name: 'Autopilot',
    title: 'The Autopilot', // REVIEW
    nickname: 'Si Paling Siap AI', // REVIEW
    data: 'data di sistem',
    key: 'Data Anda sudah bisa dibaca mesin. AI tinggal disambungkan.',
    strength: 'Data mengalir sendiri dan bisa dibaca mesin.', // REVIEW
    blocker: 'Tinggal satu langkah: sambungkan AI ke data Anda.', // REVIEW
  },
};

/** Mini-feedback after each area in the quiz, reused as the diagnosis sentence in the report. */
export const AREA_FEEDBACK: Record<AreaId, Record<Band, string>> = {
  sales: {
    low: 'Prospek Anda hidup di chat. AI nggak bisa membaca yang nggak tercatat, dan sales Anda juga sering lupa.',
    mid: 'Prospek tercatat, tapi follow-up masih bergantung ingatan orang.',
    high: 'Pipeline Anda sudah rapi. Nggak perlu diapa-apain.',
  },
  ops: {
    low: 'Laporan Anda sampai, tapi telat dan bolong. Mesin nggak bisa belajar dari data yang bolong.',
    mid: 'Laporan masuk rutin, tapi masih perlu ditanya ulang. Kelengkapan belum dipaksa sistem.',
    high: 'Laporan lapangan Anda lengkap dan tepat waktu. Ini fondasi yang bagus.',
  },
  finance: {
    low: 'Angka laba yang datang dua minggu terlambat bukan data, tapi sejarah. AI butuh data hari ini.',
    mid: 'Kas tercatat, tapi piutang dan selisih masih ketahuan belakangan.',
    high: 'Keuangan Anda real time. Area ini sudah siap.',
  },
  stock: {
    low: 'Stok yang nggak ketahuan selisihnya nggak bisa diprediksi. Prediksi stok justru hal termudah buat AI, asal angkanya ada.',
    mid: 'Stok tercatat, selisih opname masih sering nggak terlacak sebabnya.',
    high: 'Stok Anda akurat. Prediksi tinggal disambungkan.',
  },
  people: {
    low: 'SOP di kepala orang lama itu risiko terbesar Anda. Bukan cuma buat AI, tapi buat kelangsungan bisnis.',
    mid: 'SOP ada, tapi belum dipaksa jalan oleh sistem.',
    high: 'Tim Anda terdokumentasi. Orang boleh ganti, prosesnya tetap.',
  },
  owner: {
    low: 'Anda adalah database bisnis Anda sendiri. Dan database ini nggak bisa di-backup.',
    mid: 'Sebagian keputusan sudah pakai angka, tapi angkanya masih Anda yang menyusun.',
    high: 'Bisnis jalan tanpa Anda di tengahnya. Ini yang dicari.',
  },
  web: {
    low: 'Calon pelanggan nggak bisa menemukan Anda, dan yang menemukan masuk ke WA pribadi.',
    mid: 'Website ada, tapi belum jadi sumber lead yang terukur.',
    high: 'Kehadiran online Anda sudah bekerja sebagai alat jual.',
  },
  // The brief has no row for ai.
  ai: {
    low: 'Pertanyaan bisnis Anda belum bisa dijawab tanpa mengumpulkan datanya dulu. AI akan mengalami hal yang sama.', // REVIEW
    mid: 'Datanya ada di satu file, tapi masih disusun tangan. AI butuh sumber yang terus terisi.', // REVIEW
    high: 'Data Anda sudah rapi di satu tempat. AI tinggal disambungkan.', // REVIEW
  },
};

/** Fixed closing line in the report, right before the CTA. */
export const REPORT_CLOSING =
  'AI yang Anda mau ada di jawaban terakhir Anda. Yang menghalanginya ada di tiga area di atas.';

/** Step 5 service classes — shown without prices. */
export const SERVICE_CLASS_COPY: Record<ServiceClass, { label: string; body: string }> = {
  'SYS-TOOL': {
    label: 'SYS-TOOL',
    body: 'Satu proses yang perlu dirapikan dulu. Biasanya 4–8 minggu.',
  },
  'SYS-DIV': {
    label: 'SYS-DIV',
    body: 'Satu divisi penuh yang perlu disistemkan. Biasanya 2–4 bulan.',
  },
  'SYS-OS': {
    label: 'SYS-OS',
    body: 'Rantai penuh dari penjualan sampai keuangan. Biasanya 4–8 bulan, didahului discovery.',
  },
  WEB: {
    label: 'WEB',
    body: 'Operasional Anda sudah rapi. Yang tertinggal adalah cara calon pelanggan menemukan Anda.',
  },
  READY: {
    label: 'READY',
    body: 'Anda sudah siap AI. Kalau mau membahas apa yang bisa diotomasi, kirim brief.',
  },
};

/** Report note when G1 = no website and G2 = no internet leads. */
export const WEB_NOTE = {
  label: 'Catatan WEB', // REVIEW
  body: 'Di luar tiga area di atas: calon pelanggan belum bisa menemukan Anda lewat internet. Ini bisa dikerjakan terpisah dari sistem operasional.', // REVIEW
};

export const CTA_COPY = {
  brief: 'Kirim brief, kami balas dalam 2 hari',
  automation: 'Bahas apa yang bisa diotomasi',
};

/**
 * One concrete action per scored question. A priority area shows the action for its
 * lowest-scoring question (Priority.focusQuestion), never a generic line.
 */
export const ACTIONS: Record<string, string> = {
  A1: 'Pindahkan setiap calon pelanggan yang bertanya ke satu daftar bersama: nama, kontak, tanggal, dan apa yang ditanyakan.', // REVIEW
  A2: 'Mulai dari satu daftar prospek dengan tanggal follow-up berikutnya, siapa pun yang mengisinya.', // REVIEW (example from the brief)
  A4: 'Catat tanggal transaksi terakhir setiap pelanggan, supaya yang lama tidak kembali bisa dilihat dalam satu filter.', // REVIEW
  B1: 'Ganti laporan harian lewat chat dengan satu format isian yang sama untuk semua outlet, tim, atau proyek.', // REVIEW
  B2: 'Tetapkan jam tutup laporan harian dan satu tempat angkanya dikumpulkan, supaya Anda tahu hasilnya hari itu juga.', // REVIEW
  B3: 'Jadikan kolom penting di format laporan wajib diisi, supaya laporan yang bolong tidak bisa terkirim.', // REVIEW
  B4: 'Pindahkan approval cuti, pengeluaran, dan diskon dari chat ke satu form yang mencatat siapa menyetujui dan kapan.', // REVIEW
  C1: 'Catat kas masuk dan keluar setiap hari di satu tempat, lengkap dengan kategorinya.', // REVIEW
  C2: 'Buat satu daftar piutang dengan tanggal jatuh tempo per pelanggan, dan periksa setiap minggu.', // REVIEW
  C3: 'Tetapkan tanggal tutup buku yang sama setiap bulan, lalu majukan pelan-pelan sampai laba bulan lalu diketahui dalam seminggu.', // REVIEW
  C4: 'Cocokkan kas fisik dengan catatan setiap tutup hari, supaya selisih ketahuan pada hari yang sama.', // REVIEW
  D1: 'Catat stok masuk dan keluar per lokasi di satu tempat, dengan nama barang dan satuan yang sama di semua catatan.', // REVIEW
  D2: 'Jadwalkan stock opname rutin dan tulis sebab setiap selisih, supaya polanya mulai terlihat.', // REVIEW
  E1: 'Pindahkan absensi dan jadwal shift ke satu tempat yang bisa dilihat tim, bukan diumumkan lewat grup.', // REVIEW
  E2: 'Minta setiap orang kunci menuliskan langkah kerjanya, mulai dari tugas yang paling sering ditanyakan orang lain.', // REVIEW
  E3: 'Pilih satu SOP yang paling sering dilanggar, tulis ulang jadi daftar periksa, dan pakai setiap hari.', // REVIEW
  F1: 'Kumpulkan pertanyaan tim yang berulang minggu ini, lalu buat jawabannya bisa mereka lihat sendiri.', // REVIEW
  F3: 'Pilih tiga angka yang paling menentukan keputusan Anda, dan pastikan ketiganya tersedia tanpa perlu disusun dulu.', // REVIEW
  G1: 'Mulai dari satu halaman yang menjelaskan apa yang Anda jual, untuk siapa, dan cara menghubungi Anda.', // REVIEW
  G2: 'Arahkan semua lead dari internet ke satu nomor atau inbox bersama, bukan ke WA pribadi.', // REVIEW
  G3: 'Mulai bulan ini, tanyakan dan catat dari mana setiap pelanggan baru datang: iklan, Google, atau referral.', // REVIEW
  H2: 'Satukan data penjualan dan biaya per produk atau layanan di satu tempat, sebelum memikirkan AI.', // REVIEW
};

/* ------------------------------------------------------------------ */
/* Interface copy. Tone follows the site: short sentences, no          */
/* exclamation marks, no emoji. Drafts are marked REVIEW.              */
/* ------------------------------------------------------------------ */

export const LANDING_COPY = {
  // SEO carries the searched words ("siap pakai AI", "AI readiness", "bisnis masih manual").
  metaTitle: 'Cek AI Readiness bisnis Anda: siap pakai AI atau belum?', // REVIEW
  metaDescription:
    'Assessment gratis untuk bisnis yang masih banyak manual. Lihat skor AI Readiness bisnis Anda, fase operasionalnya, dan tiga area yang perlu dirapikan sebelum pakai AI.', // REVIEW
  marker: '[ OPSSCORE ] · Cek AI Readiness', // REVIEW
  headline: {
    lead: 'Bisnis Anda siap pakai AI?', // REVIEW
    accent: 'Cek AI Readiness dulu.', // REVIEW (nbsp keeps the term on one line)
  },
  lede: 'AI itu langkah ketiga, bukan pertama. Urutannya tercatat, tersistem, baru AI. OpsScore mengukur AI Readiness bisnis Anda dari satu hal yang paling menentukan: di mana data operasional Anda hidup sekarang, apakah di kepala, di chat, di spreadsheet, atau di sistem.', // REVIEW
  getTitle: 'Yang Anda dapat', // REVIEW
  /** Each item is drawn with a small diagram; `visual` picks it (see BenefitVisual). */
  get: [
    {
      visual: 'phase',
      title: 'Fase AI Readiness Anda', // REVIEW
      body: 'Dari The Juggler sampai The Autopilot. Anda tahu persis ada di posisi mana sekarang.', // REVIEW
    },
    {
      visual: 'areas',
      title: 'Skor 0–100 untuk 8 area', // REVIEW
      body: 'Penjualan, stok, kas, tim. Kelihatan area mana yang paling menahan.', // REVIEW
    },
    {
      visual: 'benchmark',
      title: 'Posisi Anda vs usaha sejenis', // REVIEW
      body: 'Skor Anda dibanding rata-rata industri yang sama.', // REVIEW
    },
    {
      visual: 'steps',
      title: 'Tiga langkah prioritas', // REVIEW
      body: 'Konkret, bisa dikerjakan minggu ini. Lengkap dengan report PDF.', // REVIEW
    },
  ] as const,
  meta: ['27 pertanyaan', '±5 menit', 'Gratis'], // REVIEW
  cta: 'Mulai cek',
  phasesTitle: 'Empat fase AI Readiness', // REVIEW
  phasesHeadline: 'Bisnis Anda yang mana?', // REVIEW
  phasesLede:
    'Empat cara data bisnis hidup, dari semuanya di kepala sampai semuanya di sistem. Salah satunya Anda.', // REVIEW
  phaseRange: (from: number, to: number) => `${from}–${to}`,
};

export const QUIZ_COPY = {
  brand: 'OpsScore',
  introMarker: '[ OPSSCORE ] · 27 pertanyaan · ±5 menit', // REVIEW
  instruction: 'Jawab sesuai yang benar-benar terjadi, bukan yang seharusnya.',
  scaleTitle: 'Hampir semua pertanyaan menanyakan satu hal', // REVIEW
  scaleQuestion: 'Di mana data bisnis Anda hidup sekarang?', // REVIEW
  scaleNote: 'Pilih tempat yang paling sering dipakai, walau belum rapi.', // REVIEW
  start: 'Mulai',
  lastResult: 'Lihat hasil terakhir Anda', // REVIEW
  resumeTitle: 'Anda pernah mulai cek ini.', // REVIEW
  resumeBody: 'Jawaban Anda tersimpan di perangkat ini.', // REVIEW
  resume: (area: string) => `Lanjutkan dari ${area}`,
  restart: 'Mulai ulang',
  back: 'Kembali',
  next: 'Lanjut',
  nextArea: (area: string) => `Lanjut ke ${area}`,
  seeResult: 'Lihat hasil',
  multiHint: 'Boleh pilih lebih dari satu.', // REVIEW
  remaining: (minutes: number) => (minutes <= 1 ? '±1 menit lagi' : `±${minutes} menit lagi`), // REVIEW
  keyboardHint: 'tekan angka untuk memilih', // REVIEW
  nextUp: (section: string) => `Berikutnya: ${section}`, // REVIEW
  questionPosition: (index: number, total: number) => `Pertanyaan ${index} dari ${total}`,
  sectionCount: (index: number, total: number) => `Bagian ${index} dari ${total}`, // REVIEW
  questionCount: (index: number, total: number) => `${index}/${total}`,
  scoring: 'Menghitung hasil', // REVIEW
  console: {
    command: 'opsscore run',
    read: (count: number) => `membaca ${count} jawaban`, // REVIEW
    areas: (count: number) => `menghitung ${count} area`, // REVIEW
    phase: 'fase ditentukan', // REVIEW
    priorities: 'menyusun prioritas', // REVIEW
    done: 'report siap', // REVIEW
  },
  errorTitle: 'Hasil belum bisa dihitung.', // REVIEW
  errorBody: 'Cek koneksi internet, lalu coba lagi. Jawaban Anda tetap tersimpan.', // REVIEW
  retry: 'Coba lagi',
  progressLabel: 'Progres per area', // REVIEW
};

/** Profile screens inside the quiz. Name and business name open it; the rest open their sections. */
export const PROFILE_COPY = {
  name: {
    prompt: 'Siapa nama Anda?', // REVIEW
    placeholder: 'Nama Anda', // REVIEW
  },
  brand: {
    greeting: (firstName: string) => `Halo, ${firstName}.`, // REVIEW
    prompt: 'Apa nama usaha Anda?', // REVIEW
    placeholder: 'Nama brand atau usaha', // REVIEW
    hint: 'Nama yang dikenal pelanggan, tidak harus nama PT.', // REVIEW
  },
  industry: {
    prompt: (brand?: string) => (brand ? `${brand} bergerak di bidang apa?` : 'Bisnis Anda bergerak di bidang apa?'), // REVIEW
    hint: 'Pilih yang paling mendekati.', // REVIEW
  },
  revenue: {
    prompt: (brand?: string) =>
      brand ? `Kira-kira berapa omset ${brand} per bulan?` : 'Kira-kira berapa omset bisnis Anda per bulan?', // REVIEW
    hint: 'Hanya untuk mengelompokkan hasil. Tidak tampil di report.', // REVIEW
  },
  employees: {
    prompt: (brand?: string) =>
      brand ? `Berapa orang di tim ${brand} sekarang?` : 'Berapa orang di tim Anda sekarang?', // REVIEW
    hint: 'Hitung semua yang bekerja rutin, termasuk paruh waktu.', // REVIEW
  },
  website: {
    prompt: (brand?: string) =>
      brand ? `Di mana pelanggan menemukan ${brand} online?` : 'Di mana pelanggan menemukan Anda online?', // REVIEW
    placeholder: 'tokosaya.com atau instagram.com/tokosaya', // REVIEW
    hint: 'Website, marketplace, atau akun sosial. Kosongkan saja kalau belum ada.', // REVIEW
  },
};

export const RESULT_COPY = {
  metaTitle: 'Hasil OpsScore', // REVIEW
  marker: '[ OPSSCORE ] · Hasil', // REVIEW
  scoreLabel: 'AI Readiness bisnis Anda',
  scoreLabelFor: (brand?: string | null) => (brand ? `AI Readiness ${brand}` : 'AI Readiness bisnis Anda'), // REVIEW
  outOf: '/100',
  phaseOf: (phase: number) => `Fase ${phase} dari 4`,
  strengthLabel: 'Kekuatan', // REVIEW
  blockerLabel: 'Yang menahan', // REVIEW
  areasTitle: 'Skor per area', // REVIEW
  stockSkipped: 'Stok tidak dihitung karena bisnis Anda tidak pegang stok fisik.', // REVIEW
  incompleteTitle: 'Assessment ini belum selesai.', // REVIEW
  incompleteBody: 'Jawaban yang tersimpan di perangkat Anda bisa dilanjutkan.', // REVIEW
  continueQuiz: 'Lanjutkan cek', // REVIEW
};

/** The gate comes before any result: the page shows a locked preview until WhatsApp is given. */
export const GATE_COPY = {
  title: (brand?: string | null) => (brand ? `Hasil ${brand} sudah siap` : 'Hasil Anda sudah siap'), // REVIEW
  intro: 'Isi nomor WhatsApp untuk membuka skor, fase, dan report lengkapnya. Kami hubungi lewat WA hanya kalau Anda mau.', // REVIEW
  locked: 'Terkunci', // REVIEW
  lockedScore: 'Skor terkunci sampai nomor WhatsApp diisi.', // REVIEW
  phaseUnknown: 'Fase ? dari 4', // REVIEW
  phaseTeaser: 'Salah satu dari empat karakter ini adalah bisnis Anda.', // REVIEW
  unlockTitle: 'Terbuka setelah ini', // REVIEW
  unlocks: (areaCount: number) => [
    'Skor AI Readiness dan fase bisnis Anda',
    `Skor ${areaCount} area operasional`,
    'Area prioritas dan langkah pertamanya',
    'Report versi PDF',
  ], // REVIEW
  phoneLabel: 'Nomor WhatsApp',
  phonePlaceholder: '0812-3456-7890',
  emailLabel: 'Email (opsional)', // REVIEW
  emailPlaceholder: 'nama@bisnisanda.com', // REVIEW
  emailHint: 'Kami kirimkan salinan report ke email ini.', // REVIEW
  emailSuggestion: (fixed: string) => `Maksud Anda ${fixed}?`, // REVIEW
  consent: 'Saya setuju dihubungi Coderoach lewat WhatsApp tentang hasil ini.', // REVIEW
  submit: 'Buka hasil', // REVIEW
  submitting: 'Membuka hasil', // REVIEW
  errors: {
    email: 'Format email belum benar. Contoh: nama@bisnisanda.com.', // REVIEW
    emailDomain: 'Domain email itu tidak menerima email. Cek lagi ketikannya.', // REVIEW
    turnstile: 'Verifikasi keamanan gagal. Muat ulang halaman, lalu coba lagi.', // REVIEW
    turnstilePending: 'Sebentar, verifikasi keamanan masih berjalan.', // REVIEW
    turnstileMissing:
      'Verifikasi keamanan tidak termuat di browser ini. Matikan pemblokir untuk halaman ini lalu muat ulang, atau email kami di hello@coderoach.studio.', // REVIEW
    emailDisposable: 'Pakai email yang benar-benar Anda buka, bukan email sekali pakai.', // REVIEW
    required: 'Wajib diisi.', // REVIEW
    phone: 'Nomor WA diawali 08, 10–13 digit.', // REVIEW
    consent: 'Centang persetujuan untuk lanjut.', // REVIEW
    server: 'Belum bisa dikirim. Coba lagi sebentar.', // REVIEW
    rateLimited: 'Terlalu banyak percobaan. Coba lagi beberapa menit lagi.', // REVIEW
  },
};

/**
 * Quick facts under each section's score card in the quiz. Every figure is checked against its source
 * (BENCHMARK_SOURCES). "Penjual online" figures describe businesses that sell online, not all UMKM. Kept to
 * about 70 characters, so the caption stays at two lines on a 360px screen.
 */
export const SECTION_FACTS: Partial<Record<SectionId, { text: string; source: string }>> = {
  sales: {
    text: '9 dari 10 penjual online jualan lewat aplikasi chat. Lewat website cuma 1,4%.', // REVIEW
    source: 'BPS 2024',
  },
  operations: {
    text: 'Hanya 13,5% penjual online yang memakai komputer untuk menjalankan usaha.', // REVIEW
    source: 'BPS 2024',
  },
  finance: {
    text: '77% UMKM sudah mencatat keuangan, tapi 3 dari 4 masih mencatat manual.', // REVIEW
    source: 'OCBC NISP 2024',
  },
  team: {
    text: 'Hanya 3,6% penjual online yang pernah ikut pelatihan teknologi informasi.', // REVIEW
    source: 'BPS 2024',
  },
  digital: {
    text: '38% UKM sudah memakai AI, tapi baru 1 dari 10 yang terintegrasi penuh.', // REVIEW
    source: 'AWS 2026',
  },
};

/** Where similar businesses stand, on the results page (brief §8). */
export const BENCHMARK_COPY = {
  marker: 'Gambaran kompetisi', // REVIEW
  you: 'Skor Anda', // REVIEW
  /** `group` is "usaha Fashion" or one of the groups below. */
  average: (group: string, source: 'estimate' | 'sessions', count: number) =>
    source === 'estimate' ? `Estimasi rata-rata ${group}` : `Rata-rata ${count} ${group}`, // REVIEW
  nationalGroup: 'UMKM Indonesia', // REVIEW
  otherGroup: 'usaha bidang lain', // REVIEW
  areaAverage: 'rata-rata', // REVIEW
  gap: (points: number) =>
    points > 0
      ? `${points} poin di atas rata-rata usaha sejenis.`
      : points < 0
        ? `${-points} poin di bawah rata-rata usaha sejenis.`
        : 'Setara dengan rata-rata usaha sejenis.', // REVIEW
  estimateNote: 'Estimasi Coderoach dari data BPS, World Bank, OCBC NISP, dan AWS.', // REVIEW
  sessionsNote: (count: number) => `Dihitung dari ${count} usaha sebidang yang sudah menyelesaikan OpsScore.`, // REVIEW
  sourcesLink: 'Lihat sumber', // REVIEW
  areaLegend: (group: string, source: 'estimate' | 'sessions') =>
    `Garis tipis: rata-rata ${group}${source === 'estimate' ? ' (estimasi)' : ''}`, // REVIEW
  sourcesTitle: 'Sumber data pembanding', // REVIEW
  method:
    'Estimasi disusun dari profil jawaban usaha mikro dan kecil yang tipikal menurut data di bawah, lalu dihitung dengan rumus OpsScore yang sama. Setelah 30 usaha sebidang menyelesaikan OpsScore, angka ini diganti rata-rata asli mereka.', // REVIEW
};

/** One fact per industry next to the benchmark. Sub-industry rates are computed from BPS tables. */
export const INDUSTRY_FACTS: Record<IndustryId, string> = {
  produksi: 'Baru 46,8% industri mikro dan kecil yang memakai internet untuk usahanya (BPS 2024).', // REVIEW
  distribusi: '86,5% usaha yang jualan online belum memakai komputer untuk menjalankan usahanya (BPS 2024).', // REVIEW
  jasa: 'Baru 42,7% perusahaan jasa formal yang punya website sendiri (World Bank 2023).', // REVIEW
  retail: 'Perdagangan besar dan eceran menyumbang 31,9% usaha yang jualan online di Indonesia (BPS 2024).', // REVIEW
  kuliner: '52,7% usaha makan-minum memakai internet, tapi sebagian besar hanya untuk pembayaran (BPS 2024).', // REVIEW
  fashion: '61,7% usaha pakaian jadi skala mikro dan kecil memakai internet untuk usahanya (BPS 2024).', // REVIEW
  kriya: 'Baru 31,4% usaha kayu, bambu, dan rotan skala mikro dan kecil yang memakai internet (BPS 2024).', // REVIEW
  lainnya: 'Baru 42% usaha di Indonesia yang sudah jualan online (BPS 2024).', // REVIEW
};

export const BENCHMARK_SOURCES = [
  {
    name: 'BPS, Statistik E-Commerce 2024',
    url: 'https://www.bps.go.id/id/publication/2025/11/28/647323224ecc656c2933571b/statistik-e-commerce-2024.html',
  },
  {
    name: 'BPS, Profil Industri Mikro dan Kecil 2024',
    url: 'https://www.bps.go.id/id/publication/2025/09/16/a83f105e49377d0a7434e62a/profil-industri-mikro-dan-kecil-2024.html',
  },
  {
    name: 'BPS, Statistik Penyediaan Makanan dan Minuman 2024',
    url: 'https://www.bps.go.id/id/publication/2025/12/31/e46a55af756331ede8016b91/statistik-penyediaan-makanan-minuman-2024.html',
  },
  {
    name: 'World Bank, Enterprise Survey Indonesia 2023',
    url: 'https://www.enterprisesurveys.org/content/dam/enterprisesurveys/documents/country/Indonesia-2023.pdf',
  },
  {
    name: 'OCBC NISP × NielsenIQ, Business Fitness Index 2024',
    url: 'https://www.ocbc.id/tentang-ocbc-nisp/informasi/siaran-pers/2024/08/19/ocbc-business-fitness-index',
  },
  {
    name: 'AWS × Strand Partners, Unlocking Indonesia\'s AI Potential 2026',
    url: 'https://www.aboutamazon.sg/news/aws/indonesias-next-wave-of-ai-is-taking-shape',
  },
  {
    name: '60 Decibels, State of Indonesian MSEs 2026',
    url: 'https://60decibels.com/insights/indonesian-mses/',
  },
];

/** Report suggestions (brief §6): the next phase, quick wins, and a 30-60-90 day plan. */
export const PLAN_COPY = {
  nextMarker: 'Langkah naik fase', // REVIEW
  nextTitle: (persona: string) => `Cara naik ke ${persona}`, // REVIEW
  nextSummary: (count: number, from: number, to: number, persona: string, reached: boolean) => {
    const steps = `${['', 'satu', 'dua', 'tiga'][count] ?? count} langkah`;
    return reached
      ? `Dengan ${steps} ini, skor Anda naik dari ${from} ke ${to} dan masuk ${persona}.`
      : `Dengan ${steps} ini, skor Anda naik dari ${from} ke ${to}, mendekati ${persona}.`;
  }, // REVIEW
  points: (gain: number) => `+${gain} poin`,
  nextNote: 'Dihitung dengan rumus skor OpsScore: jawaban mana yang paling menaikkan skor kalau naik satu tingkat.', // REVIEW
  quickMarker: 'Quick win', // REVIEW
  quickTitle: 'Bisa dikerjakan minggu ini', // REVIEW
  effort: { mudah: 'Mudah', sedang: 'Sedang' }, // REVIEW
  cost: { gratis: 'Gratis', aplikasi: 'Biaya aplikasi' }, // REVIEW
  roadmapMarker: 'Rencana 30-60-90 hari', // REVIEW
  roadmapTitle: 'Tiga bulan ke depan', // REVIEW
  days: (days: number) => `${days} hari`,
  /** Used when no area needs naming, e.g. every area is already tidy. */
  fallbackNoun: 'data operasional Anda', // REVIEW
};

/** One cheap action per area for "Bisa dikerjakan minggu ini", with effort and cost labels. */
export const QUICK_WINS: Record<AreaId, { text: string; effort: 'mudah' | 'sedang'; cost: 'gratis' | 'aplikasi' }> = {
  sales: {
    text: 'Buat satu Google Sheet berisi nama prospek, tanggal kontak, dan tanggal follow-up berikutnya. Isi setiap sore.', // REVIEW
    effort: 'mudah',
    cost: 'gratis',
  },
  ops: {
    text: 'Ganti laporan harian di grup WA dengan satu Google Form berisi lima kolom wajib.', // REVIEW
    effort: 'mudah',
    cost: 'gratis',
  },
  finance: {
    text: 'Pisahkan rekening usaha dan pribadi, lalu catat kas masuk dan keluar setiap hari di satu tempat.', // REVIEW
    effort: 'sedang',
    cost: 'gratis',
  },
  stock: {
    text: 'Hitung ulang 20 barang paling laku minggu ini, dan tulis sebab setiap selisihnya.', // REVIEW
    effort: 'sedang',
    cost: 'gratis',
  },
  people: {
    text: 'Tulis SOP satu halaman untuk tiga pekerjaan yang paling sering ditanyakan tim.', // REVIEW
    effort: 'mudah',
    cost: 'gratis',
  },
  owner: {
    text: 'Catat pertanyaan tim selama tiga hari, lalu jadikan lima yang paling sering sebagai satu dokumen jawaban.', // REVIEW
    effort: 'mudah',
    cost: 'gratis',
  },
  web: {
    text: 'Buat Google Business Profile, dan arahkan tombol WhatsApp ke nomor admin, bukan nomor pribadi.', // REVIEW
    effort: 'mudah',
    cost: 'gratis',
  },
  ai: {
    text: 'Kumpulkan data penjualan tiga bulan terakhir per produk atau layanan ke satu file.', // REVIEW
    effort: 'sedang',
    cost: 'gratis',
  },
};

/** How the 30-60-90 day plan names an area inside a sentence; no "dan", since the plan joins two with it. */
export const AREA_NOUNS: Record<AreaId, string> = {
  sales: 'catatan prospek', // REVIEW
  ops: 'laporan harian', // REVIEW
  finance: 'catatan kas', // REVIEW
  stock: 'catatan stok', // REVIEW
  people: 'SOP tim', // REVIEW
  owner: 'angka keputusan', // REVIEW
  web: 'lead dari internet', // REVIEW
  ai: 'data penjualan per produk', // REVIEW
};

/** Three steps per phase; `first` and `second` are the areas from AREA_NOUNS. */
export const ROADMAP: Record<Phase, Array<{ days: 30 | 60 | 90; title: string; body: (first: string, second: string) => string }>> = {
  1: [
    { days: 30, title: 'Keluarkan dari kepala', body: (first) => `Tulis ${first} di satu spreadsheet bersama, meski formatnya masih sederhana.` }, // REVIEW
    { days: 60, title: 'Biasakan tim', body: (first, second) => `Biasakan tim memakai format yang sama untuk ${first} dan ${second} setiap hari.` }, // REVIEW
    { days: 90, title: 'Pilih sistemnya', body: () => 'Pindahkan format yang sudah jalan ke aplikasi atau sistem, supaya laporan tersusun sendiri.' }, // REVIEW
  ],
  2: [
    { days: 30, title: 'Keluarkan dari chat', body: (first) => `Pindahkan ${first} dari grup chat ke satu format isian bersama.` }, // REVIEW
    { days: 60, title: 'Tetapkan standar', body: (first, second) => `Tetapkan format baku untuk ${first} dan ${second}, lalu pastikan dipakai setiap hari.` }, // REVIEW
    { days: 90, title: 'Sambungkan', body: () => 'Sambungkan isian itu ke satu sistem yang merangkum angkanya tanpa disusun ulang.' }, // REVIEW
  ],
  3: [
    { days: 30, title: 'Hapus salin-tempel', body: (first) => `Jadikan ${first} satu sumber data, bukan beberapa file yang disalin ulang.` }, // REVIEW
    { days: 60, title: 'Dashboard otomatis', body: (first, second) => `Buat dashboard untuk ${first} dan ${second} yang terisi sendiri dari sumber data itu.` }, // REVIEW
    { days: 90, title: 'Siapkan AI', body: () => 'Sistemkan alurnya dari awal sampai akhir, lalu uji AI untuk pertanyaan bisnis yang paling sering.' }, // REVIEW
  ],
  4: [
    { days: 30, title: 'Pilih pertanyaannya', body: () => 'Pilih satu pertanyaan bisnis yang paling sering diajukan, dan pastikan datanya lengkap.' }, // REVIEW
    { days: 60, title: 'Uji asisten AI', body: (first) => `Uji asisten AI yang menjawab dari ${first}, dengan satu tim sebagai pengguna pertama.` }, // REVIEW
    { days: 90, title: 'Otomatiskan', body: () => 'Otomatiskan laporan rutin, dan pantau jawaban AI setiap minggu.' }, // REVIEW
  ],
};

export const REPORT_COPY = {
  prioritiesTitle: (count: number) => (count === 3 ? 'Tiga area prioritas' : 'Area prioritas'), // REVIEW
  noPriorities: 'Tidak ada area yang perlu diprioritaskan. Semua area operasional sudah rapi.', // REVIEW
  scoreOf: (score: number) => `${score}/100`,
  marker: '[ REPORT ]', // REVIEW
  actionLabel: 'Mulai dari sini', // REVIEW
  classTitle: 'Yang kami sarankan', // REVIEW
  savePdf: 'Simpan PDF',
};

export const PRINT_COPY = {
  metaTitle: 'Report OpsScore', // REVIEW
  documentTitle: 'Report OpsScore',
  preparedFor: 'Disusun untuk', // REVIEW
  session: 'Sesi',
  footerUrl: 'coderoach.id/opsscore',
  briefUrl: 'coderoach.id/#contact', // REVIEW
  print: 'Simpan PDF',
  back: 'Kembali ke report', // REVIEW
  hint: 'Di jendela cetak, pilih Simpan sebagai PDF.', // REVIEW
};

export const SHARE_COPY = {
  button: 'Bagikan hasil', // REVIEW
  copied: 'Link tersalin', // REVIEW
  copyPrompt: 'Salin link ini', // REVIEW
  shareTitle: 'Hasil OpsScore', // REVIEW
  shareText: 'Ini fase AI Readiness bisnis kami menurut OpsScore.', // REVIEW
  metaTitle: (phaseTitle: string) => `${phaseTitle} | hasil OpsScore`, // REVIEW
  marker: '[ OPSSCORE ] · Hasil yang dibagikan', // REVIEW
  scoreLabel: 'AI Readiness bisnis ini', // REVIEW
  cta: 'Cek bisnis Anda',
  ctaNote: '27 pertanyaan, ±5 menit, gratis.', // REVIEW
};

/** Admin view (/admin/opsscore) — internal, read by the Coderoach team. */
export const ADMIN_COPY = {
  navGroup: 'OpsScore',
  navLink: 'Leads & funnel',
  title: 'OpsScore',
  funnelTitle: (days: number) => `${days} hari terakhir`,
  started: 'Mulai',
  completed: 'Selesai',
  gated: 'Isi gate',
  completionRate: 'Completion rate',
  gateRate: 'Gate conversion',
  filters: {
    qualified: 'Omset ≥ 50 jt',
    withPhone: 'Sudah isi WA',
    phase: 'Fase',
    status: 'Status',
    all: 'Semua',
    apply: 'Terapkan',
    reset: 'Reset',
  },
  exportCsv: 'Ekspor CSV',
  leadsCount: (count: number) => `${count} lead`,
  empty: 'Belum ada lead untuk filter ini.',
  columns: {
    date: 'Tanggal',
    name: 'Nama',
    brand: 'Brand',
    phone: 'WA',
    industry: 'Bidang',
    employees: 'Karyawan',
    revenue: 'Omset',
    phase: 'Fase',
    total: 'Total',
    priorities: 'Prioritas',
    serviceClass: 'Kelas',
    progress: 'Progres',
    intent: 'Intent (H3)',
    source: 'Sumber',
    status: 'Status',
    detail: 'Detail',
  },
  openDetail: 'Buka',
  direct: 'langsung',
  back: '← Semua lead',
  detailTitle: 'Detail sesi',
  sessionMeta: 'Sesi',
  leadTitle: 'Kontak',
  noLead: 'Belum mengisi profil.',
  progress: {
    gated: 'Isi WA',
    completed: 'Selesai, belum isi WA',
    stoppedAt: (section: string) => `Berhenti di ${section}`,
  },
  noPhone: 'Belum isi WA',
  repeatContact: 'Nomor ini pernah masuk dari sesi lain.', // REVIEW
  scoresTitle: 'Skor',
  answersTitle: 'Jawaban mentah',
  instrumentVersion: (version: number) => `Instrumen v${version}`,
  statusSaving: 'Menyimpan…',
  statusError: 'Gagal menyimpan',
  followup: {
    new: 'Baru',
    contacted: 'Sudah dihubungi',
    qualified: 'Terkualifikasi',
    not_fit: 'Tidak cocok',
    converted: 'Converted',
  } as Record<string, string>,
  sessionStatus: {
    started: 'Mulai',
    completed: 'Selesai',
    gated: 'Isi gate',
  } as Record<string, string>,
  notFound: 'Sesi tidak ditemukan.',
};
