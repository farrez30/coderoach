'use client';

import { useEffect, useRef, useState } from 'react';
import { Meta } from '../ui/Meta';

type TimelineItem = {
  year: string;
  title: string;
  description?: string | null;
};

export function StudioTimeline({ items }: { items: TimelineItem[] }) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const [activeIdx, setActiveIdx] = useState(-1);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Scroll-driven fill of the electric line
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) {
      setProgress(1);
      return;
    }

    let raf: number | null = null;
    const compute = () => {
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight || document.documentElement.clientHeight;
      const center = vh * 0.55;
      // start: when top of section reaches `center` line (rect.top - center < 0)
      // end: when bottom of section reaches `center` line (rect.bottom - center < 0)
      const startedDist = center - rect.top;
      const total = rect.height;
      const p = total > 0 ? startedDist / total : 0;
      setProgress(Math.max(0, Math.min(1, p)));
      raf = null;
    };
    const onScroll = () => {
      if (raf !== null) return;
      raf = requestAnimationFrame(compute);
    };
    compute();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (raf !== null) cancelAnimationFrame(raf);
    };
  }, []);

  // Mark items as active once they enter mid-viewport
  useEffect(() => {
    const observers: IntersectionObserver[] = [];
    itemRefs.current.forEach((el, idx) => {
      if (!el) return;
      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            if (e.isIntersecting) {
              setActiveIdx((cur) => (idx > cur ? idx : cur));
            }
          });
        },
        { threshold: 0.45, rootMargin: '-25% 0px -25% 0px' },
      );
      io.observe(el);
      observers.push(io);
    });
    return () => observers.forEach((o) => o.disconnect());
  }, [items.length]);

  return (
    <div className="relative" ref={sectionRef}>
      {/* Background spine — desktop only */}
      <div
        aria-hidden
        className="hidden md:block absolute left-1/2 top-0 bottom-0 w-px bg-paper-200 -translate-x-1/2"
      />
      {/* Foreground progress line — fills as user scrolls */}
      <div
        aria-hidden
        className="hidden md:block absolute left-1/2 top-0 w-px bg-electric -translate-x-1/2 transition-[height] duration-200 ease-out"
        style={{ height: `${progress * 100}%` }}
      />

      <div className="flex flex-col gap-12 md:gap-16">
        {items.map((t, i) => {
          const isRight = i % 2 === 1;
          const isActive = i <= activeIdx;
          return (
            <div
              key={i}
              ref={(el) => {
                itemRefs.current[i] = el;
              }}
              className="relative grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-12 items-center"
            >
              {/* Spine dot */}
              <div
                aria-hidden
                className={`hidden md:block absolute left-1/2 top-1/2 w-3 h-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-electric border-2 border-paper-100 z-[1] transition-all duration-300 ${
                  isActive
                    ? 'scale-150 shadow-[0_0_0_4px_rgba(44,112,254,0.18),0_0_18px_rgba(44,112,254,0.55)]'
                    : ''
                }`}
              />

              {/* Content side */}
              <div
                className={
                  isRight
                    ? 'md:col-start-2 md:row-start-1 md:text-left md:pl-12'
                    : 'md:col-start-1 md:row-start-1 md:text-right md:pr-12'
                }
              >
                <div className="text-[clamp(36px,4vw,56px)] font-bold tracking-[-0.025em] leading-none text-electric tabular mb-2">
                  {t.year}
                </div>
                <h3 className="text-[20px] font-bold tracking-[-0.01em] leading-tight m-0 mb-2">
                  {t.title}
                </h3>
                {t.description && (
                  <p className="text-[15px] leading-[1.55] text-mist-600 m-0 max-w-[44ch] inline-block">
                    {t.description}
                  </p>
                )}
              </div>

              {/* Artifact side — visual badge per year (opposite column) */}
              <div
                className={`hidden md:flex items-center ${
                  isRight
                    ? 'md:col-start-1 md:row-start-1 justify-end pr-12'
                    : 'md:col-start-2 md:row-start-1 justify-start pl-12'
                }`}
                aria-hidden
              >
                <TimelineArtifact year={t.year} active={isActive} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function TimelineArtifact({ year, active }: { year: string; active: boolean }) {
  const Comp = ARTIFACTS[year];
  if (!Comp) return null;
  return (
    <div
      className={`transition-all duration-500 ${
        active ? 'opacity-100 translate-y-0' : 'opacity-50 translate-y-1'
      }`}
    >
      <Comp />
    </div>
  );
}

const ARTIFACTS: Record<string, React.ComponentType> = {
  '2022': Artifact2022,
  '2023': Artifact2023,
  '2024': Artifact2024,
  '2025': Artifact2025,
  '2026': Artifact2026,
};

/* ---------- Artifact components ---------- */

function ArtifactCard({ children, dark = false }: { children: React.ReactNode; dark?: boolean }) {
  return (
    <div
      className={`w-[280px] rounded-xl border shadow-[inset_0_1px_0_rgba(255,255,255,0.04),0_8px_20px_-12px_rgba(8,9,10,0.18)] overflow-hidden ${
        dark ? 'bg-ink border-shadow-700 text-paper' : 'bg-paper-50 border-paper-200 text-ink'
      }`}
    >
      {children}
    </div>
  );
}

function ArtifactHeader({ tag, dark = false }: { tag: string; dark?: boolean }) {
  return (
    <div
      className={`flex items-center gap-2 px-3.5 py-2 border-b font-mono text-[10px] tracking-[0.18em] uppercase tabular ${
        dark ? 'border-shadow-700 text-mist-500' : 'border-paper-200 text-mist-500'
      }`}
    >
      <span
        aria-hidden
        className={`w-1.5 h-1.5 rounded-full ${dark ? 'bg-electric' : 'bg-electric'} animate-pulse`}
      />
      <Meta parts={tag} />
    </div>
  );
}

// 2022 — Git init terminal card
function Artifact2022() {
  return (
    <ArtifactCard dark>
      <ArtifactHeader tag="terminal · 2022" dark />
      <div className="px-3.5 py-3 font-mono text-[11px] leading-[1.7] tabular">
        <div className="text-mist-500">
          $ <span className="text-paper">git init coderoach/</span>
        </div>
        <div className="text-mist-600">Initialized empty Git repository</div>
        <div className="text-mist-500 mt-1">
          $ <span className="text-paper">echo &quot;ship &gt; deliverable&quot;</span>
        </div>
        <div className="flex items-center gap-1.5 text-electric mt-1">
          <span className="w-1.5 h-3 bg-electric inline-block animate-pulse" />
        </div>
      </div>
    </ArtifactCard>
  );
}

// 2023 — Mini client cards grid
function Artifact2023() {
  const clients = [
    { name: 'Uruzin', color: 'bg-[#E8F0FE] text-electric border-electric/30' },
    { name: 'Tumtim', color: 'bg-[#FDF2D9] text-[#A47A14] border-[#D9B24F]/40' },
    { name: 'Brand', color: 'bg-paper-100 text-mist-600 border-paper-200' },
  ];
  return (
    <ArtifactCard>
      <ArtifactHeader tag="clients · 2023" />
      <div className="px-3.5 py-3.5">
        <div className="grid grid-cols-3 gap-2">
          {clients.map((c) => (
            <div
              key={c.name}
              className={`aspect-square rounded-md border ${c.color} flex items-center justify-center font-mono text-[10px] font-semibold uppercase tracking-wider`}
            >
              {c.name[0]}
            </div>
          ))}
        </div>
        <div className="mt-2.5 text-[10px] font-mono uppercase tracking-[0.18em] text-mist-500 tabular">
          <span aria-hidden>✓ </span>project-scoped validated
        </div>
      </div>
    </ArtifactCard>
  );
}

// 2024 — Laporta dashboard mini
function Artifact2024() {
  return (
    <ArtifactCard>
      <ArtifactHeader tag="laporta · 2024" />
      <div className="px-3.5 py-3 grid grid-cols-2 gap-3">
        <div>
          <div className="text-[10px] font-mono uppercase tracking-[0.18em] text-mist-500 tabular">
            Salary
          </div>
          <div className="text-[22px] font-bold tracking-tight tabular text-ink leading-none mt-1">
            ↓ 50<span className="text-electric">%</span>
          </div>
        </div>
        <div>
          <div className="text-[10px] font-mono uppercase tracking-[0.18em] text-mist-500 tabular">
            Process
          </div>
          <div className="text-[22px] font-bold tracking-tight tabular text-ink leading-none mt-1">
            ↓ 4<span className="text-electric">×</span>
          </div>
        </div>
        <div className="col-span-2 flex items-end gap-1 h-10 mt-1">
          {[28, 38, 22, 46, 52, 36, 60, 48, 72, 64].map((h, i) => (
            <div
              key={i}
              className="flex-1 rounded-sm bg-electric/70"
              style={{ height: `${h}%` }}
            />
          ))}
        </div>
      </div>
    </ArtifactCard>
  );
}

// 2025 — Growth chart 1× → 3×
function Artifact2025() {
  return (
    <ArtifactCard>
      <ArtifactHeader tag="ads-pipeline · 2025" />
      <div className="px-3.5 py-3">
        <div className="flex items-baseline justify-between mb-2">
          <span className="text-[10px] font-mono uppercase tracking-[0.18em] text-mist-500 tabular">
            Campaign growth
          </span>
          <span className="text-[18px] font-bold tabular text-electric leading-none">
            3<span className="text-[12px]">×</span>
          </span>
        </div>
        <svg viewBox="0 0 240 60" className="w-full h-12" aria-hidden>
          <defs>
            <linearGradient id="growthGrad" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#2C70FE" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#2C70FE" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path
            d="M0 50 L40 46 L80 40 L120 32 L160 22 L200 14 L240 6"
            fill="none"
            stroke="#2C70FE"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M0 50 L40 46 L80 40 L120 32 L160 22 L200 14 L240 6 L240 60 L0 60 Z"
            fill="url(#growthGrad)"
          />
          <circle cx="240" cy="6" r="3" fill="#2C70FE" />
        </svg>
        <div className="flex justify-between text-[9px] font-mono uppercase tracking-[0.18em] text-mist-500 tabular mt-1">
          <span>Q1</span>
          <span>Q4</span>
        </div>
      </div>
    </ArtifactCard>
  );
}

// 2026 — 4 service entry tiles
function Artifact2026() {
  const services = ['Build', 'Automate', 'Intel', 'Augment'];
  return (
    <ArtifactCard>
      <ArtifactHeader tag="services · 2026" />
      <div className="px-3.5 py-3">
        <div className="grid grid-cols-2 gap-1.5">
          {services.map((s, i) => (
            <div
              key={s}
              className={`aspect-[2/1] rounded-md border flex items-center justify-center font-mono text-[10px] font-semibold uppercase tracking-wider tabular ${
                i === 0
                  ? 'bg-electric/[0.08] border-electric/30 text-electric'
                  : 'bg-paper-100 border-paper-200 text-mist-600'
              }`}
            >
              {s}
            </div>
          ))}
        </div>
        <div className="mt-2 text-[10px] font-mono uppercase tracking-[0.18em] text-mist-500 tabular">
          <Meta parts="4 doors · 1 discipline" />
        </div>
      </div>
    </ArtifactCard>
  );
}
