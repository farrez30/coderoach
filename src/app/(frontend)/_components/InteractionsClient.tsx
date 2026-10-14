'use client';

import { useEffect } from 'react';

/**
 * Consolidated client interactions: IntersectionObserver reveal,
 * spotlight cursor, work-row directional hover, magnetic CTA,
 * hero parallax, Process scroll progress.
 *
 * All gated by prefers-reduced-motion + (pointer: fine).
 */
export function InteractionsClient() {
  useEffect(() => {
    const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const finePointer = matchMedia('(pointer: fine)').matches;
    const cleanups: Array<() => void> = [];

    /* IntersectionObserver — section reveal. Elements that mount later (an overlay opened by a soft
       navigation, a filtered card) are picked up by the MutationObserver, or they would stay hidden. */
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('in');
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
    );
    const REVEAL = '.reveal:not(.in), .reveal-stagger:not(.in)';
    const watch = (root: ParentNode) => {
      if (root instanceof Element && root.matches(REVEAL)) io.observe(root);
      root.querySelectorAll(REVEAL).forEach((el) => io.observe(el));
    };
    watch(document);
    const mo = new MutationObserver((records) => {
      for (const r of records) r.addedNodes.forEach((n) => n instanceof Element && watch(n));
    });
    mo.observe(document.body, { childList: true, subtree: true });
    cleanups.push(() => {
      io.disconnect();
      mo.disconnect();
    });

    if (reduceMotion) return () => cleanups.forEach((c) => c());

    /* Spotlight cursor and directional work-row hover, delegated so cards mounted later work too */
    const onPointerMove = (e: PointerEvent) => {
      const el = (e.target as Element | null)?.closest?.<HTMLElement>('[data-spotlight]');
      if (!el) return;
      const r = el.getBoundingClientRect();
      el.style.setProperty('--mx', `${e.clientX - r.left}px`);
      el.style.setProperty('--my', `${e.clientY - r.top}px`);
    };
    const onPointerOver = (e: PointerEvent) => {
      const row = (e.target as Element | null)?.closest?.<HTMLElement>('[data-work-row]');
      if (!row || (e.relatedTarget instanceof Node && row.contains(e.relatedTarget))) return;
      const r = row.getBoundingClientRect();
      row.style.setProperty('--origin', e.clientX - r.left < r.width / 2 ? 'left' : 'right');
    };
    document.addEventListener('pointermove', onPointerMove, { passive: true });
    document.addEventListener('pointerover', onPointerOver, { passive: true });
    cleanups.push(() => {
      document.removeEventListener('pointermove', onPointerMove);
      document.removeEventListener('pointerover', onPointerOver);
    });

    /* Magnetic CTA (hero only, fine pointer) */
    if (finePointer) {
      const cta = document.querySelector<HTMLElement>('[data-cta-magnetic]');
      if (cta) {
        const onMove = (e: PointerEvent) => {
          const r = cta.getBoundingClientRect();
          const x = (e.clientX - r.left - r.width / 2) * 0.18;
          const y = (e.clientY - r.top - r.height / 2) * 0.22;
          cta.style.transform = `translate(${x.toFixed(2)}px, ${y.toFixed(2)}px)`;
        };
        const onLeave = () => {
          cta.style.transform = '';
        };
        cta.addEventListener('pointermove', onMove);
        cta.addEventListener('pointerleave', onLeave);
        cleanups.push(() => {
          cta.removeEventListener('pointermove', onMove);
          cta.removeEventListener('pointerleave', onLeave);
        });
      }
    }

    /* Hero parallax + Process scroll progress (single rAF-throttled scroll handler) */
    const heroBg = document.querySelector<HTMLElement>('[data-hero-bg]');
    const proc = document.querySelector<HTMLElement>('[data-process]');
    let raf: number | null = null;
    const onScroll = () => {
      if (raf !== null) return;
      raf = requestAnimationFrame(() => {
        const y = scrollY;
        if (heroBg && y < innerHeight * 1.5) {
          heroBg.style.transform = `translateY(${(y * 0.18).toFixed(2)}px)`;
        }
        if (proc) {
          const r = proc.getBoundingClientRect();
          const total = r.height + innerHeight;
          const passed = innerHeight - r.top;
          const p = Math.max(0, Math.min(1, passed / total));
          proc.style.setProperty('--progress', p.toFixed(3));
          const phase = Math.max(0, Math.min(4, Math.ceil(p * 4)));
          // Apply electric fill to dots/icons up to current phase
          for (let i = 1; i <= 4; i++) {
            const dot = proc.querySelector<HTMLElement>(`[data-phase-dot="${i}"]`);
            const icon = proc.querySelector<HTMLElement>(`[data-phase-icon="${i}"]`);
            const active = i <= phase;
            if (dot) {
              dot.style.background = active ? 'var(--color-electric)' : 'var(--color-paper-100)';
              dot.style.borderColor = active ? 'var(--color-electric)' : 'var(--color-ink)';
              dot.style.boxShadow = active ? '0 0 0 4px rgba(44,112,254,0.18)' : 'none';
            }
            if (icon) {
              icon.style.color = active ? 'var(--color-electric)' : 'var(--color-shadow-700)';
              icon.style.borderColor = active ? 'rgba(44,112,254,0.4)' : 'var(--color-paper-200)';
              icon.style.background = active ? 'rgba(44,112,254,0.08)' : 'var(--color-paper-50)';
            }
          }
        }
        raf = null;
      });
    };
    addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    cleanups.push(() => removeEventListener('scroll', onScroll));

    return () => cleanups.forEach((c) => c());
  }, []);

  return null;
}
