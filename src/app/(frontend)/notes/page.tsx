import { getPayload } from 'payload';
import config from '@payload-config';
import type { Metadata } from 'next';
import { SectionShell } from '../_components/detail/SectionShell';
import { Breadcrumbs } from '../_components/detail/Breadcrumbs';
import { PostCard } from '../_components/archive/PostCard';
import { CompactPostRow } from '../_components/archive/CompactPostRow';
import { Pagination } from '../_components/archive/Pagination';
import { Meta } from '../_components/ui/Meta';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Field Notes | Coderoach Studio | Engineering & Operations Notes',
  description: 'Notes from Coderoach Studio: engineering, operasi, dan praktik membangun software yang dipakai harian. Postgres, Next.js, otomasi, dan studi kasus produk.',
};

export default async function NotesArchivePage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const payload = await getPayload({ config });
  const { page: pageParam } = await searchParams;
  const page = parseInt(pageParam || '1', 10);

  const settings = (await payload.findGlobal({ slug: 'blog-settings' }).catch(() => null)) as any;
  const perPage = settings?.postsPerPage || 12;

  const { docs: posts, totalPages, totalDocs } = await payload.find({
    collection: 'posts',
    where: { _status: { equals: 'published' } },
    sort: '-publishedAt',
    limit: perPage,
    page,
    depth: 1,
    select: {
      slug: true,
      title: true,
      excerpt: true,
      category: true,
      author: true,
      publishedAt: true,
      readingTime: true,
      coverImage: true,
      featured: true,
    },
  });

  // Editorial split: explicit-featured OR fallback to first post
  const docs = posts as any[];
  const explicitFeatured = docs.find((p) => p.featured);
  const featured = page === 1 ? explicitFeatured || docs[0] : null;
  const compactRows = page === 1 && featured ? docs.filter((p) => p.id !== featured.id).slice(0, 4) : [];
  const compactIds = new Set(compactRows.map((p) => p.id));
  const featuredId = featured?.id;
  const gridPosts = docs.filter((p) => p.id !== featuredId && !compactIds.has(p.id));

  return (
    <SectionShell>
      <main>
        {/* Hero */}
        <section className="pt-12 pb-12 border-b border-paper-200">
          <div className="max-w-[1180px] mx-auto px-8">
            <div className="mb-8">
              <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Field Notes' }]} />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-12 items-end">
              <div>
                <span className="font-mono text-xs uppercase tracking-wider text-mist-600 inline-flex items-center gap-2 tabular">
                  {settings?.archiveHero?.sectionMarker || '[ FIELD NOTES / 01 ]'}
                </span>
                <h1 className="text-[clamp(40px,5vw,72px)] leading-[1.02] tracking-[-0.025em] font-bold mt-5 max-w-[18ch] text-balance">
                  {settings?.archiveHero?.heading || 'Notes from the studio.'}
                </h1>
              </div>
              <p className="text-[18px] leading-[1.55] text-mist-600 lg:justify-self-end max-w-[420px] text-pretty">
                {settings?.archiveHero?.lede || 'Engineering, operating, and the bits in between.'}
              </p>
            </div>
            <div className="mt-8 font-mono text-xs uppercase tracking-wider text-mist-600 tabular">
              <Meta
                parts={[
                  `${totalDocs} ${totalDocs === 1 ? 'post' : 'posts'}`,
                  `${totalPages} ${totalPages === 1 ? 'page' : 'pages'}`,
                ]}
              />
            </div>
          </div>
        </section>

        {/* Editorial split — featured big left + 4 compact rows right */}
        {featured && (
          <section className="py-12 bg-paper-50 border-b border-paper-200">
            <div className="max-w-[1180px] mx-auto px-8">
              <h2 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-mist-600 mb-6">
                Featured
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-8 lg:gap-12">
                {/* Featured big */}
                <PostCard post={featured} featured />
                {/* Compact rows */}
                {compactRows.length > 0 && (
                  <div className="flex flex-col">
                    <h3 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-mist-600 mb-3 lg:mb-2">
                      Also reading
                    </h3>
                    {compactRows.map((p) => (
                      <CompactPostRow key={p.id} post={p} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {/* Grid for remaining posts */}
        <section className="py-16">
          <div className="max-w-[1180px] mx-auto px-8">
            {gridPosts.length > 0 ? (
              <>
                <h2 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-mist-600 mb-6">
                  {page === 1 ? 'More notes' : `Page ${page}`}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 reveal-stagger">
                  {gridPosts.map((p) => (
                    <PostCard key={p.id} post={p} />
                  ))}
                </div>
              </>
            ) : !featured ? (
              <div className="py-32 text-center">
                <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-mist-600 mb-3 block">
                  Empty
                </span>
                <p className="text-[24px] font-bold tracking-tight text-ink">No posts yet.</p>
              </div>
            ) : null}

            <Pagination current={page} total={totalPages} basePath="/notes" />
          </div>
        </section>
      </main>
    </SectionShell>
  );
}
