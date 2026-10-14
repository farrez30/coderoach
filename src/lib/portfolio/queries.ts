import config from '@payload-config';
import { draftMode } from 'next/headers';
import { getPayload } from 'payload';
import { cache } from 'react';
import type { LatestCheck } from './links';

/**
 * One project with everything a detail view renders. The full page and the overlay share it, and
 * `cache` lets generateMetadata and the page read it once per request.
 */
export const getProject = cache(async (slug: string) => {
  const { isEnabled: draft } = await draftMode();
  const payload = await getPayload({ config });
  const { docs } = await payload.find({
    collection: 'projects',
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 2,
    // Same access as before: drafts only for a logged-in preview, so a draft's name never leaks.
    draft,
    overrideAccess: draft,
  });
  return docs[0] ?? null;
});

/**
 * The newest check per URL. link-checks is admin-only over REST; the page reads it here and passes
 * on just the status and the time, never the reason, final URL, or title.
 */
export async function latestLinkChecks(urls: string[]): Promise<Map<string, LatestCheck>> {
  const payload = await getPayload({ config });
  const rows = await Promise.all(
    [...new Set(urls)].map(async (url) => {
      const { docs } = await payload.find({
        collection: 'link-checks',
        where: { url: { equals: url } },
        sort: '-checkedAt',
        limit: 1,
        depth: 0,
        select: { status: true, checkedAt: true },
        overrideAccess: true,
      });
      const doc = docs[0];
      return doc ? ([url, { status: doc.status, checkedAt: doc.checkedAt }] as const) : null;
    }),
  );
  return new Map(rows.filter((r) => r !== null));
}
