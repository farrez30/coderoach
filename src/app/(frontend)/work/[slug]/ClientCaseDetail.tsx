import { Badge } from '../../_components/ui/Badge';
import { CodeLine } from '../../_components/ui/CodeLine';
import { Breadcrumbs } from '../../_components/detail/Breadcrumbs';
import { ProseRenderer } from '../../_components/detail/ProseRenderer';
import { PayloadImage } from '../../_components/ui/PayloadImage';
import { ProjectCover } from '../../_components/archive/ProjectCover';

type Project = any;

export function ClientCaseDetail({ project }: { project: Project }) {
  // featuredDetails carries default badge labels on every project, so only the featured one may use it.
  const fd = project.featured ? project.featuredDetails : null;
  const cover = project.coverImage;
  return (
    <main>
      {/* Hero — dark cinematic */}
      <section className="relative bg-ink text-paper overflow-hidden isolate" data-theme="dark">
        <div
          aria-hidden
          className="absolute inset-0 -z-[1] bg-cover opacity-[0.18] pointer-events-none"
          style={{ backgroundImage: 'url(/assets/texture-halftone-corner.png)', backgroundPosition: 'right top' }}
        />
        <div className="max-w-[1180px] mx-auto px-8 pt-12 pb-20 relative z-[1]">
          <div className="mb-10">
            <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Work', href: '/work' }, { label: project.client }]} />
          </div>
          <div className="flex gap-2 flex-wrap mb-5">
            {fd ? (
              <>
                {fd.badgeLabel && <Badge variant="dark">{fd.badgeLabel}</Badge>}
                {fd.shippedLabel && <Badge variant="success">{fd.shippedLabel}</Badge>}
              </>
            ) : (
              <>
                <Badge variant="dark">CLIENT CASE</Badge>
                {project.publishedYear && <Badge variant="success">{`SHIPPED ${project.publishedYear}`}</Badge>}
              </>
            )}
          </div>
          {(fd?.metaLine || project.meta) && (
            <span className="block font-mono text-[11px] uppercase tracking-wider text-mist-500 mb-4 tabular">
              {fd?.metaLine || project.meta}
            </span>
          )}
          <h1 className="text-[clamp(40px,5.5vw,72px)] font-bold tracking-[-0.025em] leading-[1.05] my-6 max-w-[20ch] text-balance">
            {fd?.headline || `${project.client}: ${project.tagline}`}
          </h1>
          {(fd?.description || project.excerpt) && (
            <p className="text-[19px] leading-[1.55] text-mist-400 max-w-[640px] mb-10 text-pretty">
              {fd?.description || project.excerpt}
            </p>
          )}
          {fd?.metrics && fd.metrics.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mt-10 pt-10 border-t border-shadow-700 tabular">
              {fd.metrics.map((m: any, i: number) => (
                <div key={i}>
                  <div className="text-[56px] font-bold tracking-[-0.025em] leading-none">
                    {m.num}
                    {m.accent && <span className="text-electric">{m.accent}</span>}
                  </div>
                  <div className="font-mono text-[11px] text-mist-500 tracking-wider mt-2">{m.label}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Cover — the uploaded image at its own proportions, or a placeholder until there is one */}
      <section className="pt-12 lg:pt-16">
        <div className="max-w-[1180px] mx-auto px-8">
          <div
            className="relative rounded-2xl overflow-hidden border border-paper-200 bg-paper-100"
            style={{ aspectRatio: cover?.url && cover.width && cover.height ? `${cover.width} / ${cover.height}` : '3 / 1' }}
          >
            <ProjectCover project={project} variant="hero" priority sizesAttr="(min-width: 1180px) 1116px, 100vw" />
          </div>
        </div>
      </section>

      {/* Body — split layout: prose + code panel sticky */}
      <section className="py-20">
        <div className="max-w-[1180px] mx-auto px-8 grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-16">
          <div>
            {project.richContent ? (
              <ProseRenderer data={project.richContent} />
            ) : (
              <div className="text-mist-600 italic">
                Full case study coming soon. In the meantime,{' '}
                <a href="/#contact" className="text-electric underline underline-offset-2">
                  get in touch
                </a>{' '}
                if you'd like to hear how we shipped this.
              </div>
            )}
          </div>
          <aside className="lg:sticky lg:top-24 self-start space-y-6">
            {fd?.codePanel?.lines?.length > 0 && (
              <div className="bg-shadow-900 text-paper border border-shadow-700 rounded-lg px-[22px] py-5 font-mono text-[13px] leading-[1.7] overflow-hidden tabular">
                <div className="text-mist-600 mb-2 flex justify-between">
                  <span>{fd.codePanel.tag}</span>
                  <span>{fd.codePanel.path}</span>
                </div>
                {fd.codePanel.lines.map((l: any, i: number) => (
                  <div key={i} className="flex">
                    <span className="text-mist-600 inline-block w-[22px]">{i + 1}</span>
                    <CodeLine line={l.line} />
                  </div>
                ))}
              </div>
            )}
            <div className="border border-paper-200 rounded-lg p-6">
              <h3 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-mist-600 mb-4">
                Stack
              </h3>
              <div className="flex flex-wrap gap-2">
                {(fd?.stack?.length ? fd.stack : project.pills || []).map((s: any) => (
                  <Badge key={s.tech || s.pill}>{s.tech || s.pill}</Badge>
                ))}
              </div>
            </div>
            {project.testimonial?.quote && (
              <blockquote className="border-l-2 border-electric pl-5 py-3">
                <p className="text-[16px] leading-[1.5] text-ink m-0">"{project.testimonial.quote}"</p>
                <footer className="font-mono text-[11px] uppercase tracking-wider text-mist-600 mt-3 tabular">
                  — {project.testimonial.author}, {project.testimonial.role}
                </footer>
              </blockquote>
            )}
          </aside>
        </div>
      </section>

      {/* Gallery — full bleed if exists */}
      {project.gallery && project.gallery.length > 0 && (
        <section className="py-12 bg-paper-50 border-y border-paper-200">
          <div className="max-w-[1180px] mx-auto px-8">
            <h2 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-mist-600 mb-6">
              Gallery
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {project.gallery.map((g: any, i: number) => (
                <figure key={i} className="rounded-lg overflow-hidden border border-paper-200 bg-paper-100">
                  {g.image?.url && (
                    <PayloadImage
                      media={g.image}
                      variant="card"
                      alt={g.image.alt || ''}
                      sizesAttr="(min-width: 768px) 50vw, 100vw"
                      className="w-full h-auto"
                    />
                  )}
                  {g.caption && (
                    <figcaption className="px-4 py-3 font-mono text-xs uppercase tracking-wider text-mist-600 tabular">
                      {g.caption}
                    </figcaption>
                  )}
                </figure>
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
