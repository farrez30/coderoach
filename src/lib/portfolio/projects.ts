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
export const HIDDEN_PROJECT_SLUGS = ['ads-multiplatform-dashboard'];

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
    slug: 'viralytics',
    consent: 'studio',
    order: 10,
    kind: 'studio',
    client: 'Viralytics',
    tagline: 'Operasional campaign KOL dari pemilihan influencer sampai laporan hasil, dalam satu alur bergerbang.',
    meta: 'KOL OPS · STUDIO PRODUCT',
    industry: 'media',
    service: 'build',
    publishedYear: '2026',
    pills: ['REACT', 'EXPRESS', 'POSTGRES', 'SSE'],
    excerpt:
      'Platform agensi untuk menjalankan campaign influencer: shortlist KOL, persetujuan brand per fase, draft dan verifikasi unggahan, pembayaran termin, sampai laporan hasil yang tidak perlu disusun ulang.',
    cover: {
      file: 'viralytics-campaign-board.v1.webp',
      alt: 'Daftar campaign Viralytics: ringkasan campaign aktif, budget, slot, dan views di atas tabel campaign',
      focalX: 50,
      focalY: 15,
    },
    studio: {
      vizType: 'none',
      usage: 'KOL CAMPAIGN OPS',
      externalLink: null,
      bullets: [
        'Direktori dan shortlist KOL',
        'Persetujuan brand per fase',
        'Verifikasi link unggahan',
        'Laporan hasil per campaign',
      ],
    },
    summary: {
      problem:
        'Campaign KOL biasanya berjalan lewat spreadsheet, chat, dan tangkapan layar. Brand tidak tahu KOL mana yang menunggu keputusannya, draft dan link ditagih satu per satu, dan laporan akhir disusun ulang dari nol setiap campaign.',
      solution:
        'Satu alur bergerbang untuk agensi dan brand: setiap campaign berjalan per fase dengan persetujuan brand, link unggahan diverifikasi sebelum metriknya ditarik otomatis, dan status berubah di layar semua orang saat itu juga.',
      result:
        'Antrean yang menahan jadwal terlihat di satu tempat, dan laporan hasil sudah tersedia begitu campaign selesai.',
    },
    showcase: {
      frame: 'browser',
      screen: { file: 'viralytics-campaign-board.v1.webp', alt: 'Daftar campaign Viralytics: ringkasan campaign aktif, budget, slot, dan views di atas tabel campaign' },
      tour: { file: 'viralytics-tur.v1.mp4', alt: 'Tur Viralytics: daftar campaign, fase campaign, direktori KOL, review konten, dan laporan hasil' },
      tourPoster: { file: 'viralytics-tur.v1.poster.webp', alt: 'Daftar campaign Viralytics' },
      tourTranscript:
        'Tur tanpa suara, sekitar 40 detik. Daftar campaign dengan status, slot, budget, dan progres views. Detail satu campaign beserta fasenya. Direktori KOL dengan filter dan shortlist. Antrean review konten. Lalu laporan hasil sebuah campaign yang sudah selesai.',
      demoNote:
        'Direkam dari build lokal dengan data fiktif: brand, orang, handle, dan angka tidak mewakili klien atau KOL sungguhan.',
      consent: 'studio',
    },
    features: [
      {
        title: 'Papan campaign',
        body: 'Semua campaign dalam satu daftar dengan status, slot KOL terisi, serapan budget, dan progres views terhadap target. Antrean yang menahan jadwal diingatkan di bagian atas.',
        screen: { file: 'viralytics-campaign-board.v1.webp', alt: 'Daftar campaign dengan status, slot, budget, progres views, dan jadwal' },
      },
      {
        title: 'Direktori dan shortlist KOL',
        body: 'KOL per tier dengan filter platform, kategori, provinsi, dan sumber data. Beberapa KOL dipilih sekaligus lalu diajukan ke campaign dalam satu aksi.',
        screen: { file: 'viralytics-kol-discovery.v1.webp', alt: 'Direktori KOL dengan filter, tabel followers dan ER, dan bilah aksi ajukan ke campaign' },
      },
      {
        title: 'Fase dan gerbang persetujuan',
        body: 'Setiap campaign berjalan per fase, dari pembuatan sampai posting, dengan persetujuan brand di tiap fase. Progres setiap KOL terlihat dalam satu matriks.',
        screen: { file: 'viralytics-alur-konten.v1.webp', alt: 'Empat kartu fase campaign dengan status persetujuan, dan matriks progres tiap KOL' },
      },
      {
        title: 'Laporan yang tidak disusun ulang',
        body: 'Total views, engagement, rata-rata ER, biaya per view dan per engagement, pencapaian target, dan kontribusi tiap KOL dibaca dari data yang sama dengan operasinya.',
        screen: { file: 'viralytics-laporan.v1.webp', alt: 'Laporan campaign selesai: views, engagement, biaya per view, dan kontribusi per KOL' },
      },
    ],
    timeline: [
      { date: '27 Apr 2026', title: 'Prototipe pertama manajemen campaign KOL', sourceRef: 'viralytics@fd739ca' },
      { date: '1 Mei 2026', title: 'Review link konten: KOL kirim, tim setujui, metrik ditarik', sourceRef: 'viralytics@de99a87' },
      { date: '14 Mei 2026', title: 'Perubahan status muncul seketika lewat server-sent events', sourceRef: 'viralytics@11bec22' },
      { date: '11 Jul 2026', title: 'Autentikasi di-host sendiri: Argon2id, sesi di database, CSRF', sourceRef: 'viralytics@8ebf527' },
      { date: '24 Jul 2026', title: 'Mode demo dicabut, setiap kontrol tersambung ke data nyata', sourceRef: 'viralytics@4192092' },
      { date: '25 Agu 2026', title: 'Fase campaign dengan persetujuan brand per fase', sourceRef: 'viralytics@21df1da' },
    ],
    darkChapter: {
      eyebrow: 'TUR · 40 DETIK',
      title: 'Satu campaign, dari shortlist sampai laporan.',
      body: 'Rekaman berikut berjalan dengan brand, KOL, dan angka fiktif. Yang Anda lihat adalah aplikasinya sendiri, bukan maket.',
    },
    body: [
      { h2: 'Produk venture, bukan proyek pesanan' },
      'Viralytics dibangun studio bersama mitra venture yang menjalankan agensi KOL. Kebutuhan datang dari operasi agensi itu sendiri: siapa menunggu siapa, draft mana yang belum masuk, dan termin mana yang belum dibayar.',
      { h2: 'Alur yang bergerbang, bukan daftar tugas' },
      'Setiap langkah punya pemilik dan gerbang persetujuan. Link unggahan diverifikasi dulu, baru metriknya ditarik otomatis, jadi angka di laporan tidak pernah disalin tangan.',
      'Autentikasi di-host sendiri dengan Argon2id, sesi di database, perlindungan CSRF, dan verifikasi dua langkah lewat email.',
    ],
  },
  {
    slug: 'rencana-ro',
    consent: 'studio',
    order: 11,
    kind: 'studio',
    client: 'Rencana RO',
    tagline: 'Asisten mingguan untuk distributor independen: bonus cair, beli berapa, taruh di mana, kapan repeat order.',
    meta: 'SAAS · STUDIO PRODUCT',
    industry: 'other',
    service: 'automate',
    publishedYear: '2026',
    pills: ['PLAYWRIGHT', 'NEXT.JS', 'SUPABASE', 'GITHUB ACTIONS'],
    excerpt:
      'SaaS milik studio yang setiap jam menarik data jaringan distributor dari back office, lalu menjawab empat pertanyaan mingguan mereka lewat dashboard, email, kalender, dan push di ponsel.',
    cover: {
      file: 'rencana-ro-dashboard.v1.webp',
      alt: 'Beranda Rencana RO dengan empat kartu jawaban: bonus cair, saran pembelian, posisi untuk member baru, dan tenggat repeat order',
      focalX: 50,
      focalY: 15,
    },
    studio: {
      vizType: 'none',
      usage: 'DISTRIBUTOR SAAS',
      externalLink: null,
      bullets: [
        'Tarikan data back office tiap jam',
        'Rencana repeat order per kaki',
        'Pengingat lewat email, push, kalender',
        'Riwayat run yang bisa diaudit',
      ],
    },
    metrics: [
      {
        key: 'cek-sesi-region',
        value: '27',
        unit: 'ms',
        label: 'Cek sesi per request',
        baseline: { value: '137', unit: 'ms' },
        status: 'measured',
        measuredAt: '2026-08-28',
        method: 'Fase cek sesi di middleware, sebelum dan sesudah fungsi dan database dipindah ke Singapura; median delapan sampel sesudahnya.',
        sourceRef: 'rencana-ro@cca37ff',
        consent: 'studio',
      },
    ],
    summary: {
      problem:
        'Back office distributor hanya menerbitkan data mentah: bagan jaringan, tabel kaki, buku bonus, dan masa aktif. Siapa yang perlu repeat order sebelum tutup mingguan harus dihitung sendiri, dan salah hitung berarti poin hangus.',
      solution:
        'Penarik data terjadwal menyimpan jaringan tiap distributor secara terpisah, lalu mesin aturan menyimulasikan pembelian di atas pohon jaringannya dan mengirim rencananya ke tempat distributor membaca.',
      result:
        'Satu layar menjawab bonus yang sudah cair, pembelian yang disarankan, posisi untuk member baru, dan tenggat repeat order, dengan tanggal data di setiap angka.',
    },
    showcase: {
      frame: 'browser',
      screen: { file: 'rencana-ro-dashboard.v1.webp', alt: 'Beranda Rencana RO dengan empat kartu jawaban: bonus cair, saran pembelian, posisi untuk member baru, dan tenggat repeat order' },
      screenPhone: { file: 'rencana-ro-dashboard-ponsel.v1.webp', alt: 'Beranda yang sama di ponsel: kartu jawaban ditumpuk satu kolom dengan navigasi bawah' },
      tour: { file: 'rencana-ro-tur.v1.mp4', alt: 'Tur Rencana RO: beranda, bonus cair, rencana repeat order, kalender, riwayat tarikan, dan pengaturan pengingat' },
      tourPoster: { file: 'rencana-ro-tur.v1.poster.webp', alt: 'Beranda Rencana RO' },
      tourTranscript:
        'Tur tanpa suara, sekitar satu menit. Beranda yang terisi, lalu bonus yang sudah cair. Rencana repeat order per kaki dengan jumlah unit, biaya, dan alasannya. Kalender repeat order bulanan. Riwayat dan log tarikan data per jam. Pengaturan pengingat dan jadwal tarikan, lalu lonceng notifikasi.',
      demoNote:
        'Direkam dari build lokal di atas jaringan fiktif: nama, nomor anggota, poin, dan rupiah dibangkitkan mesin. Tidak ada data atau akun distributor sungguhan.',
      consent: 'studio',
    },
    features: [
      {
        title: 'Empat jawaban di satu layar',
        body: 'Bonus yang sudah cair, pembelian yang disarankan beserta perkiraan bonusnya, posisi untuk member baru, dan tenggat repeat order. Setiap angka menyebut tanggal datanya, dan yang bergantung asumsi diberi label perkiraan.',
        screen: { file: 'rencana-ro-dashboard-ponsel.v1.webp', alt: 'Beranda di ponsel: kartu jawaban ditumpuk satu kolom' },
      },
      {
        title: 'Rencana repeat order dengan alasan',
        body: 'Mesin aturan berlapis menyimulasikan pembelian di atas pohon jaringan distributor sendiri: siapa di kaki mana, berapa unit, berapa biayanya, dan kenapa. Rencana disimpan terstruktur per run, jadi tampilan baru berlaku mundur ke run lama.',
        screen: { file: 'rencana-ro-rencana-ro.v1.webp', alt: 'Bilah poin kaki kiri dan kanan sebelum dan sesudah, dan daftar repeat order yang disarankan' },
      },
      {
        title: 'Pengingat yang diatur sendiri',
        body: 'Distributor memilih hari pengingat, target yang dikejar, kanal, dan jam tarikan otomatis. Kalender repeat order bulanan bisa diekspor ke aplikasi kalender.',
        screen: { file: 'rencana-ro-kalender.v1.webp', alt: 'Kalender repeat order bulanan dengan nama fiktif per tanggal, berwarna menurut status' },
      },
      {
        title: 'Tarikan per jam yang bisa diaudit',
        body: 'Penjadwal berdetak tiap jam untuk distributor yang jadwalnya jatuh. Satu login hanya boleh punya satu sesi, jadi run yang berjalan sekaligus menjadi kunci, dan setiap run mencatat log, durasi per fase, dan laporan.',
        screen: { file: 'rencana-ro-riwayat-run.v1.webp', alt: 'Riwayat proses: tarikan terjadwal berstatus berhasil dengan tautan log dan ekspor laporan' },
      },
    ],
    timeline: [
      { date: '11 Jul 2026', title: 'Penarik data back office dan mesin rencana repeat order', sourceRef: 'rencana-ro@9db7ab5' },
      { date: '12 Jul 2026', title: 'Notifikasi email, kalender, dan tautan WhatsApp', sourceRef: 'rencana-ro@ed56cbf' },
      { date: '22 Jul 2026', title: 'Langganan, pembayaran, dan jadwal tarikan per pengguna', sourceRef: 'rencana-ro@57ec739' },
      { date: '13 Agu 2026', title: 'Push pagi ke ponsel tanpa membuka back office', sourceRef: 'rencana-ro@6b0ae8e' },
      { date: '28 Agu 2026', title: 'Fungsi dan database dipindah ke Singapura, lalu diukur', sourceRef: 'rencana-ro@cca37ff' },
      { date: '3 Okt 2026', title: 'Satu beranda menggantikan empat mode dan enam laci', sourceRef: 'rencana-ro@ee1d450' },
    ],
    darkChapter: {
      eyebrow: 'TUR · 60 DETIK',
      title: 'Dari data mentah back office ke rencana minggu ini.',
      body: 'Rekaman berikut berjalan di atas jaringan fiktif yang dibangkitkan mesin. Yang Anda lihat adalah aplikasinya sendiri, bukan maket.',
    },
    body: [
      { h2: 'Saran, bukan sekadar data' },
      'Distributor sudah punya datanya; yang tidak mereka punya adalah waktu untuk menghitung aturan bonus yang berlapis setiap minggu. Rencana RO mengerjakan hitungan itu dan menjawab dengan bahasa sehari-hari, di ponsel tempat mereka membacanya.',
      { h2: 'Setiap distributor terpisah di database' },
      'Data tiap pengguna dipisahkan row level security, kredensial back office disimpan terenkripsi, dan kuota serta kunci run dijaga fungsi di database. Satu perintah pemeriksaan menjalankan typecheck, tes mesin dan parser, tes pemisahan tenant, dan kontras tema sebelum rilis.',
    ],
  },
  {
    slug: 'akarkita',
    consent: 'studio',
    order: 20,
    kind: 'lab',
    client: 'AkarKita',
    tagline: 'Pohon keluarga privat yang paham istilah kekerabatan Sunda dan Minangkabau.',
    meta: 'LAB · SILSILAH & ADAT',
    industry: 'community',
    service: 'build',
    publishedYear: '2026',
    pills: ['NEXT.JS', 'CANVAS', 'PWA', 'POSTGRES'],
    cover: {
      file: 'akarkita-pohon.v1.webp',
      alt: 'AkarKita: pohon keluarga contoh di canvas, dari leluhur sampai cicit, dengan satu orang yang difokus',
      focalX: 30,
      focalY: 70,
    },
    excerpt:
      'Silsilah keluarga besar di canvas sendiri, kalkulator kekerabatan menurut adat Sunda dan Minang, dan simulator faraid dengan pecahan eksak. Proyek lab yang dipakai sungguhan oleh satu keluarga.',
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
    slug: 'jeda',
    consent: 'studio',
    order: 21,
    kind: 'lab',
    client: 'Jeda',
    tagline: 'Catatan pikiran di antara sesi konseling, yang tetap jalan tanpa sinyal.',
    meta: 'LAB · KESEHATAN MENTAL',
    industry: 'health',
    service: 'build',
    publishedYear: '2026',
    pills: ['NEXT.JS', 'PWA', 'INDEXEDDB', 'POSTGRES'],
    excerpt:
      'Aplikasi thought record CBT yang dibangun bersama seorang psikolog: klien mencatat saat perasaan berubah, bahkan tanpa internet, lalu membagikan tautan baca-saja kepada psikolognya.',
    cover: {
      file: 'jeda-tabel-psikolog.v1.webp',
      alt: 'Tampilan psikolog di laptop: tabel catatan klien dengan bagian Baru sejak terakhir dibuka',
      focalX: 50,
      focalY: 20,
    },
    summary: {
      problem:
        'Pekerjaan rumah CBT biasanya diisi di kertas atau chat, tercecer, dan sering baru ditulis ulang menjelang sesi, sehingga sulit dibaca berurutan oleh psikolog.',
      solution:
        'Aplikasi yang mencatat lebih dulu di ponsel, tetap jalan tanpa sinyal, lalu menyinkronkan diam-diam. Psikolog membaca lewat tautan baca-saja yang bisa dikunci PIN dan dicabut.',
      result:
        'Klien bisa mencatat dalam hitungan detik di mana saja, dan psikolog langsung tahu catatan mana yang baru sejak terakhir dibuka.',
    },
    showcase: {
      frame: 'browser',
      screen: { file: 'jeda-tabel-psikolog.v1.webp', alt: 'Tampilan psikolog di laptop: tabel catatan klien dengan bagian Baru sejak terakhir dibuka' },
      screenPhone: { file: 'jeda-daftar.v1.webp', alt: 'Layar utama Jeda di ponsel: daftar catatan dua minggu, dua bertanda belum lengkap' },
      loop: { file: 'jeda-catat-cepat-loop.v1.mp4', alt: 'Menekan Catat, mengetik situasi dan pikiran, lalu menyimpan' },
      loopPoster: { file: 'jeda-catat-cepat-loop.v1.poster.webp', alt: 'Lembar catatan baru di ponsel' },
      tour: { file: 'jeda-tur.v1.mp4', alt: 'Tur Jeda: daftar catatan, mencatat cepat, melengkapi catatan, lalu dibaca dari ruang psikolog' },
      tourPoster: { file: 'jeda-tur.v1.poster.webp', alt: 'Daftar catatan Jeda di ponsel' },
      tourTranscript:
        'Tur tanpa suara, sekitar 50 detik. Daftar catatan klien selama dua minggu. Catatan baru disimpan cukup dengan situasi dan pikiran. Catatan yang belum lengkap dilengkapi dengan seberapa yakin, emosi beserta intensitasnya, dan respon. Lalu catatan yang sama dibaca dari ruang psikolog: beranda, ringkasan dengan grafik, dan tabel catatan.',
      demoNote: 'Direkam dari data contoh karangan pada build lokal. Tidak ada catatan klien atau psikolog sungguhan.',
      consent: 'studio',
    },
    features: [
      {
        title: 'Catat cepat, lengkapi nanti',
        body: 'Cukup situasi dan pikiran untuk menyimpan. Sisanya bisa diisi belakangan, dan catatannya ditandai belum lengkap.',
        screen: { file: 'jeda-catat-cepat.v1.webp', alt: 'Lembar catatan baru dengan situasi dan pikiran terisi' },
      },
      {
        title: 'Tetap jalan tanpa internet',
        body: 'Catatan ditulis ke perangkat dulu lalu disinkronkan begitu online. Draf bertahan walau aplikasi ditutup paksa.',
        screen: { file: 'jeda-daftar.v1.webp', alt: 'Daftar catatan klien di ponsel' },
      },
      {
        title: 'Emosi yang bisa dinamai',
        body: 'Perasaan dipilih dari daftar yang masing-masing punya arti satu baris, dengan intensitas dan skala keyakinan yang berlabel di kedua ujungnya.',
        screen: { file: 'jeda-catatan-lengkap.v1.webp', alt: 'Catatan lengkap: keyakinan, emosi cemas dengan intensitasnya, dan respon' },
      },
      {
        title: 'Ruang baca untuk psikolog',
        body: 'Tautan bertoken dengan PIN opsional yang bisa kedaluwarsa dan dicabut. Ringkasan per hari, tren keyakinan, tanda catatan baru, dan unduh PDF.',
        screen: { file: 'jeda-ringkasan.v1.webp', alt: 'Tab Ringkasan di laptop: catatan per hari, tren keyakinan, dan tabel emosi' },
      },
    ],
    timeline: [
      { date: '1 Okt 2026', title: 'Proyek dimulai', sourceRef: 'Jeda@ba94670' },
      { date: '3 Okt 2026', title: 'Aplikasi klien offline, catat cepat, dan tautan psikolog', sourceRef: 'Jeda@7669014' },
      { date: '3 Okt 2026', title: 'Rahasia lokal dikeluarkan dari unggahan deploy', sourceRef: 'Jeda@5f47376' },
      { date: '3 Okt 2026', title: 'Ringkasan dan tabel catatan jadi tab di setiap halaman', sourceRef: 'Jeda@c8f988a' },
    ],
    darkChapter: {
      eyebrow: 'TUR · 50 DETIK',
      title: 'Dari kereta tanpa sinyal ke meja psikolog.',
      body: 'Rekaman berikut berjalan dengan catatan contoh karangan. Yang Anda lihat adalah aplikasinya sendiri, bukan maket.',
    },
    body: [
      { h2: 'Mencatat, bukan menafsirkan' },
      'Psikolog yang memakainya meminta lebih sedikit analisis dan lebih banyak kehadiran. Jadi layar klien sengaja hanya mencatat: tidak ada grafik mood, streak, lencana, atau ringkasan otomatis. Angka dan grafik hanya ada di sisi psikolog.',
      { h2: 'Data kesehatan tetap di tempatnya' },
      'Tanpa SDK analitik dan tanpa tracker, font di-host sendiri, dan aplikasinya tidak memanggil server lain. Tampilan psikolog dirender di server dan tetap terbaca tanpa JavaScript.',
    ],
  },
  {
    slug: 'd-day',
    consent: 'studio',
    order: 22,
    kind: 'lab',
    client: 'd-day',
    tagline: 'Sistem eksekusi otomatis untuk aturan yang ditulis orang lain.',
    meta: 'LAB · EKSEKUSI OTOMATIS',
    industry: 'technology',
    service: 'automate',
    publishedYear: '2026',
    pills: ['TYPESCRIPT', 'NEXT.JS', 'POSTGRES', 'SYSTEMD'],
    excerpt:
      'Mesin yang menjalankan aturan trading milik mitra dengan disiplin: tiap keputusan tercatat, setiap posisi punya penjaga, dan semuanya bisa dihentikan dengan satu ketukan.',
    cover: {
      file: 'd-day-keadaan.v1.webp',
      alt: 'Dashboard d-day halaman Keadaan: status engine, tombol hentikan semua order, dan tabel engine simulasi',
      focalX: 50,
      focalY: 10,
    },
    summary: {
      problem:
        'Pemilik aturan tahu kapan masuk dan keluar, tapi tidak membaca kode dan tidak bisa menjaga server sepanjang hari. Menjalankan aturan orang lain dengan uang sungguhan tidak boleh meninggalkan posisi tanpa penjaga.',
      solution:
        'Engine yang bangun di setiap bar, menghitung sinyal secara deterministik, memasang stop sebagai order nyata, dan mencocokkan keadaannya dengan exchange sebelum memercayai catatan sendiri.',
      result:
        'Keadaan engine terbaca dalam satu kalimat, berhenti cukup satu ketukan, dan jalan lanjut hanya terbuka setelah bukti sinkron menunjukkan semuanya cocok.',
    },
    showcase: {
      frame: 'browser',
      screen: { file: 'd-day-keadaan.v1.webp', alt: 'Dashboard d-day halaman Keadaan: status engine, tombol hentikan semua order, dan tabel engine simulasi' },
      tour: { file: 'd-day-tur.v1.mp4', alt: 'Tur d-day: keadaan sehat, halaman exchange, menghentikan semua order, lalu melanjutkan' },
      tourPoster: { file: 'd-day-tur.v1.poster.webp', alt: 'Dashboard d-day halaman Keadaan' },
      tourTranscript:
        'Tur tanpa suara, sekitar 40 detik. Halaman Keadaan dengan engine sehat, log tick, dan notifikasi. Halaman Exchange dengan hasil sinkron baca-saja. Lalu semua order dihentikan dengan satu tombol, dan dilanjutkan kembali dengan mengetik LANJUTKAN.',
      demoNote:
        'Data simulasi: nama engine, simbol, harga, dan order semuanya karangan, di database lokal tanpa akun exchange. Panel saldo, hasil, dan harga stop disembunyikan.',
      consent: 'studio',
    },
    features: [
      {
        title: 'Status engine dalam satu kalimat',
        body: 'Heartbeat, tick terakhir, halt, dan posisi tanpa proteksi dinilai bersama, dan yang terburuk yang menang. Galat teknis diterjemahkan ke bahasa orang, dengan teks aslinya tetap bisa dibuka.',
        screen: { file: 'd-day-log.v1.webp', alt: 'Log tick terakhir dengan satu galat jaringan yang diterjemahkan, dan notifikasi email' },
      },
      {
        title: 'Berhenti satu ketukan, lanjut lewat bukti',
        body: 'Menghentikan semua order cukup satu tombol, karena saat darurat detik berarti. Lanjutkan hanya terbuka kalau sinkron exchange yang masih segar membuktikan order dan catatan engine cocok.',
        screen: { file: 'd-day-kill-switch.v1.webp', alt: 'Keadaan sesudah kill switch: strip merah dan formulir Lanjutkan yang terkunci' },
      },
      {
        title: 'Rekonsiliasi baca-saja',
        body: 'Worker terpisah memegang kunci, dashboard tidak. Pemeriksaan menemukan stop yang dibatalkan dari luar dan order yang bukan buatan engine, tanpa mengirim satu order pun.',
        screen: { file: 'd-day-rekonsiliasi.v1.webp', alt: 'Halaman Exchange: satu dari dua engine tidak cocok dan satu order bukan buatan engine' },
      },
    ],
    timeline: [
      { date: '10 Sep 2026', title: 'Engine mencocokkan diri dengan exchange sebelum memercayai keadaan tersimpan', sourceRef: 'd-day@0713dd3' },
      { date: '11 Sep 2026', title: 'Kill switch satu ketukan; kehati-hatian dipindah ke Lanjutkan', sourceRef: 'd-day@fe0cba2' },
      { date: '3 Okt 2026', title: 'Worker sinkron baca-saja di belakang tombol Sinkronkan', sourceRef: 'd-day@6cff7b8' },
      { date: '7 Okt 2026', title: 'Uji testnet ditutup: stop nyata, order ditolak, dan proses mati di tengah order', sourceRef: 'd-day@221ea8b' },
    ],
    darkChapter: {
      eyebrow: 'TUR · 40 DETIK',
      title: 'Berhenti dalam satu ketukan, lanjut hanya dengan bukti.',
      body: 'Rekaman berikut berjalan dengan data simulasi di mesin lokal, tanpa akun exchange sungguhan.',
    },
    body: [
      { h2: 'Mesin, bukan peramal' },
      'Keputusan trading tetap di tangan pemilik aturan. Sistem tidak menebak dan tidak mengoptimasi; ia menjalankan aturan yang tertulis, dan berhenti ketika ada yang tidak jelas.',
      { h2: 'Satu loop untuk semua mode' },
      'Backtest, mode bayangan, dan mode live memakai loop yang sama, jadi tidak ada cabang logika yang hanya teruji di satu mode. Jalur yang memegang uang ditulis tanpa dependency pihak ketiga, dan setiap keputusan desain dicatat sebagai ADR.',
    ],
  },
  {
    slug: 'yiheecam',
    consent: 'studio',
    order: 23,
    kind: 'lab',
    client: 'YiheeCam',
    tagline: 'Pengendali action cam lama yang ditinggalkan vendornya, dibangun ulang dari protokolnya.',
    meta: 'LAB · ANDROID & PROTOKOL',
    industry: 'technology',
    service: 'build',
    publishedYear: '2026',
    pills: ['KOTLIN', 'COMPOSE', 'TCP', 'RTSP'],
    excerpt:
      'Aplikasi Android untuk mengendalikan action cam keluaran 2016 saat touring motor, setelah aplikasi resminya ditarik dan tidak bisa lagi dipasang di Android 15.',
    cover: {
      file: 'yiheecam-protokol.v1.webp',
      alt: 'Diagram urutan pesan JSON antara klien uji dan kamera tiruan: mulai sesi, nyalakan live view, mulai dan hentikan rekam',
      focalX: 50,
      focalY: 50,
    },
    summary: {
      problem:
        'Aplikasi resmi kameranya sudah ditarik dari Play Store dan ditolak Android 15 saat dipasang, sehingga kamera yang masih bagus jadi tidak bisa dikendalikan dari HP.',
      solution:
        'Protokolnya dibangun ulang dari analisis aplikasi resmi di lingkungan terisolasi dan kamera tiruan yang meniru firmware aslinya, lalu dijadikan aplikasi Kotlin dengan layar yang terbaca dari dudukan stang.',
      result:
        'Status rekam, baterai, dan sisa kartu terbaca dalam satu lirikan, aman ditekan dengan sarung tangan, dan aplikasinya hanya berbicara dengan kamera, tanpa tracker.',
    },
    showcase: {
      frame: 'phone',
      screen: { file: 'yiheecam-yakin.v1.webp', alt: 'Layar Live bertema terang saat merekam: tombol berhenti yang sudah ditekan sekali bertuliskan YAKIN?' },
      demoNote: 'Tangkapan dari uji di HP dengan kamera tiruan di laptop. Live view berisi pola uji, bukan rekaman perjalanan.',
      consent: 'studio',
    },
    features: [
      {
        title: 'Terbaca dalam satu lirikan',
        body: 'Status kamera tampil sebagai papan split-flap: mode rekam, baterai, dan sisa kartu. Semua nilai berasal dari laporan kamera sendiri; yang tidak dilaporkan kamera tidak dikarang.',
        screen: { file: 'yiheecam-setting.v1.webp', alt: 'Layar Setting bagian Video dengan nilai yang dilaporkan kamera' },
      },
      {
        title: 'Aman dengan sarung tangan',
        body: 'Tombol utama besar, dan berhenti rekam butuh dua ketukan supaya tidak terhenti tak sengaja. Tema terang tetap terbaca di bawah matahari langsung.',
        screen: { file: 'yiheecam-yakin.v1.webp', alt: 'Tombol berhenti bertuliskan YAKIN? menunggu ketukan kedua' },
      },
      {
        title: 'Jujur saat sambungan putus',
        body: 'Saat WiFi kamera hilang, papan berganti TERPUTUS dan nilai terakhir diberi label, alih-alih berpura-pura masih terkini. Live view yang membeku dicoba ulang sendiri.',
        screen: { file: 'yiheecam-terputus.v1.webp', alt: 'Layar Live saat sambungan putus: papan bertuliskan TERPUTUS dengan nilai terakhir' },
      },
    ],
    timeline: [
      { date: '7 Okt 2026', title: 'Riset: kenapa aplikasi resmi tidak bisa dipasang di Android 15', sourceRef: 'yiheeCam@9f3fcbc' },
      { date: '7 Okt 2026', title: 'Analisis aplikasi resmi di lingkungan tanpa internet, peta protokol', sourceRef: 'yiheeCam@d17d62e' },
      { date: '8 Okt 2026', title: 'Layar papan split-flap dan versi pertama aplikasi', sourceRef: 'yiheeCam@8bb0296' },
      { date: '8 Okt 2026', title: 'Pemutar live view dipilih lewat uji di kamera asli', sourceRef: 'yiheeCam@15e0aa7' },
    ],
    body: [
      { h2: 'Membaca protokol yang tidak didokumentasikan' },
      'Aplikasi resmi dianalisis di lingkungan terisolasi tanpa internet, lalu protokolnya diuji langsung ke kamera. Hasilnya dipakai untuk membangun kamera tiruan yang meniru firmware aslinya, termasuk pesan yang menyatu dan terpotong, supaya klien bisa diuji tanpa kamera fisik.',
      { h2: 'Hanya bicara dengan kamera' },
      'Analisis aplikasi resmi menemukan sejumlah tracker dan pengambilan nomor IMEI. Penggantinya tidak memanggil server mana pun selain kamera itu sendiri.',
    ],
  },
  {
    slug: 'fifofun',
    consent: 'studio',
    order: 24,
    kind: 'lab',
    client: 'FiFoFun',
    tagline: 'Perencana keuangan rumah tangga yang memeriksa dirinya sendiri terhadap bank.',
    meta: 'LAB · KEUANGAN RUMAH TANGGA',
    industry: 'finance',
    service: 'build',
    publishedYear: '2026',
    pills: ['NEXT.JS', 'SUPABASE', 'DRIZZLE', 'PWA'],
    excerpt:
      'Membaca e-Statement bank, mencocokkan setiap baris dengan saldo cetakan bank sampai ke sen, lalu menjadikannya patokan untuk anggaran, dana, dan ringkasan tiga bulan.',
    cover: {
      file: 'fifofun-ringkasan.v1.webp',
      alt: 'Halaman Ringkasan FiFoFun: kartu pemasukan, pengeluaran, tagihan, dan uang bisa dipakai di atas grafik air terjun',
      focalX: 50,
      focalY: 20,
    },
    summary: {
      problem:
        'Anggaran di spreadsheet tidak pernah diperiksa terhadap sumber di luar dirinya sendiri, jadi salah kategori dan saldo dompet yang minus bisa bertahan berminggu-minggu tanpa ada yang sadar.',
      solution:
        'Mutasi bank dijadikan rujukan yang bisa diperiksa: setiap impor ditelusuri baris demi baris terhadap saldo cetakan bank, dan baru setelah cocok perencanaan dibangun di atasnya.',
      result:
        'Uang yang dipastikan bank terpisah jelas dari yang hanya perkiraan, dan impor yang tidak cocok ditolak utuh, bukan disimpan setengah.',
    },
    showcase: {
      frame: 'browser',
      screen: { file: 'fifofun-ringkasan.v1.webp', alt: 'Halaman Ringkasan FiFoFun: kartu pemasukan, pengeluaran, tagihan, dan uang bisa dipakai di atas grafik air terjun' },
      screenPhone: { file: 'fifofun-ringkasan-hp-loop.v1.poster.webp', alt: 'Ringkasan 3 Bulan di layar ponsel' },
      loop: { file: 'fifofun-ringkasan-hp-loop.v1.mp4', alt: 'Ringkasan 3 Bulan di ponsel, digulir dari pemasukan ke pengeluaran dan sisa per bulan' },
      loopPoster: { file: 'fifofun-ringkasan-hp-loop.v1.poster.webp', alt: 'Ringkasan 3 Bulan di layar ponsel' },
      tour: { file: 'fifofun-tur.v1.mp4', alt: 'Tur FiFoFun: ringkasan, impor e-Statement, saldo bank yang cocok, tinjau transaksi, anggaran, dan ringkasan tiga bulan' },
      tourPoster: { file: 'fifofun-tur.v1.poster.webp', alt: 'Halaman Ringkasan FiFoFun' },
      tourTranscript:
        'Tur tanpa suara, sekitar 45 detik. Ringkasan bulan Agustus. Impor e-Statement September yang lolos rekonsiliasi. Ringkasan September dengan saldo hitungan aplikasi yang sama dengan saldo cetakan bank. Satu keputusan di Tinjau yang mengategorikan enam transaksi sekaligus. Anggaran per kategori. Lalu Ringkasan 3 Bulan.',
      demoNote:
        'Semua layar memakai rumah tangga fiktif dan e-Statement karangan yang diimpor lewat parser asli aplikasi, bukan data keuangan sungguhan.',
      consent: 'studio',
    },
    features: [
      {
        title: 'Impor yang membuktikan dirinya',
        body: 'Rekonsiliasi berlapis menelusuri rantai saldo baris demi baris, jadi kesalahan menunjuk transaksinya, bukan sekadar totalnya selisih. Kalau tidak cocok, tidak satu baris pun disimpan.',
        screen: { file: 'fifofun-impor.v1.webp', alt: 'Hasil impor e-Statement: transaksi masuk dan saldonya cocok sampai ke sen terakhir' },
      },
      {
        title: 'Satu angka yang dicek ke luar',
        body: 'Saldo hitungan aplikasi ditaruh di samping saldo cetakan bank. Saldo dompet digital yang meleset dicatat sebagai penyesuaian, bukan dihapus diam-diam.',
        screen: { file: 'fifofun-rekonsiliasi.v1.webp', alt: 'Bagian Uangnya ada di mana: saldo hitungan aplikasi sama dengan saldo cetakan bank' },
      },
      {
        title: 'Anggaran dengan bukti di sampingnya',
        body: 'Batas per kategori ditetapkan di samping median bulan-bulan sebelumnya dan angka bulan lalu. Pos yang datang jarang dihargai per bulan supaya tidak mengagetkan saat jatuh tempo.',
        screen: { file: 'fifofun-anggaran.v1.webp', alt: 'Halaman Anggaran: bilah alokasi per kategori dan tabel biasanya, bulan lalu, anggaran, dan realisasi' },
      },
      {
        title: 'Ringkasan untuk dibaca orang lain',
        body: 'Tiga bulan terakhir berdampingan dengan rata-ratanya, hanya angka gabungan, dirancang untuk dibaca dari ponsel dan bisa dibagikan sebagai PDF.',
        screen: { file: 'fifofun-ringkasan-3-bulan.v1.webp', alt: 'Ringkasan 3 Bulan: tabel pemasukan per bulan dengan rata-rata dan tombol Bagikan sebagai PDF' },
      },
    ],
    timeline: [
      { date: '19 Agu 2026', title: 'Parser e-Statement dengan rekonsiliasi berlapis', sourceRef: 'fifofun@4265a70' },
      { date: '20 Agu 2026', title: 'Playwright mengukur grafik, axe jalan di setiap push', sourceRef: 'fifofun@1121214' },
      { date: '22 Agu 2026', title: 'Anggaran per kategori bisa ditetapkan sendiri', sourceRef: 'fifofun@ccc6428' },
      { date: '2 Okt 2026', title: 'Ringkasan 3 Bulan, satu layar untuk ditunjukkan ke orang lain', sourceRef: 'fifofun@a418836' },
    ],
    darkChapter: {
      eyebrow: 'TUR · 45 DETIK',
      title: 'Dari mutasi bank ke anggaran yang bisa dipercaya.',
      body: 'Rekaman berikut berjalan dengan rumah tangga dan e-Statement karangan. Yang Anda lihat adalah aplikasinya sendiri, bukan maket.',
    },
    body: [
      { h2: 'Bank sebagai patokan' },
      'Catatan dompet digital dan uang tunai diketik sendiri, jadi selalu bisa meleset. Mutasi bank tidak. FiFoFun memisahkan keduanya di setiap layar, supaya jelas angka mana yang sudah dipastikan dan mana yang masih perkiraan.',
      { h2: 'Uang tidak pernah jadi pecahan desimal' },
      'Setiap nominal disimpan sebagai bilangan bulat dalam sen, tidak pernah sebagai float. Data tiap rumah tangga dipisahkan oleh row level security di database, dan akun baru hanya bisa dibuat lewat undangan anggota rumah tangga.',
      'Setiap push melewati typecheck, tes unit, Playwright dengan pemeriksaan aksesibilitas di lebar desktop dan ponsel, audit dependency, CodeQL, dan pemindai rahasia.',
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
