import { type IconName } from '@/lib/icons';
import { SectionHead, type SectionHeadCopy } from './SectionHead';
import { ServiceViz } from './ui/ServiceViz';

type Service = {
  id: string | number;
  slug: string;
  tag: string;
  icon: IconName;
  title: string;
  tagline: string;
  blurb: string;
  list: Array<{ item: string }>;
  stack: Array<{ tech: string }>;
};

export function Services({ items, head }: { items: Service[]; head?: SectionHeadCopy }) {
  return (
    <section id="services" className="py-[120px] relative">
      <div className="max-w-[1180px] mx-auto px-8">
        <SectionHead
          marker={head?.sectionMarker ?? "[ 01 / 07 ]"}
          category={head?.category ?? "Services"}
          description={head?.description ?? "Yang kami bangun"}
          heading={head?.heading ?? "Four ways in."}
          lede={head?.lede ?? "Bukan menjual jam. Kami menjual hasil yang terukur. Build, automate, intelligence, dan augment. Pilih yang paling sesuai dengan masalah Anda."}
        />
        {/* Sticky-stack of service cards. Each card pins at its own staggered top
            offset so as you scroll, cards build a deck-of-cards stack with the
            previous card peeking out behind the next. Pure CSS sticky — no library. */}
        <div className="mt-14 space-y-4">
          {items.map((it, i) => (
            <div
              key={it.id}
              className="lg:sticky"
              style={{ top: `${24 + i * 22}px` }}
            >
              <a
                href={`/services/${it.slug}`}
                data-spotlight
                className="relative group block rounded-[12px] overflow-hidden cursor-pointer bg-ink text-paper border border-shadow-700 hover:border-shadow-600 transition-colors shadow-[inset_0_1px_0_rgba(255,255,255,0.04),0_18px_36px_-22px_rgba(8,9,10,0.45)]"
              >
                {/* Cursor spotlight */}
                <div
                  aria-hidden
                  className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-[360ms] bg-[radial-gradient(440px_circle_at_var(--mx,50%)_var(--my,50%),rgba(44,112,254,0.16),transparent_45%)] z-[1]"
                />

                <div className="grid lg:grid-cols-[5fr_7fr] min-h-[280px] lg:min-h-[320px]">
                  {/* Left — viz panel */}
                  <div className="relative bg-shadow-900/60 border-b lg:border-b-0 lg:border-r border-shadow-700 p-8 lg:p-10 flex items-center justify-center overflow-hidden">
                    <div className="w-full max-w-[260px] transition-transform duration-[480ms] ease-out group-hover:scale-[1.04]">
                      <ServiceViz
                        variant={it.icon as 'build' | 'automate' | 'intelligence' | 'augment'}
                        tone="dark"
                      />
                    </div>
                  </div>

                  {/* Right — content */}
                  <div className="relative p-8 lg:p-10 flex flex-col gap-4 justify-between">
                    <div className="flex items-start justify-between gap-4">
                      <span className="font-mono text-[11px] uppercase tracking-wider text-mist-400 tabular">
                        [ {it.tag} ]
                      </span>
                      <span
                        aria-hidden
                        className="w-9 h-9 shrink-0 rounded-full border border-shadow-700 bg-ink/40 inline-flex items-center justify-center text-paper/70 group-hover:text-electric group-hover:border-electric group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-[color,border-color,transform] duration-300"
                      >
                        →
                      </span>
                    </div>

                    <div className="flex flex-col gap-3">
                      <h3 className="text-[32px] lg:text-[38px] font-bold tracking-[-0.02em] leading-[1] m-0">
                        {it.title}
                      </h3>
                      <p className="text-[15px] leading-[1.45] font-medium m-0 text-paper/90 max-w-[42ch]">
                        {it.tagline}
                      </p>
                      <p className="text-[13px] leading-[1.55] m-0 text-mist-400 max-w-[48ch]">
                        {it.blurb}
                      </p>
                    </div>

                    <div className="flex items-center justify-between gap-3 flex-wrap pt-4 border-t border-shadow-700">
                      <div className="flex gap-1.5 flex-wrap">
                        <span className="font-mono text-[10px] uppercase tracking-wider text-mist-500 self-center mr-1">
                          [ stack ]
                        </span>
                        {it.stack.map((s) => (
                          <span
                            key={s.tech}
                            className="h-[22px] px-2 rounded-full bg-paper/[0.08] border border-shadow-700 inline-flex items-center font-mono text-[10px] font-medium uppercase tracking-wider whitespace-nowrap text-paper/85"
                          >
                            {s.tech}
                          </span>
                        ))}
                      </div>
                      <span className="font-mono text-[10px] uppercase tracking-wider text-electric opacity-0 group-hover:opacity-100 transition-opacity">
                        Explore <span aria-hidden>→</span>
                      </span>
                    </div>
                  </div>
                </div>
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
