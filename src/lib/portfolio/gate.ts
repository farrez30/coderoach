import { consentAllows, isConsentRef, type Consent, type Grant } from './consent';
import type { PortfolioEntry } from './projects';

export type Grants = ReadonlyMap<string, Grant>;

/**
 * What of an entry may be published, given the permissions read from Coderoach OS (ADR 0009/0010).
 * Returns null when the entry itself may not appear; otherwise a copy with every item whose
 * consent does not allow it removed, plus a line per removal for the sync log.
 */
export function gateEntry(entry: PortfolioEntry, grants: Grants): { entry: PortfolioEntry | null; blocked: string[] } {
  const blocked: string[] = [];
  if (!consentAllows(entry.consent, 'nama', grants)) {
    return { entry: null, blocked: [`${entry.slug}: no permission to name this project (${entry.consent})`] };
  }
  const keep = <T>(items: T[] | undefined, ok: (t: T) => boolean, label: (t: T) => string) =>
    items?.filter((t) => ok(t) || (blocked.push(`${entry.slug}: ${label(t)}`), false));

  const gated: PortfolioEntry = {
    ...entry,
    metrics: keep(
      entry.metrics,
      (m) => consentAllows(m.consent, 'angka', grants, m.key),
      (m) => `metric ${m.key} (${m.consent})`,
    ),
    links: keep(
      entry.links,
      (l) => consentAllows(l.consent, 'link', grants),
      (l) => `link ${l.href} (${l.consent})`,
    ),
  };
  if (entry.showcase && !consentAllows(entry.showcase.consent, 'tangkapan', grants)) {
    blocked.push(`${entry.slug}: screenshots and recordings (${entry.showcase.consent})`);
    gated.showcase = undefined;
  } else if (entry.showcase?.tour && !consentAllows(entry.showcase.consent, 'video', grants)) {
    blocked.push(`${entry.slug}: tour video (${entry.showcase.consent})`);
    gated.showcase = { ...entry.showcase, tour: undefined, tourPoster: undefined, tourCaptions: undefined, tourTranscript: undefined };
  }
  if (entry.testimonial && !consentAllows(entry.testimonial.consent, 'testimoni', grants)) {
    blocked.push(`${entry.slug}: testimonial (${entry.testimonial.consent})`);
    gated.testimonial = undefined;
  }
  return { entry: gated, blocked };
}

/** Every Coderoach OS reference the portfolio uses, so the sync knows whether it must ask. */
export function refsIn(entries: PortfolioEntry[], extra: Consent[] = []): string[] {
  const all: Consent[] = [...extra];
  for (const e of entries) {
    all.push(e.consent);
    for (const m of e.metrics ?? []) all.push(m.consent);
    for (const l of e.links ?? []) all.push(l.consent);
    if (e.showcase) all.push(e.showcase.consent);
    if (e.testimonial) all.push(e.testimonial.consent);
  }
  return [...new Set(all.filter(isConsentRef))];
}
