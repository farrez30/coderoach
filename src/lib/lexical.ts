/**
 * Minimal builder for Payload's Lexical richText fields.
 *
 * Covers what ProseRenderer draws: headings, paragraphs and bullet lists. Content modules
 * describe a section as an array of blocks and call `toLexical` to store it. A "\n" in a list item
 * becomes a line break inside that item.
 */

export type LexicalBlock = string | { h2: string } | { h3: string } | { ul: string[] };

const base = { format: '' as const, indent: 0, version: 1, direction: 'ltr' as const };

const textNode = (text: string) => ({
  type: 'text',
  text,
  mode: 'normal',
  style: '',
  detail: 0,
  format: 0,
  version: 1,
});

const paragraph = (text: string) => ({ type: 'paragraph', ...base, textFormat: 0, children: [textNode(text)] });

const heading = (tag: 'h2' | 'h3', text: string) => ({ type: 'heading', tag, ...base, children: [textNode(text)] });

const list = (items: string[]) => ({
  type: 'list',
  listType: 'bullet' as const,
  tag: 'ul',
  start: 1,
  ...base,
  children: items.map((text, i) => ({
    type: 'listitem',
    value: i + 1,
    ...base,
    children: text
      .split('\n')
      .flatMap((line, n) => (n ? [{ type: 'linebreak', version: 1 }, textNode(line)] : [textNode(line)])),
  })),
});

export function toLexical(blocks: LexicalBlock[]) {
  return {
    root: {
      type: 'root',
      ...base,
      children: blocks.map((block) => {
        if (typeof block === 'string') return paragraph(block);
        if ('h2' in block) return heading('h2', block.h2);
        if ('h3' in block) return heading('h3', block.h3);
        return list(block.ul);
      }),
    },
  };
}
