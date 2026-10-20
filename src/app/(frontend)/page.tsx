/**
 * Homepage — renders the Page document with slug "home" via BlockRenderer.
 * If no "home" Page exists yet (fresh install before seed), shows a friendly placeholder.
 */
import { getPayload } from 'payload';
import config from '@payload-config';
import { draftMode } from 'next/headers';
import { TopBar } from './_components/TopBar';
import { Nav } from './_components/Nav';
import { Footer } from './_components/Footer';
import { BlockRenderer } from './_components/blocks/BlockRenderer';
import { InteractionsClient } from './_components/InteractionsClient';
import { BackToTop } from './_components/BackToTop';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const payload = await getPayload({ config });
  const { isEnabled: isDraftMode } = await draftMode();

  const [topBar, siteSettings, pageRes] = await Promise.all([
    payload.findGlobal({ slug: 'top-bar' }).catch(() => null),
    payload.findGlobal({ slug: 'site-settings', depth: 1 }).catch(() => null),
    payload
      .find({
        collection: 'pages',
        where: { slug: { equals: 'home' } },
        limit: 1,
        depth: 2,
        draft: isDraftMode,
        overrideAccess: isDraftMode,
      })
      .catch(() => ({ docs: [] })),
  ]);

  const homePage = (pageRes.docs?.[0] as any) || null;

  return (
    <>
      <TopBar data={topBar as any} />
      <Nav data={siteSettings as any} />
      {homePage ? (
        <BlockRenderer blocks={homePage.layout || []} />
      ) : (
        <main className="min-h-[60vh] grid place-items-center">
          <div className="max-w-[640px] mx-auto px-8 text-center">
            <span className="font-mono text-xs uppercase tracking-wider text-mist-600 mb-4 block">
              [ NO HOME PAGE FOUND ]
            </span>
            <h1 className="text-[clamp(36px,5vw,56px)] font-bold tracking-[-0.02em] mb-4">
              Welcome, almost there.
            </h1>
            <p className="text-[16px] leading-[1.55] text-mist-600 mb-6">
              Create a Page with slug <code className="font-mono text-ink bg-paper-100 px-1.5 py-0.5 rounded">home</code> in the admin to render this homepage.
            </p>
            <a
              href="/admin/collections/pages/create"
              className="h-12 px-5 rounded-md bg-electric text-paper text-sm font-semibold inline-flex items-center hover:bg-[#2562E0] transition-colors"
            >
              Open admin <span aria-hidden>→</span>
            </a>
          </div>
        </main>
      )}
      <Footer data={siteSettings as any} />
      <InteractionsClient />
      <BackToTop />
    </>
  );
}
