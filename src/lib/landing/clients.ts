import type { Industry } from '../portfolio/taxonomy';

/**
 * copy.ts owns the marquee's names; the admin owns the logos.
 *
 * The list used to be cleared and rewritten on every landing sync, which also threw away any logo,
 * dark logo, or website set in the admin. Now clients are matched by name. A name dropped from
 * copy.ts (a withdrawn permission, say) is deleted only while it carries nothing set in the
 * admin; one with a logo or website is kept for the admin but unlisted, so it leaves the site and
 * the public API at once. Deleting it would lose work the sync can't recreate.
 */
export type ExistingClient = {
  id: number;
  name: string;
  order: number;
  listed: boolean;
  industry: string | null;
  hasAdminData: boolean;
};

export type WantedClient = { name: string; industry: Industry };

type Patch = Partial<{ order: number; listed: boolean; industry: Industry }>;

export type ClientsPlan = {
  create: Array<{ name: string; order: number; listed: true; industry: Industry }>;
  update: Array<{ id: number; name: string; data: Patch }>;
  keep: Array<{ id: number; name: string }>;
  /** No longer in copy.ts and nothing set in the admin: deleted. */
  remove: Array<{ id: number; name: string }>;
  /** No longer in copy.ts but carrying a logo or website from the admin: kept, unlisted, reported. */
  extra: Array<{ id: number; name: string }>;
};

const key = (name: string) => name.trim().toLowerCase();

export function planClientsSync(existing: ExistingClient[], wanted: readonly WantedClient[]): ClientsPlan {
  const byName = new Map(existing.map((c) => [key(c.name), c]));
  const names = new Set(wanted.map((c) => key(c.name)));
  const plan: ClientsPlan = { create: [], update: [], keep: [], remove: [], extra: [] };

  wanted.forEach(({ name, industry }, i) => {
    const order = i + 1;
    const found = byName.get(key(name));
    if (!found) {
      plan.create.push({ name, order, listed: true, industry });
      return;
    }
    const data: Patch = {};
    if (found.order !== order) data.order = order;
    if (!found.listed) data.listed = true;
    if (found.industry !== industry) data.industry = industry;
    if (Object.keys(data).length) plan.update.push({ id: found.id, name: found.name, data });
    else plan.keep.push({ id: found.id, name: found.name });
  });
  for (const client of existing) {
    if (names.has(key(client.name))) continue;
    if (!client.hasAdminData) {
      plan.remove.push({ id: client.id, name: client.name });
      continue;
    }
    plan.extra.push({ id: client.id, name: client.name });
    if (client.listed) plan.update.push({ id: client.id, name: client.name, data: { listed: false } });
  }
  return plan;
}
