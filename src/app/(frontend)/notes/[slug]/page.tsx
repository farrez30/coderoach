import { getPayload } from 'payload';
import config from '@payload-config';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { draftMode } from 'next/headers';
import { SectionShell } from '../../_components/detail/SectionShell';
import { Breadcrumbs } from '../../_components/detail/Breadcrumbs';
import { ProseRenderer } from '../../_components/detail/ProseRenderer';
import { AuthorChip } from '../../_components/detail/AuthorChip';
import { Badge } from '../../_components/ui/Badge';
import { RelatedGrid } from '../../_components/detail/RelatedGrid';
import { ReadingProgress } from '../../_components/detail/ReadingProgress';
import { TOCSidebar } from '../../_components/detail/TOCSidebar';
import { PrevNext } from '../../_components/detail/PrevNext';
import { PayloadImage } from '../../_components/ui/PayloadImage';

export const dynamic = 'force-dynamic';

const CATEGORY_LABELS = {
  engineering: 'Engineering',
  operating: 'Operating',
  studio: 'Studio',
  notes: 'Notes',
} as const;

const CATEGORY_VARIANTS = {
  engineering: 'electric',
  operating: 'success',
  studio: 'warning',
  notes: 'neutral',
} as const;

function formatDate(iso?: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { day: '2-digit', month: 'long', year: 'numeric' });
}

export async function generateStaticParams() {
  try {
    const payload = await getPayload({ config });
    const { docs } = await payload.find({
      collection: 'posts',
      where: { _status: { equals: 'published' } },
      limit: 1000,
      depth: 0,
      select: { slug: true },
    });
    return docs.map((d: any) => ({ slug: d.slug }));
  } catch (err) {
    console.warn('[posts] generateStaticParams: DB unavailable, deferring to runtime', err);
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
  const { docs } = await payload.find({
    collection: 'posts',
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 1,
  });
  const p = docs[0] as any;
  if (!p) return { title: 'Not found | Coderoach Studio' };
  return {
    title: `${p.title} | Field Notes | Coderoach Studio`,
    description: p.excerpt,
    openGraph: {
      title: p.title,
      description: p.excerpt,
      images: p.ogImage?.url || p.coverImage?.url ? [{ url: p.ogImage?.url || p.coverImage?.url }] : undefined,
      type: 'article',
      publishedTime: p.publishedAt,
    },
  };
}

export default async function PostDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { isEnabled: isDraftMode } = await draftMode();
  const payload = await getPayload({ config });

  const { docs } = await payload.find({
    collection: 'posts',
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 2,
    draft: isDraftMode,
    overrideAccess: isDraftMode,
  });
  const post = docs[0] as any;
  if (!post) notFound();

  // Related: same category, exclude current
  const { docs: related } = await payload.find({
    collection: 'posts',
    where: {
      and: [
        { id: { not_equals: post.id } },
        { _status: { equals: 'published' } },
        { category: { equals: post.category } },
      ],
    },
    sort: '-publishedAt',
    limit: 3,
    depth: 1,
  });

  // Prev/Next (chronological by publishedAt)
  const [prevRes, nextRes] = await Promise.all([
    post.publishedAt
      ? payload.find({
          collection: 'posts',
          where: {
            and: [
              { _status: { equals: 'published' } },
              { publishedAt: { less_than: post.publishedAt } },
            ],
          },
          sort: '-publishedAt',
          limit: 1,
        })
      : Promise.resolve({ docs: [] }),
    post.publishedAt
      ? payload.find({
          collection: 'posts',
          where: {
            and: [
              { _status: { equals: 'published' } },
              { publishedAt: { greater_than: post.publishedAt } },
            ],
          },
          sort: 'publishedAt',
          limit: 1,
        })
      : Promise.resolve({ docs: [] }),
  ]);
  const prev = (prevRes.docs[0] as any) || null;
  const next = (nextRes.docs[0] as any) || null;

  return (
    <SectionShell>
      <ReadingProgress targetSelector="article.post-body" />
      <main>
        {/* Hero — centered editorial */}
        <section className="pt-12 pb-12">
          <div className="max-w-[880px] mx-auto px-8 text-center">
            <div className="mb-10 flex justify-center">
              <Breadcrumbs
                items={[
                  { label: 'Home', href: '/' },
                  { label: 'Field Notes', href: '/notes' },
                  { label: post.title.length > 40 ? post.title.slice(0, 40) + '…' : post.title },
                ]}
              />
            </div>
            <div className="flex items-center justify-center gap-3 mb-6">
              <Badge variant={CATEGORY_VARIANTS[post.category as keyof typeof CATEGORY_VARIANTS]}>
                {CATEGORY_LABELS[post.category as keyof typeof CATEGORY_LABELS].toUpperCase()}
              </Badge>
              <span className="font-mono text-[11px] uppercase tracking-wider text-mist-600 tabular">
                {formatDate(post.publishedAt)}
              </span>
              {post.readingTime && (
                <>
                  <span className="text-mist-400">·</span>
                  <span className="font-mono text-[11px] uppercase tracking-wider text-mist-600 tabular">
                    {post.readingTime} min read
                  </span>
                </>
              )}
            </div>
            <h1 className="text-[clamp(36px,5vw,64px)] font-bold tracking-[-0.025em] leading-[1.05] mb-8 text-balance">
              {post.title}
            </h1>
            <p className="text-[20px] leading-[1.55] text-mist-600 max-w-[640px] mx-auto mb-10 text-pretty">
              {post.excerpt}
            </p>
            <div className="flex justify-center">
              <AuthorChip author={post.author} />
            </div>
          </div>
        </section>

        {/* Cover image */}
        {post.coverImage?.url && (
          <section className="pb-12">
            <div className="max-w-[1180px] mx-auto px-8">
              <div className="aspect-[16/9] rounded-2xl overflow-hidden bg-paper-100 border border-paper-200 relative">
                <PayloadImage
                  media={post.coverImage}
                  variant="hero"
                  alt={post.coverImage.alt || post.title}
                  priority
                  sizesAttr="(min-width: 1280px) 1180px, 100vw"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </section>
        )}

        {/* Article body — with TOC sidebar on xl+ screens */}
        <article className="post-body py-12">
          <div className="max-w-[1180px] mx-auto px-8 grid grid-cols-1 xl:grid-cols-[1fr_220px] xl:gap-12 justify-items-center xl:justify-items-stretch">
            <div className="max-w-[720px] xl:justify-self-end w-full">
              <ProseRenderer data={post.content} />
              {post.tags && post.tags.length > 0 && (
                <div className="mt-16 pt-8 border-t border-paper-200">
                  <h3 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-mist-600 mb-3">
                    Tags
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {post.tags.map((t: any) => (
                      <Badge key={t.tag}>#{t.tag}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <TOCSidebar targetSelector=".post-body .prose-coderoach" />
          </div>
        </article>

        {/* Author bio card */}
        {post.author && typeof post.author === 'object' && (post.author as any).bio && (
          <section className="py-12 bg-paper-50 border-y border-paper-200">
            <div className="max-w-[720px] mx-auto px-8">
              <div className="flex flex-col md:flex-row items-start gap-6 p-6 rounded-2xl bg-paper-50 border border-paper-200 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)]">
                <AuthorChip author={(post.author as any) || null} />
                <div className="flex-1">
                  <p className="text-[15px] leading-[1.55] text-mist-600 m-0">
                    {(post.author as any).bio}
                  </p>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Prev/Next post navigation */}
        <PrevNext
          contextLabel="Continue reading"
          prev={
            prev
              ? {
                  href: `/notes/${prev.slug}`,
                  label: prev.title,
                  meta: `${formatDate(prev.publishedAt)}${prev.readingTime ? ` · ${prev.readingTime} min` : ''}`,
                }
              : null
          }
          next={
            next
              ? {
                  href: `/notes/${next.slug}`,
                  label: next.title,
                  meta: `${formatDate(next.publishedAt)}${next.readingTime ? ` · ${next.readingTime} min` : ''}`,
                }
              : null
          }
        />

        {/* Related posts */}
        <RelatedGrid heading="More from this category" type="posts" items={related as any[]} />

        {/* CTA */}
        <section className="py-20 bg-ink text-paper" data-theme="dark">
          <div className="max-w-[1180px] mx-auto px-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-mist-500">
                Shipping something similar?
              </span>
              <p className="text-[28px] font-bold tracking-[-0.015em] mt-3 text-paper">
                Tell us what you're trying to ship.
              </p>
            </div>
            <a
              href="/#contact"
              className="h-12 px-5 rounded-md bg-electric text-paper text-sm font-semibold inline-flex items-center hover:bg-[#2562E0] transition-colors"
            >
              Start a 48-hour discovery <span aria-hidden>→</span>
            </a>
          </div>
        </section>
      </main>
    </SectionShell>
  );
}
