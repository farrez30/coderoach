import config from '@payload-config';
import { draftMode } from 'next/headers';
import { getPayload } from 'payload';
import { cache } from 'react';

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
