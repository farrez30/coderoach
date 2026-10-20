import { Icon, type IconName } from '@/lib/icons';
import { AnimatedCount } from './ui/AnimatedCount';
import { Meta } from './ui/Meta';
import { StudioPulse } from './ui/StudioPulse';
import { StudioWaveBg } from './ui/StudioWaveBg';

type StudioData = {
  sectionMarker?: string | null;
  heading?: string | null;
  lede?: string | null;
  stats?: Array<{ num: string; accent?: string | null; label: string }> | null;
};

type Tenet = {
  id: string | number;
  order: number;
  icon: IconName;
  title: string;
  description: string;
};

export function Studio({ data, tenets }: { data: StudioData | null; tenets: Tenet[] }) {
  return (
    <section
      id="studio"
      data-theme="dark"
      className="py-[120px] bg-ink text-paper border-y border-shadow-700 relative overflow-hidden isolate"
    >
      {/* Animated dotted-surface background — anchored top, fades toward bottom (mask baked into component) */}
      <StudioWaveBg className="opacity-55 -z-[2]" />
      <div className="max-w-[1180px] mx-auto px-8 relative z-[1]">
        <div className="reveal-stagger">
          <span className="font-mono text-xs font-medium tracking-wider uppercase inline-flex items-center gap-2 flex-wrap text-mist-500 tabular">
            [ 05 / 07 ] <span className="text-mist-400">·</span> Studio
          </span>
          <h2 className="text-[clamp(40px,5vw,64px)] leading-none tracking-[-0.02em] font-bold mt-[18px] max-w-[880px] text-paper">
            {data?.heading}
          </h2>
          <a
            href="/studio"
            className="text-[11px] font-semibold uppercase tracking-[0.18em] text-electric hover:underline mt-6 inline-block"
          >
            Lihat selengkapnya <span aria-hidden>→</span>
          </a>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-[1.15fr_1fr] gap-20 mt-14 items-start">
          <div className="flex flex-col gap-10">
            <p className="text-[20px] leading-[1.55] text-mist-500 m-0 max-w-[56ch] text-pretty">
              {data?.lede}
            </p>
            {data?.stats && data.stats.length > 0 && (
              <div className="grid grid-cols-2 gap-x-12 gap-y-9 pt-8 border-t border-shadow-700">
                {data.stats.map((s, i) => (
                  <div key={i} className="flex flex-col gap-2.5">
                    <div className="text-[56px] font-bold leading-none tracking-[-0.025em] text-paper tabular">
                      <AnimatedCount value={s.num} />
                      {s.accent && <span className="text-electric font-bold">{s.accent}</span>}
                    </div>
                    <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-mist-500 leading-[1.5] whitespace-pre-line">
                      {s.label}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Studio note — replaces testimonial until we have a real one to publish */}
            <figure className="pt-8 border-t border-shadow-700 mt-2">
              <blockquote className="text-[20px] leading-[1.4] text-paper m-0 font-medium tracking-[-0.005em] text-balance">
                Setiap proyek dikerjakan oleh engineer yang juga melakukan scoping. Tanpa lapisan
                agency, tanpa hand-off ke junior, tanpa konteks yang hilang di tengah jalan.
              </blockquote>
              <figcaption className="mt-4 flex items-center gap-3">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-electric to-[#5DD79A] grid place-items-center text-paper text-[10px] font-bold">
                  CR
                </div>
                <Meta
                  parts="Coderoach Studio · Operating note"
                  className="text-[11px] font-semibold uppercase tracking-[0.18em] text-mist-500"
                />
              </figcaption>
            </figure>
          </div>
          <div className="flex flex-col gap-9 max-lg:border-t max-lg:border-shadow-700 max-lg:pt-9 lg:border-l lg:border-shadow-700 lg:pl-12">
            {tenets.map((t) => (
              <div key={t.id} className="flex flex-col gap-2.5">
                <span className="text-mist-400 group-hover:text-electric transition-colors">
                  <Icon name={t.icon} size={20} />
                </span>
                <h4 className="text-[22px] font-bold tracking-[-0.015em] m-0 text-paper leading-tight">
                  {t.title}
                </h4>
                <p className="text-[15px] leading-[1.55] text-mist-500 m-0 max-w-[48ch]">
                  {t.description}
                </p>
              </div>
            ))}
            <StudioPulse />
          </div>
        </div>
      </div>
    </section>
  );
}
