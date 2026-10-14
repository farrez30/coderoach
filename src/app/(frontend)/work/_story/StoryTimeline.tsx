import type { Project } from '@/payload-types';

type Entry = NonNullable<Project['timeline']>[number];

/** Dated steps, each with the commit or document it came from. The rail fills as the page is read. */
export function StoryTimeline({ entries }: { entries: Entry[] }) {
  if (!entries.length) return null;
  return (
    <section aria-labelledby="linimasa-judul" className="py-[clamp(72px,9vw,120px)]">
      <div className="max-w-[1180px] mx-auto px-5 sm:px-8 grid grid-cols-1 lg:grid-cols-[1fr_1.6fr] gap-10 lg:gap-16">
        <div>
          <p className="m-0 text-[11px] font-semibold uppercase tracking-[0.18em] text-ink/65">Linimasa</p>
          <h2 id="linimasa-judul" className="m-0 mt-3 text-[clamp(34px,5vw,60px)] font-bold tracking-[-0.035em] leading-[1.02] text-balance">
            Dari awal sampai sekarang.
          </h2>
        </div>
        <ol className="relative m-0 p-0 list-none" data-scene="read">
          <span aria-hidden className="absolute left-[5px] top-2 bottom-2 w-[2px] bg-paper-200 overflow-hidden">
            <span className="story-timeline__fill block h-full w-full bg-electric" />
          </span>
          {entries.map((t, i) => (
            <li key={t.id ?? i} className="relative pl-9 pb-9 last:pb-0">
              <span aria-hidden className="absolute left-0 top-[5px] h-3 w-3 rounded-full bg-ink ring-4 ring-paper-100" />
              <p className="m-0 font-mono text-[11px] uppercase tracking-wider text-ink/65 tabular">{t.date}</p>
              <p className="m-0 mt-1.5 text-[19px] sm:text-[21px] font-semibold tracking-[-0.015em] leading-[1.3] text-pretty">{t.title}</p>
              {t.detail && <p className="m-0 mt-1.5 text-[16px] leading-[1.55] text-ink/65 text-pretty">{t.detail}</p>}
              {t.sourceRef && <p className="m-0 mt-1.5 font-mono text-[11px] text-ink/65 tabular">{t.sourceRef}</p>}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
