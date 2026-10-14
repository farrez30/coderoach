import { formatMetric } from '@/lib/portfolio/metrics';
import { safeHref } from '@/lib/portfolio/links';
import { formatDay } from './format';
import type { StoredMetric } from './MetricBand';

/** Where every number on the page came from, numbered to match the footnotes in MetricBand. */
export function Sources({ metrics, demoNote }: { metrics: StoredMetric[]; demoNote?: string | null }) {
  if (!metrics.length && !demoNote) return null;
  return (
    <section id="sumber" aria-labelledby="sumber-judul" className="bg-paper-50 border-t border-paper-200 py-[clamp(64px,8vw,104px)] scroll-mt-16">
      <div className="max-w-[1180px] mx-auto px-5 sm:px-8 grid grid-cols-1 lg:grid-cols-[1fr_1.6fr] gap-8 lg:gap-16">
        <div>
          <h2 id="sumber-judul" className="m-0 text-[28px] font-bold tracking-[-0.02em]">
            Sumber
          </h2>
          <p className="m-0 mt-3 max-w-[40ch] text-[15px] leading-[1.55] text-ink/65 text-pretty">
            Rujukan berbentuk <span className="font-mono text-[13px]">repo@commit</span> menunjuk commit tempat angka itu diukur.
          </p>
        </div>
        <ol className="m-0 p-0 list-none space-y-7">
          {metrics.map((m, i) => {
            const verify = safeHref(m.verifyUrl);
            return (
              <li key={m.key ?? i} id={`sumber-${i + 1}`} className="grid grid-cols-[36px_1fr] scroll-mt-28">
                <span className="font-mono text-[12px] text-ink/65 tabular pt-0.5">[{i + 1}]</span>
                <div>
                  <p className="m-0 text-[16px] font-semibold leading-[1.45]">
                    {m.label}:{' '}
                    {formatMetric({
                      value: m.value ?? '',
                      unit: m.unit ?? '',
                      baseline: m.baselineValue ? { value: m.baselineValue, unit: m.baselineUnit ?? '' } : undefined,
                      status: m.status ?? 'measured',
                    })}
                  </p>
                  {m.method && <p className="m-0 mt-1 text-[15px] leading-[1.55] text-ink/65 text-pretty">{m.method}</p>}
                  <p className="m-0 mt-2 font-mono text-[11px] uppercase tracking-wider text-ink/65 tabular flex flex-wrap gap-x-3 gap-y-1">
                    {m.measuredAt && <span>{m.status === 'target' ? 'Ditetapkan' : 'Diukur'} {formatDay(m.measuredAt)}</span>}
                    {m.sourceRef && <span className="normal-case">{m.sourceRef}</span>}
                    {verify && (
                      <a href={verify} target="_blank" rel="noopener noreferrer" className="text-electric hover:underline underline-offset-4">
                        Periksa sendiri ↗<span className="sr-only"> (tab baru)</span>
                      </a>
                    )}
                  </p>
                </div>
              </li>
            );
          })}
          {demoNote && (
            <li className="grid grid-cols-[36px_1fr]">
              <span aria-hidden className="font-mono text-[12px] text-ink/65 pt-0.5">—</span>
              <p className="m-0 text-[15px] leading-[1.55] text-ink/65 text-pretty">
                <span className="font-semibold text-ink">Rekaman dan tangkapan layar.</span> {demoNote}
              </p>
            </li>
          )}
        </ol>
      </div>
    </section>
  );
}
