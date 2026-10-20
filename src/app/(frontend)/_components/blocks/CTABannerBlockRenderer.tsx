import { CtaLabel } from '../ui/CtaLabel';

export function CTABannerBlockRenderer({ block }: { block: any }) {
  const dark = block?.tone !== 'light';
  return (
    <section
      className={`py-20 ${dark ? 'bg-ink text-paper' : 'bg-paper-50 border-y border-paper-200'}`}
      data-theme={dark ? 'dark' : undefined}
    >
      <div className="max-w-[1180px] mx-auto px-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          {block?.eyebrow && (
            <span className={`text-[11px] font-semibold uppercase tracking-[0.18em] ${dark ? 'text-mist-500' : 'text-mist-600'}`}>
              {block.eyebrow}
            </span>
          )}
          {block?.heading && (
            <p className={`text-[28px] font-bold tracking-[-0.015em] mt-2 text-balance ${dark ? 'text-paper' : 'text-ink'}`}>
              {block.heading}
            </p>
          )}
          {block?.description && (
            <p className={`text-[15px] leading-[1.55] mt-3 max-w-[60ch] ${dark ? 'text-mist-500' : 'text-mist-600'}`}>
              {block.description}
            </p>
          )}
        </div>
        {block?.cta?.href && (
          <a
            href={block.cta.href}
            className="h-12 px-5 rounded-md bg-electric text-paper text-sm font-semibold inline-flex items-center hover:bg-[#2562E0] transition-colors"
          >
            <CtaLabel label={block.cta.label || 'Get in touch'} />
          </a>
        )}
      </div>
    </section>
  );
}
