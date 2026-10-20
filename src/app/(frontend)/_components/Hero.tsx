import { MarqueePause } from './MarqueePause';
import { OpsConsole } from './OpsConsole';
import { OctagonMark } from './ui/OctagonMark';
import { stripArrow } from './ui/CtaLabel';
import { Meta } from './ui/Meta';

type HeroData = {
  pillText?: string | null;
  headline?: { lead?: string | null; accent?: string | null } | null;
  lede?: string | null;
  ctaPrimary?: { label?: string | null; href?: string | null } | null;
  ctaSecondary?: { label?: string | null; href?: string | null } | null;
  metaItems?: Array<{ value?: string | null; label?: string | null }> | null;
  trustedBy?: { label?: string | null; tagline?: string | null } | null;
};

type Client = {
  name: string;
  logo?: { url?: string | null; alt?: string | null } | null;
  website?: string | null;
};

export function Hero({ data, clients }: { data: HeroData | null; clients: Client[] }) {
  return (
    <section id="top" className="relative pt-16 lg:pt-20 overflow-hidden">
      {/* Background grid */}
      <div
        className="absolute inset-0 opacity-55 pointer-events-none bg-cover bg-center"
        style={{ backgroundImage: 'url(/assets/bg-grid-clean.png)' }}
        data-hero-bg
      />

      {/* Octagon watermark — bleeds off top-right */}
      <div
        aria-hidden
        className="absolute -top-40 -right-40 lg:-right-48 text-mist-400 opacity-[0.08] pointer-events-none animate-octagon-drift"
      >
        <OctagonMark size={520} strokeWidth={1} />
      </div>

      {/* Main hero — split asymmetric */}
      <div className="relative z-[2] max-w-[1180px] mx-auto px-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-12 lg:gap-16 items-center">
          {/* Left: text content */}
          <div className="flex flex-col gap-6 lg:gap-7">
            {data?.pillText && (
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-paper-50 border border-paper-200 rounded-full text-[12px] font-medium text-ink shadow-sm self-start animate-hero-in opacity-0" style={{ animationDelay: '60ms' }}>
                <OctagonMark size={11} strokeWidth={1.6} className="text-electric shrink-0" />
                <Meta parts={data.pillText} />
              </span>
            )}
            {data?.headline && (
              <h1 className="text-[clamp(40px,5.5vw,72px)] leading-[1.02] tracking-[-0.03em] font-bold max-w-[16ch] text-balance animate-hero-in opacity-0" style={{ animationDelay: '160ms' }}>
                {data.headline.lead}{' '}
                <span className="text-electric">{data.headline.accent}</span>
              </h1>
            )}
            {data?.lede && (
              <p className="max-w-[520px] text-[18px] leading-[1.55] text-mist-600 animate-hero-in opacity-0" style={{ animationDelay: '280ms' }}>
                {data.lede}
              </p>
            )}
            <div className="flex gap-3 flex-wrap mt-2 animate-hero-in opacity-0" style={{ animationDelay: '380ms' }}>
              {data?.ctaPrimary?.href && (
                <a href={data.ctaPrimary.href} className="h-[52px] px-[22px] rounded-md bg-electric text-paper text-[15px] font-semibold inline-flex items-center gap-2 hover:bg-[#2562E0] transition-colors" data-cta-magnetic>
                  {stripArrow(data.ctaPrimary.label)}
                  <svg aria-hidden width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M13 5l7 7-7 7" />
                  </svg>
                </a>
              )}
              {data?.ctaSecondary?.href && (
                <a href={data.ctaSecondary.href} className="h-[52px] px-[22px] rounded-md bg-transparent text-ink border border-mist-400 text-[15px] font-semibold inline-flex items-center hover:bg-ink/[0.04] transition-colors">
                  {data.ctaSecondary.label}
                </a>
              )}
            </div>
            {data?.metaItems && data.metaItems.length > 0 && (
              <div className="flex gap-x-3.5 gap-y-2 items-center flex-wrap mt-4 text-[12px] tracking-[0.06em] text-mist-600 uppercase tabular animate-hero-in opacity-0" style={{ animationDelay: '480ms' }}>
                {data.metaItems.map((item, i) => (
                  <span key={i} className="contents">
                    {i > 0 && (
                      <span aria-hidden className="block w-px h-3.5 bg-mist-400/60" />
                    )}
                    <span>
                      <b className="text-ink font-bold">{item.value}</b> {item.label}
                    </span>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Right: Live Ops Console */}
          <div className="animate-hero-in opacity-0" style={{ animationDelay: '600ms' }}>
            <OpsConsole />
          </div>
        </div>
      </div>

      {/* Trusted-by marquee */}
      {clients.length > 0 && (
        <div className="mt-16 lg:mt-24 pt-12 pb-14 border-t border-paper-200 bg-paper-50" data-marquee>
          <div className="max-w-[1180px] mx-auto px-8">
            <div className="flex items-baseline gap-3.5 flex-wrap mb-7 text-sm text-mist-600 leading-snug">
              <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-ink">
                {data?.trustedBy?.label ?? 'Beberapa klien yang telah kami tangani'}
              </span>
              <p className="m-0">{data?.trustedBy?.tagline}</p>
              <MarqueePause />
            </div>
            <div className="flex overflow-hidden [mask-image:linear-gradient(90deg,transparent,black_5%,black_95%,transparent)]">
              {[0, 1].map((track) => (
                // The second track only exists to make the loop seamless: hidden from screen readers, and
                // inert so keyboard users don't tab through every client twice.
                <div
                  key={track}
                  className="marquee-track flex items-center gap-[72px] flex-shrink-0 pr-[72px] animate-marquee"
                  aria-hidden={track === 1 || undefined}
                  inert={track === 1}
                >
                  {clients.map((c, i) => {
                    const inner = c.logo?.url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={c.logo.url}
                        alt={c.logo.alt || c.name}
                        className="h-9 w-auto object-contain opacity-70 hover:opacity-100 transition-opacity"
                      />
                    ) : (
                      <span className="font-sans font-bold text-[32px] tracking-[-0.02em] text-mist-600 hover:text-ink transition-colors whitespace-nowrap">
                        {c.name}
                      </span>
                    );
                    return (
                      <div key={`${track}-${i}`} className="flex-shrink-0">
                        {c.website ? (
                          <a href={c.website} target="_blank" rel="noopener noreferrer" aria-label={c.name}>
                            {inner}
                          </a>
                        ) : (
                          inner
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
