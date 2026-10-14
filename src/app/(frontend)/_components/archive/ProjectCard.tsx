import Link from 'next/link';
import { industryLabel } from '@/lib/portfolio/taxonomy';
import { Badge } from '../ui/Badge';
import { CardPreview, type CardPreviewMedia } from './CardPreview';
import { ProjectCover } from './ProjectCover';

type Project = {
  id: string | number;
  slug: string;
  kind: 'client' | 'studio' | 'lab';
  client: string;
  tagline: string;
  meta?: string | null;
  industry?: string | null;
  publishedYear?: string | null;
  pills?: Array<{ pill: string }> | null;
  excerpt?: string | null;
  coverImage?: any;
  /** A short muted loop, played over the cover on request (catalog only). */
  preview?: CardPreviewMedia | null;
};

type Variant = 'default' | 'feature' | 'wide';

const KIND_BADGE = { client: 'KLIEN', studio: 'STUDIO', lab: 'LAB' } as const;

/**
 * An <article> with one link stretched over it, so the card can also hold its own controls (the
 * preview button on the catalog) without nesting interactive elements inside a link.
 *
 * `intercept` uses a soft navigation, which the catalog turns into the overlay (work/@modal). Cards
 * shown on a full project page pass false and do a normal navigation to the next full page.
 */
export function ProjectCard({
  project,
  variant = 'default',
  intercept = true,
  priority = false,
}: {
  project: Project;
  variant?: Variant;
  intercept?: boolean;
  /** The first card of the catalog is usually the largest image on screen (LCP). */
  priority?: boolean;
}) {
  const aspect = variant === 'feature' ? 'aspect-[3/2]' : variant === 'wide' ? 'aspect-[2/1]' : 'aspect-[16/10]';
  const titleSize = variant === 'feature' ? 'text-[32px] lg:text-[36px]' : 'text-[22px]';
  const padding = variant === 'feature' ? 'p-8 lg:p-10 gap-4' : 'p-6 gap-3';
  const layout = variant === 'feature' ? 'lg:flex-row lg:gap-0' : '';
  const imgSizeClass = variant === 'feature' ? 'lg:w-[55%] lg:aspect-auto lg:border-b-0 lg:border-r' : '';
  const href = `/work/${project.slug}`;
  const linkClass =
    'after:absolute after:inset-0 after:z-[2] after:rounded-2xl focus-visible:outline-none focus-visible:after:outline focus-visible:after:outline-2 focus-visible:after:outline-electric focus-visible:after:outline-offset-2';
  return (
    <article
      className={`group relative h-full flex flex-col bg-paper-50 border border-paper-200 rounded-2xl overflow-hidden hover:border-shadow-800 transition-all hover:-translate-y-0.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] ${layout}`}
      data-spotlight
    >
      <div className={`${aspect} bg-paper-100 border-b border-paper-200 relative overflow-hidden ${imgSizeClass}`}>
        <ProjectCover
          project={project}
          priority={priority}
          sizesAttr={
            variant === 'feature'
              ? '(min-width: 1024px) 55vw, 100vw'
              : variant === 'wide'
                ? '(min-width: 1024px) 66vw, 100vw'
                : '(min-width: 1024px) 33vw, 100vw'
          }
          imageClassName="object-cover transition-transform duration-700 group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
        />
        {/* Opaque backing: the badge tints are translucent and would pick up the cover image behind them. */}
        <div className="absolute top-4 left-4 z-[1] rounded-full bg-paper-50">
          <Badge variant={project.kind === 'client' ? 'neutral' : 'electric'}>{KIND_BADGE[project.kind] ?? 'KLIEN'}</Badge>
        </div>
        {project.preview && <CardPreview preview={project.preview} label={project.client} />}
        {project.publishedYear && (
          <div className="absolute top-4 right-4 z-[1]">
            <span className="font-mono text-[11px] uppercase tracking-wider text-mist-600 bg-paper-50 px-2 py-1 rounded-md tabular">
              {project.publishedYear}
            </span>
          </div>
        )}
      </div>
      <div className={`flex flex-col flex-1 ${padding} ${variant === 'feature' ? 'lg:justify-center' : ''}`}>
        <h3 className={`${titleSize} font-bold tracking-[-0.015em] m-0 leading-tight group-hover:text-electric transition-colors`}>
          {intercept ? (
            <Link href={href} scroll={false} className={linkClass} data-card-link={project.slug}>
              {project.client}
            </Link>
          ) : (
            <a href={href} className={linkClass} data-card-link={project.slug}>
              {project.client}
            </a>
          )}
        </h3>
        <p className={`${variant === 'feature' ? 'text-[16px]' : 'text-[14px]'} leading-[1.5] text-mist-600 m-0 flex-1`}>
          {project.excerpt || project.tagline}
        </p>
        <div className="flex items-center justify-between pt-3 border-t border-paper-200/60 mt-auto flex-wrap gap-2">
          {project.industry && (
            <span className="font-mono text-[11px] uppercase tracking-wider text-mist-600 tabular">
              {industryLabel(project.industry)}
            </span>
          )}
          <span
            aria-hidden
            className="font-mono text-[11px] tracking-wider text-mist-600 group-hover:text-electric group-hover:translate-x-1 transition-[color,transform] motion-reduce:group-hover:translate-x-0"
          >
            Baca →
          </span>
        </div>
      </div>
    </article>
  );
}
