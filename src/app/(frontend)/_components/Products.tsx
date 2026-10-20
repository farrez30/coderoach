import { SectionHead, type SectionHeadCopy } from './SectionHead';
import { CoverPlaceholder, ProjectCover } from './archive/ProjectCover';
import { Meta } from './ui/Meta';

type StudioProject = {
  id: string | number;
  slug: string;
  client: string; // product name
  tagline: string;
  meta?: string | null;
  coverImage?: any;
  publishedYear?: string | null;
  studio?: {
    vizType?: 'laporta' | 'viralytics' | 'none' | null;
    usage?: string | null;
    externalLink?: { label?: string | null; href?: string | null } | null;
    bullets?: Array<{ bullet: string }> | null;
  } | null;
};

export function Products({ items, head }: { items: StudioProject[]; head?: SectionHeadCopy }) {
  return (
    <section id="products" className="py-[120px] relative bg-paper-50 border-y border-paper-200">
      <div className="max-w-[1180px] mx-auto px-8">
        <SectionHead
          marker={head?.sectionMarker ?? "[ 03 / 07 ]"}
          category={head?.category ?? "Products"}
          description={head?.description ?? "Produk in-house"}
          heading={head?.heading ?? "Products we build, use, and maintain."}
          lede={head?.lede ?? "Ujian paling jujur untuk tim engineering bukan brief klien, melainkan produk sendiri yang harus survive di tangan user nyata, revenue nyata, dan edge case nyata."}
        />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-12 reveal-stagger">
          {items.map((p) => (
            <article key={p.id} className="bg-paper-50 border border-paper-200 rounded-2xl overflow-hidden flex flex-col shadow-[inset_0_1px_0_rgba(255,255,255,0.6)]">
              <a href={`/work/${p.slug}`} className="h-[280px] relative bg-paper-100 border-b border-paper-200 overflow-hidden block group">
                {p.coverImage?.url ? (
                  <ProjectCover
                    project={p}
                    sizesAttr="(min-width: 1024px) 560px, 100vw"
                    imageClassName="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                  />
                ) : p.studio?.vizType === 'laporta' ? (
                  <LaportaViz />
                ) : p.studio?.vizType === 'viralytics' ? (
                  <ViralyticsViz />
                ) : (
                  <CoverPlaceholder client={p.client} meta={p.meta} />
                )}
              </a>
              <div className="p-8 flex flex-col gap-4">
                <div className="flex justify-between items-baseline">
                  <h3 className="text-[36px] font-bold tracking-[-0.02em] m-0">
                    <a href={`/work/${p.slug}`} className="hover:text-electric transition-colors">
                      {p.client}
                    </a>
                  </h3>
                  <span className="font-mono text-[11px] uppercase tracking-wider text-mist-600">STUDIO</span>
                </div>
                <p className="text-[15px] leading-[1.55] text-mist-600 m-0">{p.tagline}</p>
                {p.studio?.bullets && p.studio.bullets.length > 0 && (
                  <ul className="list-none p-0 m-0 grid grid-cols-2 gap-x-4 gap-y-2 mt-2 mb-4">
                    {p.studio.bullets.map((b) => (
                      <li key={b.bullet} className="text-sm flex gap-2 text-ink">
                        <span aria-hidden className="text-mist-500">—</span>
                        {b.bullet}
                      </li>
                    ))}
                  </ul>
                )}
                <div className="border-t border-paper-200/60 pt-4 flex justify-between items-center gap-4 flex-wrap">
                  {(p.publishedYear || p.studio?.usage) && (
                    <Meta
                      parts={[p.publishedYear ? `LIVE ${p.publishedYear}` : 'LIVE', p.studio?.usage]}
                      className="font-mono text-xs uppercase tracking-wider text-mist-600 tabular"
                    />
                  )}
                  <div className="flex items-center gap-3">
                    <a
                      href={`/work/${p.slug}`}
                      className="text-sm text-mist-600 hover:text-ink underline-offset-4 hover:underline"
                    >
                      Baca case study
                    </a>
                    {p.studio?.externalLink?.href && (
                      <>
                        <span aria-hidden className="w-px h-3.5 bg-paper-200" />
                        <a
                          href={p.studio.externalLink.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="h-8 px-3 rounded-md border border-paper-200 bg-paper-50 text-ink text-[12px] font-semibold inline-flex items-center gap-1.5 hover:border-electric hover:text-electric transition-colors"
                        >
                          {p.studio.externalLink.label}
                          <svg
                            width="11"
                            height="11"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.4"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            aria-hidden
                          >
                            <path d="M7 17L17 7M9 7h8v8" />
                          </svg>
                        </a>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function LaportaViz() {
  return (
    <div className="absolute inset-[18px] rounded-lg bg-paper-50 border border-paper-200 p-3.5 grid grid-cols-[1.4fr_1fr] grid-rows-[auto_1fr] gap-2.5 font-mono text-[11px] tabular">
      <div className="col-span-full flex justify-between text-mist-600 tracking-wide">
        <span className="whitespace-nowrap">[ LAPORTA · OUTLET-04 ]</span>
        <span title="Gambar contoh, bukan data langsung">ILUSTRASI</span>
      </div>
      <div className="bg-paper-100 rounded-md relative overflow-hidden p-2.5">
        <svg aria-hidden viewBox="0 0 200 80" preserveAspectRatio="none" className="w-full h-full">
          <path d="M0,55 L20,48 L40,52 L60,38 L80,42 L100,28 L120,32 L140,18 L160,22 L180,12 L200,8" stroke="var(--color-electric)" strokeWidth="1.5" fill="none" pathLength="1" className="animate-draw-line" />
          <path d="M0,55 L20,48 L40,52 L60,38 L80,42 L100,28 L120,32 L140,18 L160,22 L180,12 L200,8 L200,80 L0,80 Z" fill="var(--color-electric)" opacity="0.10" />
          <line x1="0" y1="60" x2="200" y2="60" stroke="var(--color-paper-200)" strokeDasharray="2 2" />
          <line x1="0" y1="40" x2="200" y2="40" stroke="var(--color-paper-200)" strokeDasharray="2 2" />
          <line x1="0" y1="20" x2="200" y2="20" stroke="var(--color-paper-200)" strokeDasharray="2 2" />
        </svg>
      </div>
      <div className="flex flex-col gap-2">
        <div className="bg-paper-100 rounded-md px-2.5 py-2">
          <div className="text-mist-600 text-[10px] tracking-wide">[ COGS RATIO ]</div>
          <div className="text-ink text-[18px] font-bold font-sans tracking-tight mt-0.5">31.4<span className="text-electric">%</span></div>
        </div>
        <div className="bg-paper-100 rounded-md px-2.5 py-2">
          <div className="text-mist-600 text-[10px] tracking-wide">[ DAILY GROSS ]</div>
          <div className="text-ink text-[18px] font-bold font-sans tracking-tight mt-0.5">8.2<span className="text-electric">M</span></div>
        </div>
        <div className="bg-paper-100 rounded-md px-2.5 py-2">
          <div className="text-mist-600 text-[10px] tracking-wide">[ SURVIVAL ]</div>
          <div className="text-ink text-[18px] font-bold font-sans tracking-tight mt-0.5">+4 <span className="text-electric">DAYS</span></div>
        </div>
      </div>
    </div>
  );
}

function ViralyticsViz() {
  const rows: Array<{ av: string; bg: string; name: string; tier: string; reach: string; delta: string; deltaColor?: string }> = [
    { av: 'RA', bg: 'linear-gradient(135deg,var(--color-electric),#5DD79A)', name: '@contoh.kuliner', tier: 'tier-3 · F&B', reach: '412k', delta: '+38%' },
    { av: 'BD', bg: 'linear-gradient(135deg,#F2A93B,#E5484D)', name: '@contoh.gaya', tier: 'tier-2 · lifestyle', reach: '186k', delta: '+12%' },
    { av: 'NK', bg: 'linear-gradient(135deg,#A7A2A9,#3A4140)', name: '@contoh.ulasan', tier: 'tier-2 · review', reach: '94k', delta: '-3%', deltaColor: '#E5484D' },
    { av: 'AS', bg: 'linear-gradient(135deg,#5DD79A,#2C70FE)', name: '@contoh.cerita', tier: 'tier-1 · macro', reach: '1.4M', delta: '+92%' },
  ];
  return (
    <div className="absolute inset-[18px] rounded-lg bg-shadow-900 text-paper p-4 font-mono text-[11px] flex flex-col gap-2 overflow-hidden tabular">
      <div className="flex justify-between text-mist-500 tracking-wider">
        <Meta parts={['[ CONTOH KAMPANYE', 'ILUSTRASI ]']} />
        <span className="inline-flex items-center gap-1.5 text-[#5DD79A]">
          <span className="relative flex w-1.5 h-1.5">
            <span className="absolute inset-0 rounded-full bg-success animate-pulse-dot" />
            <span className="relative w-1.5 h-1.5 rounded-full bg-success" />
          </span>
          TRACKING
        </span>
      </div>
      {rows.map((r) => (
        <div key={r.av} className="grid grid-cols-[24px_1fr_60px_60px] gap-2.5 items-center px-2.5 py-2 bg-shadow-800 rounded">
          <div className="w-6 h-6 rounded-full flex items-center justify-center text-paper font-sans font-bold text-[11px]" style={{ background: r.bg }}>
            {r.av}
          </div>
          <div>
            <div className="text-paper font-sans font-semibold text-[13px]">{r.name}</div>
            <Meta parts={r.tier} className="text-mist-500" />
          </div>
          <div className="text-mist-500 text-right">{r.reach}</div>
          <div className="text-right" style={{ color: r.deltaColor || 'var(--color-electric)' }}>{r.delta}</div>
        </div>
      ))}
    </div>
  );
}
