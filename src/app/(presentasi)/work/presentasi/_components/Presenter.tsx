'use client';

import { useEffect, useState } from 'react';

/**
 * Keyboard and screen for presenting, attached to server-rendered links so everything still works
 * as plain links without JS. On the shelf ← → move between cards ([data-shelf-item]); on a project
 * ← → go to the previous or next project. F toggles full screen, Esc steps back out. The screen is
 * kept awake (Wake Lock) while the page is visible, so a laptop doesn't dim mid-sentence.
 */
export function Presenter({ back, prev, next }: { back?: string; prev?: string | null; next?: string | null }) {
  const [canFull, setCanFull] = useState(false);

  useEffect(() => {
    setCanFull(document.fullscreenEnabled);
    const go = (href: string | null | undefined) => href && window.location.assign(href);
    const onKey = (e: KeyboardEvent) => {
      if (e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey) return;
      if (e.target instanceof Element && e.target.closest('input, textarea, select, video, [contenteditable]')) return;
      const items = [...document.querySelectorAll<HTMLElement>('[data-shelf-item]')];
      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
        e.preventDefault();
        const step = e.key === 'ArrowRight' ? 1 : -1;
        if (!items.length) return go(step > 0 ? next : prev);
        const at = items.indexOf(document.activeElement as HTMLElement);
        const to = items[Math.min(items.length - 1, Math.max(0, at < 0 ? 0 : at + step))];
        to?.focus();
        to?.scrollIntoView({ inline: 'center', block: 'nearest' });
      } else if (e.key === 'f' || e.key === 'F') {
        if (!document.fullscreenEnabled) return;
        if (document.fullscreenElement) document.exitFullscreen();
        else document.documentElement.requestFullscreen().catch(() => {});
      } else if (e.key === 'Escape' && !document.fullscreenElement && back) {
        go(back);
      }
    };
    window.addEventListener('keydown', onKey);

    let lock: WakeLockSentinel | null = null;
    const hold = () => {
      if (document.visibilityState !== 'visible' || !('wakeLock' in navigator)) return;
      navigator.wakeLock
        .request('screen')
        .then((l) => {
          lock = l;
        })
        .catch(() => {});
    };
    hold();
    document.addEventListener('visibilitychange', hold);
    return () => {
      window.removeEventListener('keydown', onKey);
      document.removeEventListener('visibilitychange', hold);
      lock?.release().catch(() => {});
    };
  }, [back, prev, next]);

  if (!canFull) return null;
  return (
    <button
      type="button"
      onClick={() => (document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen().catch(() => {}))}
      className="h-10 px-3.5 rounded-md border border-shadow-700 font-mono text-[11px] uppercase tracking-wider text-paper hover:bg-paper/[0.06] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-electric"
    >
      Layar penuh (F)
    </button>
  );
}
