import type { Payload, TaskConfig } from 'payload';
import { probe } from '../lib/linkcheck/probe';

const KEEP_DAYS = 90;
/** A URL checked this recently is skipped, so two containers overlapping during a deploy don't double up. */
const RECENT_MINUTES = 30;
const CONCURRENCY = 3;

type Target = { url: string; project: number; linkKind: string };

/**
 * Probes every checked link of every published project and records one link-checks row each
 * (ADR 0007). Network I/O happens with no transaction open; the handler never throws for a
 * single bad link, so one dead site can't stop the schedule.
 */
export const checkLinksTask: TaskConfig<{ input: Record<string, never>; output: { checked: number; pruned: number } }> = {
  slug: 'checkLinks',
  retries: 0,
  schedule: [{ cron: '0 17 */6 * * *', queue: 'linkcheck' }],
  outputSchema: [
    { name: 'checked', type: 'number', required: true },
    { name: 'pruned', type: 'number', required: true },
  ],
  handler: async ({ req }) => {
    const { payload } = req;
    const { docs } = await payload.find({
      collection: 'projects',
      where: { _status: { equals: 'published' } },
      select: { links: true },
      depth: 0,
      limit: 200,
      overrideAccess: true,
    });
    const seen = new Set<string>();
    const targets: Target[] = [];
    for (const doc of docs) {
      for (const link of doc.links ?? []) {
        if (!link.href || link.check === false || seen.has(link.href)) continue;
        seen.add(link.href);
        targets.push({ url: link.href, project: doc.id, linkKind: link.kind ?? 'live' });
      }
    }

    const since = new Date(Date.now() - RECENT_MINUTES * 60_000).toISOString();
    const { docs: recent } = await payload.find({
      collection: 'link-checks',
      where: { checkedAt: { greater_than: since } },
      select: { url: true },
      depth: 0,
      limit: 1000,
      overrideAccess: true,
    });
    const fresh = new Set(recent.map((r) => r.url));
    const queue = targets.filter((t) => !fresh.has(t.url));

    let checked = 0;
    const work = async () => {
      for (let t = queue.shift(); t; t = queue.shift()) {
        const result = await probe(t.url);
        await payload.create({
          collection: 'link-checks',
          data: {
            url: t.url,
            project: t.project,
            linkKind: t.linkKind as 'live',
            status: result.status,
            httpStatus: result.httpStatus,
            reason: result.reason,
            finalUrl: result.finalUrl,
            title: result.title,
            durationMs: result.durationMs,
            checkedAt: new Date().toISOString(),
          },
          overrideAccess: true,
        });
        checked++;
      }
    };
    await Promise.all(Array.from({ length: CONCURRENCY }, work));

    const pruned = await pruneOld(payload);
    return { output: { checked, pruned } };
  },
};

/** Drops rows older than KEEP_DAYS, but never the latest row of a URL, however old. */
async function pruneOld(payload: Payload) {
  const cutoff = new Date(Date.now() - KEEP_DAYS * 86_400_000).toISOString();
  const { docs: old } = await payload.find({
    collection: 'link-checks',
    where: { checkedAt: { less_than: cutoff } },
    select: { url: true, checkedAt: true },
    sort: '-checkedAt',
    depth: 0,
    limit: 5000,
    overrideAccess: true,
  });
  let pruned = 0;
  for (const row of old) {
    const { totalDocs: newer } = await payload.count({
      collection: 'link-checks',
      where: { and: [{ url: { equals: row.url } }, { checkedAt: { greater_than: row.checkedAt } }] },
      overrideAccess: true,
    });
    if (newer === 0) continue;
    await payload.delete({ collection: 'link-checks', id: row.id, overrideAccess: true });
    pruned++;
  }
  return pruned;
}
