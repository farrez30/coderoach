import type { Project } from '@/payload-types';
import { asMedia, MediaImg } from './MediaImg';

/**
 * The page's one dark chapter, holding the tour. The video never autoplays and loads nothing until
 * asked (preload="none"); the transcript is its text alternative, since the recording has no sound.
 */
export function TourChapter({ project }: { project: Project }) {
  const sc = project.showcase;
  const tour = asMedia(sc?.tour);
  const poster = asMedia(sc?.tourPoster);
  const captions = asMedia(sc?.tourCaptions);
  const dc = project.darkChapter;
  if (!tour && !dc?.title) return null;
  return (
    <section id="tur" aria-labelledby="tur-judul" data-theme="dark" className="bg-ink text-paper py-[clamp(80px,10vw,140px)] overflow-hidden scroll-mt-16">
      <div className="max-w-[1180px] mx-auto px-5 sm:px-8">
        <div className="max-w-[780px] mx-auto text-center">
          {dc?.eyebrow && <p className="m-0 font-mono text-[11px] sm:text-xs uppercase tracking-wider text-mist-500 tabular">{dc.eyebrow}</p>}
          <h2 id="tur-judul" className="m-0 mt-4 text-[clamp(34px,5.4vw,68px)] font-bold tracking-[-0.035em] leading-[1.02] text-balance">
            {dc?.title || `Tur ${project.client}`}
          </h2>
          {dc?.body && <p className="m-0 mt-5 text-[17px] sm:text-[19px] leading-[1.5] text-mist-400 text-pretty">{dc.body}</p>}
        </div>
        {tour?.url && (
          <figure className="m-0 mt-12 sm:mt-16">
            <div data-scene="enter">
              <div className="story-tour relative mx-auto overflow-hidden bg-shadow-900 border border-shadow-700 aspect-[16/10]">
                {/* The poster as a lazy image under the video: a poster attribute is fetched with the
                    page, competing with the hero image for a section far below it. An unloaded
                    video paints nothing, so the image shows through until playback starts. */}
                {poster && <MediaImg media={poster} alt="" sizes="(min-width: 1180px) 1116px, 92vw" className="absolute inset-0 h-full w-full object-contain" />}
                <video
                  controls
                  playsInline
                  preload="none"
                  aria-label={tour.alt || `Tur ${project.client}`}
                  className="relative block h-full w-full object-contain"
                >
                  <source src={tour.url} type={tour.mimeType ?? 'video/mp4'} />
                  {captions?.url && <track kind="captions" src={captions.url} srcLang="id" label="Bahasa Indonesia" default />}
                  <a href={tour.url}>Buka rekaman tur</a>
                </video>
              </div>
            </div>
            {sc?.demoNote && (
              <figcaption className="mt-4 text-center text-[14px] leading-[1.5] text-mist-500 text-pretty">{sc.demoNote}</figcaption>
            )}
          </figure>
        )}
        {sc?.tourTranscript && (
          <details className="story-transcript max-w-[780px] mx-auto mt-8 border-t border-shadow-700 pt-5">
            <summary className="cursor-pointer text-[15px] font-medium text-paper focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-electric">
              Transkrip tur
            </summary>
            <p className="m-0 mt-4 text-[16px] leading-[1.6] text-mist-400 text-pretty">{sc.tourTranscript}</p>
          </details>
        )}
      </div>
    </section>
  );
}
