'use client';

import { useMemo, useState } from 'react';
import { FilterBar } from '../_components/archive/FilterBar';
import type { CardPreviewMedia } from '../_components/archive/CardPreview';
import { ProjectCard } from '../_components/archive/ProjectCard';
import { Breadcrumbs } from '../_components/detail/Breadcrumbs';

export type CatalogProject = {
  id: string | number;
  slug: string;
  kind: 'client' | 'studio' | 'lab';
  client: string;
  tagline: string;
  meta?: string | null;
  industry?: string | null;
  publishedYear?: string | null;
  pills?: Array<{ pill: string }> | null;
  excerpt?: string | null;
  coverImage?: any;
  preview: CardPreviewMedia | null;
  pillar: { slug: string; label: string } | null;
};

type Filters = { pilar: string; bidang: string };

function hrefFor({ pilar, bidang }: Filters) {
  const q = new URLSearchParams();
  if (pilar) q.set('pilar', pilar);
  if (bidang) q.set('bidang', bidang);
  const s = q.toString();
  return s ? `/work?${s}#katalog` : '/work#katalog';
}

/**
 * The server renders the list already filtered from the URL, so the archive works without
 * JavaScript. Here the same links filter in place and rewrite the URL with replaceState: no
 * request, no loading screen, and Back still leaves the archive instead of undoing a filter.
 */
export function CatalogClient({
  projects,
  initial,
  headline,
  industryLabels,
}: {
  projects: CatalogProject[];
  initial: Filters;
  headline: string;
  industryLabels: Record<string, string>;
}) {
  const [filters, setFilters] = useState<Filters>(initial);

  const pillarOptions = useMemo(() => {
    const counts = new Map<string, { label: string; count: number }>();
    for (const p of projects) {
      if (!p.pillar) continue;
      const c = counts.get(p.pillar.slug) ?? { label: p.pillar.label, count: 0 };
      counts.set(p.pillar.slug, { ...c, count: c.count + 1 });
    }
    return [
      { value: '', label: 'Semua', count: projects.length, href: hrefFor({ ...filters, pilar: '' }) },
      ...[...counts].map(([slug, c]) => ({ value: slug, label: c.label, count: c.count, href: hrefFor({ ...filters, pilar: slug }) })),
    ];
  }, [projects, filters]);

  const industryOptions = useMemo(() => {
    const counts = new Map<string, number>();
    for (const p of projects) counts.set(p.industry || 'other', (counts.get(p.industry || 'other') ?? 0) + 1);
    return [
      { value: '', label: 'Semua bidang', href: hrefFor({ ...filters, bidang: '' }) },
      ...[...counts]
        .sort(([a], [b]) => (industryLabels[a] ?? a).localeCompare(industryLabels[b] ?? b, 'id'))
        .map(([value, count]) => ({ value, label: industryLabels[value] ?? value, count, href: hrefFor({ ...filters, bidang: value }) })),
    ];
  }, [projects, filters, industryLabels]);

  const filtered = useMemo(
    () =>
      projects.filter(
        (p) => (!filters.pilar || p.pillar?.slug === filters.pilar) && (!filters.bidang || (p.industry || 'other') === filters.bidang),
      ),
    [projects, filters],
  );

  const select = (key: keyof Filters) => (value: string) => {
    const next = { ...filters, [key]: value };
    setFilters(next);
    history.replaceState(history.state, '', hrefFor(next).replace('#katalog', ''));
  };

  const reset = () => {
    setFilters({ pilar: '', bidang: '' });
    history.replaceState(history.state, '', '/work');
  };

  return (
    <main>
      <section className="pt-16 pb-12 border-b border-paper-200">
        <div className="max-w-[1180px] mx-auto px-8">
          <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
            <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Work' }]} />
            {/* A plain link: a soft navigation would be caught by the @modal intercept as a project slug. */}
            <a
              href="/work/presentasi"
              className="font-mono text-xs uppercase tracking-wider text-ink/65 hover:text-ink transition-colors tabular focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-electric"
            >
              Mode presentasi →
            </a>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-12 items-end mb-12">
            <div>
              <span className="font-mono text-xs uppercase tracking-wider text-mist-600 inline-flex items-center gap-2 tabular">
                [ 02 / 06 ] <span className="text-mist-400">·</span> Work archive
              </span>
              <h1 className="text-[clamp(40px,5vw,72px)] leading-[1.02] tracking-[-0.025em] font-bold mt-5 max-w-[18ch] text-balance">
                {headline}
              </h1>
            </div>
            <p className="text-[18px] leading-[1.55] text-ink max-w-[420px] lg:justify-self-end text-pretty">
              Sistem yang kami bangun untuk klien dan untuk studio sendiri, dari ERP sampai situs. Saring menurut
              layanan atau bidang usaha yang paling dekat dengan masalah Anda.
            </p>
          </div>

          <div className="flex flex-col gap-4 pt-6 border-t border-paper-200">
            <FilterBar variant="segmented" label="Layanan" options={pillarOptions} active={filters.pilar} onSelect={select('pilar')} />
            <FilterBar variant="chips" label="Bidang" options={industryOptions} active={filters.bidang} onSelect={select('bidang')} />
          </div>
        </div>
      </section>

      <section id="katalog" className="py-16 scroll-mt-24" aria-live="polite">
        <div className="max-w-[1180px] mx-auto px-8">
          <h2 className="sr-only">Proyek</h2>
          {filtered.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch" style={{ gridAutoFlow: 'dense' }}>
              {filtered.map((p, i) => {
                // Magazine pattern: the first card is a 2-col feature. The last card turns wide only when
                // that closes the final row of the 3-col grid, so no filter leaves a two-cell gap.
                const isLast = i === filtered.length - 1;
                const closesRow = i > 0 && isLast && (filtered.length + 1) % 3 === 2;
                const span = i === 0 || closesRow ? 'md:col-span-2 lg:col-span-2' : '';
                const variant = i === 0 ? 'feature' : closesRow ? 'wide' : 'default';
                return (
                  <div key={p.id} className={`${span} h-full`}>
                    <ProjectCard project={p} variant={variant} priority={i === 0} />
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-32 text-center">
              <p className="text-[24px] font-bold tracking-tight text-ink mb-2">Belum ada proyek untuk saringan ini.</p>
              <p className="text-ink">
                <a
                  href="/work#katalog"
                  onClick={(e) => {
                    e.preventDefault();
                    reset();
                  }}
                  className="text-electric underline underline-offset-2"
                >
                  Lihat semua proyek
                </a>{' '}
                atau{' '}
                <a href="/#contact" className="text-electric underline underline-offset-2">
                  ceritakan kebutuhan Anda
                </a>
                .
              </p>
            </div>
          )}
        </div>
      </section>

      <section className="py-20 bg-paper-50 border-t border-paper-200">
        <div className="max-w-[1180px] mx-auto px-8">
          <div
            className="relative overflow-hidden rounded-2xl p-10 lg:p-14 bg-paper border border-paper-200 shadow-[inset_0_1px_0_rgba(255,255,255,0.6),0_8px_24px_-12px_rgba(8,9,10,0.08)] flex flex-col lg:flex-row lg:items-center justify-between gap-10"
            style={{
              backgroundImage: `
                linear-gradient(rgba(8,9,10,0.04) 1px, transparent 1px),
                linear-gradient(90deg, rgba(8,9,10,0.04) 1px, transparent 1px)
              `,
              backgroundSize: '36px 36px',
              backgroundPosition: '-1px -1px',
            }}
          >
            <div aria-hidden className="absolute top-3 left-3 w-3 h-3 border-l border-t border-ink/15" />
            <div aria-hidden className="absolute top-3 right-3 w-3 h-3 border-r border-t border-ink/15" />
            <div aria-hidden className="absolute bottom-3 left-3 w-3 h-3 border-l border-b border-ink/15" />
            <div aria-hidden className="absolute bottom-3 right-3 w-3 h-3 border-r border-b border-ink/15" />

            <div className="relative max-w-[680px]">
              <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-mist-600 block mb-3">
                Bidang Anda belum ada di sini?
              </span>
              <p className="text-[clamp(28px,3.2vw,40px)] font-bold tracking-[-0.02em] leading-[1.15] text-ink text-balance m-0">
                Ceritakan sistem yang Anda butuhkan.
              </p>
            </div>

            <a
              href="/#contact"
              className="relative h-12 px-5 rounded-md bg-electric text-paper text-sm font-semibold inline-flex items-center hover:bg-[#2562E0] active:scale-[0.98] transition-[background,transform] flex-shrink-0 shadow-[0_8px_24px_-8px_rgba(44,112,254,0.4)]"
            >
              Konsultasi gratis 30 menit →
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
