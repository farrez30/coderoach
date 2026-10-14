import { Badge } from '../../_components/ui/Badge';
import { Breadcrumbs } from '../../_components/detail/Breadcrumbs';
import { ProseRenderer } from '../../_components/detail/ProseRenderer';
import { CoverPlaceholder, ProjectCover } from '../../_components/archive/ProjectCover';
import { Icon } from '@/lib/icons';

type Project = any;

// Inline product viz — re-uses Laporta/Viralytics from Products section
function ProductViz({ vizType }: { vizType?: string | null }) {
  if (vizType === 'laporta') {
    return (
      <div className="aspect-video rounded-2xl bg-paper-100 border border-paper-200 p-6 grid grid-cols-[1.4fr_1fr] grid-rows-[auto_1fr] gap-3 font-mono text-xs tabular shadow-[inset_0_1px_0_rgba(255,255,255,0.6)]">
        <div className="col-span-full flex justify-between text-mist-600 tracking-wide text-sm">
          <span>[ LAPORTA · OUTLET-04 ]</span>
          <span title="Gambar contoh, bukan data langsung">ILUSTRASI</span>
        </div>
        <div className="bg-paper-50 rounded-lg relative overflow-hidden p-4">
          <svg aria-hidden viewBox="0 0 200 80" preserveAspectRatio="none" className="w-full h-full">
            <path d="M0,55 L20,48 L40,52 L60,38 L80,42 L100,28 L120,32 L140,18 L160,22 L180,12 L200,8" stroke="var(--color-electric)" strokeWidth="1.5" fill="none" pathLength="1" className="animate-draw-line" />
            <path d="M0,55 L20,48 L40,52 L60,38 L80,42 L100,28 L120,32 L140,18 L160,22 L180,12 L200,8 L200,80 L0,80 Z" fill="var(--color-electric)" opacity="0.10" />
            <line x1="0" y1="60" x2="200" y2="60" stroke="var(--color-paper-200)" strokeDasharray="2 2" />
            <line x1="0" y1="40" x2="200" y2="40" stroke="var(--color-paper-200)" strokeDasharray="2 2" />
            <line x1="0" y1="20" x2="200" y2="20" stroke="var(--color-paper-200)" strokeDasharray="2 2" />
          </svg>
        </div>
        <div className="flex flex-col gap-2.5">
          {[
            ['COGS RATIO', '31.4', '%'],
            ['DAILY GROSS', '8.2', 'M'],
            ['SURVIVAL', '+4', ' DAYS'],
          ].map(([l, n, a]) => (
            <div key={l} className="bg-paper-50 rounded-lg px-3 py-2.5">
              <div className="text-mist-600 text-[10px] tracking-wide">[ {l} ]</div>
              <div className="text-ink text-[20px] font-bold font-sans tracking-tight mt-0.5">
                {n}<span className="text-electric">{a}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  if (vizType === 'viralytics') {
    const rows = [
      { av: 'RA', bg: 'linear-gradient(135deg,var(--color-electric),#5DD79A)', name: '@contoh.kuliner', tier: 'tier-3 · F&B', reach: '412k', delta: '+38%' },
      { av: 'BD', bg: 'linear-gradient(135deg,#F2A93B,#E5484D)', name: '@contoh.gaya', tier: 'tier-2 · lifestyle', reach: '186k', delta: '+12%' },
      { av: 'NK', bg: 'linear-gradient(135deg,#A7A2A9,#3A4140)', name: '@contoh.ulasan', tier: 'tier-2 · review', reach: '94k', delta: '-3%', deltaColor: '#E5484D' },
      { av: 'AS', bg: 'linear-gradient(135deg,#5DD79A,#2C70FE)', name: '@contoh.cerita', tier: 'tier-1 · macro', reach: '1.4M', delta: '+92%' },
    ];
    return (
      <div className="aspect-video rounded-2xl bg-shadow-900 text-paper p-6 font-mono text-xs flex flex-col gap-2.5 overflow-hidden tabular">
        <div className="flex justify-between text-mist-500 tracking-wider text-sm mb-2">
          <span>[ CONTOH KAMPANYE · ILUSTRASI ]</span>
          <span className="inline-flex items-center gap-1.5 text-[#5DD79A]">
            <span className="relative flex w-1.5 h-1.5">
              <span className="absolute inset-0 rounded-full bg-success animate-pulse-dot" />
              <span className="relative w-1.5 h-1.5 rounded-full bg-success" />
            </span>
            TRACKING
          </span>
        </div>
        {rows.map((r) => (
          <div key={r.av} className="grid grid-cols-[28px_1fr_70px_70px] gap-3 items-center px-3 py-2.5 bg-shadow-800 rounded">
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-paper font-sans font-bold text-xs" style={{ background: r.bg }}>
              {r.av}
            </div>
            <div>
              <div className="text-paper font-sans font-semibold text-sm">{r.name}</div>
              <div className="text-mist-500">{r.tier}</div>
            </div>
            <div className="text-mist-500 text-right">{r.reach}</div>
            <div className="text-right" style={{ color: r.deltaColor || 'var(--color-electric)' }}>{r.delta}</div>
          </div>
        ))}
      </div>
    );
  }
  return null;
}

// Cover image first, then the drawn product viz, then a placeholder until a cover is uploaded.
function HeroVisual({ project }: { project: Project }) {
  const cover = project.coverImage;
  if (cover?.url) {
    return (
      <div
        className="relative rounded-2xl overflow-hidden border border-paper-200 bg-paper-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)]"
        style={{ aspectRatio: cover.width && cover.height ? `${cover.width} / ${cover.height}` : '3 / 2' }}
      >
        <ProjectCover project={project} variant="hero" priority sizesAttr="(min-width: 1024px) 540px, 100vw" />
      </div>
    );
  }
  const vizType = project.studio?.vizType;
  if (vizType === 'laporta' || vizType === 'viralytics') return <ProductViz vizType={vizType} />;
  return (
    <div className="relative aspect-video rounded-2xl overflow-hidden border border-paper-200">
      <CoverPlaceholder client={project.client} meta={project.meta} />
    </div>
  );
}

/** `as="div"` inside the overlay, where the catalog page already holds the <main> landmark. */
export function StudioProductDetail({ project, as: Root = 'main' }: { project: Project; as?: 'main' | 'div' }) {
  return (
    <Root>
      {/* Hero — light, product-landing style */}
      <section className="pt-12 pb-16 border-b border-paper-200">
        <div className="max-w-[1180px] mx-auto px-8">
          <div className="mb-8">
            <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Work', href: '/work' }, { label: project.client }]} />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-12 items-center">
            <div>
              <div className="flex gap-2 mb-5">
                <Badge variant="electric">STUDIO PRODUCT</Badge>
                {project.publishedYear && <Badge>{`SHIPPED ${project.publishedYear}`}</Badge>}
              </div>
              <h1 className="text-[clamp(48px,7vw,88px)] font-bold tracking-[-0.03em] leading-[0.95] mb-6">
                {project.client}
              </h1>
              <p className="text-[20px] leading-[1.5] text-mist-600 max-w-[460px] mb-8 text-pretty">
                {project.tagline}
              </p>
              {project.studio?.externalLink?.href && (
                <a
                  href={project.studio.externalLink.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-12 px-5 rounded-md bg-electric text-paper text-sm font-semibold inline-flex items-center gap-2 hover:bg-[#2562E0] transition-colors"
                >
                  {project.studio.externalLink.label || `Visit ${project.client.toLowerCase()} →`}
                </a>
              )}
            </div>
            <HeroVisual project={project} />
          </div>
        </div>
      </section>

      {/* Feature grid — bullets become rich cards */}
      {project.studio?.bullets && project.studio.bullets.length > 0 && (
        <section className="py-20 reveal-stagger">
          <div className="max-w-[1180px] mx-auto px-8">
            <h2 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-mist-600 mb-10">
              Features
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {project.studio.bullets.map((b: any, i: number) => (
                <div
                  key={i}
                  className="bg-paper-50 border border-paper-200 rounded-2xl p-8 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)]"
                >
                  <div className="inline-flex items-center justify-center w-10 h-10 rounded-md bg-electric/[0.08] text-electric border border-electric/20 mb-5">
                    <Icon name="layers" size={20} />
                  </div>
                  <h3 className="text-[20px] font-bold tracking-[-0.01em] mb-2 leading-tight">
                    {b.bullet}
                  </h3>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Long-form prose */}
      {project.richContent && (
        <section className="py-12 bg-paper-50 border-y border-paper-200">
          <div className="max-w-[1180px] mx-auto px-8">
            <h2 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-mist-600 mb-8">
              Story
            </h2>
            <ProseRenderer data={project.richContent} />
          </div>
        </section>
      )}

      {/* Built by us trust strip */}
      <section className="py-16">
        <div className="max-w-[880px] mx-auto px-8 text-center">
          <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-mist-600 block mb-4">
            Built by Coderoach Studio
          </span>
          <p className="text-[24px] leading-[1.4] font-semibold tracking-[-0.01em] text-balance">
            The same engineers who built {project.client} are the ones who'll ship your client work.
          </p>
        </div>
      </section>
    </Root>
  );
}
