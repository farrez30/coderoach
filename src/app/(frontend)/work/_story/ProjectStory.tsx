import type { Project } from '@/payload-types';
import { linkState, safeHref } from '@/lib/portfolio/links';
import { latestLinkChecks } from '@/lib/portfolio/queries';
import { Badge } from '../../_components/ui/Badge';
import { ProseRenderer } from '../../_components/detail/ProseRenderer';
import { FeatureScene } from './FeatureScene';
import { formatDay } from './format';
import type { LinkView } from './LinkChips';
import { asMedia, MediaImg } from './MediaImg';
import { MetricBand } from './MetricBand';
import { Sources } from './Sources';
import { StoryEnhancer } from './StoryEnhancer';
import { StoryHero } from './StoryHero';
import { StoryTimeline } from './StoryTimeline';
import { TourChapter } from './TourChapter';

/** The new template takes over once a project has its problem written; until then the old one stays. */
export const hasStory = (project: Project) => Boolean(project.summary?.problem);

/**
 * A project page in the apple.com manner (ADR 0003): light, one idea per section, the real product
 * in a drawn frame, at most one dark chapter. Complete as server-rendered HTML; StoryEnhancer only
 * adds motion on the full page. The overlay renders the same thing, still.
 */
export async function ProjectStory({ project, mode }: { project: Project; mode: 'page' | 'overlay' }) {
  const Root = mode === 'page' ? 'main' : 'div';
  const rootId = `story-${project.slug}`;
  const metrics = project.metrics ?? [];
  const links = await linkViews(project.links ?? []);
  const stack = project.featuredDetails?.stack?.length
    ? project.featuredDetails.stack.map((s) => s.tech)
    : (project.pills ?? []).map((p) => p.pill);

  return (
    <Root id={rootId} className="story">
      <StoryHero project={project} links={links} mode={mode} />
      <MetricBand metrics={metrics} />
      <FeatureScene client={project.client} features={project.features ?? []} />
      <BeforeAfter rows={project.beforeAfter ?? []} />
      <TourChapter project={project} />
      <StoryTimeline entries={project.timeline ?? []} />

      {project.testimonial?.quote && (
        <section aria-label="Testimoni" className="py-[clamp(72px,9vw,120px)] border-t border-paper-200">
          <figure className="m-0 max-w-[880px] mx-auto px-5 sm:px-8 text-center">
            <blockquote className="m-0 text-[clamp(24px,3.2vw,38px)] font-semibold tracking-[-0.02em] leading-[1.25] text-balance">
              “{project.testimonial.quote}”
            </blockquote>
            <figcaption className="mt-6 text-[15px] text-ink/65">
              {[project.testimonial.author, project.testimonial.role, project.testimonial.company].filter(Boolean).join(', ')}
            </figcaption>
          </figure>
        </section>
      )}

      {project.richContent && (
        <section aria-labelledby="cerita-judul" className="py-[clamp(72px,9vw,120px)] border-t border-paper-200">
          <div className="max-w-[1180px] mx-auto px-5 sm:px-8 grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-12 lg:gap-16">
            <div>
              <h2 id="cerita-judul" className="m-0 mb-8 text-[clamp(28px,3.4vw,40px)] font-bold tracking-[-0.03em] leading-[1.08]">
                Cerita lengkap
              </h2>
              <ProseRenderer data={project.richContent} />
            </div>
            {stack.length > 0 && (
              <aside className="lg:sticky lg:top-24 self-start border border-paper-200 rounded-lg p-6">
                <h3 className="m-0 mb-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-ink/65">Stack</h3>
                <div className="flex flex-wrap gap-2">
                  {stack.map((tech) => (
                    <Badge key={tech}>{tech}</Badge>
                  ))}
                </div>
              </aside>
            )}
          </div>
        </section>
      )}

      <Sources metrics={metrics} demoNote={project.showcase?.demoNote} />
      {mode === 'page' && <StoryEnhancer rootId={rootId} />}
    </Root>
  );
}

async function linkViews(links: NonNullable<Project['links']>): Promise<LinkView[]> {
  const usable = links
    .map((l) => ({ ...l, href: safeHref(l.href) }))
    .filter((l): l is typeof l & { href: string } => Boolean(l.href && l.label));
  const checks = await latestLinkChecks(usable.filter((l) => l.check !== false).map((l) => l.href));
  const now = Date.now();
  return usable.map((l) => ({
    label: l.label ?? '',
    href: l.href,
    state: l.check === false ? null : linkState(checks.get(l.href), now),
    snapshot: asMedia(l.snapshot),
    snapshotTakenAt: l.snapshotTakenAt ?? null,
  }));
}

/** Two dated screenshots, stacked: the old one first. Works the same with or without JS. */
function BeforeAfter({ rows }: { rows: NonNullable<Project['beforeAfter']> }) {
  const usable = rows.filter((r) => asMedia(r.before) && asMedia(r.after));
  if (!usable.length) return null;
  return (
    <section aria-labelledby="sebelum-judul" className="py-[clamp(72px,9vw,120px)] bg-paper-50 border-y border-paper-200">
      <div className="max-w-[1180px] mx-auto px-5 sm:px-8">
        <h2 id="sebelum-judul" className="m-0 text-[clamp(34px,5vw,60px)] font-bold tracking-[-0.035em] leading-[1.02]">
          Sebelum dan sesudah.
        </h2>
        {usable.map((r, i) => {
          const source = safeHref(r.sourceUrl);
          return (
            <div key={r.id ?? i} className="mt-12">
              {r.label && <h3 className="m-0 text-[21px] font-semibold tracking-[-0.015em]">{r.label}</h3>}
              <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-5">
                {(
                  [
                    ['Sebelum', asMedia(r.before), r.beforeDate],
                    ['Sesudah', asMedia(r.after), r.afterDate],
                  ] as const
                ).map(([label, media, date]) =>
                  media ? (
                    <figure key={label} className="m-0 rounded-xl overflow-hidden border border-paper-200 bg-paper-100">
                      <MediaImg media={media} sizes="(min-width: 768px) 560px, 92vw" className="block w-full h-auto" />
                      <figcaption className="px-4 py-3 font-mono text-[11px] uppercase tracking-wider text-ink/65 tabular">
                        {label}
                        {date ? ` · ${formatDay(date)}` : ''}
                      </figcaption>
                    </figure>
                  ) : null,
                )}
              </div>
              {(r.caption || source) && (
                <p className="m-0 mt-3 text-[15px] leading-[1.55] text-ink/65">
                  {r.caption}{' '}
                  {source && (
                    <a href={source} target="_blank" rel="noopener noreferrer" className="text-electric hover:underline underline-offset-4">
                      Sumber ↗<span className="sr-only"> (tab baru)</span>
                    </a>
                  )}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
