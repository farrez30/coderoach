'use client';

import { useEffect, useRef, useState } from 'react';

export type CardPreviewMedia = { src: string; poster: string | null; width: number; height: number };

/**
 * The "Pratinjau" button on a catalog card: plays the project's short muted loop over the cover.
 * Nothing is fetched until it is asked for. Hovering the card starts it too, except with reduced
 * motion or Save-Data, where only a press does.
 */
export function CardPreview({ preview, label }: { preview: CardPreviewMedia; label: string }) {
  const [on, setOn] = useState(false);
  const [hover, setHover] = useState(false);
  const ref = useRef<HTMLButtonElement>(null);
  // Stopped by hand while hovering: stays stopped until the pointer leaves.
  const held = useRef(false);
  const playing = on || hover;

  useEffect(() => {
    const card = ref.current?.closest('article');
    if (!card) return;
    const calm =
      window.matchMedia('(prefers-reduced-motion: reduce), (hover: none)').matches ||
      (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData === true;
    if (calm) return;
    const enter = () => held.current || setHover(true);
    const leave = () => {
      held.current = false;
      setHover(false);
    };
    card.addEventListener('pointerenter', enter);
    card.addEventListener('pointerleave', leave);
    return () => {
      card.removeEventListener('pointerenter', enter);
      card.removeEventListener('pointerleave', leave);
    };
  }, []);

  return (
    <>
      {playing && (
        <div aria-hidden className="absolute inset-0 z-[1] grid place-items-center bg-paper-100">
          <video
            src={preview.src}
            poster={preview.poster ?? undefined}
            muted
            playsInline
            loop
            autoPlay
            className="h-[92%] max-w-[92%] object-contain rounded-xl"
            style={{ aspectRatio: `${preview.width} / ${preview.height}` }}
          />
        </div>
      )}
      <button
        ref={ref}
        type="button"
        aria-pressed={playing}
        aria-label={`Pratinjau ${label}`}
        onClick={() => {
          if (playing) {
            held.current = hover;
            setHover(false);
            setOn(false);
          } else {
            setOn(true);
          }
        }}
        className="absolute bottom-4 right-4 z-[3] h-10 px-3.5 rounded-full bg-paper-50 border border-paper-200 inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider text-ink hover:border-shadow-800 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-electric"
      >
        <svg aria-hidden width="10" height="10" viewBox="0 0 10 10" fill="currentColor">
          {playing ? <path d="M2 1.5h2.2v7H2zM5.8 1.5H8v7H5.8z" /> : <path d="M2.5 1.2v7.6L8.6 5z" />}
        </svg>
        Pratinjau
      </button>
    </>
  );
}
