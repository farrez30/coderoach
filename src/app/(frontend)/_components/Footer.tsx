import { FooterCopyLink } from './FooterCopyLink';
import { Meta } from './ui/Meta';

type FooterData = {
  siteName?: string | null;
  logo?: { url?: string | null; alt?: string | null } | null;
  logoDark?: { url?: string | null; alt?: string | null } | null;
  footer?: {
    tagline?: string | null;
    badge?: string | null;
    columns?: Array<{
      heading: string;
      links: Array<{ label: string; href: string }>;
    }> | null;
    metaLine?: { left?: string | null; right?: string | null } | null;
  } | null;
};

export function Footer({ data }: { data: FooterData | null }) {
  const siteName = data?.siteName || 'Studio';
  // Prefer logoDark for the dark footer; fall back to logo (auto-inverted) or static asset.
  const logoUrl = data?.logoDark?.url || data?.logo?.url;
  const useInvert = !data?.logoDark?.url;
  const parts = siteName.trim().split(/\s+/);
  const line1 = parts[0] ?? siteName;
  const line2 = parts.slice(1).join(' ');
  return (
    <footer className="bg-ink text-paper pt-6 pb-7">
      <div className="max-w-[1180px] mx-auto px-8">
        <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr_1fr] gap-12 pt-12">
          <div>
            <div className="flex items-center gap-[10px] mb-[18px]">
              {logoUrl ? (
                <img
                  src={logoUrl}
                  alt=""
                  className={`h-8 w-auto ${useInvert ? 'invert-[0.96]' : ''}`}
                />
              ) : (
                <img src="/assets/coderoach_logo.svg" alt="" className="h-8 w-auto invert-[0.96]" />
              )}
              <span className="flex flex-col leading-none tracking-[-0.02em] gap-[2px] text-paper">
                <span className="font-sans text-[14px] font-semibold lowercase">{line1}</span>
                {line2 && <span className="font-sans text-[14px] font-normal lowercase">{line2}</span>}
              </span>
            </div>
            {data?.footer?.tagline && (
              <p className="text-[13px] text-mist-500 leading-[1.5] max-w-[280px] m-0 mb-4">
                {data.footer.tagline}
              </p>
            )}
          </div>
          {data?.footer?.columns?.map((col, i) => (
            <div key={i}>
              <h5 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-mist-500 m-0 mb-3.5">
                {col.heading}
              </h5>
              <ul className="list-none p-0 m-0 flex flex-col gap-2.5">
                {col.links.map((l, j) => (
                  <li key={j}>
                    <FooterCopyLink
                      href={l.href}
                      label={l.label}
                      className="text-sm text-paper hover:text-electric transition-colors"
                    />
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        {data?.footer?.metaLine && (data.footer.metaLine.left || data.footer.metaLine.right) && (
          <div className="mt-14 pt-6 border-t border-shadow-700 flex justify-between flex-wrap gap-4 font-mono text-[11px] text-mist-500 tracking-wide tabular">
            <Meta parts={data.footer.metaLine.left} />
            <Meta parts={data.footer.metaLine.right} />
          </div>
        )}
      </div>
    </footer>
  );
}
