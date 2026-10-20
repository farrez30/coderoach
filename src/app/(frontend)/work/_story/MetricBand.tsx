import type { Project } from '@/payload-types';
import { Meta } from '../../_components/ui/Meta';

export type StoredMetric = NonNullable<Project['metrics']>[number];

/** The numbers, large. Each one points to its line under Sumber: when, how, and where to check it. */
export function MetricBand({ metrics }: { metrics: StoredMetric[] }) {
  if (!metrics.length) return null;
  return (
    <section aria-labelledby="angka-judul" className="bg-paper-50 border-y border-paper-200 py-[clamp(72px,9vw,120px)]" data-scene="enter">
      <div className="max-w-[1180px] mx-auto px-5 sm:px-8">
        <p className="m-0 text-[11px] font-semibold uppercase tracking-[0.18em] text-ink/65">Angka</p>
        <h2 id="angka-judul" className="m-0 mt-3 text-[clamp(34px,5vw,60px)] font-bold tracking-[-0.035em] leading-[1.02] text-balance">
          Hasil yang terukur.
        </h2>
        <p className="m-0 mt-4 max-w-[560px] text-[17px] leading-[1.5] text-ink/65 text-pretty">
          Setiap angka punya tanggal ukur, cara ukur, dan rujukannya di bagian{' '}
          <a href="#sumber" className="text-ink underline underline-offset-4 decoration-paper-200 hover:decoration-ink">
            Sumber
          </a>
          .
        </p>
        <ul className="m-0 mt-12 sm:mt-16 p-0 list-none grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-8">
          {metrics.map((m, i) => (
            <li key={m.key ?? i} className="story-metric @container border-t border-paper-200 pt-6" style={{ '--i': i } as React.CSSProperties}>
              <p className="m-0 text-[15px] leading-[1.4] text-ink/65">{m.label}</p>
              <p className="m-0 mt-3 tabular whitespace-nowrap">
                {m.status === 'target' && (
                  <span className="block font-mono text-[11px] uppercase tracking-wider text-ink/65 mb-1">Target</span>
                )}
                <span className="text-[min(84px,19cqi)] font-bold tracking-[-0.045em] leading-none">{m.value}</span>
                {m.unit && <span className="ml-1.5 text-[min(28px,7cqi)] font-semibold tracking-[-0.02em] text-electric">{m.unit}</span>}
              </p>
              <p className="m-0 mt-3 font-mono text-[11px] uppercase tracking-wider text-ink/65 tabular">
                <Meta
                  parts={[
                    m.baselineValue && `Dari ${[m.baselineValue, m.baselineUnit].filter(Boolean).join(' ')}`,
                    <a key="sumber" href={`#sumber-${i + 1}`} className="inline-block -my-3 px-1.5 py-3 hover:text-ink underline-offset-4 hover:underline" aria-label={`Sumber angka ${i + 1}`}>
                      [{i + 1}]
                    </a>,
                  ]}
                />
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
