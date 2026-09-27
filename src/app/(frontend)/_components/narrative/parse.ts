/**
 * Reads a Lexical richText value into the shape the narrative layouts draw.
 *
 * The editor still writes ordinary headings, paragraphs and lists, so these sections stay editable
 * in the admin. The layout is what changes: an h3 starts a new group, and the list under it belongs
 * to that group. A list item may carry a second line (Shift+Enter in the editor): the first line is
 * the item, the rest is its detail.
 */

export type NarrativeGroup = { title: string; paragraphs: string[]; items: string[] };

export type Narrative = {
  title: string;
  /** Paragraphs before the first list or group. */
  intro: string[];
  /** A list that belongs to no group, i.e. the section has no h3. */
  items: string[];
  groups: NarrativeGroup[];
  /** Paragraphs after the lists. */
  outro: string[];
};

function textOf(node: any): string {
  if (!node) return '';
  if (node.type === 'linebreak') return '\n';
  if (typeof node.text === 'string') return node.text;
  return (node.children ?? []).map(textOf).join('');
}

/** Splits a list item into its first line and the detail under it. */
export function splitItem(item: string): { text: string; detail: string } {
  const [text, ...rest] = item.split('\n').map((line) => line.trim()).filter(Boolean);
  return { text: text ?? '', detail: rest.join(' ') };
}

export function parseNarrative(data: any): Narrative {
  const out: Narrative = { title: '', intro: [], items: [], groups: [], outro: [] };
  const children: any[] = data?.root?.children ?? [];

  for (const node of children) {
    const current = out.groups[out.groups.length - 1];
    if (node.type === 'heading') {
      const text = textOf(node);
      if (node.tag === 'h2' && !out.title) out.title = text;
      else out.groups.push({ title: text, paragraphs: [], items: [] });
      continue;
    }
    if (node.type === 'list') {
      const items = (node.children ?? []).map(textOf).filter(Boolean);
      if (current) current.items.push(...items);
      else out.items.push(...items);
      continue;
    }
    if (node.type === 'paragraph') {
      const text = textOf(node).trim();
      if (!text) continue;
      if (current) current.paragraphs.push(text);
      else if (out.items.length) out.outro.push(text);
      else out.intro.push(text);
    }
  }
  return out;
}
