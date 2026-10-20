/** Drops an arrow typed at the end of a label, e.g. "Kirim brief →" from an older CMS value. */
export const stripArrow = (label: string | null | undefined) => String(label ?? '').replace(/\s*[→←]\s*$/, '');

/**
 * Link or button text with its arrow drawn beside it, not inside the words, so screen readers say
 * "Kirim brief" instead of "Kirim brief right arrow". Labels from the CMS may still carry the arrow.
 */
export function CtaLabel({ label, arrow = true }: { label: string | null | undefined; arrow?: boolean }) {
  return (
    // One wrapper so the space before the arrow survives inside flex buttons.
    <span>
      {stripArrow(label)}
      {arrow && <span aria-hidden> →</span>}
    </span>
  );
}
