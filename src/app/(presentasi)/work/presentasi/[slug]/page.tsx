import { notFound } from 'next/navigation';
import { getProject } from '@/lib/portfolio/queries';
import { ClientCaseDetail } from '../../../../(frontend)/work/[slug]/ClientCaseDetail';
import { StudioProductDetail } from '../../../../(frontend)/work/[slug]/StudioProductDetail';
import { hasStory, ProjectStory } from '../../../../(frontend)/work/_story/ProjectStory';
import { presentableProjects } from '../_components/data';
import { Presenter } from '../_components/Presenter';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const project = await getProject((await params).slug);
  return { title: project ? `${project.client} | Presentasi` : 'Presentasi' };
}

/**
 * One project inside the presentation: the same page as /work/<slug> under the worker's scope, so
 * it opens offline, with a slim bar to step through the projects instead of the site's nav.
 */
export default async function PresentasiProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [project, all] = await Promise.all([getProject(slug), presentableProjects()]);
  if (!project || project._status !== 'published') notFound();
  const at = all.findIndex((p) => p.slug === slug);
  const href = (i: number) => (all[i] ? `/work/presentasi/${all[i].slug}` : null);
  const prev = href(at - 1);
  const next = href(at + 1);
  const link =
    'h-8 px-3 rounded-md inline-flex items-center font-mono text-[11px] uppercase tracking-wider text-mist-500 hover:text-paper focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-electric';

  return (
    <>
      <nav aria-label="Presentasi" className="sticky top-0 z-40 flex items-center justify-between gap-3 px-4 sm:px-8 h-12 bg-ink/95 text-paper">
        <a href="/work/presentasi" className={link}>
          <span aria-hidden>←&nbsp;</span>Semua proyek (Esc)
        </a>
        <div className="flex items-center gap-1">
          {prev && (
            <a href={prev} className={link} aria-label="Proyek sebelumnya">
              ←
            </a>
          )}
          <span className="font-mono text-[11px] uppercase tracking-wider text-mist-500 tabular px-1">
            {String(at + 1).padStart(2, '0')} / {String(all.length).padStart(2, '0')}
          </span>
          {next && (
            <a href={next} className={link} aria-label="Proyek berikutnya">
              →
            </a>
          )}
          <span className="hidden sm:inline-flex ml-2">
            <Presenter back="/work/presentasi" prev={prev} next={next} />
          </span>
        </div>
      </nav>
      {hasStory(project) ? (
        <ProjectStory project={project} mode="present" />
      ) : project.kind === 'client' ? (
        <ClientCaseDetail project={project} />
      ) : (
        <StudioProductDetail project={project} />
      )}
    </>
  );
}
