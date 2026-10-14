/**
 * Production's schema is changed by a dev-mode push, not by migrations (docs/opsscore-ops.md).
 * A push that has to drop, rename, or tighten a column stops at an interactive prompt or loses
 * data, so schema changes in this repo are additive only. describeSchema() flattens the Payload
 * config into one line per stored field; schema.test.ts compares it with baseline.json.
 */
export type FieldShape = {
  type: string;
  required?: true;
  hasMany?: true;
  /** Select and radio values, sorted. Postgres stores them as an enum that can only gain values. */
  options?: string[];
  relationTo?: string;
};

export type SchemaShape = Record<string, FieldShape>;

type AnyField = Record<string, any>;
type AnyEntity = { slug: string; fields: AnyField[] };

export function describeSchema(config: { collections: AnyEntity[]; globals: AnyEntity[] }): SchemaShape {
  const out: SchemaShape = {};
  for (const c of config.collections) walk(c.fields, `collection:${c.slug}`, out);
  for (const g of config.globals) walk(g.fields, `global:${g.slug}`, out);
  return Object.fromEntries(Object.entries(out).sort(([a], [b]) => a.localeCompare(b)));
}

function walk(fields: AnyField[], prefix: string, out: SchemaShape) {
  for (const field of fields) {
    const here = field.name ? `${prefix}.${field.name}` : prefix;
    switch (field.type) {
      case 'ui':
      case 'join':
        break;
      case 'row':
      case 'collapsible':
        walk(field.fields, prefix, out);
        break;
      case 'tabs':
        for (const tab of field.tabs) walk(tab.fields, tab.name ? `${prefix}.${tab.name}` : prefix, out);
        break;
      case 'group':
        if (field.name) out[here] = { type: 'group' };
        walk(field.fields, here, out);
        break;
      case 'array':
        out[here] = shape(field);
        walk(field.fields, `${here}[]`, out);
        break;
      case 'blocks':
        out[here] = shape(field);
        for (const block of field.blocks ?? []) walk(block.fields, `${here}<${block.slug}>`, out);
        break;
      default:
        if (field.name) out[here] = shape(field);
    }
  }
}

function shape(field: AnyField): FieldShape {
  const s: FieldShape = { type: field.type };
  if (field.required === true) s.required = true;
  if (field.hasMany === true) s.hasMany = true;
  if (Array.isArray(field.options)) {
    s.options = field.options.map((o: unknown) => (typeof o === 'string' ? o : (o as { value: string }).value)).sort();
  }
  if (field.relationTo) s.relationTo = [field.relationTo].flat().sort().join(',');
  return s;
}

/** Why `next` cannot be pushed onto a database built from `baseline`, empty when it is additive. */
export function nonAdditiveChanges(baseline: SchemaShape, next: SchemaShape): string[] {
  const problems: string[] = [];
  for (const [path, before] of Object.entries(baseline)) {
    const after = next[path];
    if (!after) {
      problems.push(`${path}: removed or renamed`);
      continue;
    }
    if (after.type !== before.type) problems.push(`${path}: type ${before.type} → ${after.type}`);
    if (after.required && !before.required) problems.push(`${path}: became required`);
    if (Boolean(after.hasMany) !== Boolean(before.hasMany)) problems.push(`${path}: hasMany changed`);
    if (after.relationTo !== before.relationTo) problems.push(`${path}: relationTo ${before.relationTo} → ${after.relationTo}`);
    const dropped = (before.options ?? []).filter((o) => !(after.options ?? []).includes(o));
    if (dropped.length) problems.push(`${path}: options removed (${dropped.join(', ')})`);
  }
  for (const [path, after] of Object.entries(next)) {
    if (!baseline[path] && after.required) problems.push(`${path}: new field is required (NOT NULL on existing rows)`);
  }
  return problems;
}
