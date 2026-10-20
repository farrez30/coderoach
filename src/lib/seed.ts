/**
 * Placeholder content seed.
 *
 * Run via: npm run seed
 *
 * Idempotent — clears collections and recreates with placeholder data.
 * Requires DATABASE_URI + PAYLOAD_SECRET env vars (loaded via --env-file=.env.local).
 */
import path from 'node:path';
import { getPayload } from 'payload';
import config from '../payload.config';
import { HIDDEN_PROJECT_SLUGS, PORTFOLIO } from './portfolio/projects';
import { refsIn } from './portfolio/gate';
import { assumedGrants } from './portfolio/grants';
import { syncPortfolio } from './portfolio/sync';

async function seed() {
  // reset() below deletes every document in the collections it seeds, projects included.
  if (process.env.SEED_TARGET !== 'local') {
    console.error('Seed refuses to run: set SEED_TARGET=local in .env.local to confirm this database is a local one.');
    process.exit(1);
  }
  const payload = await getPayload({ config });
  console.log('🌱 Seeding placeholder content...\n');

  // Helper: clear and recreate
  async function reset(slug: any, docs: any[]) {
    const existing = await payload.find({ collection: slug, limit: 200, overrideAccess: true });
    for (const d of existing.docs) {
      await payload.delete({ collection: slug, id: d.id, overrideAccess: true });
    }
    const created: any[] = [];
    for (const data of docs) {
      const doc = await payload.create({ collection: slug, data, overrideAccess: true });
      created.push(doc);
    }
    return created;
  }

  // ============ GLOBALS ============

  await payload.updateGlobal({
    slug: 'top-bar',
    data: {
      enabled: true,
      tag: '[ OPEN UNTUK Q2 2026 ]',
      message: 'Slot terbatas untuk kolaborasi baru kuartal ini. Mulai dari diskusi 30 menit.',
      link: { label: 'Mulai brief proyek', href: '#contact' },
    },
  });
  console.log('✓ TopBar');

  await payload.updateGlobal({
    slug: 'hero',
    data: {
      pillText: 'Senior dev studio · Project-scoped · Berbasis di Jakarta',
      headline: { lead: 'We build, automate,', accent: 'and ship intelligence.' },
      lede: 'Studio engineering Jakarta untuk membangun website, mengotomasi workflow, dan mengoperasikan dashboard analitik bisnis Anda, dari company website sampai sistem internal yang dipakai tim harian.',
      ctaPrimary: { label: 'Mulai brief proyek', href: '#contact' },
      ctaSecondary: { label: 'Lihat hasil kami', href: '#work' },
      metaItems: [
        { value: '3+', label: 'tahun beroperasi' },
        { value: '40+', label: 'kolaborasi sejak 2022' },
        { value: 'Remote', label: 'berbasis Jakarta' },
      ],
      trustedBy: {
        label: 'Beberapa klien yang telah kami tangani',
        tagline: 'Dari company website sampai dashboard analitik untuk F&B, marketing agency, dan brand lokal di Indonesia.',
      },
    },
  });
  console.log('✓ Hero');

  // Helper for Lexical paragraphs
  const lexParagraphs = (paragraphs: string[]) => ({
    root: {
      type: 'root',
      format: '' as const,
      indent: 0,
      version: 1,
      direction: 'ltr' as const,
      children: paragraphs.map((text) => ({
        type: 'paragraph',
        format: '' as const,
        indent: 0,
        version: 1,
        direction: 'ltr' as const,
        textFormat: 0,
        children: [{ mode: 'normal', text, type: 'text', style: '', detail: 0, format: 0, version: 1 }],
      })),
    },
  });

  await payload.updateGlobal({
    slug: 'studio',
    data: {
      sectionMarker: 'Tentang Coderoach',
      heading: 'Senior team. Measured execution.',
      lede: 'Coderoach Studio fokus pada kolaborasi berskala kecil hingga menengah dengan tim engineer senior yang menangani proyek dari scoping sampai live di production. Tanpa hand-off ke junior, tanpa lapisan terjemahan. Satu titik akuntabilitas dari awal sampai handoff.',
      stats: [
        { num: '3', accent: '+ yr', label: 'BEROPERASI\nSEJAK 2022' },
        { num: '40', accent: '+', label: 'KOLABORASI\n6 INDUSTRI' },
        { num: '100', accent: '%', label: 'SENIOR-LED\nNO HAND-OFF' },
        { num: '4', accent: '×', label: 'PINTU MASUK\nPROYEK' },
      ],
      about: {
        pageHeading: 'Studio engineering. Measured execution.',
        pageLede:
          'Coderoach Studio adalah tim engineer senior yang membangun software, otomasi, dan sistem data untuk bisnis di Indonesia. Setiap kolaborasi dikerjakan langsung oleh tim inti dengan dokumentasi handoff yang lengkap dan transfer ownership di akhir proyek.',
        mission:
          'Membantu bisnis dan operator Indonesia membangun software yang benar-benar dipakai dalam operasional harian, bukan deliverable yang berhenti di tahap testing.',
        story: lexParagraphs([
          'Coderoach Studio dibentuk pada 2022 untuk mengisi celah antara agency tradisional dan freelancer lepas. Banyak proyek software lokal masih dikerjakan dengan model jam yang menghargai waktu yang dihabiskan, bukan masalah yang terselesaikan, sehingga proses dan hasil akhir tidak selalu sejalan dengan kebutuhan klien.',
          'Kami mengoperasikan model berbeda: project-scoped dengan harga berdasarkan hasil, dikerjakan oleh tim engineer senior tanpa hand-off ke junior. Lebih sedikit lapisan terjemahan berarti lebih sedikit konteks yang hilang, dan jalur lebih cepat dari masalah ke solusi yang live.',
          'Setelah tiga tahun beroperasi, model ini terbukti pada hasil: company website yang live, internal tools yang menggantikan spreadsheet, satu studio product (Laporta) yang kini dipakai operator F&B multi-cabang, dan data pipeline yang memangkas pekerjaan ops dari hitungan jam menjadi menit.',
          'Tim inti tetap kecil dengan sengaja. Setiap proyek dikerjakan oleh engineer yang juga melakukan scoping: Izzul (Product & Frontend) dan Farrez (Backend & Infra), didukung jaringan engineer senior tepercaya saat skala proyek menuntut.',
        ]),
        workspace: {
          address: 'Remote · Berbasis Jakarta, Indonesia',
          hours: 'Sen–Jum · 09:00–18:00 WIB · async di luar jam tersebut',
          tagline: 'Diskusi awal via Google Meet atau WhatsApp Business.',
        },
        timeline: [
          { year: '2022', title: 'Coderoach Studio resmi beroperasi', description: 'Dimulai dengan model project-scoped dan harga berbasis hasil. Fokus: software yang live di production, bukan deliverable yang berhenti di tahap testing.' },
          { year: '2023', title: 'Klien pertama', description: 'Kerjasama dengan Uruzin, Tumtim Cookies, dan beberapa brand lokal. Operating model project-scoped tervalidasi pada proyek nyata.' },
          { year: '2024', title: 'Laporta live di production', description: 'Studio product pertama. Menjembatani SPV dan Accounting di operasi F&B multi-cabang, memangkas 50% budget salary accounting.' },
          { year: '2025', title: 'Ekspansi ke Intelligence work', description: 'Pengembangan ads multiplatform dashboard untuk agency digital marketing. Memangkas 70% beban manual reporting dan mendukung pertumbuhan campaign 3×.' },
          { year: '2026', title: 'Versatile dev studio', description: 'Empat pintu masuk (Build, Automate, Intelligence, Augment) dengan disiplin shipping yang sama di setiap proyek.' },
        ],
      },
    },
  });
  console.log('✓ Studio');

  await payload.updateGlobal({
    slug: 'contact',
    data: {
      sectionMarker: 'Mulai proyek',
      heading: { line1: 'Punya sesuatu yang ingin dibangun?', line2Accent: 'Mari diskusi.' },
      lede: 'Kami menerima jumlah klien baru yang terbatas tiap kuartal supaya tiap proyek mendapat perhatian penuh dari tim inti. Ceritakan apa yang ingin Anda bangun. Setiap brief dibaca tim senior dan dibalas dalam 48 jam kerja.',
      scopes: [
        { scope: 'Build' },
        { scope: 'Automate' },
        { scope: 'Intelligence' },
        { scope: 'Augment' },
        { scope: 'Belum yakin' },
      ],
      formLabels: {
        email: '[ EMAIL ANDA ]',
        scope: '[ JENIS PROYEK ]',
        brief: '[ APA YANG INGIN DIBANGUN? ]',
        submit: 'Kirim brief',
        emailFallback: 'hello@coderoach.studio',
      },
      successHeading: 'Terima kasih, brief Anda sudah masuk.',
    },
  });
  console.log('✓ Contact');

  await payload.updateGlobal({
    slug: 'site-settings',
    data: {
      siteName: 'Coderoach Studio',
      siteDescription: 'Coderoach Studio: jasa pembuatan website, otomasi workflow, dan dashboard analitik untuk bisnis di Indonesia. Tim engineer senior, project-scoped, berbasis Jakarta.',
      navStatus: { label: 'OPEN · Q2 2026' },
      navCta: { label: 'Mulai brief', href: '#contact' },
      footer: {
        tagline: 'Studio engineering yang membantu bisnis Indonesia membangun website, mengotomasi workflow, dan mengoperasikan dashboard analitik. Remote-first, berbasis di Jakarta.',
        badge: 'OPEN · Q2 2026',
        columns: [
          {
            heading: 'NAVIGATE',
            links: [
              { label: 'Services', href: '/#services' },
              { label: 'Work', href: '/work' },
              { label: 'Process', href: '/#process' },
              { label: 'Field notes', href: '/notes' },
              { label: 'FAQ', href: '/#faq' },
            ],
          },
          {
            heading: 'STUDIO',
            links: [
              { label: 'About', href: '/studio' },
              { label: 'Field notes', href: '/notes' },
              { label: 'Mulai proyek', href: '/#contact' },
            ],
          },
          {
            heading: 'CONTACT',
            links: [
              { label: 'hello@coderoach.studio', href: 'mailto:hello@coderoach.studio' },
              { label: '+62 813-3602-0915', href: 'https://wa.me/6281336020915' },
              { label: 'Based in Jakarta', href: '#' },
              { label: 'Remote-first', href: '#' },
            ],
          },
        ],
        metaLine: {
          left: '© 2026 CODEROACH STUDIO',
          right: 'BUILT IN-HOUSE · NEXT.JS 15 · BUILD · AUTOMATE · SHIP',
        },
      },
    },
  });
  console.log('✓ SiteSettings');

  await payload.updateGlobal({
    slug: 'blog-settings',
    data: {
      archiveHero: {
        sectionMarker: '[ FIELD NOTES / 01 ]',
        heading: 'Notes from the studio.',
        lede: 'Engineering, operasional, dan hal-hal di antara keduanya.',
      },
      postsPerPage: 12,
    },
  });
  console.log('✓ BlogSettings');

  // ============ SERVICES ============

  const serviceDocs = await reset('services', [
    {
      order: 1,
      slug: 'build',
      tag: 'ENGINEERING',
      icon: 'build',
      title: 'Build',
      tagline: 'Web, mobile, dan tools yang benar-benar dipakai.',
      blurb: 'Mulai dari company website sampai aplikasi internal. Frontend modern, backend yang scalable, dan dokumentasi handoff yang siap dilanjutkan tim Anda.',
      list: [
        { item: 'Web development (company website, web app, e-commerce, landing page)' },
        { item: 'Mobile app (iOS, Android, cross-platform React Native)' },
        { item: 'Internal admin tools & dashboard' },
        { item: 'API & backend services (REST, GraphQL)' },
        { item: 'CMS development (Payload, headless WordPress alternative)' },
      ],
      stack: [
        { tech: 'Next.js' },
        { tech: 'React' },
        { tech: 'React Native' },
        { tech: 'Node.js' },
        { tech: 'TypeScript' },
        { tech: 'Postgres' },
        { tech: 'Tailwind' },
      ],
      heroLede: 'Web development, mobile app, dan internal tools yang benar-benar dipakai tim Anda harian, dari company website sampai sistem yang menggantikan spreadsheet di operasi.',
      pricingNote: 'Project-scoped, bukan per jam. Diskusi awal untuk quote yang akurat.',
      serviceFAQ: [
        { question: 'Bisa mobile?', answer: 'Bisa. React Native untuk cross-platform, native iOS/Android jika kebutuhan menuntut.' },
        { question: 'Custom design atau template?', answer: 'Selalu custom. Setiap proyek didesain spesifik untuk kebutuhan klien.' },
      ],
    },
    {
      order: 2,
      slug: 'automate',
      tag: 'OPERATIONS',
      icon: 'automate',
      title: 'Automate',
      tagline: 'Workflow yang dulu manual, kini berjalan otomatis.',
      blurb: 'Banyak tim masih melakukan copy-paste antar spreadsheet di luar jam kerja. Kami menggantikan pekerjaan manual itu dengan sistem otomasi yang reliable, lengkap dengan audit log dan monitoring.',
      list: [
        { item: 'Workflow automation & RPA (Robotic Process Automation)' },
        { item: 'Business Process Automation (BPA) end-to-end' },
        { item: 'API integration & data pipeline' },
        { item: 'Reporting automation (laporan otomatis harian, mingguan, bulanan)' },
        { item: 'Process digitization (form, approval, dokumen)' },
      ],
      stack: [
        { tech: 'n8n' },
        { tech: 'Node.js' },
        { tech: 'Python' },
        { tech: 'Webhooks' },
        { tech: 'Zapier' },
        { tech: 'Make' },
        { tech: 'Cron' },
      ],
      heroLede: 'Otomasi workflow yang reliable dan termonitor. Pekerjaan ops yang dulu dikerjakan manual kini dijalankan oleh sistem, dengan audit log yang dapat di-trace kapan saja.',
      pricingNote: 'Project-scoped per scope automation. Discovery sebelum quote.',
    },
    {
      order: 3,
      slug: 'intelligence',
      tag: 'ANALYTICS',
      icon: 'intelligence',
      title: 'Intelligence',
      tagline: 'Data yang mengarahkan keputusan, bukan sekadar chart.',
      blurb: 'Membuat dashboard itu mudah. Yang sulit adalah membangun data layer dengan KPI yang akurat, alarm anomali yang bunyi tepat waktu, dan insight yang dapat dijadikan dasar pengambilan keputusan.',
      list: [
        { item: 'Web dashboard & data visualisation' },
        { item: 'Data warehouse & ETL pipeline' },
        { item: 'Custom analytics dashboard (Power BI, Looker Studio, Tableau, Metabase)' },
        { item: 'Multi-platform ads analytics (Meta, Google, TikTok)' },
        { item: 'Database design & query optimization (Postgres, BigQuery, MySQL)' },
        { item: 'Forecasting & anomaly detection' },
      ],
      stack: [
        { tech: 'Power BI' },
        { tech: 'Looker Studio' },
        { tech: 'Tableau' },
        { tech: 'Metabase' },
        { tech: 'BigQuery' },
        { tech: 'Postgres' },
        { tech: 'Airflow' },
        { tech: 'dbt' },
      ],
      heroLede: 'Dari API multi-platform sampai dashboard yang dipakai harian, kami membangun pipeline-nya, bukan hanya chart-nya. Data warehouse, ETL, dan visualisasi yang nyambung ke keputusan bisnis.',
      pricingNote: 'Discovery dan scoping di awal. Tiap stack data berbeda biaya, kami transparan sejak diskusi pertama.',
    },
    {
      order: 4,
      slug: 'augment',
      tag: 'AI · LLM',
      icon: 'augment',
      title: 'Augment',
      tagline: 'Menambahkan AI ke sistem yang sudah berjalan.',
      blurb: 'LLM kini menjadi bagian dari infrastruktur. Kami mengintegrasikannya pada titik yang benar-benar berdampak: internal search, document processing, dan agentic workflow.',
      list: [
        { item: 'LLM integration & RAG (Retrieval-Augmented Generation)' },
        { item: 'Agentic workflow & AI automation' },
        { item: 'AI internal tools & internal search' },
        { item: 'Document processing & extraction' },
        { item: 'Vector search & semantic retrieval' },
      ],
      stack: [
        { tech: 'Anthropic Claude' },
        { tech: 'OpenAI' },
        { tech: 'LangChain' },
        { tech: 'pgvector' },
        { tech: 'Pinecone' },
      ],
      heroLede: 'AI yang berdampak nyata, bukan chatbot demo. Kami menambahkan intelligence ke alur kerja yang sudah ada, di tempat di mana waktu pemrosesan terbayar oleh hasil.',
      pricingNote: 'Pilot scope di awal, expand setelah ada hasil yang terukur.',
    },
  ]);
  console.log(`✓ Services (${serviceDocs.length})`);

  const serviceMap = Object.fromEntries(serviceDocs.map((s: any) => [s.slug, s.id]));

  // ============ PROJECTS (cases + studio products) ============
  // The published portfolio lives in src/lib/portfolio/projects.ts, shared with scripts/portfolio-sync.ts.
  // These two are kept as drafts: off the site, not deleted.

  await reset('projects', [
    {
      order: 90,
      slug: 'ads-multiplatform-dashboard',
      kind: 'client',
      client: 'Digital Marketing Agency',
      tagline: 'Ads data warehouse: Meta, TikTok, Google Ads jadi satu source of truth.',
      meta: 'AGENCY · INTELLIGENCE',
      industry: 'agency',
      service: serviceMap.intelligence,
      pills: [{ pill: 'AIRFLOW' }, { pill: 'LOOKER STUDIO' }],
      _status: 'draft',
      publishedYear: '2025',
      excerpt: 'Reporting yang dulu manual 4 jam sehari, sekarang otomatis 30 menit. Tim ops bisa support pertumbuhan campaign 3× tanpa nambah orang.',
    },
    {
      order: 91,
      slug: 'viralytics',
      kind: 'studio',
      client: 'Viralytics',
      tagline: 'End-to-end KOL OS: sourcing, contracts, live performance.',
      meta: 'KOL OS · STUDIO PRODUCT',
      industry: 'agency',
      pills: [{ pill: 'TIKTOK API' }, { pill: 'NODE.JS' }],
      _status: 'draft',
      publishedYear: '2025',
      excerpt: 'KOL campaign management tanpa spreadsheet. Sourcing, contract, sampai live tracking dalam satu workspace.',
      studio: {
        vizType: 'viralytics',
        usage: '380 CAMPAIGNS',
        externalLink: { label: 'viralytics.id', href: 'https://viralytics.id' },
        bullets: [
          { bullet: 'KOL directory & sourcing' },
          { bullet: 'Campaign administration' },
          { bullet: 'Live performance dashboards' },
          { bullet: 'TikTok & Meta API integrations' },
        ],
      },
    },
  ]);
  await syncPortfolio(payload, {
    // The seed only runs on a local database (SEED_TARGET guard above), so every permission is assumed.
    grants: assumedGrants(refsIn(PORTFOLIO), PORTFOLIO.flatMap((e) => (e.metrics ?? []).map((m) => m.key))),
    apply: true,
    assetsDir: path.resolve(process.cwd(), 'scripts/portfolio-assets'),
    log: () => {},
  });
  console.log(`✓ Projects (${PORTFOLIO.length} published + ${HIDDEN_PROJECT_SLUGS.length} drafts)`);

  // ============ PROCESS / TENETS / FAQs / CLIENTS ============

  await reset('process-phases', [
    { order: 1, tag: 'PHASE 01', icon: 'discover', name: 'Discover', what: 'Kami memetakan masalah sebenarnya, bukan hanya output yang diminta. Wawancara stakeholder, audit sistem berjalan, dan pengetatan scope sampai jelas.', deliv: 'Brief tertulis · technical scope · success metric' },
    { order: 2, tag: 'PHASE 02', icon: 'design', name: 'Design', what: 'Wireframe, data model, system architecture. Kami mendesain sesuatu yang bisa kami pertahankan di code, bukan hanya di Figma.', deliv: 'Clickable prototype · technical spec · ERD' },
    { order: 3, tag: 'PHASE 03', icon: 'layers', name: 'Build', what: 'Sprint dua mingguan dengan demo di tiap akhir sprint. Tanpa kejutan di akhir proyek. Continuous deploy sejak hari pertama.', deliv: 'Working software · deploy berkala' },
    { order: 4, tag: 'PHASE 04', icon: 'handoff', name: 'Handoff', what: 'Dokumentasi lengkap, training tim Anda, source code, dan akses infrastruktur. Kami berperan sebagai partner support, bukan dependency permanen.', deliv: 'Source · docs · credential infra · support 30 hari' },
  ]);
  console.log('✓ ProcessPhases (4)');

  await reset('tenets', [
    { order: 1, icon: 'users', title: 'Senior end-to-end. Tanpa hand-off.', description: 'Engineer yang melakukan scoping adalah engineer yang menyelesaikan pekerjaan. Tanpa lapisan agency yang menerjemahkan ulang, tanpa hand-off ke junior, dan tanpa konteks yang hilang di tengah jalan.' },
    { order: 2, icon: 'voice', title: 'Opinionated, bukan obedient.', description: 'Kami akan membangun apa yang Anda minta. Tetapi jika ada cara yang lebih masuk akal untuk goal Anda, kami akan menyampaikannya di awal, bukan setelah proyek berjalan.' },
    { order: 3, icon: 'shield', title: 'Dibangun untuk bertahan.', description: 'Arsitektur yang clean, dokumentasi handoff yang lengkap, dan tanpa vendor lock-in. Kami memposisikan diri sebagai partner support, bukan dependency permanen.' },
  ]);
  console.log('✓ Tenets (3)');

  await reset('faqs', [
    { order: 1, question: 'Bagaimana cara Anda menentukan harga proyek?', answer: 'Project-based per scope, bukan per jam. Setelah diskusi awal 30–60 menit, kami menyiapkan proposal dengan milestone dan deliverable yang jelas. Tanpa hourly billing, tanpa timesheet.' },
    { order: 2, question: 'Berapa skala proyek paling kecil yang Anda terima?', answer: 'Untuk full project, paling kecil dimulai dari skala company website dengan struktur konten yang serius. Jika scope-nya lebih kecil, kami biasanya merekomendasikan freelancer tepercaya, kadang kami refer langsung.' },
    { order: 3, question: 'Apakah tersedia model retainer?', answer: 'Tersedia, untuk produk yang sudah live dan memerlukan continuous improvement. Bukan model "pool of hours". Kami tetap scope per cycle agar fokus pada hasil yang jelas.' },
    { order: 4, question: 'Anda berbasis di mana?', answer: 'Remote-first, dengan tim inti berbasis di Jakarta. Klien dapat berada di mana pun di Indonesia atau Asia Tenggara. Kami biasa berkolaborasi via Google Meet, WhatsApp, atau on-site untuk kickoff dan milestone besar.' },
    { order: 5, question: 'Stack apa yang Anda gunakan?', answer: 'Pragmatis dan modern: Next.js, React Native, Node.js, Python, Postgres, BigQuery, Airflow, Anthropic/OpenAI. Stack disesuaikan dengan problem klien, bukan dengan resume kami.' },
    { order: 6, question: 'Apakah tersedia NDA?', answer: 'Tersedia. Mutual NDA standar dapat ditandatangani sebelum diskusi detail teknis dan bisnis.' },
    { order: 7, question: 'Bagaimana setelah proyek selesai?', answer: 'Source code, infrastructure, dan dokumentasi sepenuhnya menjadi milik Anda. Anda dapat melanjutkan dengan retainer untuk improvement berikutnya, atau handoff bersih ke tim internal. Pilihan ada di tangan Anda.' },
  ]);
  console.log('✓ FAQs (7)');

  // Trusted-by marquee — dummy/abstract names sampai ada client logo asset siap
  await reset('clients', [
    { order: 1, name: 'Acme Co.' },
    { order: 2, name: 'Studio Kanvas' },
    { order: 3, name: 'Nara Group' },
    { order: 4, name: 'Pendar Labs' },
    { order: 5, name: 'Halu Brand' },
    { order: 6, name: 'Bangsal' },
    { order: 7, name: 'Kopi Kuat' },
    { order: 8, name: 'Senja Studio' },
  ]);
  console.log('✓ Clients (8 dummy)');

  // ============ AUTHORS + POSTS ============

  // Delete posts first (FK to authors) before resetting authors
  const existingPosts = await payload.find({ collection: 'posts', limit: 200, overrideAccess: true });
  for (const p of existingPosts.docs) {
    await payload.delete({ collection: 'posts', id: p.id, overrideAccess: true });
  }

  const authorDocs = await reset('authors', [
    { name: 'M Izzul Haq W', slug: 'izzul-haq-w', role: 'Founder · Product & Frontend', bio: 'Founder & Product Engineer di Coderoach. Menangani sisi bisnis dan frontend engineering. Tertarik pada proyek yang dampaknya terlihat di P&L klien, bukan hanya di dashboard.' },
    { name: 'Farrez Al Hakim', slug: 'farrez-al-hakim', role: 'Co-founder · Backend & Infra', bio: 'Co-founder & Backend Engineer di Coderoach. Bertanggung jawab atas backend, infrastruktur, dan data pipeline, fondasi yang menentukan ketahanan jangka panjang sistem.' },
  ]);
  console.log(`✓ Authors (${authorDocs.length})`);

  const izzul = (authorDocs[0] as any).id;
  const farrez = (authorDocs[1] as any).id;

  // Helper: build a minimal Lexical root with paragraphs
  const lex = (paragraphs: string[]) => ({
    root: {
      type: 'root',
      format: '' as const,
      indent: 0,
      version: 1,
      direction: 'ltr' as const,
      children: paragraphs.map((text) => ({
        type: 'paragraph',
        format: '' as const,
        indent: 0,
        version: 1,
        direction: 'ltr' as const,
        textFormat: 0,
        children: [{ mode: 'normal', text, type: 'text', style: '', detail: 0, format: 0, version: 1 }],
      })),
    },
  });

  await reset('posts', [
    {
      title: 'Kenapa kami gak jual jam.',
      slug: 'kenapa-gak-jual-jam',
      excerpt: 'Hourly billing optimize buat hal yang salah. Ini yang kami lakuin sebagai gantinya, dan kenapa tiap proyek Coderoach itu project-scoped.',
      category: 'operating',
      author: izzul,
      publishedAt: '2026-04-22T09:00:00.000Z',
      _status: 'published',
      featured: true,
      tags: [{ tag: 'operations' }, { tag: 'pricing' }],
      content: lex([
        'Hourly billing itu default-nya banyak agency. Kami belum pernah pakai. Ini alasannya.',
        'Kalau vendor charge per jam, struktur insentifnya reward orang yang spend lebih banyak waktu, bukan yang solve masalahnya lebih cepat. Buyer akhirnya jadi police timesheet, bukan evaluasi outcome.',
        'Project pricing balik insentifnya. Kami propose scope, sepakat sama outcome, dan tim di-reward kalau selesai lebih cepat. Outcome yang lebih bagus, less rework, gak ada padding.',
        'Trade-off-nya: kami harus jujur soal scope dari awal. Itu fungsinya diskusi 30 menit di awal, supaya kedua sisi jelas sebelum mulai.',
      ]),
    },
    {
      title: 'Postgres untuk semuanya (sampai gak bisa lagi).',
      slug: 'postgres-untuk-semuanya',
      excerpt: 'Kapan satu instance Postgres mulai gak cukup, dan apa yang berikutnya. Catatan pragmatis dari studio.',
      category: 'engineering',
      author: farrez,
      publishedAt: '2026-04-08T09:00:00.000Z',
      _status: 'published',
      tags: [{ tag: 'postgres' }, { tag: 'architecture' }, { tag: 'data' }],
      content: lex([
        'Untuk sebagian besar proyek di studio, Postgres cover hampir semua kebutuhan: transactional, analytical, queue, search, bahkan vector lewat pgvector.',
        'Kapan itu mulai gak cukup? Tiga sinyal yang biasanya muncul.',
        'Pertama, write contention di hot table. Kedua, query OLAP yang ngabisin CPU yang dipake transactional workload. Ketiga, vector search ke jutaan embedding. pgvector masih jalan, tapi cost-per-query mulai gak nyaman.',
        'Kalau ketemu salah satunya, kami tambah specialized store untuk sinyal itu (Redis queue, Clickhouse OLAP, vector DB dedicated), tapi cuma untuk satu sinyal. Sisanya tetep di Postgres. Default tetep simple.',
      ]),
    },
    {
      title: 'Catatan dari bangun Laporta.',
      slug: 'catatan-bangun-laporta',
      excerpt: 'Laporta dimulai sebagai tool untuk satu klien F&B kami sendiri. Yang kami pikir 3 bulan, ternyata jadi proyek panjang yang ngajarin banyak hal soal operating F&B.',
      category: 'studio',
      author: izzul,
      publishedAt: '2026-03-15T09:00:00.000Z',
      _status: 'published',
      tags: [{ tag: 'product' }, { tag: 'laporta' }, { tag: 'fb' }],
      content: lex([
        'Laporta dimulai sebagai tool untuk satu klien F&B kami sendiri. Kami pikir bisa ship 3 bulan. Ternyata jauh lebih lama dari itu.',
        'Yang kami dapet bener: logic P&L, multi-outlet aggregation, alur Petty Cash, Stock Opname, lalu Waste yang menjembatani SPV dan Accounting.',
        'Yang akan kami lakuin beda kalau ngulang: customer onboarding. Kami asumsi operator F&B akan self-serve. Mereka enggak. Kami rebuild onboarding dua kali sebelum kepake.',
        'Yang surprise: feature yang paling kepake bukan dashboard interaktif. Tapi ringkasan harian yang dikirim langsung ke decision maker, yang format-nya simpel dan bisa dibaca sambil naik motor.',
      ]),
    },
  ]);
  console.log('✓ Posts (3)');

  // ============ PAGES (block-based) ============

  /**
   * Payload-fetched docs come back with internal `id` fields on nested arrays/groups.
   * Reusing them in `create()` for a different doc would conflict, so strip recursively.
   */
  const stripIds = (val: any): any => {
    if (Array.isArray(val)) return val.map(stripIds);
    if (val && typeof val === 'object') {
      const { id: _id, ...rest } = val;
      const out: any = {};
      for (const [k, v] of Object.entries(rest)) out[k] = stripIds(v);
      return out;
    }
    return val;
  };

  // Reuse the studio global lede/heading + hero global as block defaults.
  const heroGlobalRaw = await payload.findGlobal({ slug: 'hero', depth: 0 }).catch(() => null) as any;
  const studioGlobalRaw = await payload.findGlobal({ slug: 'studio', depth: 0 }).catch(() => null) as any;
  const contactGlobalRaw = await payload.findGlobal({ slug: 'contact', depth: 0 }).catch(() => null) as any;
  const heroGlobal = stripIds(heroGlobalRaw);
  const studioGlobal = stripIds(studioGlobalRaw);
  const contactGlobal = stripIds(contactGlobalRaw);

  const homeLayout = [
    {
      blockType: 'hero',
      pillText: heroGlobal?.pillText,
      headline: heroGlobal?.headline,
      lede: heroGlobal?.lede,
      ctaPrimary: heroGlobal?.ctaPrimary,
      ctaSecondary: heroGlobal?.ctaSecondary,
      metaItems: heroGlobal?.metaItems,
      showOpsConsole: true,
      showTrustedBy: true,
      trustedBy: heroGlobal?.trustedBy,
    },
    { blockType: 'serviceList', heading: 'Four ways in.', lede: 'Bukan menjual jam. Kami menjual hasil yang terukur.', source: 'all' },
    { blockType: 'work', heading: "Work we've shipped.", lede: 'Sebagian proyek yang telah berjalan, dari company website sampai data pipeline. Case study lengkap tersedia atas permintaan.', showViewAllLink: true },
    { blockType: 'products', heading: 'Products we build, use, and maintain.', lede: 'Ujian paling jujur untuk tim engineering bukan brief klien, melainkan produk sendiri yang harus survive di tangan user nyata.' },
    { blockType: 'process', heading: 'Brief to production, in four phases.', lede: 'Setiap proyek mengikuti pola yang sama. Scope berbeda, stack berbeda, disiplin shipping tetap konsisten.' },
    {
      blockType: 'studio',
      heading: studioGlobal?.heading,
      lede: studioGlobal?.lede,
      stats: studioGlobal?.stats,
      pullQuote: {
        quote: 'Setiap proyek dikerjakan oleh engineer yang juga melakukan scoping. Tanpa lapisan agency, tanpa hand-off ke junior, tanpa konteks yang hilang di tengah jalan.',
        attribution: 'Coderoach Studio · Operating note',
      },
      fullStudioLink: { label: 'Lihat selengkapnya', href: '/studio' },
    },
    { blockType: 'notes', heading: 'Latest from the studio.', lede: 'Engineering, operasional, dan hal-hal di antara keduanya.', limit: 3, showViewAllLink: true },
    { blockType: 'faq', heading: 'Common questions.', source: 'collection' },
    {
      blockType: 'contact',
      sectionMarker: '[ CONTACT ]',
      heading: contactGlobal?.heading,
      lede: contactGlobal?.lede,
      scopes: contactGlobal?.scopes,
      formLabels: contactGlobal?.formLabels,
      successHeading: contactGlobal?.successHeading,
    },
  ];

  await reset('pages', [
    {
      title: 'Home',
      slug: 'home',
      _status: 'published',
      seo: {
        metaTitle: '',
        metaDescription: '',
      },
      layout: homeLayout,
    },
    {
      title: 'About',
      slug: 'about',
      _status: 'published',
      seo: {
        metaTitle: 'About | Coderoach Studio',
        metaDescription: 'Studio engineering, remote-first dari Jakarta: build, automate, intelligence, augment.',
      },
      layout: [
        {
          blockType: 'hero',
          pillText: 'About',
          headline: { lead: 'Studio engineering.', accent: 'Measured execution.' },
          lede: 'Tim engineer senior yang menangani scoping hingga pengiriman. Tanpa lapisan agency, tanpa hand-off ke junior.',
          ctaPrimary: { label: 'Mulai diskusi', href: '/#contact' },
          showOpsConsole: false,
          showTrustedBy: false,
        },
        {
          blockType: 'statsGrid',
          eyebrow: 'Studio',
          heading: 'Angka-angka yang kami pegang.',
          stats: studioGlobal?.stats,
        },
        { blockType: 'studio', heading: studioGlobal?.heading, lede: studioGlobal?.lede, stats: studioGlobal?.stats },
        {
          blockType: 'ctaBanner',
          eyebrow: 'Ready to ship?',
          heading: 'Punya brief? Mari diskusi.',
          description: 'Kami membalas setiap brief dalam 48 jam kerja.',
          cta: { label: 'Mulai brief proyek', href: '/#contact' },
          tone: 'dark',
        },
      ],
    },
  ]);
  console.log('✓ Pages (2) — home + about');

  console.log('\n✓ Seed complete. Visit /admin to log in & edit, or http://localhost:3000 to view.');
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
