import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { cache } from 'react';
import { getPayload } from 'payload';
import config from '@payload-config';
import { SectionShell } from '../../../_components/detail/SectionShell';
import { SESSIONS } from '@/lib/opsscore/api';
import { SHARE_CTA_QUERY, ogImagePath, productPath } from '@/lib/opsscore/config';
import { PHASE_COPY, RESULT_COPY, SHARE_COPY } from '@/lib/opsscore/copy';
import type { Scores } from '@/lib/opsscore/scoring';
import { AreaScoreList } from '../../_components/AreaScoreList';
import { PersonaArt, PersonaKey, PersonaTitle, PersonaTraits } from '../../_components/PersonaHero';
import { PhaseLadder } from '../../_components/PhaseLadder';

import { Meta } from '../../../_components/ui/Meta';
export const dynamic = 'force-dynamic';

const SLUG = /^[a-z2-9]{8}$/;

/** Public page: reads scores only. Contact details live in assessment-leads and are never touched here. */
const findSharedScores = cache(async (slug: string): Promise<Scores | null> => {
  if (!SLUG.test(slug)) return null;
  const payload = await getPayload({ config });
  const { docs } = await payload.find({
    collection: SESSIONS,
    where: { shareSlug: { equals: slug } },
    select: { scores: true },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  });
  return (docs[0]?.scores as Scores | undefined) ?? null;
});

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const scores = await findSharedScores(slug);
  if (!scores) return { robots: { index: false, follow: false } };
  const phase = PHASE_COPY[scores.phase];
  const title = SHARE_COPY.metaTitle(`${phase.title}: ${phase.nickname}`);
  const images = [{ url: ogImagePath(scores.phase), width: 1200, height: 630, alt: phase.title }];
  return {
    metadataBase: process.env.NEXT_PUBLIC_SERVER_URL ? new URL(process.env.NEXT_PUBLIC_SERVER_URL) : undefined,
    title,
    description: phase.key,
    alternates: { canonical: productPath(`/r/${slug}`) },
    openGraph: { title, description: phase.key, images },
    twitter: { card: 'summary_large_image', title, description: phase.key, images },
  };
}

export default async function SharedResultPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const scores = await findSharedScores(slug);
  if (!scores) notFound();

  return (
    <SectionShell>
      <main>
        <section className="relative overflow-hidden pt-12 lg:pt-16 pb-16 lg:pb-24">
          <div
            aria-hidden
            className="absolute inset-0 opacity-40 pointer-events-none bg-cover bg-center"
            style={{ backgroundImage: 'url(/assets/bg-grid-clean.png)' }}
          />
          {/* Phones read top to bottom. Desktop pairs each row: the persona with its portrait, the key sentence
              with its traits, and the phase ladder with the area scores. */}
          <div className="relative max-w-[1180px] mx-auto px-8 grid grid-cols-1 gap-y-6 lg:grid-cols-2 lg:gap-x-20 lg:gap-y-10">
            <div className="lg:col-start-1 lg:row-start-1">
              <span className="font-mono text-xs font-medium tracking-wider text-mist-600 uppercase tabular">
                <Meta parts={SHARE_COPY.marker} />
              </span>
              <p className="mt-8 mb-0 text-[11px] font-semibold uppercase tracking-[0.18em] text-mist-600">
                {SHARE_COPY.scoreLabel}
              </p>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-[104px] sm:text-[128px] font-bold leading-[0.9] tracking-[-0.045em] tabular">
                  {scores.total}
                </span>
                <span className="text-[18px] text-mist-600 tabular">{RESULT_COPY.outOf}</span>
              </div>
              <PersonaTitle phase={scores.phase} className="mt-8" />
            </div>
            <PersonaArt
              phase={scores.phase}
              className="w-full max-w-[360px] sm:max-w-[420px] lg:col-start-2 lg:row-start-1 lg:self-end lg:justify-self-end"
            />
            <PersonaKey phase={scores.phase} className="lg:col-start-1 lg:row-start-2" />
            <PersonaTraits phase={scores.phase} className="max-w-[520px] lg:max-w-none lg:col-start-2 lg:row-start-2" />
            <div className="mt-2 lg:mt-0 lg:col-start-1 lg:row-start-3">
              <PhaseLadder phase={scores.phase} className="max-w-[520px]" animate />
              <div className="mt-10 flex flex-col gap-3">
                <a
                  href={productPath(SHARE_CTA_QUERY)}
                  className="self-start h-[52px] px-[22px] rounded-md bg-electric text-paper text-[15px] font-semibold inline-flex items-center gap-2 hover:bg-[#2562E0] transition-colors"
                >
                  {SHARE_COPY.cta}
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <path d="M5 12h14M13 5l7 7-7 7" />
                  </svg>
                </a>
                <span className="text-[13px] text-mist-600">{SHARE_COPY.ctaNote}</span>
              </div>
            </div>
            <div className="mt-6 lg:mt-0 lg:col-start-2 lg:row-start-3">
              <h2 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-mist-600 m-0">
                {RESULT_COPY.areasTitle}
              </h2>
              <AreaScoreList areas={scores.areas} className="mt-6" animate />
            </div>
          </div>
        </section>
      </main>
    </SectionShell>
  );
}
