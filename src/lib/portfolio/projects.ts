/**
 * The /work portfolio, kept in code so the seed and scripts/portfolio-sync.ts write the same copy.
 *
 * Syncing overwrites the fields defined here on the matching project (by slug). Fields left out,
 * such as gallery or testimonial, keep whatever was set in the admin. An entry without `cover`
 * keeps its current cover, so an image uploaded in the admin survives the next sync.
 */

import { toLexical, type LexicalBlock } from '../lexical';
import type { Consent } from './consent';
import type { Industry } from './taxonomy';
import { toFeaturedMetric, type Metric } from './metrics';

export { toLexical };

export type PortfolioBlock = LexicalBlock;

export type PortfolioCover = {
  /** File name inside scripts/portfolio-assets/. Also the Media filename used to find it again. */
  file: string;
  alt: string;
  /**
   * Focal point in percent, 1-100. Cards crop to 16:10, so a board with text on the left wants focalX 1.
   * Payload stores 0 as the default 50, so use 1 for the left or top edge.
   */
  focalX?: number;
  focalY?: number;
};

/** A file in scripts/portfolio-assets/, uploaded to Media by the sync. Versioned names: laporta-tour.v1.mp4. */
export type PortfolioAsset = { file: string; alt: string };

export type PortfolioLink = {
  kind: 'live' | 'demo' | 'archive' | 'repo';
  label: string;
  href: string;
  /** Probe it with the checkLinks job. Off for links that answer bots badly. */
  check?: boolean;
  consent: Consent;
  /** Dated screenshot shown when the link is down. */
  snapshot?: PortfolioAsset & { takenAt: string };
};

export type PortfolioEntry = {
  slug: string;
  /** What lets this entry be shown at all: its name, copy, and cover (see consent.ts). */
  consent: Consent;
  order: number;
  kind: 'client' | 'studio' | 'lab';
  client: string;
  tagline: string;
  meta: string;
  industry: Industry;
  /** Slug of the primary service. */
  service: 'build' | 'automate' | 'intelligence' | 'augment';
  publishedYear: string;
  pills: string[];
  excerpt: string;
  body: PortfolioBlock[];
  cover?: PortfolioCover;
  /** Sourced numbers. The featured ones also fill the home page card. */
  metrics?: Metric[];
  /** The first screen of the project page: what was wrong, what was built, what changed. */
  summary?: { problem: string; solution: string; result: string };
  showcase?: {
    frame: 'laptop' | 'phone' | 'browser';
    screen?: PortfolioAsset;
    screenPhone?: PortfolioAsset;
    loop?: PortfolioAsset;
    loopPoster?: PortfolioAsset;
    tour?: PortfolioAsset;
    tourPoster?: PortfolioAsset;
    tourCaptions?: PortfolioAsset;
    tourTranscript?: string;
    /** Says the recording runs on made-up data, e.g. "Data contoh, bukan data klien." */
    demoNote?: string;
    /** Who allowed the recordings and screenshots: studio for our own products. */
    consent: Consent;
  };
  links?: PortfolioLink[];
  features?: Array<{ title: string; body: string; screen?: PortfolioAsset }>;
  timeline?: Array<{ date: string; title: string; detail?: string; sourceRef?: string }>;
  darkChapter?: { eyebrow: string; title: string; body: string };
  testimonial?: { quote: string; author: string; role: string; company: string; givenAt: string; consent: Consent };
  /** Kept in the database as a draft: off the site, copy preserved for later. */
  hidden?: boolean;
  featured?: boolean;
  featuredDetails?: {
    badgeLabel: string;
    shippedLabel: string;
    metaLine: string;
    headline: string;
    description: string;
    metrics: Array<{ num: string; accent?: string; label: string }>;
    codePanel: { tag: string; path: string; lines: string[] };
    stack: string[];
  };
  studio?: {
    vizType: 'laporta' | 'viralytics' | 'none';
    usage: string;
    externalLink: { label: string; href: string } | null;
    bullets: string[];
  };
};

/** Entries that stay in the database as drafts: off the site, kept for later. */
export const HIDDEN_PROJECT_SLUGS = ['ads-multiplatform-dashboard', 'viralytics'];

const kw = (s: string) => `<span style="color:#C4C0C5">${s}</span>`;

/** Measured on Laporta itself and written down in the commit that changed it (repo mwafiudin/laporta_v2). */
const LAPORTA_METRICS: Metric[] = [
  {
    key: 'input-penjualan-layar',
    value: '1,7',
    unit: 'layar',
    label: 'Input penjualan di ponsel crew',
    baseline: { value: '2,7', unit: 'layar' },
    status: 'measured',
    measuredAt: '2026-07-29',
    method: 'Tinggi formulir input penjualan per shift di ponsel crew, sebelum dan sesudah grup channel bisa dilipat.',
    sourceRef: 'laporta_v2@7d244f9',
    consent: 'studio',
    featured: true,
  },
  {
    key: 'jadwal-ubah-sel',
    value: '76–101',
    unit: 'ms',
    label: 'Ubah satu sel jadwal',
    baseline: { value: '0,7–1,2', unit: 'dtk' },
    status: 'measured',
    measuredAt: '2026-08-31',
    method: 'Waktu dari klik sampai sel jadwal berubah di layar, diukur sebelum dan sesudah pembaruan optimistik.',
    sourceRef: 'laporta_v2@69ab349',
    consent: 'studio',
    featured: true,
  },
  {
    key: 'ocr-bukti-transfer',
    value: '14/14',
    unit: '',
    label: 'Bukti transfer terbaca benar',
    status: 'measured',
    measuredAt: '2026-08-04',
    method: 'Tujuh slip BCA, BRI, dan DANA sintetis (buram, miring, difoto dari jauh) dibaca dua putaran, rata-rata 1,4 dtk per bukti.',
    sourceRef: 'laporta_v2@57435fc',
    consent: 'studio',
    featured: true,
  },
];

export const PORTFOLIO: PortfolioEntry[] = [
  {
    slug: 'laporta',
    consent: 'studio',
    order: 1,
    kind: 'studio',
    client: 'Laporta',
    tagline: 'Profit intelligence layer di atas POS, untuk operator F&B Indonesia.',
    meta: 'F&B OPS · STUDIO PRODUCT',
    industry: 'fb',
    service: 'build',
    publishedYear: '2026',
    featured: true,
    pills: ['NEXT.JS', 'POSTGRES', 'DRIZZLE', 'RLS'],
    excerpt:
      'Menjembatani SPV dan Accounting di operasi F&B multi-cabang: tutup shift dari ponsel crew, serah terima kas sampai setoran bank, dan jurnal double-entry sampai tutup buku.',
    // From the demo database. The earlier cover showed a live outlet's sales and the production URL.
    cover: {
      file: 'laporta-setoran.v2.webp',
      alt: 'Laporta, halaman Setoran Tunai: uang yang sudah masuk bank, setoran yang perlu diperiksa, dan pembanding per rekening',
      focalX: 30,
      focalY: 0,
    },
    metrics: LAPORTA_METRICS,
    summary: {
      problem:
        'POS mencatat penjualan, tapi kas kecil, stok, waste, setoran bank, dan absensi tersebar di spreadsheet dan WhatsApp, dan harus disalin ulang untuk head office.',
      solution:
        'Satu sistem untuk lima peran: crew menutup shift dari ponsel, kas punya rantai serah terima sampai bank, dan setiap transaksi masuk jurnal double-entry.',
      result:
        'Input penjualan crew turun dari 2,7 ke 1,7 layar, dan mengubah sel jadwal dari 0,7–1,2 detik jadi 76–101 ms.',
    },
    showcase: {
      frame: 'laptop',
      screen: { file: 'laporta-setoran.v2.webp', alt: 'Laporta, halaman Setoran Tunai: uang yang sudah masuk bank, setoran yang perlu diperiksa, dan pembanding per rekening' },
      screenPhone: { file: 'laporta-tutup-shift.v2.webp', alt: 'Laporta di ponsel crew: checklist Tutup Shift dengan tujuh langkah' },
      loop: { file: 'laporta-tutup-shift-loop.v2.mp4', alt: 'Checklist Tutup Shift digulir di ponsel crew' },
      loopPoster: { file: 'laporta-tutup-shift-loop.v2.poster.webp', alt: 'Checklist Tutup Shift di ponsel crew' },
      tour: { file: 'laporta-tur.v2.mp4', alt: 'Tur Laporta: setoran tunai, serah terima shift, kontrol harian, stock opname, laba rugi, katalog resep, dan jurnal umum' },
      tourPoster: { file: 'laporta-tur.v2.poster.webp', alt: 'Laporta, halaman Setoran Tunai' },
      tourTranscript:
        'Tur tanpa suara, sekitar 50 detik. Halaman Setoran Tunai: uang yang sudah masuk bank, yang masih di outlet, dan setoran yang perlu diperiksa, dicocokkan per rekening. Serah Terima Shift: kas berpindah dari shift ke shift dengan jejak, termasuk yang masih menunggu diterima dan yang selisih. Beranda Eksekutif: kontrol harian pekerjaan shift tiap cabang dan omset hari itu. Stock opname: pemakaian aktual dibanding kebutuhan ideal dari resep. Laba rugi bulan berjalan dari buku besar, katalog resep beserta HPP, dan jurnal umum.',
      demoNote: 'Direkam dari database demo. Nama cabang, karyawan, dan angka adalah data contoh, bukan data klien.',
      consent: 'studio',
    },
    features: [
      {
        title: 'Tutup shift dari ponsel crew',
        body: 'Tujuh langkah berurutan: absen, penjualan, stock opname, kas kecil, waste, kebersihan, lalu serah terima kas. Data yang sudah diserahkan terkunci; koreksi punya jalur sendiri dan tercatat.',
        screen: { file: 'laporta-tutup-shift.v2.webp', alt: 'Checklist Tutup Shift di ponsel crew' },
      },
      {
        title: 'Rantai kas sampai rekening bank',
        body: 'Uang berpindah dari orang ke orang dengan jejak, sampai ke setoran. Foto bukti transfer dibaca OCR untuk dicocokkan dengan nominal yang diklaim, bukan untuk mengisinya.',
        screen: { file: 'laporta-setoran.v2.webp', alt: 'Setoran tunai per rekening dan status pemeriksaannya' },
      },
      {
        title: 'Selisih stok terhadap resep',
        body: 'Kebutuhan bahan ideal dihitung dari resep dikali penjualan menu, disandingkan dengan pemakaian aktual dari opname, lalu diurutkan menurut nilai rupiahnya.',
        screen: { file: 'laporta-stock-opname.v2.webp', alt: 'Stock opname: pemakaian aktual dibanding kebutuhan ideal' },
      },
      {
        title: 'Jurnal yang menutup buku',
        body: 'Setiap transaksi memposting jurnal double-entry: bagan akun, buku besar, laba rugi, rekonsiliasi bank, dan tutup buku.',
        screen: { file: 'laporta-laba-rugi.v2.webp', alt: 'Laba rugi Juli dari buku besar: konsolidasi tiga belas outlet dan margin per outlet' },
      },
    ],
    timeline: [
      { date: '6 Mei 2026', title: 'Versi 2 dimulai', sourceRef: 'laporta_v2@8c85f7e' },
      { date: '2 Jul 2026', title: 'Modul pertama pindah dari data contoh ke database', sourceRef: 'laporta_v2@14f2777' },
      { date: '29 Jul 2026', title: 'Buku besar jadi sumber kebenaran, siap pilot', sourceRef: 'laporta_v2@7d244f9' },
      { date: '4 Agu 2026', title: 'Model OCR dipilih lewat uji tujuh model', sourceRef: 'laporta_v2@57435fc' },
      { date: '31 Agu 2026', title: 'Jadwal mingguan diubah tanpa menunggu server', sourceRef: 'laporta_v2@69ab349' },
    ],
    darkChapter: {
      eyebrow: 'TUR · 50 DETIK',
      title: 'Satu hari outlet, dari laci kas sampai buku besar.',
      body: 'Rekaman berikut berjalan di database demo dengan data contoh. Yang Anda lihat adalah aplikasinya sendiri, bukan maket.',
    },
    featuredDetails: {
      badgeLabel: 'FEATURED · STUDIO PRODUCT',
      shippedLabel: '✓ SHIPPED',
      metaLine: 'F&B OPS · STUDIO PRODUCT · MULTI-CABANG',
      headline: 'Laporta — bridging SPV dan Accounting di operasi F&B multi-cabang.',
      description:
        'Aplikasi yang menyederhanakan alur data dari cabang ke head office. Petty Cash, Stock Opname, Waste, dan data non-POS lainnya diproses cepat melalui satu workflow — termonitor langsung oleh Area Manager, Investor, dan Decision Maker. Dibangun untuk operator F&B Indonesia yang sudah melampaui kapasitas spreadsheet, namun belum cocok dengan enterprise ERP.',
      metrics: LAPORTA_METRICS.filter((m) => m.featured).map(toFeaturedMetric),
      codePanel: {
        tag: '[ .TS ]',
        path: 'apps/laporta/sync.ts',
        lines: [
          `${kw('export async function')} syncOutlet() {`,
          `&nbsp;&nbsp;${kw('const')} cash&nbsp; = ${kw('await')} outlet.pettyCash()`,
          `&nbsp;&nbsp;${kw('const')} stock = ${kw('await')} outlet.stockOpname()`,
          `&nbsp;&nbsp;${kw('const')} waste = ${kw('await')} outlet.waste()`,
          `&nbsp;&nbsp;${kw('const')} book&nbsp; = ledger(cash, stock, waste)`,
          `&nbsp;&nbsp;${kw('await')} push(<span style="color:#2C70FE">"hq.dashboard"</span>, book)`,
          `&nbsp;&nbsp;${kw('return')} book`,
          '}',
        ],
      },
      stack: ['NEXT.JS', 'POSTGRES', 'DRIZZLE', 'RAILWAY'],
    },
    studio: {
      vizType: 'laporta',
      usage: 'F&B MULTI-CABANG',
      externalLink: null,
      bullets: [
        'Tutup shift dari ponsel crew',
        'Serah terima kas sampai setoran bank',
        'Selisih stok vs resep × penjualan',
        'Jurnal, laba rugi, dan tutup buku',
      ],
    },
    body: [
      { h2: 'Masalahnya bukan POS' },
      'Jaringan Geprek Wow menjalankan banyak outlet sekaligus. POS mencatat penjualan dengan rapi, tapi semua yang bukan penjualan (kas kecil, stock opname, waste, setoran ke bank, absensi, belanja ke distribution center) tersebar di spreadsheet dan grup WhatsApp. Angka dari cabang harus disalin ulang sebelum bisa dibaca head office, dan masalah di outlet baru terlihat setelah laporannya dirapikan.',
      { h2: 'Satu sistem, lima peran' },
      'Laporta dibangun untuk lima peran: Super Admin, Akuntansi, Crew dan SPV Outlet, Investor, dan Maintenance. Semuanya berjalan di atas Postgres dengan Row Level Security per outlet, sehingga crew satu outlet secara teknis tidak bisa membaca data outlet lain.',
      'Alurnya mengikuti hari kerja outlet, bukan struktur database. Di akhir shift, crew menjalankan satu checklist Tutup Shift dari ponselnya: absen pulang, penjualan, stock opname, kas kecil, waste, lalu serah terima kas. Data yang sudah diserahkan terkunci. Kalau ada yang keliru, koreksinya punya jalur sendiri dan tercatat.',
      'Kas punya rantai kepemilikan antar-shift. Uang berpindah dari orang ke orang dengan jejak, sampai ke amplop yang disetor ke bank, dan foto bukti transfernya dibaca OCR untuk dicocokkan dengan nominal yang diklaim.',
      { h2: 'Dari outlet sampai buku besar' },
      'Semua transaksi bermuara ke jurnal double-entry: bagan akun, buku besar, laba rugi, arus kas, rekonsiliasi bank, tutup buku, sampai export ke format ESB. Stock opname tidak berhenti di "berapa sisanya": sistem menghitung kebutuhan bahan ideal dari resep dikali penjualan menu, menyandingkannya dengan pemakaian aktual, lalu mengurutkan selisihnya menurut nilai rupiah.',
      'Di sekitarnya ada modul yang biasanya hidup di aplikasi terpisah: absensi dari kamera ponsel dengan geolokasi dan antrean offline, roster mingguan yang sekaligus menjadi cut-off payroll, cuti dan lembur, purchase request ke distribution center, produksi dapur, kebersihan per shift, maintenance aset, dan portal investor dengan porsi kepemilikan yang tercatat per periode.',
      { h2: 'Yang tidak terlihat dari luar' },
      'Sebagian besar pekerjaan justru berupa menutup celah: laba rugi perusahaan yang ternyata bisa dibuka crew, data gaji yang terbuka untuk semua peran, lima rute tulis tanpa pemeriksaan wewenang, dan satu kebocoran RLS lewat connection pooler. Semuanya ditemukan lewat audit internal dan ditutup sebelum jadi insiden. Sistem yang memegang uang orang lain tidak cukup dinilai dari fiturnya.',
    ],
  },
  {
    slug: 'rpn-os',
    consent: 'legacy',
    order: 2,
    kind: 'client',
    client: 'RPN OS',
    tagline: 'ERP rumah produksi, dari pembelian bahan sampai buku besar.',
    meta: 'AGRIFOOD · ERP',
    industry: 'manufacturing',
    service: 'build',
    publishedYear: '2026',
    pills: ['NEXT.JS', 'DRIZZLE', 'POSTGRES', 'FIFO'],
    excerpt:
      'Sistem operasi untuk RPN Agro (PT Robbani Permata Niaga), rumah produksi sambal dan greens yang memasok jaringan outlet Geprek Wow. Persediaan FIFO, HPP aktual per batch, dan jurnal double-entry yang menutup buku setiap bulan.',
    cover: {
      file: 'portfolio-rpn-os.webp',
      alt: 'Dashboard RPN OS: nilai persediaan FIFO, batch produksi berjalan, piutang per outlet, dan surat jalan',
      focalX: 1,
      focalY: 50,
    },
    summary: {
      problem:
        'Bahan dibeli dari pasar dan supplier, diolah bertahap, lalu dikirim dan ditagih ke outlet. HPP yang bisa dipertanggungjawabkan harus bisa ditelusuri sampai harga bahan yang benar-benar terpakai.',
      solution:
        'Satu rantai dokumen dari PO sampai pembayaran, persediaan FIFO per lapisan harga, batch produksi dengan HPP dan yield aktual, dan jurnal double-entry di bawah setiap dokumen.',
      result:
        'Pembukuan dimulai dari posisi yang diketahui benar setelah masa uji, dengan invoice historis termigrasi dan pembayaran ganda dibersihkan sebelum buku dibuka.',
    },
    body: [
      { h2: 'Rumah produksi dengan rantai yang panjang' },
      'RPN Agro memproduksi sambal dan greens untuk jaringan outlet Geprek Wow. Bahan datang dari pasar dan supplier, diolah bertahap, lalu dikirim dengan surat jalan dan ditagih dengan invoice. Setiap tahap punya biaya, dan HPP yang bisa dipertanggungjawabkan harus bisa ditelusuri sampai ke harga bahan yang benar-benar terpakai.',
      { h2: 'Setiap dokumen menyambung ke dokumen berikutnya' },
      'Procurement berjalan sebagai rantai: PO, kedatangan barang, faktur supplier, lalu pembayaran, dengan jalur terpisah untuk belanja pasar yang memang tidak pernah punya PO. Setiap kedatangan membentuk lapisan FIFO dengan harga satuannya sendiri.',
      'Produksi mengambil bahan dari lapisan itu. Batch boleh berjalan beberapa hari, dicatat harian dan dipanen saat hasilnya bisa ditimbang, dan sambal melewati tahap antara (Cabe Selep) sebelum dimasak. HPP aktual dan yield terbentuk dari situ. Susut proses melekat ke HPP, sementara kerugian nyata dicatat terpisah sebagai write-off, supaya dua hal yang berbeda tidak saling menyamar.',
      'Distribusi menutup rantainya. Surat jalan bernomor resmi mengeluarkan stok secara FIFO, outlet mengonfirmasi penerimaan, invoice terbit, piutang bertambah, dan jatuh temponya dihitung dari termin masing-masing outlet.',
      { h2: 'Akuntansi di bawah semuanya' },
      'Setiap dokumen memposting jurnal double-entry-nya sendiri. Di atasnya berjalan PPN per baris dan PPh yang dipotong, aset tetap dengan penyusutan bulanan yang masuk ke HPP (bukan beban operasional), rekonsiliasi bank, dan tutup buku yang menghasilkan laporan akrual. HR ikut di dalamnya: jadwal shift, absensi ber-geofence, upah berbasis porsi jam, dan slip yang bisa dicetak.',
      'Hak akses tidak ditentukan oleh jabatan. Setiap wewenang adalah modul tersendiri, sehingga manajemen operasional bisa menjalankan produksi tanpa melihat kas dan nilai persediaan perusahaan.',
      { h2: 'Dari masa uji ke buku sungguhan' },
      'Pada 23 Agustus 2026 sistem menjalani cutoff: masa uji berakhir dan pembukuan dimulai dari posisi yang diketahui benar. Sebelumnya, 397 invoice historis (Januari sampai Juli 2026, sepuluh outlet) dan 643 baris pengeluaran senilai Rp580 juta dimigrasikan, aset tetap Rp62 juta masuk saldo awal, dan 25 pembayaran ganda senilai Rp33,9 juta ditemukan lalu dibersihkan, sekaligus menutup celah yang dulu membiarkan pembayaran melebihi nilai fakturnya.',
    ],
  },
  {
    slug: 'locascore',
    consent: 'studio',
    order: 3,
    kind: 'studio',
    client: 'LocaScore',
    tagline: 'Menilai calon lokasi outlet sebelum kontrak sewa ditandatangani.',
    meta: 'SITE INTELLIGENCE · STUDIO PRODUCT',
    industry: 'fb',
    service: 'intelligence',
    publishedYear: '2026',
    pills: ['NEXT.JS', 'PRISMA', 'GOOGLE PLACES', 'OSM'],
    excerpt:
      'Tempel satu link Google Maps, dapatkan skor kelayakan lokasi beserta alasannya. Kompetitor, demografi, dan kepadatan jalan dikumpulkan otomatis, lalu dikalibrasi dengan performa outlet yang sudah berjalan.',
    studio: {
      vizType: 'none',
      usage: 'SITE SCORING',
      externalLink: null,
      bullets: [
        'Auto-collect 14 kategori titik sekitar',
        'Traffic dari hierarki jalan OSM',
        'Skor dikalibrasi dari outlet berjalan',
        'Laporan PDF dan share link publik',
      ],
    },
    summary: {
      problem:
        'Lokasi outlet sering dipilih dari firasat dan kunjungan satu sore, padahal kontrak sewanya mengikat bertahun-tahun.',
      solution:
        'Tempel satu link Google Maps: kompetitor, fasilitas sekitar, demografi kelurahan, dan arus jalan dikumpulkan otomatis, bisa dikoreksi surveyor, lalu dinilai jadi rekomendasi GO atau NO-GO.',
      result:
        'Skor yang bisa dijelaskan alasannya, dikalibrasi dari performa outlet yang sudah berjalan, dan keluar sebagai laporan PDF serta tautan yang bisa dibagikan ke investor.',
    },
    body: [
      { h2: 'Keputusan mahal yang diambil cepat' },
      'Memilih lokasi outlet sering berakhir sebagai rapat berisi firasat: "ramai kok", "dekat sekolah", "kompetitornya cuma satu". Tidak jarang, kontrak sewa tiga tahun ditandatangani berdasarkan kunjungan satu sore.',
      { h2: 'Cara kerjanya' },
      'Surveyor menempelkan satu link Google Maps. Dari koordinat itu, LocaScore mengumpulkan empat belas kategori titik di sekitarnya (kompetitor beserta ratingnya, modern market, bank, sekolah, fasilitas kesehatan, fasilitas publik) lalu melakukan reverse geocoding sampai tingkat kelurahan untuk menarik angka demografi.',
      'Traffic tidak ditebak dari "ramai atau tidak", tetapi diturunkan dari kecepatan arus bebas dan hierarki jalan OpenStreetMap di sekitar titik. Setiap titik dibobot per unit, bukan sekadar dihitung jumlahnya.',
      'Semua hasil tarikan itu boleh diubah surveyor sebelum skor dikunci, karena data otomatis adalah titik awal, bukan putusan. Skor bergerak setiap kali field diubah, dan berakhir pada satu rekomendasi GO atau NO-GO.',
      { h2: 'Belajar dari jaringan yang memakainya' },
      'Bobot skornya dikalibrasi terhadap outlet yang sudah berjalan. Masukkan performa aktualnya, dan seluruh lokasi yang pernah dinilai dihitung ulang.',
      'Hasil akhirnya keluar sebagai laporan PDF untuk investor dan tautan publik yang bisa dibagikan tanpa membuat akun. Karena setiap panggilan ke Google Places ada biayanya (sekitar $1,35 per lokasi), pemakaiannya dipantau di halaman tersendiri supaya tagihan tidak jadi kejutan.',
    ],
  },
  {
    slug: 'the-global-review',
    consent: 'legacy',
    order: 4,
    kind: 'client',
    client: 'The Global Review',
    tagline: 'Frontend baru untuk media geopolitik, dengan redaksi yang tetap menulis di WordPress.',
    meta: 'MEDIA · HEADLESS CMS',
    industry: 'media',
    service: 'build',
    publishedYear: '2026',
    pills: ['NEXT.JS', 'HEADLESS WORDPRESS', 'I18N'],
    excerpt:
      'Situs baru untuk kanal analisis geopolitik milik Global Future Institute. Redaksi tetap bekerja di wp-admin; pembaca mendapat situs dua bahasa, dan redaksi mendapat halaman statistiknya sendiri.',
    summary: {
      problem:
        'Tampilan situs tertinggal dari bobot tulisannya, tetapi redaksi terbiasa menulis di wp-admin. Memaksa mereka pindah CMS adalah cara tercepat membuat proyek ini gagal.',
      solution:
        'WordPress tetap jadi tempat menulis; frontend dibangun ulang dengan Next.js dan membaca konten lewat REST API, ditambah mu-plugin untuk podcast, galeri, jajak pendapat, dan webhook pembaruan.',
      result:
        'Pembaca mendapat situs dua bahasa dengan arsip yang bisa disaring lewat URL, dan redaksi mendapat halaman statistik sendiri di wp-admin tanpa pelacak pihak ketiga.',
    },
    body: [
      { h2: 'Mengganti situs tanpa mengganti kebiasaan redaksi' },
      'The Global Review adalah kanal analisis geopolitik milik Global Future Institute, dengan arsip bertahun-tahun di WordPress. Tampilannya sudah tertinggal dari bobot tulisannya, tetapi redaksinya terbiasa dengan wp-admin, dan memaksa mereka pindah ke CMS baru adalah cara tercepat membuat proyek ini gagal.',
      { h2: 'Headless, dengan tambahan yang dibutuhkan' },
      'WordPress tetap menjadi tempat menulis. Frontend-nya dibangun ulang dengan Next.js dan membaca konten lewat REST API. Sebuah mu-plugin khusus menambahkan yang dibutuhkan situs baru: tipe konten podcast, galeri, dan jajak pendapat; kotak Sorotan Judul yang wajib diisi sebelum tulisan bisa terbit; kotak Pesan Masuk untuk formulir kontak; profil Pengurus dan Redaksi; serta webhook yang memperbarui halaman begitu tulisan disimpan.',
      { h2: 'Yang didapat pembaca' },
      'Situs dua bahasa dengan rute /en tersendiri, lengkap dengan canonical dan hreflang per bahasa. Arsip rubrik bisa difilter, diurutkan, dan dipaginasi, dan seluruh kondisinya tersimpan di URL sehingga hasil penyaringan bisa disimpan sebagai bookmark. Pencarian juga mengenali nama penulis, bukan hanya judul.',
      'Setiap artikel punya kartu pratinjau yang digambar server (foto artikel, overlay, dan logo), sehingga tautan yang dibagikan di WhatsApp tampil sebagai kartu besar, bukan tautan polos.',
      { h2: 'Yang didapat redaksi' },
      'Halaman Statistik di dalam wp-admin, ditarik dari Google Search Console dan Chrome UX Report lewat cron harian: grafik, perbandingan antar-periode, dan peringatan otomatis ketika datanya berhenti diperbarui. Tanpa pelacak pihak ketiga dan tanpa biaya bulanan.',
      'Peralihan domain ke situs baru selesai pada 24 Agustus 2026.',
    ],
  },
  {
    slug: 'uruzin',
    consent: 'legacy',
    order: 5,
    kind: 'client',
    client: 'Uruzin OS',
    tagline: 'Sistem operasional dan keuangan untuk konsultan perizinan usaha.',
    meta: 'LEGAL SERVICES · ERP',
    industry: 'legal',
    service: 'build',
    publishedYear: '2026',
    pills: ['OPERASIONAL', 'KEUANGAN', 'TASK BOARD'],
    excerpt:
      'Satu sistem untuk Uruzin, dari peluang, penawaran, dan pengurusan izin klien sampai invoice, piutang, dan pajak. Setiap orang melihat pekerjaannya sendiri; manajemen melihat arus kasnya langsung.',
    cover: {
      file: 'portfolio-uruzin-os.webp',
      alt: 'Uruzin OS: halaman login, dashboard pendapatan dan piutang, serta papan tugas per tim',
      focalX: 1,
      focalY: 50,
    },
    summary: {
      problem:
        'Satu klien perizinan berarti rangkaian pekerjaan panjang, dari konsultasi sampai izin terbit. Makin banyak klien, makin sulit melihat pekerjaan yang tertahan dan tagihan yang belum dibayar.',
      solution:
        'Satu sistem yang mengikuti perjalanan klien dari peluang dan penawaran sampai pengurusan izin, dengan keuangan penuh di sisi yang sama: invoice, piutang, kas, aset, dan pajak.',
      result:
        'Dashboard membuka hari dengan yang perlu ditagih dan yang lewat jatuh tempo, dan papan tugas per tim memperlihatkan pekerjaan yang tertahan sebelum klien menanyakannya.',
    },
    body: [
      { h2: 'Satu klien, satu rangkaian pekerjaan panjang' },
      'Uruzin mengurus legalitas dan perizinan usaha: pendirian PT dan CV, NIB, sertifikat halal, BPOM, sampai HAKI. Satu klien berarti satu rangkaian pekerjaan yang panjang, dari konsultasi, penawaran, dan pengumpulan dokumen sampai izinnya terbit. Semakin banyak klien, semakin sulit melihat pekerjaan mana yang tertahan dan tagihan mana yang belum dibayar.',
      { h2: 'Operasional dan keuangan dalam satu alur' },
      'Uruzin OS mengikuti perjalanan satu klien: layanan, pipeline dan peluang, penawaran, lalu pengurusan, tahap ketika dokumen diproses sampai izin terbit. Di sisi yang sama, keuangan berjalan penuh: penjualan dan invoice, pembelian, biaya, kas dan bank, bagan akun, aset tetap, dan pajak.',
      'Dashboard membuka hari dengan angka yang perlu ditindaklanjuti: pendapatan bulan berjalan, invoice yang perlu ditagih beserta yang sudah lewat jatuh tempo, pekerjaan yang siap ditagih, total piutang, dan arus kas enam bulan terakhir.',
      'Pekerjaan harian dikelola sebagai papan tugas per tim (Sales, Finance, Operasional, Creative, Marketing, IT) dengan prioritas dan tenggat, sehingga yang tertahan terlihat sebelum klien menanyakannya.',
      { h2: 'Visibilitas, bukan pengawasan' },
      'Setiap orang melihat tugas dan kinerjanya sendiri: pekerjaan yang selesai, tingkat produktivitas, dan rata-rata waktu penyelesaian. Laporan produktivitas memberi manajemen gambaran yang sama tanpa rapat status tambahan.',
      'Kerja sama dengan Uruzin dimulai pada 2023 lewat situs perusahaannya, dan kini berlanjut ke sistem yang menjalankan operasional hariannya.',
    ],
  },
  {
    slug: 'chicken-wow',
    consent: 'legacy',
    order: 6,
    kind: 'client',
    client: 'Chicken Wow',
    tagline: 'Situs jaringan gerai ayam geprek, dari menu sampai gerai terdekat.',
    meta: 'F&B · BUILD + CMS',
    industry: 'fb',
    service: 'build',
    publishedYear: '2026',
    pills: ['STATIC SITE', 'LARAVEL', 'FILAMENT', 'CPANEL'],
    excerpt:
      'Situs untuk jaringan gerai Chicken Wow (Masaya Food), dengan menu dan daftar gerai yang dibaca dari berkas data dan halaman link-in-bio milik sendiri. Aset dipangkas dari 20,3 MB menjadi 9,4 MB.',
    summary: {
      problem:
        'Menu dan daftar gerai tertanam di HTML, jadi setiap perubahan berarti seseorang menyunting markup lalu mengunggahnya manual, dan beberapa halaman utama berujung 404.',
      solution:
        'Situs yang membaca menu dan gerai dari berkas data yang diterbitkan panel CMS multi-tenant, plus halaman link-in-bio sendiri yang mengurutkan gerai dari yang terdekat.',
      result:
        'Perubahan menu dan gerai tidak lagi lewat developer, aset gambar menyusut lebih dari separuh, dan lalu lintas dari media sosial mendarat di situs sendiri.',
    },
    body: [
      { h2: 'Setiap perubahan harus lewat developer' },
      'Chicken Wow punya jaringan gerai yang terus bertambah dan menu yang berubah. Selama isinya tertanam di HTML, setiap perubahan berarti seseorang harus menyunting markup lalu mengunggahnya secara manual.',
      { h2: 'Situs publik yang membaca data' },
      'Halaman Menu, Kemitraan, Lokasi, dan Karier dibuat benar-benar ada (sebelumnya berujung 404), dan semuanya membaca isi dari berkas data, bukan dari markup. 38 gambar dikonversi ke WebP sehingga aset turun dari 20,3 MB menjadi 9,4 MB.',
      'Deploy berjalan lewat Git di cPanel. Itu bukan pilihan pertama, tetapi yang bertahan setelah transport FTP ternyata diblokir firewall penyedia hosting.',
      { h2: 'Panel CMS multi-tenant' },
      'Berkas data itu dirancang untuk diterbitkan oleh panel CMS Laravel dan Filament yang kami bangun sebagai aplikasi multi-tenant: satu aplikasi untuk beberapa klien sekaligus, dengan setiap situs sebagai batas tenant. Dari panel, tim mengelola kategori menu, item, varian, dan paket bundling; saat diterbitkan, panel menulis menu.json dan outlets.json langsung ke document root situsnya. Pipeline CI-nya menjalankan lint, test, build produksi, dan smoke test tiga kali deploy berturut-turut sebelum server menarik rilis baru.',
      { h2: 'Halaman kecil yang berdampak besar' },
      'Tautan di bio Instagram dan TikTok Chicken Wow sebelumnya mengarah ke Linktree. Kami membuat penggantinya: /info, halaman link-in-bio milik sendiri dengan daftar gerai berhalaman, banner kemitraan, dan tombol "cari gerai terdekat" yang membaca lokasi ponsel pengunjung lalu mengurutkan gerai dari yang paling dekat, supaya lalu lintas dari media sosial mendarat di situs sendiri, bukan di properti orang lain.',
    ],
  },
  {
    slug: 'coderoach-os',
    consent: 'studio',
    order: 9,
    kind: 'studio',
    client: 'Coderoach OS',
    tagline: 'Sistem operasi dan keuangan studio kami sendiri, dari penawaran sampai buku besar.',
    meta: 'OPS + FINANCE · STUDIO PRODUCT',
    industry: 'technology',
    service: 'build',
    publishedYear: '2026',
    pills: ['NEXT.JS', 'POSTGRES', 'DRIZZLE', 'MCP'],
    excerpt:
      'Alat internal yang menjalankan studio dua orang: klien, penawaran, proyek dan story, jam kerja, invoice, kas, dan pembukuan double-entry yang dijaga database, ditambah server MCP supaya Claude Code membaca status story dari sumbernya.',
    summary: {
      problem:
        'Penawaran, proyek, jam kerja, tagihan, dan pajak studio tersebar di spreadsheet terpisah, sehingga margin sebuah proyek baru ketahuan setelah semuanya direkap.',
      solution:
        'Satu aplikasi dari penawaran sampai buku besar. Setiap transaksi memposting jurnal double-entry, jam kerja langsung menjadi biaya proyek, dan status story naik sendiri dari PR, CI, dan deploy.',
      result:
        'Margin tiap proyek terbaca kapan saja, bukan menunggu tutup buku, dan jurnal yang timpang ditolak database sebelum tersimpan.',
    },
    showcase: {
      frame: 'laptop',
      screen: { file: 'coderoach-os-beranda.v2.webp', alt: 'Coderoach OS, Beranda: saldo kas, piutang, pendapatan dan laba bulan berjalan, tugas, dan proyek berjalan' },
      tour: { file: 'coderoach-os-tur.v2.mp4', alt: 'Tur Coderoach OS: beranda, proyek, papan kerja, invoice, kas dan bank, laporan laba rugi, dan grid jam' },
      tourPoster: { file: 'coderoach-os-tur.v2.poster.webp', alt: 'Coderoach OS, Beranda' },
      tourTranscript:
        'Tur tanpa suara, sekitar 80 detik. Beranda: saldo kas, piutang terbuka, pendapatan dan laba bulan berjalan, tugas yang menunggu, dan proyek berjalan. Daftar proyek, lalu satu proyek: nilai kontrak, biaya, jam, margin riil, progres story, dan rilis dengan gate. Papan kerja berisi fase, story, dan tugas lepas. Penagihan. Kas dan bank dengan mutasi dan transfer antar-kas. Laporan laba rugi per lini layanan. Grid jam mingguan dan utilisasi tim.',
      demoNote: 'Direkam dari database demo. Klien, orang, dan angka adalah data contoh.',
      consent: 'studio',
    },
    features: [
      {
        title: 'Margin proyek yang selalu terkini',
        body: 'Nilai kontrak, biaya proyek, dan jam kerja dikali rate internal dihitung ulang setiap kali salah satunya berubah, jadi margin riil tidak menunggu rekap akhir bulan.',
        screen: { file: 'coderoach-os-proyek-detail.v2.webp', alt: 'Detail proyek: nilai kontrak, total jam, biaya, margin riil, dan progres story' },
      },
      {
        title: 'Story yang statusnya diisi mesin',
        body: 'Status pengembangan naik sendiri dari PR, hasil tes CI per kriteria penerimaan, dan deploy produksi. Orang tetap bisa menimpanya, dengan alasan yang tercatat.',
        screen: { file: 'coderoach-os-tugas.v2.webp', alt: 'Papan kerja: fase, story, dan tugas lepas dalam empat kolom status' },
      },
      {
        title: 'Pembukuan yang dijaga database',
        body: 'Trigger memeriksa setiap jurnal saat transaksi selesai, dan jurnal yang timpang ditolak. Laba rugi, posisi kas, aging piutang, dan utilisasi dibaca dari buku yang sama.',
        screen: { file: 'coderoach-os-laporan.v2.webp', alt: 'Laporan laba rugi bulan berjalan, dengan margin per lini layanan' },
      },
      {
        title: 'Angka keuangan hanya untuk yang berhak',
        body: 'Staff melihat proyek, tugas, dan jamnya sendiri. Rate, biaya, saldo, dan nomor rekening disaring di query SQL, jadi tidak pernah sampai ke peramban mereka.',
      },
    ],
    timeline: [
      { date: '21 Agu 2026', title: 'Versi pertama: operasi dan pembukuan studio', sourceRef: 'coderoach-app@adfa743' },
      { date: '25 Agu 2026', title: 'Modul Repo: insiden, change failure rate, dan MTTR', sourceRef: 'coderoach-app@0f11f9e' },
      { date: '8 Sep 2026', title: 'Peta arsitektur dibangun dari fakta repo', sourceRef: 'coderoach-app@64b3348' },
      { date: '12 Okt 2026', title: 'Webhook diterima sebagai inbox, diproses terpisah', sourceRef: 'coderoach-app@3d830f4' },
      { date: '13 Okt 2026', title: 'Hasil tes per kriteria penerimaan dari CI klien lewat OIDC', sourceRef: 'coderoach-app@520495a' },
      { date: '13 Okt 2026', title: 'Server MCP untuk Claude Code dan rilis dengan gate', sourceRef: 'coderoach-app@c799399' },
    ],
    darkChapter: {
      eyebrow: 'TUR · 80 DETIK',
      title: 'Satu minggu studio, dari papan kerja sampai laba rugi.',
      body: 'Rekaman berikut berjalan di database demo dengan klien dan angka contoh. Yang Anda lihat adalah aplikasinya sendiri, bukan maket.',
    },
    body: [
      { h2: 'Alat yang kami pakai sendiri setiap hari' },
      'Coderoach OS menjalankan studio ini: klien dan penawaran, proyek yang dipecah jadi fase dan story, jam kerja per orang, invoice dan termin, biaya, kas, sampai laporan keuangan. Semua yang kami sarankan ke klien soal sistem internal, kami jalankan dulu di sini.',
      { h2: 'Pembukuan yang tidak bisa berbohong diam-diam' },
      'Setiap pembayaran, biaya, dan transfer memposting jurnal double-entry. Keseimbangannya dijaga trigger di Postgres yang baru memeriksa di akhir transaksi, dan pemeriksaan otomatis membuktikannya dengan sengaja memposting jurnal timpang lalu memastikan database menolaknya.',
      'Tanggal "hari ini" selalu tanggal WIB, bukan tanggal server, supaya transaksi tengah malam tidak jatuh ke hari yang salah.',
      { h2: 'Story yang statusnya tidak diisi tangan' },
      'Repo klien terhubung lewat webhook yang diterima sebagai inbox: route hanya memverifikasi dan menyimpan, pemrosesan berjalan terpisah. Dari situ status story naik sendiri saat PR dibuka, tes untuk tiap kriteria penerimaan lulus di CI, dan deploy produksi berhasil.',
      'Claude Code membaca dan mencatat ke story yang sama lewat server MCP dengan token ber-scope, jadi agen dan manusia melihat sumber kebenaran yang sama.',
    ],
  },
  {
    slug: 'akarkita',
    consent: 'studio',
    order: 20,
    kind: 'lab',
    client: 'AkarKita',
    tagline: 'Pohon keluarga privat yang paham istilah kekerabatan Sunda dan Minangkabau.',
    meta: 'LAB · PROYEK PRIBADI',
    industry: 'other',
    service: 'build',
    publishedYear: '2026',
    pills: ['NEXT.JS', 'CANVAS', 'PWA', 'POSTGRES'],
    excerpt:
      'Proyek pribadi farrez: silsilah keluarga besar di canvas sendiri, kalkulator kekerabatan menurut adat, dan simulator faraid dengan pecahan eksak. Dipakai sungguhan oleh satu keluarga.',
    summary: {
      problem:
        'Silsilah keluarga besar tersimpan di ingatan orang tua dan grup WhatsApp, dengan istilah kekerabatan seperti Uwa, Mamak, dan Bako yang tidak dikenal aplikasi silsilah umum.',
      solution:
        'Pohon interaktif di canvas, istilah kekerabatan dihitung relatif terhadap siapa pun yang dipilih menurut lensa Sunda atau Minang, dan aturan adat disimpan sebagai data, bukan kode.',
      result:
        'Dipakai sungguhan oleh satu keluarga besar, bisa dibuka offline di ponsel, dan simulator warisannya menghitung bagian faraid dengan pecahan eksak.',
    },
    showcase: {
      frame: 'browser',
      screen: { file: 'akarkita-pohon.v1.webp', alt: 'AkarKita: pohon keluarga contoh di canvas, dari leluhur sampai cicit, dengan satu orang yang difokus' },
      screenPhone: { file: 'akarkita-pohon-ponsel.v1.webp', alt: 'AkarKita di ponsel: potongan pohon dengan nama dan tahun lahir' },
      demoNote: 'Render dari keluarga contoh. Nama dan tahun adalah data fiktif.',
      consent: 'studio',
    },
    links: [{ kind: 'live', label: 'akarkita.vercel.app', href: 'https://akarkita.vercel.app', consent: 'studio' }],
    timeline: [
      { date: '24 Agu 2026', title: 'Engine kekerabatan, faraid, dan tata letak silsilah, semuanya fungsi murni yang teruji', sourceRef: 'AkarKita@fbda784' },
      { date: '24 Agu 2026', title: 'Bisa dibuka offline, foto dikompres di perangkat', sourceRef: 'AkarKita@9adfc1d' },
      { date: '14 Sep 2026', title: 'Simulator warisan menanyakan asabah jauh, server menghitung ulang', sourceRef: 'AkarKita@7223f97' },
    ],
    body: [
      { h2: 'Budaya sebagai data' },
      'Satu platform memetakan dua sistem kekerabatan sekaligus: Pancakaki Sunda yang bilateral dan suku Minangkabau yang diwariskan lewat garis ibu. Istilah, aturan pewarisan suku, dan peringatan pernikahan sesuku disimpan sebagai data, sehingga budaya lain bisa ditambahkan tanpa mengubah kode.',
      { h2: 'Canvas sendiri, bukan pustaka diagram' },
      'Pohonnya digambar di canvas dengan pan, zoom, dan pinch yang mulus, dan berubah bentuk saat diperkecil: dari orang per orang menjadi kelompok keluarga.',
      { h2: 'Warisan dengan pecahan eksak' },
      'Simulator faraid menghitung bagian ahli waris dengan pecahan, bukan desimal yang dibulatkan, dan membedakan harta pusaka tinggi Minang dari harta pencaharian. Sifatnya edukatif, bukan fatwa.',
    ],
  },
  {
    slug: 'pt-raja-roti-cemerlang',
    consent: 'legacy',
    hidden: true,
    order: 7,
    kind: 'client',
    client: 'PT Raja Roti Cemerlang Tbk',
    tagline: 'Company profile dan halaman Hubungan Investor untuk produsen tepung roti.',
    meta: 'FOOD MANUFACTURING · BUILD',
    industry: 'manufacturing',
    service: 'build',
    publishedYear: '2024',
    pills: ['REACT', 'TAILWIND'],
    excerpt:
      'Situs perusahaan untuk produsen tepung roti yang memasok brand seperti Mamasuka dan Kobe, lengkap dengan halaman Hubungan Investor yang mengumpulkan laporan tahunan, prospektus, dan dokumen investor lainnya.',
    body: [
      { h2: 'Dua jenis pembaca, satu situs' },
      'Raja Roti Group memproduksi tepung roti untuk industri makanan, bahan yang dipakai brand seperti Mamasuka dan Kobe. Sebagai perusahaan terbuka, situsnya punya dua pembaca dengan kebutuhan berbeda: calon mitra yang ingin tahu kapasitas dan kualitas produksinya, dan investor yang mencari dokumen resmi.',
      { h2: 'Yang dibangun' },
      'Landing page yang bercerita dari sisi produksi (teknologi, standar kualitas, dan brand yang dipasok) dengan jalur kontak yang jelas untuk calon mitra.',
      'Di halaman terpisah, Hubungan Investor mengumpulkan dokumen yang biasanya tercecer: informasi keuangan bulanan, triwulan, dan tahunan; ikhtisar keuangan dan operasional; laporan tahunan; laporan keberlanjutan; presentasi kepada investor; dan prospektus. Masing-masing punya tab sendiri, dengan berkas yang bisa langsung diunduh.',
      'Dibangun dengan React dan Tailwind, dan disusun ulang untuk layar ponsel.',
    ],
  },
  {
    slug: 'tumtim-cookies',
    consent: 'legacy',
    hidden: true,
    order: 8,
    kind: 'client',
    client: 'Tumtim Cookies',
    tagline: 'Company website untuk produsen cookies dan bakery, dengan katalog dan jalur pemesanan.',
    meta: 'F&B · BUILD',
    industry: 'fb',
    service: 'build',
    publishedYear: '2024',
    pills: ['WORDPRESS', 'ELEMENTOR'],
    excerpt:
      'Situs untuk Tumtim Cookies & Bakery: katalog roti, cookies, snackbox, dan hampers, dengan jalur pemesanan ke outlet dan e-commerce, dalam nada yang mengikuti brand voice mereka.',
    body: [
      { h2: 'Dari pesanan lebaran ke produksi harian' },
      'Tumtim berawal pada 2015 sebagai produsen kue kering untuk pesanan lebaran, lalu tumbuh menjadi produsen cookies dan roti yang beroperasi setiap hari. Situsnya perlu ikut tumbuh: bukan lagi brosur musiman, melainkan etalase untuk empat lini produk dan beberapa jalur pembelian.',
      { h2: 'Yang dibangun' },
      'Company website dengan katalog per lini (roti, cookies, snackbox, dan hampers) dan jalur pemesanan yang jelas: ambil langsung di outlet, pesan lewat e-commerce, atau hubungi tim untuk pesanan acara dan hampers. Halaman Tentang Kami dan FAQ menjawab pertanyaan yang biasanya datang lewat chat.',
      'Situsnya berjalan di WordPress dengan Elementor, sehingga tim Tumtim bisa memperbarui produk, banner musiman, dan angka di halaman depan tanpa menunggu developer.',
      'Copy dan visualnya mengikuti suara brand Tumtim yang hangat: produk halal dengan harga bersahabat untuk berbagai momen.',
    ],
  },
];
