'use client';

import { useState } from 'react';

/**
 * WCAG 2.2.2: anything that moves for more than five seconds needs a way to stop it. Hover and
 * focus already pause the marquee in CSS; this is the explicit control, for touch and for anyone
 * who wants it to stay still.
 */
export function MarqueePause() {
  const [paused, setPaused] = useState(false);
  return (
    <button
      type="button"
      aria-pressed={paused}
      onClick={(e) => {
        const next = !paused;
        setPaused(next);
        e.currentTarget.closest('[data-marquee]')?.toggleAttribute('data-paused', next);
      }}
      className="motion-reduce:hidden ml-auto h-8 px-3 rounded-md font-mono text-[11px] uppercase tracking-wider text-mist-600 hover:text-ink hover:bg-paper-100 transition-colors focus-visible:outline-2 focus-visible:outline-electric"
    >
      {paused ? 'Jalankan' : 'Jeda'}
    </button>
  );
}
