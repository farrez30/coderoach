import type { Project } from '@/payload-types';
import { industryLabel, KIND_LABELS } from '@/lib/portfolio/taxonomy';
import { Breadcrumbs } from '../../_components/detail/Breadcrumbs';
import { DeviceFrame } from './DeviceFrame';
import { LinkChips, type LinkView } from './LinkChips';
import { asMedia, MediaImg } from './MediaImg';
import type { StoryMode } from './ProjectStory';

/**
 * The first screen: name, one line, then problem, solution, and result before any picture, so the
 * answer is on screen before the show. The product sits below in a drawn frame.
 */
export function StoryHero({ project, links, mode }: { project: Project; links: LinkView[]; mode: StoryMode }) {
  const sc = project.showcase;
  const screen = asMedia(sc?.screen);
  // No recording yet: the cover the old page used, shown as it is (it is often already a composite).
  const cover = screen ? null : asMedia(project.coverImage);
  const phone = asMedia(sc?.screenPhone);
  const loop = asMedia(sc?.loop);
  const summary = [
    ['Masalah', project.summary?.problem],
    ['Solusi', project.summary?.solution],
    ['Hasil', project.summary?.result],
  ].filter((row): row is [string, string] => Boolean(row[1]));
  const eyebrow = [KIND_LABELS[project.kind], industryLabel(project.industry), project.publishedYear].filter(Boolean);

  return (
    <section className="story-hero pt-6 sm:pt-12 pb-16 sm:pb-24" data-scene="exit">
      <div className="max-w-[1180px] mx-auto px-5 sm:px-8">
        {mode === 'page' && (
          <div className="hidden sm:block mb-12">
            <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Work', href: '/work' }, { label: project.client }]} />
          </div>
        )}
        <p className="m-0 font-mono text-[11px] sm:text-xs uppercase tracking-wider text-ink/65 tabular">{eyebrow.join(' · ')}</p>
        <h1 className="m-0 mt-2 sm:mt-3 text-[clamp(46px,9vw,112px)] font-bold tracking-[-0.045em] leading-[0.95]">{project.client}</h1>
        <p className="m-0 mt-3 sm:mt-5 max-w-[28ch] text-[clamp(21px,2.8vw,34px)] font-semibold tracking-[-0.02em] leading-[1.18] text-pretty">
          {project.tagline}
        </p>
        <div className="mt-3 sm:mt-6 flex flex-wrap items-start gap-x-6 gap-y-3">
          {asMedia(sc?.tour) && (
            <a
              href="#tur"
              className="h-9 inline-flex items-center text-[17px] font-medium text-electric hover:underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-electric"
            >
              Tonton turnya ›
            </a>
          )}
          <LinkChips links={links} />
        </div>
        {summary.length > 0 && (
          <dl className="m-0 mt-4 sm:mt-14 grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-10 border-t border-paper-200 pt-4 md:pt-8">
            {summary.map(([label, text]) => (
              <div key={label}>
                <dt className="text-[11px] font-semibold uppercase tracking-[0.18em] text-ink/65">{label}</dt>
                <dd className="m-0 mt-1.5 text-[16px] sm:text-[17px] leading-[1.5] text-pretty">{text}</dd>
              </div>
            ))}
          </dl>
        )}
      </div>

      {cover && (
        <div className="max-w-[1180px] mx-auto px-5 sm:px-8 mt-12 sm:mt-20">
          <div className="story-rise overflow-hidden rounded-2xl border border-paper-200 bg-paper-50">
            <MediaImg media={cover} priority sizes="(min-width: 1180px) 1116px, 92vw" className="block w-full h-auto" />
          </div>
        </div>
      )}
      {screen && (
        <div className="max-w-[1180px] mx-auto px-5 sm:px-8 mt-12 sm:mt-20">
          <div className={`relative mx-auto max-w-[1040px] ${phone ? 'pr-[11%] pb-[6%]' : ''}`}>
            <div className="story-rise">
              <DeviceFrame kind={sc?.frame ?? 'laptop'}>
                <MediaImg media={screen} priority sizes="(min-width: 1180px) 900px, 86vw" />
              </DeviceFrame>
            </div>
            {phone && (
              <div className="story-phone absolute right-0 bottom-0 w-[25%] max-w-[240px]">
                <div className="story-float">
                  <DeviceFrame kind="phone">
                    <MediaImg media={phone} sizes="(min-width: 1180px) 240px, 25vw" />
                    {loop && (
                      // Filled in by StoryEnhancer once on screen; the still underneath is the content.
                      <video data-loop={loop.url ?? ''} muted playsInline loop preload="none" aria-hidden tabIndex={-1} />
                    )}
                  </DeviceFrame>
                </div>
                {loop && (
                  <button
                    type="button"
                    hidden
                    data-loop-toggle
                    aria-pressed="false"
                    aria-label="Jeda animasi"
                    className="story-loop-toggle absolute -left-4 bottom-6 h-9 w-9 rounded-full bg-paper-50 border border-paper-200 text-ink inline-flex items-center justify-center shadow-[0_8px_20px_-10px_rgba(8,9,10,0.4)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-electric"
                  >
                    <svg aria-hidden width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
                      <path className="story-icon-pause" d="M3 2h3v10H3zM8 2h3v10H8z" />
                      <path className="story-icon-play" d="M3.5 2v10l8-5z" />
                    </svg>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
