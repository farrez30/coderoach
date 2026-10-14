/**
 * What coderoach.id already showed on 14 October 2026, before the permission rule (ADR 0009).
 *
 * Those items may keep `consent: 'legacy'`, but only within this snapshot: a client entry on
 * legacy consent can be reworded, not given new numbers, new screenshots, or new client names.
 * Anything beyond it needs a permission recorded in Coderoach OS (an IZN-YYYY-NNN reference).
 * Frozen on purpose: this file only ever shrinks, as legacy items get a real permission.
 */

/** Client names in the marquee under the hero (src/lib/landing/copy.ts, CLIENTS). */
export const LEGACY_CLIENT_NAMES = ['Geprek Wow', 'RPN Agro', 'Chicken Wow', 'Uruzin', 'The Global Review'] as const;

/** Per client case study: the numbers its copy contained, and the image files it used. */
export const LEGACY_ENTRIES: Record<string, { numbers: readonly string[]; files: readonly string[] }> = {
  'rpn-os': { numbers: ['2026', '23', '25', '33,9', '397', '580', '62', '643'], files: ['portfolio-rpn-os.webp'] },
  'the-global-review': { numbers: ['18', '2026', '24'], files: [] },
  uruzin: { numbers: ['2023', '2026'], files: ['portfolio-uruzin-os.webp'] },
  'chicken-wow': { numbers: ['2026', '20,3', '38', '404', '9,4'], files: [] },
  'pt-raja-roti-cemerlang': { numbers: ['2024'], files: [] },
  'tumtim-cookies': { numbers: ['2015', '2024'], files: [] },
};

/** Every number written in a piece of copy: "Rp33,9 juta" gives "33,9", "2026" gives "2026". */
export function numericTokens(text: string): string[] {
  return [...text.matchAll(/\d(?:[\d.,]*\d)?/g)].map((m) => m[0]);
}
