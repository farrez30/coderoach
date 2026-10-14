import config from '@payload-config';
import { getPayload } from 'payload';
import type { Project } from '@/payload-types';

/** Every published project, in catalog order: what a presentation can open. */
export async function presentableProjects() {
  const payload = await getPayload({ config });
  const { docs } = await payload.find({
    collection: 'projects',
    where: { _status: { equals: 'published' } },
    sort: 'order',
    limit: 100,
    depth: 1,
    select: { slug: true, kind: true, client: true, tagline: true, industry: true, publishedYear: true, coverImage: true, showcase: { screen: true } },
  });
  return docs as Array<Pick<Project, 'slug' | 'kind' | 'client' | 'tagline' | 'industry' | 'publishedYear' | 'coverImage' | 'showcase'>>;
}
