import { getPayload } from 'payload';
import config from '@payload-config';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { SectionShell } from '../../_components/detail/SectionShell';
import { Breadcrumbs } from '../../_components/detail/Breadcrumbs';
import { ProseRenderer } from '../../_components/detail/ProseRenderer';
import { RelatedGrid } from '../../_components/detail/RelatedGrid';
import { Badge } from '../../_components/ui/Badge';
import { Icon, type IconName } from '@/lib/icons';
import { ServiceViz } from '../../_components/ui/ServiceViz';

export const dynamic = 'force-dynamic';

export async function generateStaticParams() {
  try {
    const payload = await getPayload({ config });
    const { docs } = await payload.find({
      collection: 'services',
      limit: 100,
      depth: 0,
      select: { slug: true },
    });
    return docs.map((d: any) => ({ slug: d.slug }));
  } catch (err) {
    console.warn('[services] generateStaticParams: DB unavailable, deferring to runtime', err);
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const payload = await getPayload({ config });
  const { docs } = await payload.find({ collection: 'services', where: { slug: { equals: slug } }, limit: 1 });
  const s = docs[0] as any;
  if (!s) return { title: 'Not found | Coderoach Studio' };
  return {
    title: `${s.title} | Coderoach Studio`,
    description: s.heroLede || s.tagline,
  };
}

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const payload = await getPayload({ config });

  const { docs } = await payload.find({
    collection: 'services',
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 2,
  });
  const service = docs[0] as any;
  if (!service) notFound();

  // Related projects: those that have this service as primary, or manually curated
  let relatedProjects: any[] = [];
  if (service.caseStudies && service.caseStudies.length > 0) {
    relatedProjects = service.caseStudies;
  } else {
    const { docs: byService } = await payload.find({
      collection: 'projects',
      where: {
        and: [{ service: { equals: service.id } }, { _status: { equals: 'published' } }],
      },
      sort: 'order',
      limit: 4,
      depth: 1,
    });
    relatedProjects = byService;
  }

  return (
    <SectionShell>
      {/* Hero — split layout (60/40) */}
      <section className="pt-12 pb-20 border-b border-paper-200">
        <div className="max-w-[1180px] mx-auto px-8">
          <div className="mb-10">
            <Breadcrumbs
              items={[
                { label: 'Home', href: '/' },
                { label: 'Services' },
                { label: service.title },
              ]}
            />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-16 items-start">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <Badge variant="electric">{service.tag}</Badge>
              </div>
              <h1 className="text-[clamp(48px,7vw,88px)] font-bold tracking-[-0.03em] leading-[0.95] mb-6">
                {service.title}
              </h1>
              <p className="text-[24px] leading-[1.35] text-ink font-medium mb-6 max-w-[20ch] text-balance">
                {service.tagline}
              </p>
              <p className="text-[18px] leading-[1.6] text-mist-600 max-w-[520px] text-pretty">
                {service.heroLede || service.blurb}
              </p>
              {service.pricingNote && (
                <div className="mt-8 inline-flex items-center gap-3 px-4 py-2.5 rounded-md bg-paper-50 border border-paper-200">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-electric">Pricing</span>
                  <span className="text-[13px] text-mist-600">{service.pricingNote}</span>
                </div>
              )}
            </div>
            {/* Right: large icon + stack chips */}
            <aside className="lg:sticky lg:top-24 self-start">
              <div className="bg-paper-50 border border-paper-200 rounded-3xl p-10 lg:p-12 aspect-square shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] flex flex-col gap-6 justify-between">
                <div className="flex items-center justify-between">
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-electric/[0.08] text-electric border border-electric/20">
                    <Icon name={service.icon as IconName} size={28} />
                  </div>
                  <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-mist-500">
                    Live
                  </span>
                </div>
                <div className="flex-1 flex items-center justify-center">
                  <div className="w-full text-shadow-700">
                    <ServiceViz variant={service.icon as 'build' | 'automate' | 'intelligence' | 'augment'} tone="light" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-mist-600">
                  <div>
                    <div className="text-[28px] font-bold tracking-[-0.025em] text-electric leading-none mb-1 tabular">
                      {service.list?.length || 0}
                    </div>
                    Capabilities
                  </div>
                  <div>
                    <div className="text-[28px] font-bold tracking-[-0.025em] text-ink leading-none mb-1 tabular">
                      {service.stack?.length || 0}
                    </div>
                    Stack tools
                  </div>
                </div>
              </div>
              <div className="mt-6">
                <h3 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-mist-600 mb-3">
                  Stack
                </h3>
                <div className="flex flex-wrap gap-2">
                  {(service.stack || []).map((s: any) => (
                    <Badge key={s.tech}>{s.tech}</Badge>
                  ))}
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* What you get — checklist style from .list field */}
      {service.list && service.list.length > 0 && (
        <section className="py-20">
          <div className="max-w-[1180px] mx-auto px-8">
            <h2 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-mist-600 mb-8">
              What you get
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 max-w-[920px]">
              {service.list.map((l: any, i: number) => (
                <div key={i} className="flex items-start gap-4 pb-6 border-b border-paper-200">
                  <span className="font-mono text-[11px] tracking-wider text-mist-600 mt-1.5 w-6 shrink-0 tabular">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span className="text-[18px] leading-[1.45] font-medium text-ink">
                    {l.item}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Long-form prose */}
      {service.richContent && (
        <section className="py-16 bg-paper-50 border-y border-paper-200">
          <div className="max-w-[1180px] mx-auto px-8">
            <h2 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-mist-600 mb-10">
              Cara kami menjalankan proyek {service.title}
            </h2>
            <ProseRenderer data={service.richContent} />
          </div>
        </section>
      )}

      {/* Sample work — related projects */}
      {relatedProjects.length > 0 && (
        <RelatedGrid heading={`${service.title} in practice`} type="projects" items={relatedProjects} />
      )}

      {/* Service-scoped FAQ */}
      {service.serviceFAQ && service.serviceFAQ.length > 0 && (
        <section className="py-20 bg-paper-50 border-t border-paper-200">
          <div className="max-w-[880px] mx-auto px-8">
            <h2 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-mist-600 mb-8">
              Questions about {service.title}
            </h2>
            <div className="border-t border-ink">
              {service.serviceFAQ.map((q: any, i: number) => (
                <details key={i} open={i === 0} className="border-b border-paper-200 py-6 group">
                  <summary
                    className="list-none cursor-pointer grid items-baseline gap-6"
                    style={{ gridTemplateColumns: '76px 1fr 24px' }}
                  >
                    <span className="font-mono text-xs text-mist-600 group-open:text-electric tracking-wider whitespace-nowrap tabular">
                      [ Q.{String(i + 1).padStart(2, '0')} ]
                    </span>
                    <span className="text-[20px] font-semibold tracking-[-0.01em] leading-snug">
                      {q.question}
                    </span>
                    <span className="font-mono text-mist-500 group-open:text-electric text-right text-[22px] leading-none transition-transform duration-[280ms] group-open:rotate-45 ease-[var(--ease-out-quint)]">
                      +
                    </span>
                  </summary>
                  <div className="text-base leading-[1.55] text-mist-600 max-w-[760px] mt-3.5 pl-[100px] pr-6 group-open:animate-faq-in">
                    {q.answer}
                  </div>
                </details>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Contact CTA — pre-fills scope */}
      <section className="py-20 bg-ink text-paper" data-theme="dark">
        <div className="max-w-[1180px] mx-auto px-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-mist-500">
              Ready to ship {service.title}?
            </span>
            <p className="text-[28px] font-bold tracking-[-0.015em] mt-3 text-paper">
              Tell us what you're trying to ship.
            </p>
          </div>
          <a
            href={`/#contact?scope=${service.title}`}
            className="h-12 px-5 rounded-md bg-electric text-paper text-sm font-semibold inline-flex items-center hover:bg-[#2562E0] transition-colors"
          >
            Start a 48-hour discovery <span aria-hidden>→</span>
          </a>
        </div>
      </section>
    </SectionShell>
  );
}
