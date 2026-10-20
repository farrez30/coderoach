import { getPayload } from 'payload';
import config from '@payload-config';
import type { Metadata } from 'next';
import { SectionShell } from '../_components/detail/SectionShell';
import { Breadcrumbs } from '../_components/detail/Breadcrumbs';
import { ProseRenderer } from '../_components/detail/ProseRenderer';
import { Icon, type IconName } from '@/lib/icons';
import { Badge } from '../_components/ui/Badge';
import { Meta } from '../_components/ui/Meta';
import { AnimatedCount } from '../_components/ui/AnimatedCount';
import { PayloadImage } from '../_components/ui/PayloadImage';
import { StudioTimeline } from '../_components/studio/StudioTimeline';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Studio | Coderoach',
  description: 'Studio engineering dari Jakarta: build, automate, dan ship intelligence untuk bisnis Indonesia.',
};

export default async function StudioPage() {
  const payload = await getPayload({ config });

  const [studio, tenets, authors] = await Promise.all([
    payload.findGlobal({ slug: 'studio' }).catch(() => null) as Promise<any>,
    payload
      .find({ collection: 'tenets', sort: 'order', limit: 100 })
      .catch(() => ({ docs: [] })),
    payload.find({ collection: 'authors', limit: 100, depth: 1 }).catch(() => ({ docs: [] })),
  ]);

  return (
    <SectionShell>
      {/* Hero — left-aligned w/ asymmetric whitespace */}
      <section className="pt-12 pb-20 border-b border-paper-200">
        <div className="max-w-[1180px] mx-auto px-8">
          <div className="mb-12">
            <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Studio' }]} />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-16 items-end">
            <div>
              <span className="font-mono text-xs font-medium tracking-wider text-mist-600 uppercase inline-flex items-center gap-2 tabular">
                [ THE STUDIO ] <span className="text-mist-400">·</span> Tim di balik Coderoach
              </span>
              <h1 className="text-[clamp(48px,7vw,88px)] font-bold tracking-[-0.025em] leading-[0.95] mt-6 max-w-[16ch] text-balance">
                {studio?.about?.pageHeading || 'Studio engineering. Measured execution.'}
              </h1>
            </div>
            {(studio?.about?.pageLede || studio?.lede) && (
              <p className="text-[18px] leading-[1.6] text-mist-600 lg:justify-self-end max-w-[460px] text-pretty">
                {studio?.about?.pageLede || studio?.lede}
              </p>
            )}
          </div>

          {/* Stats — bento grid (mixed cell sizes) */}
          {studio?.stats && studio.stats.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 md:grid-rows-2 gap-3 pt-12 mt-16 border-t border-paper-200">
              {studio.stats.map((s: any, i: number) => {
                const isHero = i === 0;
                // Bento sizing: 1st cell big (2x2), 2nd horizontal (2x1), 3rd & 4th compact
                const span = isHero
                  ? 'md:col-span-2 md:row-span-2 bg-ink text-paper'
                  : i === 1
                    ? 'md:col-span-2 md:row-span-1 bg-paper-50 border border-paper-200'
                    : 'md:col-span-1 md:row-span-1 bg-paper-50 border border-paper-200';
                const numColor = isHero ? 'text-paper' : 'text-ink';
                const labelColor = isHero ? 'text-mist-500' : 'text-mist-600';
                const numSize = isHero ? 'text-[clamp(72px,9vw,128px)]' : 'text-[clamp(36px,4vw,52px)]';
                return (
                  <div
                    key={i}
                    className={`relative overflow-hidden rounded-2xl p-7 flex flex-col justify-end gap-3 ${span} shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]`}
                    style={
                      isHero
                        ? {
                            backgroundImage: `
                              linear-gradient(rgba(255,255,255,0.045) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(255,255,255,0.045) 1px, transparent 1px)
                            `,
                            backgroundSize: '36px 36px',
                            backgroundPosition: '-1px -1px',
                          }
                        : undefined
                    }
                  >
                    {/* Blueprint corner crosshairs — only on hero tile */}
                    {isHero && (
                      <>
                        <div aria-hidden className="absolute top-3 left-3 w-3 h-3 border-l border-t border-paper/20" />
                        <div aria-hidden className="absolute top-3 right-3 w-3 h-3 border-r border-t border-paper/20" />
                        <div aria-hidden className="absolute bottom-3 left-3 w-3 h-3 border-l border-b border-paper/20" />
                        <div aria-hidden className="absolute bottom-3 right-3 w-3 h-3 border-r border-b border-paper/20" />
                      </>
                    )}
                    <div
                      className={`relative ${numSize} font-bold leading-[0.95] tracking-[-0.03em] tabular ${numColor}`}
                    >
                      <AnimatedCount value={s.num} />
                      {s.accent && <span className="text-electric">{s.accent}</span>}
                    </div>
                    <div
                      className={`relative text-[11px] font-semibold uppercase tracking-[0.18em] leading-[1.5] whitespace-pre-line ${labelColor}`}
                    >
                      {s.label}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Mission — single sentence, large */}
      {studio?.about?.mission && (
        <section className="py-20 bg-paper-50 relative">
          <div className="max-w-[880px] mx-auto px-8 text-center">
            <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-mist-600 mb-6 block">
              Mission
            </span>
            <p className="text-[clamp(28px,3.5vw,40px)] font-semibold tracking-[-0.015em] leading-[1.25] m-0 text-ink text-balance">
              {studio.about.mission}
            </p>
          </div>
        </section>
      )}

      {/* Diagonal halftone divider — slanted band between mission and story */}
      <div
        aria-hidden
        className="relative h-32 overflow-hidden bg-paper-50"
        style={{
          clipPath: 'polygon(0 0, 100% 35%, 100% 100%, 0 65%)',
        }}
      >
        <div
          className="absolute inset-0 bg-cover bg-center opacity-30"
          style={{ backgroundImage: 'url(/assets/texture-halftone-streak.png)' }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-paper-50 via-paper-100 to-paper-50" />
      </div>

      {/* Story — long-form */}
      {studio?.about?.story && (
        <section className="py-20">
          <div className="max-w-[1180px] mx-auto px-8 grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-16">
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-mist-600 lg:sticky lg:top-24 block">
                Our story
              </span>
            </div>
            <div>
              <ProseRenderer data={studio.about.story} />
            </div>
          </div>
        </section>
      )}

      {/* Tenets — full */}
      {tenets?.docs?.length > 0 && (
        <section className="py-20 bg-ink text-paper" data-theme="dark">
          <div className="max-w-[1180px] mx-auto px-8">
            <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-mist-500 mb-12 block">
              Principles
            </span>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 reveal-stagger">
              {(tenets.docs as any[]).map((t, i) => (
                <div key={t.id} className="flex flex-col gap-3">
                  <span className="text-mist-400">
                    <Icon name={t.icon as IconName} size={22} />
                  </span>
                  <h3 className="text-[28px] font-bold tracking-[-0.02em] leading-[1.15] m-0 text-paper">
                    {t.title}
                  </h3>
                  <p className="text-[16px] leading-[1.55] text-mist-400 m-0">{t.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Team — Authors as team members */}
      {authors?.docs?.length > 0 && (
        <section className="py-20">
          <div className="max-w-[1180px] mx-auto px-8">
            <div className="flex items-baseline justify-between mb-12 flex-wrap gap-4">
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-mist-600">
                  Team
                </span>
                <h2 className="text-[clamp(32px,4vw,48px)] font-bold tracking-[-0.02em] leading-tight mt-2">
                  The core team. Same hands that scope, build.
                </h2>
              </div>
              <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-mist-500">
                {authors.docs.length} {authors.docs.length === 1 ? 'person' : 'people'} on the page
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(authors.docs as any[]).map((a) => (
                <div
                  key={a.id}
                  className="bg-paper-50 border border-paper-200 rounded-2xl p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)]"
                >
                  <div className="flex items-center gap-4 mb-4">
                    {a.avatar?.url ? (
                      <PayloadImage
                        media={a.avatar}
                        variant="thumbnail"
                        alt={a.avatar.alt || a.name}
                        width={48}
                        height={48}
                        className="w-12 h-12 rounded-full object-cover bg-paper-200"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-electric to-[#5DD79A] grid place-items-center text-paper text-sm font-bold tracking-wide">
                        {(a.name || '??')
                          .split(/\s+/)
                          .map((p: string) => p[0]?.toUpperCase() || '')
                          .slice(0, 2)
                          .join('')}
                      </div>
                    )}
                    <div className="flex flex-col gap-0.5 leading-tight">
                      <span className="text-[16px] font-bold text-ink">{a.name}</span>
                      {a.role && (
                        <Meta parts={a.role} className="font-mono text-[11px] uppercase tracking-wider text-mist-600 tabular" />
                      )}
                    </div>
                  </div>
                  {a.bio && <p className="text-[14px] leading-[1.55] text-mist-600 m-0">{a.bio}</p>}
                  {a.socialLinks && a.socialLinks.length > 0 && (
                    <div className="flex gap-2 mt-4 flex-wrap">
                      {a.socialLinks.map((sl: any) => (
                        <a
                          key={sl.platform}
                          href={sl.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-mono text-[11px] uppercase tracking-wider text-mist-600 hover:text-electric tabular"
                        >
                          {sl.platform} <span aria-hidden>→</span>
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Workspace */}
      {studio?.about?.workspace && (
        <section className="py-20 bg-paper-50 border-y border-paper-200">
          <div className="max-w-[1180px] mx-auto px-8">
            <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-mist-600 mb-10 block">
              Workspace
            </span>
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.5fr] gap-12 items-center">
              <div className="aspect-[4/3] rounded-2xl bg-paper-100 border border-paper-200 overflow-hidden relative">
                {studio.about.workspace.image?.url ? (
                  <PayloadImage
                    media={studio.about.workspace.image}
                    variant="hero"
                    alt={studio.about.workspace.image.alt || 'Studio workspace'}
                    sizesAttr="(min-width: 1024px) 40vw, 100vw"
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div
                    className="absolute inset-0 bg-cover opacity-40"
                    style={{ backgroundImage: 'url(/assets/bg-grid-clean.png)' }}
                  />
                )}
              </div>
              <div className="flex flex-col gap-6">
                {studio.about.workspace.address && (
                  <div>
                    <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-mist-600 mb-2 block">
                      Address
                    </span>
                    <p className="text-[24px] font-bold tracking-[-0.015em] m-0 leading-tight">
                      {studio.about.workspace.address}
                    </p>
                  </div>
                )}
                {studio.about.workspace.hours && (
                  <div>
                    <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-mist-600 mb-2 block">
                      Hours
                    </span>
                    <p className="text-[16px] m-0 text-ink"><Meta parts={studio.about.workspace.hours} /></p>
                  </div>
                )}
                {studio.about.workspace.tagline && (
                  <Badge>{studio.about.workspace.tagline}</Badge>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Timeline — alternating zig-zag with scroll-driven progress + per-year artifact */}
      {studio?.about?.timeline && studio.about.timeline.length > 0 && (
        <section className="py-20">
          <div className="max-w-[1180px] mx-auto px-8">
            <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-mist-600 mb-16 block">
              Timeline
            </span>
            <StudioTimeline items={studio.about.timeline as any[]} />
          </div>
        </section>
      )}

      {/* CTA — blueprint card with crosshairs + live status indicator */}
      <section className="py-20 bg-ink text-paper" data-theme="dark">
        <div className="max-w-[1180px] mx-auto px-8">
          <div
            className="relative overflow-hidden rounded-2xl p-10 lg:p-14 bg-shadow-900/60 border border-shadow-700 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] flex flex-col lg:flex-row lg:items-center justify-between gap-10"
            style={{
              backgroundImage: `
                linear-gradient(rgba(255,255,255,0.045) 1px, transparent 1px),
                linear-gradient(90deg, rgba(255,255,255,0.045) 1px, transparent 1px)
              `,
              backgroundSize: '36px 36px',
              backgroundPosition: '-1px -1px',
            }}
          >
            {/* Blueprint corner crosshairs */}
            <div aria-hidden className="absolute top-3 left-3 w-3 h-3 border-l border-t border-paper/20" />
            <div aria-hidden className="absolute top-3 right-3 w-3 h-3 border-r border-t border-paper/20" />
            <div aria-hidden className="absolute bottom-3 left-3 w-3 h-3 border-l border-b border-paper/20" />
            <div aria-hidden className="absolute bottom-3 right-3 w-3 h-3 border-r border-b border-paper/20" />

            <div className="relative max-w-[680px]">
              {/* Live status indicator */}
              <div className="inline-flex items-center gap-2 mb-5 font-mono text-[10px] uppercase tracking-[0.2em] tabular text-mist-500">
                <span aria-hidden className="relative flex w-2 h-2">
                  <span className="absolute inset-0 rounded-full bg-[#5DD79A] animate-ping opacity-75" />
                  <span className="relative w-2 h-2 rounded-full bg-[#5DD79A]" />
                </span>
                <Meta parts="OPEN · SLOT TERBATAS · Q2 2026" />
              </div>
              <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-mist-500 block mb-3">
                Tertarik berkolaborasi?
              </span>
              <p className="text-[clamp(28px,3.2vw,40px)] font-bold tracking-[-0.02em] leading-[1.15] text-paper text-balance m-0">
                Kami menerima jumlah klien baru yang terbatas tiap kuartal agar tiap proyek mendapat perhatian penuh.
              </p>
            </div>

            <a
              href="/#contact"
              className="relative h-12 px-5 rounded-md bg-electric text-paper text-sm font-semibold inline-flex items-center hover:bg-[#2562E0] active:scale-[0.98] transition-[background,transform] flex-shrink-0 shadow-[0_8px_24px_-8px_rgba(44,112,254,0.55)]"
            >
              Mulai brief proyek <span aria-hidden>→</span>
            </a>
          </div>
        </div>
      </section>
    </SectionShell>
  );
}
