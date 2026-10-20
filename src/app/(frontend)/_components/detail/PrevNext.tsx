import { Meta } from '../ui/Meta';

type Item = {
  href: string;
  label: string; // e.g., "Why we don't sell hours."
  meta?: string; // e.g., "Operating · 22 Apr 2026"
};

/**
 * Two-card navigation between sibling content (prev/next post or case).
 */
export function PrevNext({
  prev,
  next,
  contextLabel = 'Continue reading',
}: {
  prev?: Item | null;
  next?: Item | null;
  contextLabel?: string;
}) {
  if (!prev && !next) return null;
  return (
    <section className="py-16 border-t border-paper-200">
      <div className="max-w-[1180px] mx-auto px-8">
        <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-mist-600 mb-6 block">
          {contextLabel}
        </span>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {prev ? (
            <a
              href={prev.href}
              className="group relative flex flex-col gap-2 p-6 rounded-2xl border border-paper-200 bg-paper-50 hover:border-shadow-800 hover:-translate-y-0.5 transition-all shadow-[inset_0_1px_0_rgba(255,255,255,0.6)]"
            >
              <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-mist-600 group-hover:text-electric transition-colors">
                <span aria-hidden>←</span> Previous
              </span>
              <span className="text-[18px] font-bold tracking-[-0.01em] leading-snug">{prev.label}</span>
              {prev.meta && (
                <span className="text-[12px] text-mist-600 tracking-wide tabular"><Meta parts={prev.meta} /></span>
              )}
            </a>
          ) : (
            <div className="hidden md:block" />
          )}
          {next ? (
            <a
              href={next.href}
              className="group relative flex flex-col gap-2 p-6 rounded-2xl border border-paper-200 bg-paper-50 hover:border-shadow-800 hover:-translate-y-0.5 transition-all shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] md:text-right"
            >
              <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-mist-600 group-hover:text-electric transition-colors">
                Next <span aria-hidden>→</span>
              </span>
              <span className="text-[18px] font-bold tracking-[-0.01em] leading-snug">{next.label}</span>
              {next.meta && (
                <span className="text-[12px] text-mist-600 tracking-wide tabular"><Meta parts={next.meta} /></span>
              )}
            </a>
          ) : (
            <div className="hidden md:block" />
          )}
        </div>
      </div>
    </section>
  );
}
