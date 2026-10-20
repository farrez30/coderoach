import { Fragment, isValidElement, type ReactNode } from 'react';

type Part = ReactNode;

/** Splits "F&B OPS · STUDIO PRODUCT" (or a list of parts) into its parts, dropping empty ones. */
export function metaParts(parts: Part | Part[]): ReactNode[] {
  const list = Array.isArray(parts) ? parts : [parts];
  return list.flatMap((p): ReactNode[] => {
    if (isValidElement(p)) return [p];
    if (typeof p !== 'string' && typeof p !== 'number') return [];
    return String(p)
      .split(' · ')
      .map((s) => s.trim())
      .filter(Boolean);
  });
}

/**
 * Instrument meta line ("kind · industry · year"). Each part stays on one line and the row wraps only
 * between parts, so a narrow screen never leaves "STUDIO" on one line and "PRODUCT" on the next. The dot
 * is decoration; screen readers hear a comma instead.
 */
export function Meta({
  parts,
  className = '',
  dotClassName = '',
}: {
  parts: Part | Part[];
  className?: string;
  dotClassName?: string;
}) {
  const list = metaParts(parts);
  if (list.length === 0) return null;
  return (
    <span className={`inline-flex flex-wrap items-baseline gap-x-2 ${className}`}>
      {list.map((part, i) => (
        <Fragment key={i}>
          {i > 0 && (
            <span aria-hidden className={dotClassName}>
              ·
            </span>
          )}
          <span className="whitespace-nowrap">
            {part}
            {i < list.length - 1 && <span className="sr-only">,</span>}
          </span>
        </Fragment>
      ))}
    </span>
  );
}
