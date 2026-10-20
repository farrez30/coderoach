import type { Metadata } from 'next';
import Image from 'next/image';
import { SectionShell } from '../_components/detail/SectionShell';
import { OctagonMark } from '../_components/ui/OctagonMark';
import { productPath } from '@/lib/opsscore/config';
import { LANDING_COPY, PHASE_COPY } from '@/lib/opsscore/copy';
import { phaseRange, type Phase } from '@/lib/opsscore/scoring';
import { LandingTracker } from './_components/Trackers';
import { BenefitVisual } from './_components/BenefitVisual';

import { Meta } from '../_components/ui/Meta';
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: LANDING_COPY.metaTitle,
  description: LANDING_COPY.metaDescription,
  alternates: { canonical: productPath() },
  openGraph: { title: LANDING_COPY.metaTitle, description: LANDING_COPY.metaDescription },
};

const PHASES: Phase[] = [1, 2, 3, 4];

export default function OpsScoreLandingPage() {
  return (
    <SectionShell>
      <LandingTracker />
      <main>
        <section className="relative overflow-hidden pt-10 sm:pt-14 lg:pt-20 pb-20 lg:pb-28">
          <div
            aria-hidden
            className="absolute inset-0 opacity-55 pointer-events-none bg-cover bg-center"
            style={{ backgroundImage: 'url(/assets/bg-grid-clean.png)' }}
          />
          <div
            aria-hidden
            className="absolute -top-40 -right-40 text-mist-400 opacity-[0.08] pointer-events-none"
          >
            <OctagonMark size={520} strokeWidth={1} />
          </div>

          <div className="relative max-w-[1180px] mx-auto px-8 grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-12 lg:gap-16 items-center">
            <div className="flex flex-col gap-5 sm:gap-6">
              <span className="font-mono text-xs font-medium tracking-wider text-mist-600 uppercase tabular">
                <Meta parts={LANDING_COPY.marker} />
              </span>
              <h1 className="text-[clamp(34px,5.5vw,72px)] leading-[1.02] tracking-[-0.03em] font-bold max-w-[16ch] text-balance m-0">
                {LANDING_COPY.headline.lead}{' '}
                <span className="text-electric">{LANDING_COPY.headline.accent}</span>
              </h1>
              <p className="max-w-[540px] text-[16px] sm:text-[18px] leading-[1.55] text-mist-600 m-0 text-pretty">
                {LANDING_COPY.lede}
              </p>
              <div className="flex flex-col gap-4 mt-2">
                <a
                  href={productPath('/mulai')}
                  className="self-start h-[52px] px-[22px] rounded-md bg-electric text-paper text-[15px] font-semibold inline-flex items-center gap-2 hover:bg-[#2562E0] transition-colors"
                >
                  {LANDING_COPY.cta}
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <path d="M5 12h14M13 5l7 7-7 7" />
                  </svg>
                </a>
                <div className="flex gap-x-3.5 gap-y-2 items-center flex-wrap text-[12px] tracking-[0.06em] text-mist-600 uppercase tabular">
                  {LANDING_COPY.meta.map((item, i) => (
                    <span key={item} className="contents">
                      {i > 0 && <span aria-hidden className="block w-px h-3.5 bg-mist-400/60" />}
                      <b className="text-ink font-bold">{item}</b>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <aside className="bg-paper-50 border border-paper-200 rounded-xl p-7 lg:p-8 shadow-[0_24px_48px_-32px_rgba(8,9,10,0.25)]">
              <h2 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-mist-600 m-0">
                {LANDING_COPY.getTitle}
              </h2>
              <ol className="list-none p-0 m-0 mt-5 flex flex-col">
                {LANDING_COPY.get.map((item, i) => (
                  <li
                    key={item.title}
                    className="py-4 border-t border-paper-200 first:border-t-0 first:pt-0 last:pb-0"
                  >
                    <div className="flex items-baseline gap-3">
                      <span className="font-mono text-[12px] text-electric tabular">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <h3 className="text-[17px] font-bold tracking-[-0.015em] leading-[1.3] text-ink m-0">
                        {item.title}
                      </h3>
                    </div>
                    <p className="mt-1.5 mb-0 text-[14px] leading-[1.5] text-mist-600 text-pretty">
                      {item.body}
                    </p>
                    <BenefitVisual kind={item.visual} className="mt-3" />
                  </li>
                ))}
              </ol>
            </aside>
          </div>
        </section>

        <section className="border-t border-paper-200 bg-paper-50 py-16 lg:py-20">
          <div className="max-w-[1180px] mx-auto px-8">
            <span className="block text-[11px] font-semibold uppercase tracking-[0.18em] text-mist-600">
              {LANDING_COPY.phasesTitle}
            </span>
            <h2 className="mt-4 mb-0 text-[clamp(30px,4vw,44px)] font-bold tracking-[-0.025em] leading-[1.05] text-balance">
              {LANDING_COPY.phasesHeadline}
            </h2>
            <p className="mt-3 mb-0 max-w-[560px] text-[16px] sm:text-[17px] leading-[1.55] text-mist-600 text-pretty">
              {LANDING_COPY.phasesLede}
            </p>
            <ol className="list-none p-0 m-0 mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-8">
              {PHASES.map((phase) => {
                const { from, to } = phaseRange(phase);
                return (
                  <li key={phase} className="flex flex-col">
                    <Image
                      src={`/assets/opsscore/phase-${phase}.webp`}
                      alt=""
                      width={1024}
                      height={1024}
                      sizes="(min-width: 1024px) 270px, (min-width: 640px) 45vw, 88vw"
                      className="block w-full h-auto rounded-lg bg-ink"
                    />
                    <div className="mt-5 pt-4 border-t-2 border-ink">
                      <span className="font-mono text-[11px] tracking-wider text-mist-600 tabular">
                        [ {LANDING_COPY.phaseRange(from, to)} ]
                      </span>
                      <h3 className="text-[24px] font-bold tracking-[-0.015em] mt-3 mb-0">
                        {PHASE_COPY[phase].title}
                      </h3>
                      <p className="mt-0.5 mb-2 text-[15px] font-semibold text-mist-600">{PHASE_COPY[phase].nickname}</p>
                      <p className="text-[15px] leading-[1.55] text-mist-600 m-0 text-pretty">
                        {PHASE_COPY[phase].key}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>
        </section>
      </main>
    </SectionShell>
  );
}
