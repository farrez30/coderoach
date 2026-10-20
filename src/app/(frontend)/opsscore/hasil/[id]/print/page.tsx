import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { getPayload } from 'payload';
import config from '@payload-config';
import { LEADS, findSession } from '@/lib/opsscore/api';
import { productPath } from '@/lib/opsscore/config';
import {
  ACTIONS,
  AREA_FEEDBACK,
  AREA_NOUNS,
  BENCHMARK_COPY,
  CTA_COPY,
  PHASE_COPY,
  PLAN_COPY,
  PRINT_COPY,
  REPORT_CLOSING,
  REPORT_COPY,
  RESULT_COPY,
  ROADMAP,
  SERVICE_CLASS_COPY,
  WEB_NOTE,
} from '@/lib/opsscore/copy';
import { gapTo } from '@/lib/opsscore/benchmark';
import { benchmarkFor } from '@/lib/opsscore/benchmark-server';
import { nextPhasePlan, roadmapAreas } from '@/lib/opsscore/plan';
import { AREAS, AREA_LABELS } from '@/lib/opsscore/questions';
import { bandFor, phaseRange, type Answers, type Phase, type Scores } from '@/lib/opsscore/scoring';
import { benchmarkGroup } from '../../../_components/Benchmark';
import { PrintButton } from './PrintButton';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: PRINT_COPY.metaTitle,
  robots: { index: false, follow: false },
};

const PHASES: Phase[] = [1, 2, 3, 4];

/** Hatched bar: prints in black and white, and SVG fills survive "background graphics" being off. */
function HatchBar({ value, id }: { value: number; id: string }) {
  return (
    <div className="h-2.5 border border-ink">
      <svg width="100%" height="100%" aria-hidden className="block">
        <defs>
          <pattern id={id} width="4" height="4" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <rect width="2" height="4" fill="#08090A" />
          </pattern>
        </defs>
        <rect width={`${value}%`} height="100%" fill={`url(#${id})`} />
      </svg>
    </div>
  );
}

export default async function OpsScorePrintPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ cetak?: string }>;
}) {
  const [{ id }, { cetak }] = await Promise.all([params, searchParams]);
  const payload = await getPayload({ config });
  const session = await findSession(payload, id);
  if (!session) notFound();
  if (session.status !== 'gated' || !session.scores) redirect(productPath(`/hasil/${id}`));

  const { docs } = await payload.find({
    collection: LEADS,
    where: { session: { equals: id } },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  });
  const lead = docs[0];
  const scores = session.scores as Scores;
  const phase = PHASE_COPY[scores.phase];
  const service = SERVICE_CLASS_COPY[scores.serviceClass];
  const benchmark = await benchmarkFor(payload, lead?.industry);
  const plan = nextPhasePlan((session.answers ?? {}) as Answers);
  const [first = PLAN_COPY.fallbackNoun, second = first] = roadmapAreas(scores.areas, scores.priorities).map(
    (area) => AREA_NOUNS[area],
  );
  const date = new Intl.DateTimeFormat('id-ID', { dateStyle: 'long', timeZone: 'Asia/Jakarta' }).format(
    new Date(session.gatedAt ?? session.completedAt ?? session.startedAt),
  );

  return (
    <div className="min-h-screen bg-paper-200 py-6 print:bg-white print:py-0 print:min-h-0">
      <style>{'@page { size: A4; margin: 12mm; } @media print { html, body { background: #fff !important; } }'}</style>

      <div className="print:hidden max-w-[210mm] mx-auto px-4 mb-3 flex items-center justify-between gap-3 flex-wrap">
        <a href={productPath(`/hasil/${id}`)} className="text-[14px] font-semibold text-mist-600 hover:text-ink">
          <span aria-hidden>←</span> {PRINT_COPY.back}
        </a>
        <PrintButton label={PRINT_COPY.print} auto={cetak === '1'} />
      </div>
      <p className="print:hidden max-w-[210mm] mx-auto px-4 mb-4 text-[12px] text-mist-600">{PRINT_COPY.hint}</p>

      <article className="bg-white text-ink max-w-[210mm] mx-auto px-[12mm] py-[12mm] shadow-[0_20px_40px_-24px_rgba(8,9,10,0.35)] print:shadow-none print:p-0 print:max-w-none">
        <header className="flex items-start justify-between gap-6 pb-4 border-b-2 border-ink">
          <div className="flex items-center gap-2.5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/assets/coderoach_logo.svg" alt="Coderoach" className="h-7 w-auto" />
            <span className="flex flex-col leading-none tracking-[-0.02em] gap-[2px]">
              <span className="text-[13px] font-semibold lowercase">coderoach</span>
              <span className="text-[13px] font-normal lowercase">studio</span>
            </span>
          </div>
          <div className="text-right">
            <p className="m-0 text-[10px] font-semibold uppercase tracking-[0.18em] text-mist-600">
              {PRINT_COPY.documentTitle}
            </p>
            {lead?.brand && (
              <p className="m-0 mt-1 text-[15px] font-bold">
                <span className="sr-only">{PRINT_COPY.preparedFor} </span>
                {lead.brand}
              </p>
            )}
            <p className="m-0 mt-0.5 text-[11px] text-mist-600">{date}</p>
          </div>
        </header>

        <section className="grid grid-cols-[auto_1fr] gap-8 py-5 border-b border-paper-200 break-inside-avoid">
          <div>
            <p className="m-0 text-[10px] font-semibold uppercase tracking-[0.18em] text-mist-600">
              {RESULT_COPY.scoreLabel}
            </p>
            <p className="m-0 mt-1 text-[64px] font-bold leading-none tracking-[-0.04em] tabular">
              {scores.total}
              <span className="text-[14px] font-normal text-mist-600 tracking-normal ml-1">{RESULT_COPY.outOf}</span>
            </p>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`/assets/opsscore/phase-${scores.phase}.webp`}
              alt=""
              className="mt-3 block w-[34mm] h-[34mm] rounded-md"
            />
          </div>
          <div>
            <p className="m-0 font-mono text-[11px] uppercase tracking-wider text-mist-600">
              {RESULT_COPY.phaseOf(scores.phase)}
            </p>
            <h1 className="m-0 mt-1 text-[28px] font-bold tracking-[-0.02em] leading-tight">
              {phase.title} <span className="text-[16px] font-semibold text-mist-600 tracking-normal">· {phase.nickname}</span>
            </h1>
            <p className="m-0 mt-2 text-[13px] leading-[1.5]">{phase.key}</p>
            <p className="m-0 mt-1.5 text-[11px] leading-[1.45] text-mist-600">
              <b className="text-ink">{RESULT_COPY.strengthLabel}:</b> {phase.strength}{' '}
              <b className="text-ink">{RESULT_COPY.blockerLabel}:</b> {phase.blocker}
            </p>
            <ol className="list-none p-0 m-0 mt-3 grid grid-cols-4 gap-1.5 text-[10px]">
              {PHASES.map((p) => {
                const { from, to } = phaseRange(p);
                return (
                  <li key={p} className={`pt-1.5 border-t-2 ${p === scores.phase ? 'border-ink font-bold' : 'border-paper-200 text-mist-600'}`}>
                    {PHASE_COPY[p].name} <span className="font-mono">{from}–{to}</span>
                  </li>
                );
              })}
            </ol>
            <p className="m-0 mt-2.5 text-[11px] leading-[1.45] text-mist-600">
              <b className="text-ink">{BENCHMARK_COPY.marker}:</b>{' '}
              {BENCHMARK_COPY.average(benchmarkGroup(benchmark), benchmark.source, benchmark.count)} {benchmark.total}.{' '}
              {BENCHMARK_COPY.gap(gapTo(scores.total, benchmark))}
            </p>
          </div>
        </section>

        <section className="py-4 border-b border-paper-200 break-inside-avoid">
          <h2 className="m-0 text-[10px] font-semibold uppercase tracking-[0.18em] text-mist-600">{RESULT_COPY.areasTitle}</h2>
          <ul className="list-none p-0 m-0 mt-3 grid grid-cols-2 gap-x-8 gap-y-2.5">
            {AREAS.map(({ id: area, label }) => {
              const score = scores.areas[area];
              if (score === undefined) return null;
              return (
                <li key={area}>
                  <div className="flex justify-between text-[12px] mb-1">
                    <span>{label}</span>
                    <span className="font-mono tabular">{score}</span>
                  </div>
                  <HatchBar value={score} id={`hatch-${area}`} />
                </li>
              );
            })}
          </ul>
          {scores.areas.stock === undefined && (
            <p className="m-0 mt-3 text-[11px] text-mist-600">{RESULT_COPY.stockSkipped}</p>
          )}
        </section>

        <section className="py-4 border-b border-paper-200">
          <h2 className="m-0 text-[10px] font-semibold uppercase tracking-[0.18em] text-mist-600">
            {REPORT_COPY.prioritiesTitle(scores.priorities.length)}
          </h2>
          {scores.priorities.length > 0 ? (
            <ol className="list-none p-0 m-0 mt-3 flex flex-col gap-3">
              {scores.priorities.map((p, i) => (
                <li key={p.area} className="grid grid-cols-[28px_1fr] gap-3 break-inside-avoid">
                  <span className="font-mono text-[12px] tabular text-mist-600 pt-0.5">{String(i + 1).padStart(2, '0')}</span>
                  <div>
                    <div className="flex items-baseline justify-between gap-4">
                      <h3 className="m-0 text-[15px] font-bold">{AREA_LABELS[p.area]}</h3>
                      <span className="font-mono text-[12px] tabular">{REPORT_COPY.scoreOf(p.score)}</span>
                    </div>
                    <p className="m-0 mt-1 text-[12px] leading-[1.5] text-mist-600">{AREA_FEEDBACK[p.area][bandFor(p.score)]}</p>
                    <p className="m-0 mt-1.5 text-[12px] leading-[1.5]">
                      <b>{REPORT_COPY.actionLabel}:</b> {ACTIONS[p.focusQuestion]}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          ) : (
            <p className="m-0 mt-3 text-[12px]">{REPORT_COPY.noPriorities}</p>
          )}
          {scores.webNote && (
            <p className="m-0 mt-3 text-[12px] leading-[1.5]">
              <b>{WEB_NOTE.label}:</b> {WEB_NOTE.body}
            </p>
          )}
        </section>

        <section className="py-4 border-b border-paper-200 break-inside-avoid">
          {plan && plan.steps.length > 0 && (
            <>
              <h2 className="m-0 text-[10px] font-semibold uppercase tracking-[0.18em] text-mist-600">
                {PLAN_COPY.nextTitle(PHASE_COPY[plan.target].title)}
              </h2>
              <p className="m-0 mt-1 text-[12px] leading-[1.5] text-mist-600">
                {PLAN_COPY.nextSummary(plan.steps.length, plan.from, plan.to, PHASE_COPY[plan.target].title, plan.reached)}
              </p>
              <ol className="list-none p-0 m-0 mt-2 flex flex-col gap-1.5">
                {plan.steps.map((step, i) => (
                  <li key={step.question} className="grid grid-cols-[28px_1fr_auto] gap-3 text-[12px] leading-[1.45]">
                    <span className="font-mono tabular text-mist-600">{String(i + 1).padStart(2, '0')}</span>
                    <span>{ACTIONS[step.question]}</span>
                    <span className="font-mono tabular">{PLAN_COPY.points(step.gain)}</span>
                  </li>
                ))}
              </ol>
            </>
          )}
          <h2 className="m-0 mt-4 text-[10px] font-semibold uppercase tracking-[0.18em] text-mist-600">{PLAN_COPY.roadmapMarker}</h2>
          <ol className="list-none p-0 m-0 mt-2 grid grid-cols-3 gap-4">
            {ROADMAP[scores.phase].map((step) => (
              <li key={step.days} className="text-[11px] leading-[1.45]">
                <span className="font-mono tabular text-mist-600">{PLAN_COPY.days(step.days)}</span>
                <b className="block text-[12px] mt-0.5">{step.title}</b>
                {step.body(first, second)}
              </li>
            ))}
          </ol>
        </section>

        <section className="py-4 break-inside-avoid">
          <h2 className="m-0 text-[10px] font-semibold uppercase tracking-[0.18em] text-mist-600">{REPORT_COPY.classTitle}</h2>
          <p className="m-0 mt-2 text-[16px] font-bold leading-snug">
            {scores.serviceClass !== 'READY' && <span className="font-mono mr-2">{service.label}</span>}
            {service.body}
          </p>
          {scores.priorities.length === 3 && <p className="m-0 mt-3 text-[12px] leading-[1.5]">{REPORT_CLOSING}</p>}
          <p className="m-0 mt-3 text-[12px] leading-[1.5]">
            <b>{CTA_COPY[scores.cta]}:</b> {PRINT_COPY.briefUrl}
          </p>
        </section>

        <footer className="mt-2 pt-2.5 border-t border-ink flex justify-between gap-4 font-mono text-[10px] tabular break-before-avoid">
          <span>{PRINT_COPY.footerUrl}</span>
          <span>
            {PRINT_COPY.session} {session.shareSlug.toUpperCase()}
          </span>
        </footer>
      </article>
    </div>
  );
}
