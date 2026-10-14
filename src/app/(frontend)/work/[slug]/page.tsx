import { getPayload } from 'payload';
import config from '@payload-config';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getProject } from '@/lib/portfolio/queries';
import { SectionShell } from '../../_components/detail/SectionShell';
import { ClientCaseDetail } from './ClientCaseDetail';
import { StudioProductDetail } from './StudioProductDetail';
import { RelatedGrid } from '../../_components/detail/RelatedGrid';
import { PrevNext } from '../../_components/detail/PrevNext';
import { hasStory, ProjectStory } from '../_story/ProjectStory';

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const p = (await getProject(slug)) as any;
  if (!p) return { title: 'Tidak ditemukan · Coderoach Studio' };
  return {
    title: `${p.client} · Coderoach Studio`,
    description: p.excerpt || p.tagline,
    alternates: { canonical: `/work/${slug}` },
    openGraph: {
      title: p.client,
      description: p.excerpt || p.tagline,
      images: p.coverImage?.url ? [{ url: p.coverImage.url }] : undefined,
    },
  };
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = (await getProject(slug)) as any;
  if (!project) notFound();
  const payload = await getPayload({ config });

  // Related: same industry or service, excluding current
  const { docs: relatedRaw } = await payload.find({
    collection: 'projects',
    where: {
      and: [
        { id: { not_equals: project.id } },
        { _status: { equals: 'published' } },
        {
          or: [
            ...(project.industry ? [{ industry: { equals: project.industry } }] : []),
            ...(typeof project.service === 'object' && project.service?.id
              ? [{ service: { equals: project.service.id } }]
              : []),
          ],
        },
      ],
    },
    sort: 'order',
    limit: 3,
  });

  // Prev/Next case (sorted by `order`, restricted to same kind so client-cases nav within client, studio-products within studio)
  const currentOrder = project.order ?? 0;
  const [prevRes, nextRes] = await Promise.all([
    payload.find({
      collection: 'projects',
      where: {
        and: [
          { _status: { equals: 'published' } },
          { kind: { equals: project.kind } },
          { order: { less_than: currentOrder } },
        ],
      },
      sort: '-order',
      limit: 1,
    }),
    payload.find({
      collection: 'projects',
      where: {
        and: [
          { _status: { equals: 'published' } },
          { kind: { equals: project.kind } },
          { order: { greater_than: currentOrder } },
        ],
      },
      sort: 'order',
      limit: 1,
    }),
  ]);
  const prevCase = (prevRes.docs[0] as any) || null;
  const nextCase = (nextRes.docs[0] as any) || null;

  return (
    <SectionShell>
      {hasStory(project) ? (
        <ProjectStory project={project} mode="page" />
      ) : project.kind === 'client' ? (
        <ClientCaseDetail project={project} />
      ) : (
        <StudioProductDetail project={project} />
      )}
      <PrevNext
        contextLabel={project.kind === 'client' ? 'Studi kasus klien lainnya' : 'Produk studio lainnya'}
        prev={
          prevCase
            ? {
                href: `/work/${prevCase.slug}`,
                label: prevCase.client,
                meta: prevCase.meta || prevCase.publishedYear || '',
              }
            : null
        }
        next={
          nextCase
            ? {
                href: `/work/${nextCase.slug}`,
                label: nextCase.client,
                meta: nextCase.meta || nextCase.publishedYear || '',
              }
            : null
        }
      />
      <RelatedGrid heading={project.kind === 'client' ? 'Kasus serupa' : 'Karya serupa'} type="projects" items={relatedRaw as any[]} />
      {/* Contact CTA strip */}
      <section className="py-20 bg-paper-50 border-t border-paper-200">
        <div className="max-w-[1180px] mx-auto px-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-mist-600">
              {project.kind === 'client' ? 'Butuh sistem seperti ini?' : 'Menjalankan usaha serupa?'}
            </span>
            <p className="text-[24px] font-bold tracking-[-0.015em] mt-2">
              Mulai dari konsultasi gratis 30 menit.
            </p>
          </div>
          <a
            href="/#contact"
            className="h-12 px-5 rounded-md bg-electric text-paper text-sm font-semibold inline-flex items-center hover:bg-[#2562E0] transition-colors"
          >
            Ceritakan kebutuhan Anda →
          </a>
        </div>
      </section>
    </SectionShell>
  );
}
