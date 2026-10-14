import { getPayload } from 'payload';
import config from '@payload-config';
import { Hero } from '../Hero';

export async function HeroBlockRenderer({ block }: { block: any }) {
  const payload = await getPayload({ config });
  // Trusted-by marquee always pulls from Clients collection (single source of truth across pages).
  let clients: Array<{ name: string; logo?: any; website?: string | null }> = [];
  if (block?.showTrustedBy !== false) {
    // The Local API skips access control, so the listed filter that guards the REST API is repeated here.
    const res = await payload
      .find({ collection: 'clients', where: { listed: { equals: true } }, sort: 'order', limit: 100, depth: 1 })
      .catch(() => ({ docs: [] }));
    clients = (res.docs as any[]).map((c) => ({
      name: c.name,
      logo: c.logo || null,
      website: c.website || null,
    }));
  }
  return <Hero data={block as any} clients={clients} />;
}
