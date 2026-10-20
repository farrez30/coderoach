import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getPayload } from 'payload';
import config from '@payload-config';
import { SectionShell } from '../../../_components/detail/SectionShell';
import { AnimatedCount } from '../../../_components/ui/AnimatedCount';
import { LEADS, findSession } from '@/lib/opsscore/api';
import { benchmarkFor } from '@/lib/opsscore/benchmark-server';
import { productPath } from '@/lib/opsscore/config';
import { BENCHMARK_COPY, GATE_COPY, RESULT_COPY } from '@/lib/opsscore/copy';
import type { Answers, Scores } from '@/lib/opsscore/scoring';
import { AreaScoreList } from '../../_components/AreaScoreList';
import { BenchmarkCompare, BenchmarkSources, benchmarkGroup } from '../../_components/Benchmark';
import { GateForm } from '../../_components/GateForm';
import { LockedDetails, LockedScore } from '../../_components/LockedResult';
import { PersonaArt, PersonaKey, PersonaTitle, PersonaTraits } from '../../_components/PersonaHero';
import { PhaseLadder } from '../../_components/PhaseLadder';
import { Report } from '../../_components/Report';
import { CompleteTracker } from '../../_components/Trackers';

import { Meta } from '../../../_components/ui/Meta';
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: RESULT_COPY.metaTitle,
  robots: { index: false, follow: false },
};

export default async function OpsScoreResultPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const payload = await getPayload({ config });
  const session = await findSession(payload, id);
  if (!session) notFound();

  if (session.status === 'started' || !session.scores) {
    return (
      <SectionShell>
        <main className="min-h-[60vh] grid place-items-center py-20">
          <div className="max-w-[640px] mx-auto px-8 text-center">
            <span className="font-mono text-xs uppercase tracking-wider text-mist-600 tabular"><Meta parts={RESULT_COPY.marker} /></span>
            <h1 className="text-[clamp(36px,5vw,56px)] font-bold tracking-[-0.025em] leading-[1.05] mt-4 mb-4">
              {RESULT_COPY.incompleteTitle}
            </h1>
            <p className="text-[18px] leading-[1.55] text-mist-600 mb-8">{RESULT_COPY.incompleteBody}</p>
            <a
              href={productPath('/mulai')}
              className="h-[52px] px-[22px] rounded-md bg-electric text-paper text-[15px] font-semibold inline-flex items-center hover:bg-[#2562E0] transition-colors"
            >
              {RESULT_COPY.continueQuiz}
            </a>
          </div>
        </main>
      </SectionShell>
    );
  }

  const scores = session.scores as Scores;
  const { docs } = await payload.find({
    collection: LEADS,
    where: { session: { equals: session.id } },
    select: { brand: true, revenueBand: true, industry: true },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  });
  const lead = docs[0];

  // The gate comes first: until WhatsApp is given, the page shows a locked preview and no scores.
  if (session.status !== 'gated') {
    return (
      <SectionShell>
        <CompleteTracker sessionId={session.id} phase={scores.phase} total={scores.total} />
        <main>
          <section className="relative overflow-hidden pt-10 lg:pt-16 pb-16 lg:pb-24">
            <div
              aria-hidden
              className="absolute inset-0 opacity-40 pointer-events-none bg-cover bg-center"
              style={{ backgroundImage: 'url(/assets/bg-grid-clean.png)' }}
            />
            {/* Phones read title → locked score → form → what unlocks; desktop keeps the preview on the right. */}
            <div className="relative max-w-[1180px] mx-auto px-8 flex flex-col gap-8 lg:grid lg:grid-cols-2 lg:grid-rows-[auto_1fr] lg:gap-x-20 lg:gap-y-6">
              <header className="lg:col-start-1 lg:row-start-1">
                <span className="font-mono text-xs font-medium tracking-wider text-mist-600 uppercase tabular">
                  <Meta parts={RESULT_COPY.marker} />
                </span>
                <h1 className="text-[clamp(36px,5vw,56px)] leading-[1.02] tracking-[-0.025em] font-bold mt-4 mb-0 text-balance">
                  {GATE_COPY.title(lead?.brand)}
                </h1>
              </header>
              <div className="contents lg:flex lg:flex-col lg:gap-10 lg:col-start-2 lg:row-start-1 lg:row-span-2">
                <LockedScore brand={lead?.brand} className="order-2 lg:order-none" />
                <LockedDetails areas={scores.areas} className="order-4 lg:order-none" />
              </div>
              <div className="order-3 lg:order-none lg:col-start-1 lg:row-start-2">
                <p className="m-0 text-[17px] leading-[1.55] text-mist-600 max-w-[460px] text-pretty">{GATE_COPY.intro}</p>
                <GateForm
                  sessionId={session.id}
                  phase={scores.phase}
                  revenueBand={lead?.revenueBand}
                  className="mt-6"
                />
              </div>
            </div>
          </section>
        </main>
      </SectionShell>
    );
  }

  const benchmark = await benchmarkFor(payload, lead?.industry);

  return (
    <SectionShell>
      <CompleteTracker sessionId={session.id} phase={scores.phase} total={scores.total} />
      <main>
        <section className="relative overflow-hidden pt-12 lg:pt-16 pb-14 lg:pb-20 border-b border-paper-200">
          <div
            aria-hidden
            className="absolute inset-0 opacity-40 pointer-events-none bg-cover bg-center"
            style={{ backgroundImage: 'url(/assets/bg-grid-clean.png)' }}
          />
          {/* Phones read top to bottom. Desktop pairs each row: the persona with its portrait, the key sentence
              with its traits, and the phase ladder with the area scores. */}
          <div className="relative max-w-[1180px] mx-auto px-8 grid grid-cols-1 gap-y-6 lg:grid-cols-2 lg:gap-x-20 lg:gap-y-10">
            <div className="lg:col-start-1 lg:row-start-1">
              <span className="font-mono text-xs font-medium tracking-wider text-mist-600 uppercase tabular">
                <Meta parts={RESULT_COPY.marker} />
              </span>
              <p className="mt-8 mb-0 text-[11px] font-semibold uppercase tracking-[0.18em] text-mist-600">
                {RESULT_COPY.scoreLabelFor(lead?.brand)}
              </p>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-[104px] sm:text-[128px] font-bold leading-[0.9] tracking-[-0.045em] tabular">
                  <AnimatedCount value={String(scores.total)} duration={900} />
                </span>
                <span className="text-[18px] text-mist-600 tabular">{RESULT_COPY.outOf}</span>
              </div>
              <PersonaTitle phase={scores.phase} className="mt-8" />
            </div>
            <PersonaArt
              phase={scores.phase}
              className="w-full max-w-[360px] sm:max-w-[420px] lg:col-start-2 lg:row-start-1 lg:self-end lg:justify-self-end"
            />
            <PersonaKey phase={scores.phase} className="lg:col-start-1 lg:row-start-2" />
            <PersonaTraits phase={scores.phase} className="max-w-[520px] lg:max-w-none lg:col-start-2 lg:row-start-2" />
            <div className="mt-2 lg:mt-0 lg:col-start-1 lg:row-start-3">
              <PhaseLadder phase={scores.phase} className="max-w-[520px]" animate />
              <BenchmarkCompare total={scores.total} benchmark={benchmark} className="mt-10 max-w-[520px]" />
            </div>
            <div className="mt-6 lg:mt-0 lg:col-start-2 lg:row-start-3">
              <h2 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-mist-600 m-0">
                {RESULT_COPY.areasTitle}
              </h2>
              <AreaScoreList
                areas={scores.areas}
                benchmark={benchmark.areas}
                benchmarkLegend={BENCHMARK_COPY.areaLegend(benchmarkGroup(benchmark), benchmark.source)}
                className="mt-6"
                animate
              />
              {scores.areas.stock === undefined && (
                <p className="mt-5 mb-0 text-[13px] leading-[1.5] text-mist-600">{RESULT_COPY.stockSkipped}</p>
              )}
            </div>
          </div>
        </section>

        <Report sessionId={session.id} shareSlug={session.shareSlug} scores={scores} answers={(session.answers ?? {}) as Answers} />
        <BenchmarkSources />
      </main>
    </SectionShell>
  );
}
