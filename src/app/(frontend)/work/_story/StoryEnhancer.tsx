'use client';

import { useEffect } from 'react';

type Kind = 'exit' | 'enter' | 'read';
type Scene = { el: HTMLElement; kind: Kind; top: number; height: number; visible: boolean; last: number };

/** Share of the gap to the real scroll position closed per frame (0.08–0.12 reads as smooth, not laggy). */
const DAMPING = 0.12;

/**
 * Progress through a scene, 0 to 1:
 * - exit: from the top of the page until the scene has scrolled away (the hero);
 * - enter: from the scene's top touching the bottom edge until it is 60% of a screen up;
 * - read: the scene's length, measured at a reading line 60% down the screen.
 */
function progress(s: Scene, y: number, vh: number): number {
  const raw =
    s.kind === 'exit' ? y / (s.top + s.height) : s.kind === 'enter' ? (y + vh - s.top) / (vh * 0.6) : (y + vh * 0.6 - s.top) / s.height;
  return Math.min(1, Math.max(0, raw));
}

/**
 * Motion for a project page that is already complete without it. Every CSS rule that moves
 * something reads `--p` with its resting value as the fallback, so no JS, reduced motion, and the
 * overlay all show the finished layout. Only the scroll value read here is smoothed, never the
 * scroll itself, and the loop sleeps once nothing is moving.
 */
export function StoryEnhancer({ rootId }: { rootId: string }) {
  useEffect(() => {
    const root = document.getElementById(rootId);
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (!root || reduce.matches) return;

    root.dataset.motion = 'on';
    const scenes: Scene[] = [...root.querySelectorAll<HTMLElement>('[data-scene]')].map((el) => ({
      el,
      kind: el.dataset.scene as Kind,
      top: 0,
      height: 1,
      visible: false,
      last: -1,
    }));

    let smoothed = window.scrollY;
    let frame = 0;
    const paint = (all: boolean) => {
      const vh = window.innerHeight;
      for (const s of scenes) {
        if (!all && !s.visible) continue;
        const p = Math.round(progress(s, smoothed, vh) * 1000) / 1000;
        if (p !== s.last) {
          s.el.style.setProperty('--p', String(p));
          s.last = p;
        }
      }
    };
    const tick = () => {
      const target = window.scrollY;
      // A jump (an anchor link, End, the scrollbar) lands close by instead of replaying every scene in between.
      const reach = window.innerHeight * 0.5;
      if (Math.abs(target - smoothed) > reach * 3) smoothed = target - Math.sign(target - smoothed) * reach;
      smoothed += (target - smoothed) * DAMPING;
      if (Math.abs(target - smoothed) < 0.5) smoothed = target;
      paint(false);
      frame = smoothed === target ? 0 : requestAnimationFrame(tick);
    };
    const wake = () => {
      if (!frame) frame = requestAnimationFrame(tick);
    };
    const measure = () => {
      for (const s of scenes) {
        const r = s.el.getBoundingClientRect();
        s.top = r.top + window.scrollY;
        s.height = Math.max(1, r.height);
      }
      wake();
    };
    measure();
    // Everything starts where the scroll position says, so nothing below the fold pops on first frame.
    paint(true);

    const seen = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          const s = scenes.find((x) => x.el === e.target);
          if (s) s.visible = e.isIntersecting;
        }
        wake();
      },
      { rootMargin: '25% 0px' },
    );
    for (const s of scenes) seen.observe(s.el);

    // Pinned features: the text crossing the middle of the screen picks the screen shown.
    const articles = [...root.querySelectorAll<HTMLElement>('.story-feature')];
    const middle = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          const current = e.target.closest('.story-feature');
          for (const a of articles) a.toggleAttribute('data-current', a === current);
        }
      },
      { rootMargin: '-50% 0px -50% 0px' },
    );
    for (const a of articles) {
      const text = a.querySelector('.story-feature__text');
      if (text) middle.observe(text);
    }

    // Preview loops: fetched only once on screen, paused off screen, never on Save-Data.
    const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData === true;
    const loops = saveData ? [] : [...root.querySelectorAll<HTMLVideoElement>('video[data-loop]')];
    const onPlaying = (e: Event) => {
      const v = e.currentTarget as HTMLVideoElement;
      v.classList.add('is-playing');
      v.closest('.story-phone')?.querySelector('[data-loop-toggle]')?.removeAttribute('hidden');
    };
    const onScreen = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          const v = e.target as HTMLVideoElement;
          if (v.dataset.paused === 'user') continue;
          if (e.isIntersecting) {
            if (!v.getAttribute('src') && v.dataset.loop) v.src = v.dataset.loop;
            v.play().catch(() => {});
          } else {
            v.pause();
          }
        }
      },
      { threshold: 0.25 },
    );
    for (const v of loops) {
      v.addEventListener('playing', onPlaying);
      onScreen.observe(v);
    }
    // WCAG 2.2.2: anything moving on its own for more than five seconds can be paused.
    const onClick = (e: MouseEvent) => {
      const button = (e.target as Element).closest<HTMLButtonElement>('[data-loop-toggle]');
      const v = button?.closest('.story-phone')?.querySelector<HTMLVideoElement>('video[data-loop]');
      if (!button || !v) return;
      const pause = !v.paused;
      if (pause) {
        v.pause();
        v.dataset.paused = 'user';
      } else {
        delete v.dataset.paused;
        v.play().catch(() => {});
      }
      button.setAttribute('aria-pressed', String(pause));
    };

    const resized = new ResizeObserver(measure);
    resized.observe(root);
    window.addEventListener('scroll', wake, { passive: true });
    window.addEventListener('resize', measure);
    root.addEventListener('click', onClick);

    const stop = () => {
      cancelAnimationFrame(frame);
      seen.disconnect();
      middle.disconnect();
      onScreen.disconnect();
      resized.disconnect();
      window.removeEventListener('scroll', wake);
      window.removeEventListener('resize', measure);
      root.removeEventListener('click', onClick);
      for (const v of loops) {
        v.removeEventListener('playing', onPlaying);
        v.pause();
      }
      for (const b of root.querySelectorAll('[data-loop-toggle]')) b.setAttribute('hidden', '');
      for (const s of scenes) s.el.style.removeProperty('--p');
      delete root.dataset.motion;
    };
    // Someone switching reduced motion on mid-visit gets the still page at once.
    const onReduce = () => reduce.matches && stop();
    reduce.addEventListener('change', onReduce);
    return () => {
      reduce.removeEventListener('change', onReduce);
      stop();
    };
  }, [rootId]);

  return null;
}
