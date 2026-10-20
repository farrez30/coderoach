/**
 * Landing page copy, kept in code so scripts/landing-sync.ts writes the same words to any database.
 *
 * What this covers: the top bar, the home page's blocks, and the collections those blocks read
 * (services, process phases, tenets, FAQs, clients). Fields not named here keep their current value.
 *
 * Positioning: a business builds its own system instead of renting several subscriptions that grow
 * with headcount. No prices anywhere — the owner decided against publishing numbers. The only
 * timing promise is one month to something the client's team can try.
 */
import type { LexicalBlock } from '../lexical';
import type { WantedClient } from './clients';

/** Rich-text sections that do not exist as blocks yet. `after` is the blockType they follow. */
export type LandingSection = {
  /** blockName, used to find the section again on the next sync. */
  name: string;
  after: string;
  maxWidth: 'narrow' | 'wide';
  body: LexicalBlock[];
};

export const TOP_BAR = {
  enabled: true,
  tag: '[ TERBUKA UNTUK Q4 2026 ]',
  message: 'Kami menerima beberapa proyek baru tiap kuartal. Mulai dari konsultasi gratis 30 menit.',
  link: { label: 'Konsultasi gratis', href: '#contact' },
};

/**
 * The Hero global is never rendered — the homepage reads its hero block. Its headline is only used
 * by generateMetadata to build the <title>, so it holds the search phrase, not the on-page headline.
 */
export const METADATA = {
  // Both halves are required fields; the title joins them: "Coderoach Studio | Jasa Pembuatan ERP & Sistem Custom".
  heroHeadline: { lead: 'Jasa Pembuatan ERP &', accent: 'Sistem Custom' },
  siteDescription:
    'Software house Jakarta yang membangun ERP custom, aplikasi internal, otomasi, dan dashboard sesuai proses bisnis Anda. Source code milik Anda.',
};

export const HERO = {
  pillText: 'Sistem internal untuk bisnis Indonesia',
  headline: { lead: 'Punya sistem sendiri,', accent: 'tanpa tagihan yang membesar tiap tambah orang.' },
  lede: 'Kami membangun ERP, aplikasi internal, otomasi, dan dashboard yang mengikuti proses bisnis Anda. Sekitar satu bulan sudah ada versi yang bisa dicoba tim Anda, dan source code-nya milik Anda.',
  ctaPrimary: { label: 'Konsultasi gratis 30 menit', href: '#contact' },
  ctaSecondary: { label: 'Cek kesiapan operasi (5 menit)', href: '/opsscore' },
  trustedBy: {
    label: 'Sistem dan situs yang kami bangun',
    tagline: 'F&B, rumah produksi, jasa perizinan, dan media di Indonesia.',
  },
};

/** Headings and ledes on the blocks that already exist. Keyed by blockType. */
export const BLOCK_COPY: Record<string, Record<string, unknown>> = {
  serviceList: {
    description: 'Tiga pintu masuk',
    heading: 'Yang kami bangun.',
    lede: 'Biasanya dimulai dari satu yang paling mendesak, lalu tumbuh menyambung ke yang lain. Bukan menjadi tiga sistem terpisah.',
    source: 'manual',
  },
  work: {
    heading: 'Sistem yang sudah berjalan.',
    lede: 'Bukan mockup. Tiga di antaranya memegang uang, stok, dan absensi klien setiap hari.',
  },
  products: {
    heading: 'Produk yang kami bangun dan pakai sendiri.',
    lede: 'Ujian paling jujur untuk sebuah tim engineering bukan brief klien, melainkan produk sendiri yang harus bertahan di tangan pengguna nyata.',
  },
  process: {
    heading: 'Dari pemetaan sampai benar-benar dipakai.',
    lede: 'Empat tahap yang sama untuk tiap proyek. Sekitar satu bulan sudah ada versi yang bisa dicoba tim Anda, lalu modul berikutnya menyusul.',
  },
  studio: {
    heading: 'Tim kecil, senior, satu titik tanggung jawab.',
  },
  notes: {
    heading: 'Catatan dari studio.',
    lede: 'Engineering, operasional, dan hal-hal di antara keduanya.',
  },
  faq: {
    heading: 'Pertanyaan yang sering masuk.',
  },
  contact: {
    heading: { line1: 'Ceritakan proses yang paling merepotkan.', line2Accent: 'Kami bantu petakan.' },
    lede: 'Tidak perlu tahu solusinya. Ceritakan bagian yang paling banyak memakan waktu tim Anda, dan kami bantu petakan apakah layak dibangun, termasuk kalau jawabannya belum.',
    scopes: [
      { scope: 'ERP & sistem operasional' },
      { scope: 'Otomasi & AI' },
      { scope: 'Dashboard & BI' },
      { scope: 'Belum yakin' },
    ],
    formLabels: { submit: 'Kirim dan jadwalkan konsultasi' },
    successHeading: 'Terkirim. Kami balas dalam 48 jam kerja.',
  },
};

/**
 * The narrative sections. Their layouts (narrative/sections.tsx) read the structure: the paragraph
 * under the h2 is the lede, and the second line of a list item is its detail.
 */
export const SECTIONS: LandingSection[] = [
  {
    name: 'kapan-butuh-sistem',
    after: 'hero',
    maxWidth: 'narrow',
    body: [
      { h2: 'Kapan bisnis butuh sistem sendiri?' },
      'Kalau tiga pemandangan ini terasa akrab, masalahnya bukan di tim Anda.',
      {
        ul: [
          'Gudang pakai spreadsheet.\nTiga orang edit file yang sama. Angka yang benar tergantung siapa yang terakhir simpan.',
          'Keuangan pakai aplikasi lain.\nTiap aplikasi rapi sendiri, tapi tidak saling bicara. Tagihannya naik tiap tambah orang.',
          'Lapangan lapor lewat grup chat.\nLaporannya ada. Mencarinya yang makan waktu, dan tidak pernah jadi data.',
        ],
      },
      'Semua jalan, sampai Anda butuh satu angka yang menyatukan ketiganya.',
      'Bukan soal disiplin tim. Sistemnya memang tidak pernah dirancang untuk nyambung.',
    ],
  },
  {
    name: 'langganan-atau-bangun',
    after: 'kapan-butuh-sistem',
    maxWidth: 'narrow',
    body: [
      { h2: 'Langganan atau bangun sendiri?' },
      'Untuk kebutuhan umum seperti email atau akuntansi standar, pakai yang sudah ada. Yang mahal adalah menyewa bagian yang membedakan bisnis Anda.',
      { h3: 'Menyewa' },
      {
        ul: [
          'Biaya per pengguna, tiap bulan, selamanya',
          'Naik saat tim bertambah',
          'Naik lagi saat kurs menguat',
          'Proses ikut software',
          'Data terpisah di tiap langganan',
        ],
      },
      { h3: 'Memiliki' },
      {
        ul: [
          'Dibayar di awal, lalu jadi aset',
          'Tambah pengguna, tagihan tetap',
          'Source code milik Anda',
          'Software ikut proses',
          'Satu tempat untuk semua data',
        ],
      },
      // The cost chart: its heading, its explanation, then the note under the plot.
      { h3: 'Murah di awal belum tentu murah di akhir.' },
      'Langganan naik tiap tambah orang dan tiap kurs menguat. Sistem sendiri dibayar di awal, lalu grafiknya melandai.',
      'Setelah titik balik, tiap bulan adalah penghematan',
    ],
  },
  {
    name: 'cocok-untuk-siapa',
    after: 'process',
    maxWidth: 'narrow',
    body: [
      { h2: 'Cocok untuk siapa?' },
      'Kami lebih suka bilang "belum" di awal daripada membangun sistem yang akhirnya tidak dipakai.',
      { h3: 'Cocok kalau' },
      {
        ul: [
          'Prosesnya sudah stabil dan dijalankan banyak orang',
          'Biaya langganan mulai terasa',
          'Data tersebar di beberapa aplikasi',
          'Ada pekerjaan berulang tiap hari',
        ],
      },
      'Centang 3 dari 4? Saatnya kita ngobrol.',
      { h3: 'Belum cocok kalau' },
      {
        ul: [
          'Butuhnya cuma satu formulir atau satu laporan\nPakai form atau spreadsheet dulu, lebih murah.',
          'Prosesnya masih berubah tiap minggu\nStabilkan prosesnya dulu, baru dibangun.',
          'Belum ada yang bisa menjawab soal proses\nTunjuk satu pemilik proses di internal.',
        ],
      },
      'Tetap boleh konsultasi. Kami arahkan ke opsi yang lebih murah.',
    ],
  },
];

/** Three services. AI merged into Otomasi, internal apps merged into ERP. */
export const SERVICES = [
  {
    slug: 'build',
    order: 1,
    tag: 'OPERASI',
    title: 'ERP & Sistem Operasional',
    tagline: 'Satu sistem untuk pembelian, stok, produksi, penjualan, sampai buku besar.',
    blurb:
      'Termasuk aplikasi internal untuk pekerjaan yang sekarang berjalan di spreadsheet dan grup chat: pengajuan, persetujuan, laporan lapangan, dan pemantauan. Dibangun modul per modul, mengikuti proses yang sudah jalan.',
    list: [
      'ERP custom: pembelian, stok, produksi, penjualan, keuangan',
      'Aplikasi internal dan sistem informasi',
      'Portal untuk klien, mitra, atau investor',
      'Company website dan CMS yang bisa diisi tim sendiri',
      'Sambungan ke sistem yang sudah Anda pakai',
    ],
    heroLede:
      'Sistem yang menjalankan operasi harian Anda, dari pembelian bahan sampai laporan keuangan. Dibangun bertahap, dimulai dari bagian yang paling terasa.',
  },
  {
    slug: 'automate',
    order: 2,
    tag: 'EFISIENSI',
    title: 'Otomasi & AI',
    tagline: 'Pekerjaan berulang dijalankan sistem, termasuk yang butuh AI.',
    blurb:
      'Dari menyalin data antar aplikasi sampai membaca nota dan dokumen. AI dipasang di titik yang memang memangkas waktu kerja, bukan sebagai demo.',
    list: [
      'Otomasi alur kerja dan persetujuan',
      'Sinkronisasi data antar aplikasi',
      'Pembacaan dokumen dan nota dengan AI',
      'Notifikasi dan laporan terjadwal',
      'Jejak audit dan pemantauan, supaya kesalahan terlihat',
    ],
    heroLede:
      'Pekerjaan manual yang berulang dijalankan sistem, lengkap dengan jejaknya. Termasuk bagian yang baru bisa dikerjakan setelah ada AI.',
  },
  {
    slug: 'intelligence',
    order: 3,
    tag: 'KEPUTUSAN',
    title: 'Dashboard & Business Intelligence',
    tagline: 'Angka untuk mengambil keputusan, dari data operasi Anda sendiri.',
    blurb:
      'Membuat grafik itu mudah. Yang sulit adalah memastikan angkanya benar, sumbernya satu, dan yang menyimpang terlihat sebelum jadi masalah.',
    list: [
      'Dashboard harian untuk operasi dan keuangan',
      'Penyatuan data dari beberapa sumber',
      'Laporan terjadwal ke email atau WhatsApp',
      'Peringatan saat angka menyimpang dari biasanya',
    ],
    heroLede:
      'Dashboard yang dipakai harian, bukan yang dibuka sekali lalu dilupakan. Kami bangun sampai ke sumber datanya.',
  },
];

export const PROCESS_PHASES = [
  {
    order: 1,
    tag: 'TAHAP 01',
    icon: 'discover',
    name: 'Petakan',
    what: 'Kami duduk bersama orang yang menjalankan prosesnya, memetakan alurnya, lalu menunjukkan bagian mana yang paling mahal kalau dibiarkan.',
    deliv: 'Peta proses · prioritas masalah · lingkup kerja',
  },
  {
    order: 2,
    tag: 'TAHAP 02',
    icon: 'design',
    name: 'Rancang',
    what: 'Satu rancangan yang sudah memperhitungkan modul berikutnya, supaya yang dibangun sekarang tidak menghalangi yang dibangun tahun depan.',
    deliv: 'Alur layar · model data · rencana bertahap',
  },
  {
    order: 3,
    tag: 'TAHAP 03',
    icon: 'layers',
    name: 'Bangun bertahap',
    what: 'Mulai dari bagian yang paling terasa. Sekitar satu bulan sudah ada versi yang bisa dicoba tim Anda, dan tiap dua minggu ada tambahan yang bisa dilihat.',
    deliv: 'Sistem berjalan · demo tiap dua minggu',
  },
  {
    order: 4,
    tag: 'TAHAP 04',
    icon: 'handoff',
    name: 'Pakai dan kembangkan',
    what: 'Kami dampingi sampai tim benar-benar memakainya: pelatihan, migrasi data, lalu penyesuaian saat prosesnya berubah.',
    deliv: 'Pelatihan tim · dokumentasi · akses infrastruktur',
  },
];

export const TENETS = [
  {
    order: 1,
    icon: 'users',
    title: 'Senior end-to-end. Tanpa hand-off.',
    description:
      'Engineer yang melakukan scoping adalah engineer yang menyelesaikan pekerjaan. Tanpa lapisan agency yang menerjemahkan ulang, tanpa hand-off ke junior, dan tanpa konteks yang hilang di tengah jalan.',
  },
  {
    order: 2,
    icon: 'voice',
    title: 'Opinionated, bukan obedient.',
    description:
      'Kami akan membangun apa yang Anda minta. Tetapi jika ada cara yang lebih masuk akal untuk goal Anda, kami akan menyampaikannya di awal, bukan setelah proyek berjalan.',
  },
  {
    order: 3,
    icon: 'shield',
    title: 'Sistemnya milik Anda, kami tetap ada.',
    description:
      'Source code, database, dan dokumentasi sepenuhnya milik Anda sejak hari pertama. Kami tetap menjadi partner pengembangan selama dibutuhkan, karena Anda memilih, bukan karena terkunci.',
  },
];

export const FAQS = [
  {
    order: 1,
    question: 'Apa bedanya sistem custom dengan software langganan?',
    answer:
      'Software langganan dibuat untuk banyak perusahaan sekaligus, jadi proses Anda yang menyesuaikan produknya. Sistem custom dibangun dari proses Anda sendiri, dan biayanya tidak bertambah setiap ada pengguna baru. Untuk kebutuhan umum seperti email atau akuntansi standar, langganan justru lebih masuk akal.',
  },
  {
    order: 2,
    question: 'Berapa lama sampai bisa dipakai?',
    answer:
      'Sekitar satu bulan sampai ada versi yang bisa dicoba tim Anda. Setelah itu modul berikutnya menyusul, jadi sistemnya tumbuh sambil dipakai, bukan menunggu semuanya selesai.',
  },
  {
    order: 3,
    question: 'Bagaimana cara Anda menentukan harga proyek?',
    answer:
      'Project-based per scope, bukan per jam. Setelah diskusi awal 30–60 menit, kami menyiapkan proposal dengan milestone dan deliverable yang jelas. Tanpa hourly billing, tanpa timesheet.',
  },
  {
    order: 4,
    question: 'Apakah source code menjadi milik kami?',
    answer:
      'Ya. Source code, database, dan dokumentasi milik Anda sejak hari pertama, termasuk akses ke infrastrukturnya. Anda bisa melanjutkan bersama kami, atau memindahkannya ke tim lain kapan pun.',
  },
  {
    order: 5,
    question: 'Bisakah terhubung dengan sistem yang sudah kami pakai?',
    answer:
      'Bisa, selama sistem itu punya API atau datanya bisa diekspor. POS, akuntansi, dan marketplace adalah sambungan yang paling sering kami kerjakan.',
  },
  {
    order: 6,
    question: 'Bagaimana kalau tim kami tidak terbiasa dengan sistem baru?',
    answer:
      'Itu bagian dari pekerjaan kami. Layarnya mengikuti urutan kerja yang sudah dikenal tim, bukan struktur database, dan kami dampingi saat peralihan sampai sistemnya benar-benar dipakai.',
  },
  {
    order: 7,
    question: 'Proses bisnis kami masih sering berubah. Apa tidak sia-sia?',
    answer:
      'Justru itu alasan membangun sendiri: menyesuaikan sistem sendiri lebih murah daripada memaksa proses mengikuti software orang lain. Tetapi kalau prosesnya masih berubah setiap minggu, kami sarankan menunggu sampai polanya stabil.',
  },
  {
    order: 8,
    question: 'Proyek sekecil apa yang Anda terima?',
    answer:
      'Paling kecil dimulai dari satu modul yang jelas masalahnya, misalnya pencatatan stok harian atau alur persetujuan. Kalau kebutuhannya hanya satu formulir, kami biasanya merekomendasikan cara yang lebih murah.',
  },
  {
    order: 9,
    question: 'Apakah tersedia model retainer?',
    answer:
      'Tersedia, untuk sistem yang sudah live dan terus berkembang. Bukan model "pool of hours". Kami tetap scope per cycle agar fokus pada hasil yang jelas.',
  },
  {
    order: 10,
    question: 'Anda berbasis di mana?',
    answer:
      'Remote-first, dengan tim inti di Jakarta. Klien dapat berada di mana pun di Indonesia. Kami biasa berkolaborasi via Google Meet dan WhatsApp, dan datang langsung untuk kickoff serta milestone besar.',
  },
  {
    order: 11,
    question: 'Apakah tersedia NDA?',
    answer: 'Tersedia. Mutual NDA standar dapat ditandatangani sebelum diskusi detail teknis dan bisnis.',
  },
];

/**
 * Marquee under the hero. Names the owner confirmed may be published; all already named on /work.
 * The landing sync lists exactly these in Clients, which is what the public API returns.
 */
export const CLIENTS: readonly WantedClient[] = [
  { name: 'Geprek Wow', industry: 'fb' },
  { name: 'RPN Agro', industry: 'manufacturing' },
  { name: 'Chicken Wow', industry: 'fb' },
  { name: 'Uruzin', industry: 'legal' },
  { name: 'The Global Review', industry: 'media' },
];
