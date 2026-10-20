import { Meta } from './ui/Meta';

/** Section head copy as stored on a page block. Every field is optional; components keep a default. */
export type SectionHeadCopy = {
  sectionMarker?: string | null;
  category?: string | null;
  description?: string | null;
  heading?: string | null;
  lede?: string | null;
};

type Props = {
  marker: string;
  category: string;
  /** @deprecated description removed from homepage section markers per design */
  description?: string;
  heading: string;
  lede?: string;
  className?: string;
};

export function SectionHead({ marker, category, heading, lede, className = '' }: Props) {
  return (
    <div className={`reveal-stagger ${className}`}>
      <Meta
        parts={[marker, category]}
        dotClassName="text-mist-400"
        className="font-mono text-xs font-medium tracking-wider text-mist-600 uppercase tabular"
      />
      <h2 className="text-[clamp(40px,5vw,64px)] leading-none tracking-[-0.02em] font-bold mt-[18px] max-w-[880px]">
        {heading}
      </h2>
      {lede && (
        <p className="mt-6 text-[18px] leading-[1.5] text-mist-600 max-w-[620px]">{lede}</p>
      )}
    </div>
  );
}
