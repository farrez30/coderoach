/**
 * What lets a piece of the portfolio be shown (ADR 0009).
 *
 * - `studio`: the studio's own work or data, such as a number measured on a studio product and
 *   traced to a commit.
 * - `legacy`: shown on coderoach.id before the permission rule (14 October 2026). Only items in
 *   legacy-baseline.ts may use it, and only within what was there on that day.
 * - `IZN-YYYY-NNN`: a permission recorded in Coderoach OS. Who gave it and the evidence stay there;
 *   this repository is public, so it only carries the reference.
 */
export type ConsentRef = `IZN-${string}`;
export type Consent = 'studio' | 'legacy' | ConsentRef;

const REF = /^IZN-\d{4}-\d{3}$/;

export function isConsentRef(value: string): value is ConsentRef {
  return REF.test(value);
}

export function isConsent(value: unknown): value is Consent {
  return value === 'studio' || value === 'legacy' || (typeof value === 'string' && isConsentRef(value));
}

/** What a permission in Coderoach OS covers. Mirrors izin_portofolio.cakupan there. */
export type ConsentScope = 'nama' | 'logo' | 'angka' | 'tangkapan' | 'testimoni' | 'video' | 'link';

/** One row of GET /api/portofolio/izin (ADR 0010). */
export type Grant = {
  ref: string;
  status: 'diberikan' | 'dicabut' | 'kedaluwarsa';
  cakupan: ConsentScope[];
  kunciMetrik: string[];
  slugSitus: string | null;
  kedaluwarsa: string | null;
};

/**
 * Whether `consent` lets an item of kind `scope` through, given the grants read from Coderoach OS.
 * A metric also needs its key listed on the grant, so permission for one number is not
 * permission for every number.
 */
export function consentAllows(
  consent: Consent,
  scope: ConsentScope,
  grants: ReadonlyMap<string, Grant>,
  metricKey?: string,
): boolean {
  if (consent === 'studio' || consent === 'legacy') return true;
  const grant = grants.get(consent);
  if (!grant || grant.status !== 'diberikan') return false;
  if (!grant.cakupan.includes(scope)) return false;
  if (scope === 'angka' && metricKey !== undefined) return grant.kunciMetrik.includes(metricKey);
  return true;
}
