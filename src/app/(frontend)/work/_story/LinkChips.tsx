import type { Media } from '@/payload-types';
import type { LatestCheck } from '@/lib/portfolio/links';
import { formatDay, formatMinute } from './format';

export type LinkView = {
  label: string;
  href: string;
  /** Null when the link is not checked, or the last check is too old to say anything. */
  state: LatestCheck | null;
  snapshot: Media | null;
  snapshotTakenAt: string | null;
};

const chip =
  'h-9 px-3.5 rounded-full border border-paper-200 bg-paper-50 inline-flex items-center gap-2 text-[14px] font-medium';
const linkChip = `${chip} hover:border-shadow-800 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-electric`;

/**
 * Live and demo links with what the last check found. A dead link is not linked: the visitor gets
 * the dated snapshot instead, or a plain note when there is none.
 */
export function LinkChips({ links }: { links: LinkView[] }) {
  if (!links.length) return null;
  const checked = links.map((l) => l.state?.checkedAt).filter((t): t is string => Boolean(t));
  const latest = checked.sort().at(-1);
  return (
    <div>
      <ul className="m-0 p-0 list-none flex flex-wrap gap-2">
        {links.map((l) => (
          <li key={l.href}>
            {l.state?.status === 'mati' ? (
              l.snapshot?.url ? (
                <a href={l.snapshot.url} className={linkChip}>
                  <span aria-hidden className="h-2 w-2 rounded-full bg-error" />
                  {l.label} sedang tidak bisa dibuka. Lihat tangkapan
                  {l.snapshotTakenAt ? ` ${formatDay(l.snapshotTakenAt)}` : ''}
                </a>
              ) : (
                <span className={`${chip} text-ink/65`}>
                  <span aria-hidden className="h-2 w-2 rounded-full bg-error" />
                  {l.label} sedang tidak bisa dibuka
                </span>
              )
            ) : (
              <a href={l.href} target="_blank" rel="noopener noreferrer" className={linkChip}>
                {l.state && (
                  <span aria-hidden className={`h-2 w-2 rounded-full ${l.state.status === 'hidup' ? 'bg-success' : 'bg-warning'}`} />
                )}
                {l.label}
                {l.state?.status === 'login' && <span className="text-ink/65 font-normal">(perlu login)</span>}
                <span aria-hidden>↗</span>
                <span className="sr-only">(tab baru)</span>
              </a>
            )}
          </li>
        ))}
      </ul>
      {latest && (
        <p className="m-0 mt-2 text-[13px] text-ink/65">
          Dicek otomatis setiap 6 jam, terakhir {formatMinute(latest)} WIB.
        </p>
      )}
    </div>
  );
}
