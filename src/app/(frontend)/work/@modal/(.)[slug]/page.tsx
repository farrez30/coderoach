import { getProject } from '@/lib/portfolio/queries';
import { ClientCaseDetail } from '../../[slug]/ClientCaseDetail';
import { StudioProductDetail } from '../../[slug]/StudioProductDetail';
import { hasStory, ProjectStory } from '../../_story/ProjectStory';
import { ProjectOverlay } from './ProjectOverlay';

export const dynamic = 'force-dynamic';

/** A project opened from the catalog: the same view as /work/<slug>, on top of the grid. */
export default async function ProjectOverlayPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = (await getProject(slug)) as any;

  if (!project) {
    return (
      <ProjectOverlay slug={slug} title="Proyek tidak ditemukan">
        <div className="max-w-[640px] mx-auto px-8 py-24">
          <p className="text-[24px] font-bold tracking-tight m-0 mb-2">Proyek ini tidak ada, atau belum tayang.</p>
          <a href="/work" className="text-electric underline underline-offset-2">
            Kembali ke daftar karya
          </a>
        </div>
      </ProjectOverlay>
    );
  }

  return (
    <ProjectOverlay slug={slug} title={project.client}>
      {hasStory(project) ? (
        <ProjectStory project={project} mode="overlay" />
      ) : project.kind === 'client' ? (
        <ClientCaseDetail project={project} as="div" />
      ) : (
        <StudioProductDetail project={project} as="div" />
      )}
    </ProjectOverlay>
  );
}
