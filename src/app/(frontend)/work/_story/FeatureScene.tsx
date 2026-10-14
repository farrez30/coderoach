import type { Project } from '@/payload-types';
import { DeviceFrame } from './DeviceFrame';
import { asMedia, MediaImg } from './MediaImg';

type Feature = NonNullable<Project['features']>[number];

const pad = (n: number) => String(n).padStart(2, '0');

/**
 * One feature per row: text beside its screen. On a wide screen with motion allowed, StoryEnhancer
 * turns the rows into one pinned scene (globals.css, "PROJECT STORY"): the screens share a sticky
 * slot and cross-fade as each text reaches the middle. Same markup either way.
 */
export function FeatureScene({ client, features }: { client: string; features: Feature[] }) {
  if (!features.length) return null;
  const n = features.length;
  return (
    <section aria-labelledby="fitur-judul" className="py-[clamp(72px,9vw,120px)]">
      <div className="max-w-[1180px] mx-auto px-5 sm:px-8">
        <p className="m-0 text-[11px] font-semibold uppercase tracking-[0.18em] text-ink/65">Fitur</p>
        <h2 id="fitur-judul" className="m-0 mt-3 text-[clamp(34px,5vw,60px)] font-bold tracking-[-0.035em] leading-[1.02] text-balance">
          Di dalam {client}.
        </h2>
        <div className="story-features mt-12 sm:mt-16" style={{ '--n': n } as React.CSSProperties}>
          {features.map((f, i) => {
            const shot = asMedia(f.screen);
            const tall = Boolean(shot?.width && shot.height && shot.height > shot.width);
            return (
              <article
                key={f.id ?? i}
                className="story-feature"
                style={{ '--row': i + 1 } as React.CSSProperties}
                data-current={i === 0 ? '' : undefined}
              >
                <div className="story-feature__text">
                  <p className="m-0 font-mono text-[11px] uppercase tracking-wider text-ink/65 tabular">
                    {pad(i + 1)} / {pad(n)}
                  </p>
                  <h3 className="m-0 mt-3 text-[clamp(24px,2.6vw,32px)] font-bold tracking-[-0.025em] leading-[1.12] text-balance">
                    {f.title}
                  </h3>
                  {f.body && <p className="m-0 mt-3 max-w-[46ch] text-[17px] leading-[1.55] text-ink/65 text-pretty">{f.body}</p>}
                </div>
                {shot && (
                  <figure className={`story-feature__shot m-0 ${tall ? 'story-feature__shot--tall' : ''}`}>
                    <DeviceFrame kind={tall ? 'phone' : 'browser'}>
                      <MediaImg media={shot} sizes={tall ? '(min-width: 1024px) 300px, 70vw' : '(min-width: 1024px) 640px, 92vw'} />
                    </DeviceFrame>
                  </figure>
                )}
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
