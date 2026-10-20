import { productPath } from '@/lib/opsscore/config';
import {
  ACTIONS,
  AREA_FEEDBACK,
  CTA_COPY,
  REPORT_CLOSING,
  REPORT_COPY,
  SERVICE_CLASS_COPY,
  WEB_NOTE,
} from '@/lib/opsscore/copy';
import { AREA_LABELS } from '@/lib/opsscore/questions';
import { bandFor, type Answers, type Scores } from '@/lib/opsscore/scoring';
import { RevealReport } from './RevealReport';
import { ScoreBar } from './ScoreBar';
import { ShareButton } from './ShareButton';
import { Suggestions } from './Suggestions';
import { TrackedLink } from './Trackers';

import { Meta } from '../../_components/ui/Meta';
/** Full report, shown after the gate: priorities → next steps → service class → closing line → CTA. */
export function Report({
  sessionId,
  shareSlug,
  scores,
  answers,
}: {
  sessionId: string;
  shareSlug: string;
  scores: Scores;
  answers: Answers;
}) {
  const { priorities } = scores;
  const service = SERVICE_CLASS_COPY[scores.serviceClass];

  return (
    <section id="report" className="py-16 lg:py-24 scroll-mt-24">
      <RevealReport sessionId={sessionId} />
      <div className="max-w-[1180px] mx-auto px-8">
        <span className="font-mono text-xs font-medium tracking-wider text-mist-600 uppercase tabular">
          <Meta parts={REPORT_COPY.marker} />
        </span>
        <h2 className="text-[clamp(36px,4.5vw,56px)] leading-[1.02] tracking-[-0.025em] font-bold mt-4 mb-0">
          {REPORT_COPY.prioritiesTitle(priorities.length)}
        </h2>

        {priorities.length > 0 ? (
          <ol className="reveal-stagger list-none p-0 m-0 mt-10 grid grid-cols-1 md:grid-cols-3 gap-4">
            {priorities.map((p, i) => (
              <li key={p.area} className="bg-paper-50 border border-paper-200 rounded-xl p-6 flex flex-col">
                <div className="flex items-center justify-between gap-3 font-mono text-[12px] tabular">
                  <span className="text-mist-600">[ {String(i + 1).padStart(2, '0')} ]</span>
                  <span className="text-ink">{REPORT_COPY.scoreOf(p.score)}</span>
                </div>
                <h3 className="text-[24px] font-bold tracking-[-0.015em] mt-4 mb-0">{AREA_LABELS[p.area]}</h3>
                <ScoreBar value={p.score} className="mt-3" animate index={i} />
                <p className="mt-4 mb-0 text-[15px] leading-[1.55] text-mist-600 text-pretty">
                  {AREA_FEEDBACK[p.area][bandFor(p.score)]}
                </p>
                <div className="mt-auto pt-5">
                  <div className="ops-highlight bg-paper-100 border border-paper-200 rounded-md px-3.5 py-3">
                    <span className="block text-[10px] font-semibold uppercase tracking-[0.18em] text-mist-600 mb-1">
                      {REPORT_COPY.actionLabel}
                    </span>
                    <p className="m-0 text-[14px] leading-[1.5] text-ink">{ACTIONS[p.focusQuestion]}</p>
                  </div>
                </div>
              </li>
            ))}
          </ol>
        ) : (
          <p className="mt-6 text-[18px] leading-[1.55] text-mist-600 max-w-[620px]">{REPORT_COPY.noPriorities}</p>
        )}

        {scores.webNote && (
          <aside className="mt-4 border border-paper-200 rounded-xl p-6 flex flex-col sm:flex-row gap-3 sm:gap-6">
            <span className="font-mono text-[12px] tracking-wider uppercase text-mist-600 shrink-0 tabular">
              [ {WEB_NOTE.label} ]
            </span>
            <p className="m-0 text-[15px] leading-[1.55] text-ink">{WEB_NOTE.body}</p>
          </aside>
        )}

        <Suggestions answers={answers} scores={scores} />

        <div className="mt-16 relative overflow-hidden rounded-2xl bg-ink text-paper p-8 lg:p-12">
          <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-mist-500">
            {REPORT_COPY.classTitle}
          </span>
          {scores.serviceClass !== 'READY' && (
            <p className="mt-4 mb-0 font-mono text-[14px] tracking-wider text-electric tabular">{service.label}</p>
          )}
          <p className="mt-2 mb-0 text-[clamp(24px,3vw,34px)] leading-[1.2] tracking-[-0.02em] font-bold max-w-[760px] text-balance">
            {service.body}
          </p>
          {priorities.length === 3 && (
            <p className="mt-6 mb-0 text-[17px] leading-[1.55] text-mist-500 max-w-[640px]">{REPORT_CLOSING}</p>
          )}
          <div className="mt-8 flex gap-3 flex-wrap">
            <TrackedLink
              href={`/?hasil_id=${sessionId}#contact`}
              event="assessment_cta_brief"
              params={{ fase: scores.phase, kelas: scores.serviceClass }}
              className="h-[52px] px-[22px] rounded-md bg-electric text-paper text-[15px] font-semibold inline-flex items-center gap-2 hover:bg-[#2562E0] transition-colors"
            >
              {CTA_COPY[scores.cta]}
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M5 12h14M13 5l7 7-7 7" />
              </svg>
            </TrackedLink>
            <TrackedLink
              href={productPath(`/hasil/${sessionId}/print?cetak=1`)}
              event="assessment_pdf"
              params={{ fase: scores.phase }}
              className="h-[52px] px-[22px] rounded-md bg-transparent text-paper border border-shadow-700 text-[15px] font-semibold inline-flex items-center hover:bg-paper/[0.06] transition-colors"
            >
              {REPORT_COPY.savePdf}
            </TrackedLink>
            <ShareButton
              path={productPath(`/r/${shareSlug}`)}
              className="h-[52px] px-[22px] rounded-md bg-transparent text-paper border border-shadow-700 text-[15px] font-semibold inline-flex items-center hover:bg-paper/[0.06] transition-colors"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
