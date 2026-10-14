'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useId, useRef } from 'react';

/**
 * The "screen in a screen" (ADR 0002): a native modal <dialog>, so the page behind is inert and
 * focus stays inside without a hand-written trap. Every way out goes through router.back(), which
 * restores the catalog's URL and scroll position; focus returns to the card that opened it.
 */
export function ProjectOverlay({ slug, title, children }: { slug: string; title: string; children: React.ReactNode }) {
  const ref = useRef<HTMLDialogElement>(null);
  const router = useRouter();
  const leaving = useRef(false);
  const titleId = useId();

  const close = useCallback(() => {
    if (leaving.current) return;
    leaving.current = true;
    router.back();
  }, [router]);

  useEffect(() => {
    const dialog = ref.current;
    if (dialog && !dialog.open) dialog.showModal();
    // A parallel slot can't set metadata, so the overlay names the tab itself.
    const previousTitle = document.title;
    document.title = `${title} · Coderoach Studio`;
    return () => {
      document.title = previousTitle;
      document.querySelector<HTMLElement>(`[data-card-link="${CSS.escape(slug)}"]`)?.focus({ preventScroll: true });
    };
  }, [slug, title]);

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      // Esc fires cancel; going back is what closes it, so the URL and the screen never disagree.
      onCancel={(e) => {
        e.preventDefault();
        close();
      }}
      onClose={close}
      onClick={(e) => {
        // A click that lands on the dialog itself, not its content, is a click on the backdrop.
        if (e.target === e.currentTarget) return close();
        // In-page links (#tur, #sumber-1) scroll the overlay without a history entry; otherwise
        // the next Back would only drop the hash and leave the overlay open.
        const link = (e.target as Element).closest<HTMLAnchorElement>('a[href^="#"]');
        const target = link?.hash && ref.current?.querySelector<HTMLElement>(`#${CSS.escape(link.hash.slice(1))}`);
        if (!target) return;
        e.preventDefault();
        target.scrollIntoView({ block: 'start' });
        if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
        target.focus({ preventScroll: true });
      }}
      className="project-overlay m-0 sm:m-auto p-0 w-full max-w-none h-[100dvh] max-h-none sm:w-[min(1180px,calc(100vw-48px))] sm:h-[calc(100dvh-48px)] sm:rounded-2xl border-0 sm:border sm:border-paper-200 bg-paper-100 text-ink overflow-hidden shadow-[0_40px_80px_-24px_rgba(8,9,10,0.45)] backdrop:bg-[rgba(8,9,10,0.45)]"
    >
      <div className="h-full overflow-y-auto overscroll-contain">
        <div className="sticky top-0 z-20 flex items-center justify-between gap-4 px-5 sm:px-8 h-14 bg-paper-50/95 border-b border-paper-200">
          <p id={titleId} className="m-0 font-semibold tracking-[-0.01em] truncate">
            {title}
          </p>
          <div className="flex items-center gap-2 shrink-0">
            <a
              href={`/work/${slug}`}
              className="h-9 px-3 rounded-md font-mono text-[11px] uppercase tracking-wider text-mist-600 hover:text-ink hover:bg-paper-100 inline-flex items-center transition-colors"
            >
              Halaman penuh ↗
            </a>
            <button
              type="button"
              onClick={close}
              className="h-9 w-9 rounded-md inline-flex items-center justify-center text-ink hover:bg-paper-100 transition-colors focus-visible:outline-2 focus-visible:outline-electric"
              aria-label="Tutup dan kembali ke daftar karya"
            >
              <svg aria-hidden width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
                <path d="M3.5 3.5l9 9M12.5 3.5l-9 9" />
              </svg>
            </button>
          </div>
        </div>
        {children}
      </div>
    </dialog>
  );
}
