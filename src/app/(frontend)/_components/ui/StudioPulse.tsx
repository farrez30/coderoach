'use client';

import { useEffect, useState } from 'react';
import { Meta } from './Meta';

const formatTime = (d: Date) => {
  const h = String(d.getHours()).padStart(2, '0');
  const m = String(d.getMinutes()).padStart(2, '0');
  return `${h}:${m}`;
};

// 14-day sprint cadence — relative shipping intensity per day (0..1)
// Week 1: M T W T F S S | Week 2: M T W T F S S
const HEIGHTS = [0.55, 0.7, 0.78, 0.82, 0.9, 0.18, 0.12, 0.7, 0.85, 0.92, 0.96, 1, 0.2, 0.14];
const LABELS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
const FOCUS = [
  'kickoff · scoping',
  'architecture',
  'first commits',
  'demo prep',
  'sprint demo',
  'async · light',
  'rest',
  'ship review',
  'iteration',
  'integration',
  'qa pass',
  'demo · ship',
  'async · light',
  'rest',
];

export function StudioPulse() {
  const [now, setNow] = useState<Date | null>(null);
  const [hoveredDay, setHoveredDay] = useState<number | null>(null);

  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);

  // Map current weekday to second-week index of the sprint (Mon..Sun → 7..13).
  // getDay() returns 0=Sun..6=Sat — convert to Mon=0..Sun=6.
  const today = now ? ((now.getDay() + 6) % 7) + 7 : -1;
  const activeDay = hoveredDay !== null ? hoveredDay : today;

  return (
    <div className="pt-9 border-t border-shadow-700 flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-mist-500">
          [ Studio rhythm ]
        </span>
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse-dot" aria-hidden />
          <span className="font-mono text-[11px] tabular text-paper">
            {now ? formatTime(now) : '--:--'} <span className="text-mist-500">WIB</span>
          </span>
        </div>
      </div>

      <div
        className="flex items-end gap-1.5 h-14 select-none"
        onMouseLeave={() => setHoveredDay(null)}
        role="img"
        aria-label="Two-week sprint cadence visualisation"
      >
        {HEIGHTS.map((h, i) => {
          const isToday = i === today;
          const isHover = hoveredDay === i;
          const isWeekStart = i === 7;
          return (
            <div
              key={i}
              onMouseEnter={() => setHoveredDay(i)}
              className={`flex-1 rounded-sm cursor-pointer transition-[background-color,height] duration-200 ${
                isWeekStart ? 'ml-2' : ''
              } ${
                isToday
                  ? 'bg-electric shadow-[0_0_12px_rgba(44,112,254,0.45)]'
                  : isHover
                  ? 'bg-paper'
                  : 'bg-mist-400/25 hover:bg-mist-400/40'
              }`}
              style={{ height: `${Math.max(h * 100, 14)}%` }}
            />
          );
        })}
      </div>

      <div className="flex items-center justify-between font-mono text-[10px] text-mist-500 tracking-[0.04em]">
        <span>
          {activeDay >= 0 ? (
            <Meta
              parts={[
                <span key="day" className="text-paper">day {String(activeDay + 1).padStart(2, '0')}</span>,
                LABELS[activeDay],
                FOCUS[activeDay],
              ]}
            />
          ) : (
            <>two-week sprints, demos every friday</>
          )}
        </span>
        <Meta parts="kemang · jkt" className="text-mist-600" />
      </div>
    </div>
  );
}
