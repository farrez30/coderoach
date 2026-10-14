/**
 * The marquee's client list is matched by name and only ever added to or reordered.
 *
 * It used to be cleared and rewritten on every landing sync, which also threw away any logo,
 * dark logo, or website set in the admin. Logos are the part that needs a permission (ADR 0009),
 * so losing them silently is the worst failure here. A client dropped from copy.ts is reported,
 * not deleted: removing one is a decision for the admin, where its logo is visible.
 */
export type ExistingClient = { id: number; name: string; order: number };

export type ClientsPlan = {
  create: Array<{ name: string; order: number }>;
  reorder: Array<{ id: number; name: string; order: number }>;
  keep: Array<{ id: number; name: string }>;
  /** In the database but no longer in copy.ts. */
  extra: Array<{ id: number; name: string }>;
};

const key = (name: string) => name.trim().toLowerCase();

export function planClientsSync(existing: ExistingClient[], names: readonly string[]): ClientsPlan {
  const byName = new Map(existing.map((c) => [key(c.name), c]));
  const wanted = new Set(names.map(key));
  const plan: ClientsPlan = { create: [], reorder: [], keep: [], extra: [] };

  names.forEach((name, i) => {
    const order = i + 1;
    const found = byName.get(key(name));
    if (!found) plan.create.push({ name, order });
    else if (found.order !== order) plan.reorder.push({ id: found.id, name: found.name, order });
    else plan.keep.push({ id: found.id, name: found.name });
  });
  for (const client of existing) {
    if (!wanted.has(key(client.name))) plan.extra.push({ id: client.id, name: client.name });
  }
  return plan;
}
