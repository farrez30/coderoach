import { industryLabel, KIND_LABELS } from '@/lib/portfolio/taxonomy';
import { asMedia, MediaImg } from '../../../(frontend)/work/_story/MediaImg';
import { presentableProjects } from './_components/data';
import { OfflineKit } from './_components/OfflineKit';
import { Presenter } from './_components/Presenter';

export const dynamic = 'force-dynamic';

const pad = (n: number) => String(n).padStart(2, '0');

/**
 * The console shelf (ADR 0002): one card per project, as plain links, on the dark instrument the
 * home page's ops console uses. Arrow keys, Enter, F and Esc come from Presenter; everything here
 * is server HTML and works offline once "Siapkan offline" has run.
 */
export default async function PresentasiPage() {
  const projects = await presentableProjects();
  const pages = ['/work/presentasi', ...projects.map((p) => `/work/presentasi/${p.slug}`)];

  return (
    <main className="min-h-[100dvh] bg-ink text-paper flex flex-col" data-theme="dark">
      <header className="flex flex-wrap items-center justify-between gap-4 px-6 sm:px-10 py-5 border-b border-shadow-700">
        <p className="m-0 font-mono text-[11px] uppercase tracking-wider text-mist-500 tabular">
          Coderoach · Presentasi · {pad(projects.length)} proyek
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <OfflineKit enabled={process.env.NEXT_PUBLIC_PRESENTASI_OFFLINE === 'on'} pages={pages} />
          <Presenter back="/work" />
          <a
            href="/work"
            className="h-8 px-3 rounded-md inline-flex items-center font-mono text-[11px] uppercase tracking-wider text-mist-500 hover:text-paper focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-electric"
          >
            Keluar · Esc
          </a>
        </div>
      </header>

      <ol className="m-0 p-0 list-none flex-1 flex items-center gap-6 sm:gap-8 overflow-x-auto snap-x snap-mandatory px-6 sm:px-[8vw] py-10">
        {projects.map((p, i) => {
          const image = asMedia(p.showcase?.screen) ?? asMedia(p.coverImage);
          return (
            <li key={p.slug} className="snap-center shrink-0 w-[min(82vw,640px)]">
              <a
                href={`/work/presentasi/${p.slug}`}
                data-shelf-item
                className="group block rounded-2xl border border-shadow-700 bg-shadow-900 overflow-hidden shadow-[inset_0_1px_0_rgba(255,255,255,0.04),0_24px_48px_-24px_rgba(8,9,10,0.5)] hover:border-mist-600 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-electric transition-colors"
              >
                <div className="aspect-[16/10] bg-shadow-800 overflow-hidden">
                  {image ? (
                    <MediaImg
                      media={image}
                      sizes="(min-width: 800px) 640px, 82vw"
                      priority={i === 0}
                      className="h-full w-full object-cover object-top"
                    />
                  ) : (
                    // No screenshot yet: the blueprint well the site's cards use, on the dark panel.
                    <div
                      aria-hidden
                      className="h-full w-full grid place-items-center bg-[linear-gradient(rgba(244,247,245,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(244,247,245,0.05)_1px,transparent_1px)] bg-[size:28px_28px]"
                    >
                      <span className="text-[clamp(32px,5vw,56px)] font-bold tracking-[-0.03em] text-paper/80">{p.client}</span>
                    </div>
                  )}
                </div>
                <div className="p-6 sm:p-7">
                  <p className="m-0 font-mono text-[11px] uppercase tracking-wider text-mist-500 tabular">
                    [ {pad(i + 1)} / {pad(projects.length)} ] · {KIND_LABELS[p.kind]} · {industryLabel(p.industry)}
                    {p.publishedYear ? ` · ${p.publishedYear}` : ''}
                  </p>
                  <p className="m-0 mt-3 text-[clamp(28px,3.4vw,40px)] font-bold tracking-[-0.03em] leading-[1.05]">{p.client}</p>
                  <p className="m-0 mt-2 text-[17px] leading-[1.45] text-mist-400 text-pretty">{p.tagline}</p>
                </div>
              </a>
            </li>
          );
        })}
      </ol>

      <p className="m-0 px-6 sm:px-10 pb-6 font-mono text-[11px] uppercase tracking-wider text-mist-500 tabular">
        ← → pilih · Enter buka · F layar penuh · Esc keluar
      </p>
    </main>
  );
}
