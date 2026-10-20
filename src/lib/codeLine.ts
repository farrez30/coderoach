/**
 * Code panel lines come from the CMS as a tiny subset of HTML: syntax colour via
 * `<span style="color:#hex">…</span>` and entities like `&nbsp;` for indentation.
 * They used to go straight into dangerouslySetInnerHTML, so anyone with admin
 * access could put a script on the public home page. Parsing into tokens and
 * letting React render the text keeps the colours and drops everything else.
 */

export type CodeToken = { text: string; color?: string };

const HEX = '#(?:[0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})';
const COLOR_SPAN = new RegExp(`<span style="color:\\s*(${HEX})\\s*;?">([^<]*)</span>`, 'g');

const ENTITIES: Record<string, string> = {
  nbsp: ' ',
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  '#39': "'",
};

const decode = (s: string) => s.replace(/&(nbsp|amp|lt|gt|quot|#39);/g, (_, name: string) => ENTITIES[name]);

/** Anything outside the allowed spans is kept as literal text, never as markup. */
export function parseCodeLine(line: string | null | undefined): CodeToken[] {
  const src = line ?? '';
  const tokens: CodeToken[] = [];
  let last = 0;
  for (const m of src.matchAll(COLOR_SPAN)) {
    if (m.index > last) tokens.push({ text: decode(src.slice(last, m.index)) });
    tokens.push({ text: decode(m[2]), color: m[1] });
    last = m.index + m[0].length;
  }
  if (last < src.length) tokens.push({ text: decode(src.slice(last)) });
  return tokens;
}

/**
 * Payload field validator: reject tags other than the colour span so editors see
 * the problem on save instead of raw markup showing up on the site. A bare `<`
 * as in `a < b` is fine.
 */
export function validateCodeLine(value: unknown): true | string {
  if (typeof value !== 'string') return true;
  if (/<[a-zA-Z/!?]/.test(value.replace(COLOR_SPAN, ''))) {
    return 'Only <span style="color:#hex">text</span> is allowed here. Write a literal < as &lt;.';
  }
  return true;
}
