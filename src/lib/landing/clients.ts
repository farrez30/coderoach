/**
 * copy.ts owns the marquee's names; the admin owns the logos.
 *
 * The list used to be cleared and rewritten on every landing sync, which also threw away any logo,
 * dark logo, or website set in the admin. Now clients are matched by name. A name dropped from
 * copy.ts (a withdrawn permission, say) is deleted only while it carries nothing set in the
 * admin; one with a logo or website is kept and reported, because deleting it would lose work
 * the sync can't recreate. Removing that one is a decision for the admin, where the logo is visible.
 */
export type ExistingClient = { id: number; name: string; order: number; hasAdminData: boolean };

export type ClientsPlan = {
  create: Array<{ name: string; order: number }>;
  reorder: Array<{ id: number; name: string; order: number }>;
  keep: Array<{ id: number; name: string }>;
  /** No longer in copy.ts and nothing set in the admin: deleted. */
  remove: Array<{ id: number; name: string }>;
  /** No longer in copy.ts but carrying a logo or website from the admin: kept, reported. */
  extra: Array<{ id: number; name: string }>;
};

const key = (name: string) => name.trim().toLowerCase();

export function planClientsSync(existing: ExistingClient[], names: readonly string[]): ClientsPlan {
  const byName = new Map(existing.map((c) => [key(c.name), c]));
  const wanted = new Set(names.map(key));
  const plan: ClientsPlan = { create: [], reorder: [], keep: [], remove: [], extra: [] };

  names.forEach((name, i) => {
    const order = i + 1;
    const found = byName.get(key(name));
    if (!found) plan.create.push({ name, order });
    else if (found.order !== order) plan.reorder.push({ id: found.id, name: found.name, order });
    else plan.keep.push({ id: found.id, name: found.name });
  });
  for (const client of existing) {
    if (wanted.has(key(client.name))) continue;
    (client.hasAdminData ? plan.extra : plan.remove).push({ id: client.id, name: client.name });
  }
  return plan;
}
