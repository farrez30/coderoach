import config from '@payload-config';
import { getPayload } from 'payload';

export const dynamic = 'force-dynamic';

/**
 * Railway's healthcheck. It reads one row from every collection (and its versions table) and every
 * global, so a build whose code expects a column the database doesn't have yet fails here and is
 * never promoted. /opsscore, the old healthcheck, never touched Payload and passed such a build.
 * `cron: true` also starts Payload's job crons in the process that serves traffic.
 */
export async function GET() {
  const headers = { 'cache-control': 'no-store' };
  try {
    const payload = await getPayload({ config, cron: true });
    for (const collection of payload.config.collections) {
      if (collection.slug === 'payload-migrations') continue;
      await payload.find({
        collection: collection.slug as never,
        limit: 1,
        depth: 0,
        overrideAccess: true,
        draft: Boolean(collection.versions && typeof collection.versions === 'object' && collection.versions.drafts),
      });
    }
    for (const global of payload.config.globals) {
      await payload.findGlobal({ slug: global.slug as never, depth: 0, overrideAccess: true });
    }
    return Response.json({ ok: true }, { headers });
  } catch (error) {
    console.error('health: schema check failed', error);
    return Response.json({ ok: false }, { status: 503, headers });
  }
}
