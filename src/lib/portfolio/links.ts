import type { LinkStatus } from '../linkcheck/classify';

/** The job runs every 6 hours; a result older than two days says nothing about today. */
export const STALE_AFTER_MS = 48 * 60 * 60 * 1000;

export type LatestCheck = { status: LinkStatus; checkedAt: string };

/**
 * What the page may claim about a link. A stale or missing check claims nothing, so the link is
 * shown plainly instead of with a green dot from last week.
 */
export function linkState(latest: LatestCheck | undefined, now: number): LatestCheck | null {
  if (!latest) return null;
  const age = now - Date.parse(latest.checkedAt);
  if (Number.isNaN(age) || age > STALE_AFTER_MS) return null;
  return latest;
}

/**
 * Only plain https links reach an href. The field is filled in the admin, and a `javascript:` URL
 * there would run in every visitor's browser. The link comes back as written, not normalized: the
 * checkLinks job stores it that way, and the page looks its status up by the same string.
 */
export function safeHref(href: string | null | undefined): string | null {
  const raw = href?.trim();
  if (!raw) return null;
  try {
    const url = new URL(raw);
    return url.protocol === 'https:' && !url.username && !url.password ? raw : null;
  } catch {
    return null;
  }
}
