'use client';

import { useEffect, useState } from 'react';
import { QUIZ_COPY } from '@/lib/opsscore/copy';
import { AREAS, QUESTIONS } from '@/lib/opsscore/questions';

const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Log lines play out while the result is computed, in the style of the site's deploy console. */
export function ScoringConsole({
  answered = QUESTIONS.length,
  areas = AREAS.length,
}: {
  answered?: number;
  areas?: number;
}) {
  const lines = [
    { prefix: '$', tone: 'text-electric', text: QUIZ_COPY.console.command, at: 0 },
    { prefix: '→', tone: 'text-mist-500', text: QUIZ_COPY.console.read(answered), at: 250 },
    { prefix: '→', tone: 'text-mist-500', text: QUIZ_COPY.console.areas(areas), at: 550 },
    { prefix: '✓', tone: 'text-success', text: QUIZ_COPY.console.phase, at: 850 },
    { prefix: '→', tone: 'text-mist-500', text: QUIZ_COPY.console.priorities, at: 1100 },
    { prefix: '✓', tone: 'text-success', text: QUIZ_COPY.console.done, at: 1350 },
  ];
  const [shown, setShown] = useState(1);

  useEffect(() => {
    if (prefersReducedMotion()) {
      setShown(lines.length);
      return;
    }
    const timers = lines.slice(1).map((line, i) => window.setTimeout(() => setShown(i + 2), line.at));
    return () => timers.forEach((timer) => window.clearTimeout(timer));
    // The lines are fixed for the lifetime of this screen.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="grid place-items-center py-6" role="status" aria-label={QUIZ_COPY.scoring}>
      <div className="w-full max-w-[420px] bg-ink text-paper rounded-xl border border-shadow-700 shadow-[0_24px_60px_-24px_rgba(8,9,10,0.55)] overflow-hidden font-mono text-[13px] leading-[1.9] tabular">
        <div className="flex items-center justify-between gap-3 px-4 h-10 border-b border-shadow-700 text-[11px] uppercase tracking-wider text-mist-500">
          <span className="inline-flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse-dot" aria-hidden />
            {QUIZ_COPY.brand}
          </span>
          <span>{QUIZ_COPY.scoring}</span>
        </div>
        <ol className="list-none m-0 px-4 py-4 min-h-[200px]">
          {lines.slice(0, shown).map((line) => (
            <li key={line.text} className="ops-line-in">
              <span aria-hidden className={`${line.tone} mr-2`}>{line.prefix}</span>
              {line.text}
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
