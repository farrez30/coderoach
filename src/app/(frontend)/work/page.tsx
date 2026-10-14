import config from '@payload-config';
import type { Metadata } from 'next';
import { getPayload } from 'payload';
import { industryLabel } from '@/lib/portfolio/taxonomy';
import { SectionShell } from '../_components/detail/SectionShell';
import { CatalogClient, type CatalogProject } from './CatalogClient';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Work · Portfolio Coderoach Studio · Web, Automasi, Dashboard',
  description:
    'Sistem yang dibangun Coderoach Studio untuk klien dan untuk studio sendiri: ERP, aplikasi internal, otomasi, dan situs.',
  alternates: { canonical: '/work' },
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? '';

export default async function WorkArchivePage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const payload = await getPayload({ config });
  const { docs } = await payload.find({
    collection: 'projects',
    where: { _status: { equals: 'published' } },
    sort: 'order',
    limit: 200,
    depth: 1,
    select: {
      slug: true,
      kind: true,
      client: true,
      tagline: true,
      meta: true,
      industry: true,
      service: true,
      publishedYear: true,
      pills: true,
      excerpt: true,
      coverImage: true,
      featured: true,
      order: true,
    },
  });

  const projects: CatalogProject[] = docs.map((p: any) => ({
    id: p.id,
    slug: p.slug,
    kind: p.kind,
    client: p.client,
    tagline: p.tagline,
    meta: p.meta,
    industry: p.industry,
    publishedYear: p.publishedYear,
    pills: p.pills,
    excerpt: p.excerpt,
    coverImage: p.coverImage,
    pillar: typeof p.service === 'object' && p.service ? { slug: p.service.slug, label: p.service.title } : null,
  }));

  const industries = new Set(projects.map((p) => p.industry || 'other'));

  return (
    <SectionShell>
      <CatalogClient
        projects={projects}
        initial={{ pilar: one(params.pilar), bidang: one(params.bidang) }}
        headline={`${projects.length} proyek, ${industries.size} bidang usaha.`}
        industryLabels={Object.fromEntries([...industries].map((i) => [i, industryLabel(i)]))}
      />
    </SectionShell>
  );
}
