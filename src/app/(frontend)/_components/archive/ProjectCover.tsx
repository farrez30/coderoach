import { PayloadImage } from '../ui/PayloadImage';
import { Meta } from '../ui/Meta';

type CoverSource = {
  client: string;
  meta?: string | null;
  coverImage?: any;
};

type ProjectCoverProps = {
  project: CoverSource;
  /** Payload size to request for the image. */
  variant?: 'card' | 'hero';
  sizesAttr?: string;
  priority?: boolean;
  /** Classes for the <img>. Defaults to covering the box. */
  imageClassName?: string;
};

/**
 * Fills its positioned parent with the project's cover image, or with a drawn placeholder until
 * one is uploaded. The placeholder is decorative: the project name is always in the text beside it.
 */
export function ProjectCover({
  project,
  variant = 'card',
  sizesAttr,
  priority,
  imageClassName = 'object-cover',
}: ProjectCoverProps) {
  if (project.coverImage?.url) {
    return (
      <PayloadImage
        media={project.coverImage}
        variant={variant}
        alt={project.coverImage.alt || project.client}
        sizesAttr={sizesAttr}
        priority={priority}
        className={imageClassName}
        fill
      />
    );
  }
  return <CoverPlaceholder client={project.client} meta={project.meta} />;
}

const GRID =
  'linear-gradient(rgba(8,9,10,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(8,9,10,0.05) 1px, transparent 1px)';

/** Blueprint-style stand-in for a missing cover: the project name set large on the site's grid. */
export function CoverPlaceholder({ client, meta }: { client: string; meta?: string | null }) {
  return (
    <div
      aria-hidden
      className="absolute inset-0 overflow-hidden bg-paper-100"
      style={{
        containerType: 'inline-size',
        backgroundImage: GRID,
        backgroundSize: '28px 28px',
        backgroundPosition: '-1px -1px',
      }}
    >
      <span className="absolute bottom-3 left-3 w-3 h-3 border-l border-b border-ink/15" />
      <span className="absolute bottom-3 right-3 w-3 h-3 border-r border-b border-ink/15" />
      <div
        className="absolute inset-x-0 bottom-0 flex flex-col"
        style={{ padding: 'clamp(20px, 6cqw, 48px)', gap: 'clamp(8px, 1.6cqw, 14px)' }}
      >
        {meta && (
          <span
            className="inline-flex items-center gap-2 font-mono uppercase tracking-wider text-mist-600 tabular"
            style={{ fontSize: 'clamp(10px, 1.6cqw, 12px)' }}
          >
            <span aria-hidden className="w-1.5 h-1.5 bg-electric shrink-0" />
            <Meta parts={meta} />
          </span>
        )}
        <span
          className="font-bold text-ink leading-[0.95] tracking-[-0.03em] text-balance"
          style={{ fontSize: 'clamp(26px, 8.5cqw, 72px)' }}
        >
          {client}
        </span>
      </div>
    </div>
  );
}
