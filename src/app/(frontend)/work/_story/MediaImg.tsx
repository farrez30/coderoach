import type { Media } from '@/payload-types';

/** An upload field read at depth ≥ 1: the document, or nothing when it is empty or not populated. */
export const asMedia = (value: number | Media | null | undefined): Media | null =>
  value && typeof value === 'object' && value.url ? value : null;

type Size = { url?: string | null; width?: number | null };

/**
 * A plain <img> with a srcset built from Payload's own sizes. These URLs end in .webp under
 * /api/media/file, so Cloudflare caches them; /_next/image is rendered on demand with a 60 s TTL
 * and is emptied by every deploy, which is the wrong place for the largest image on the page.
 * Width and height come from the original, so the box is reserved before the bytes arrive (CLS).
 */
export function MediaImg({
  media,
  sizes,
  priority = false,
  className,
  alt,
}: {
  media: Media;
  sizes: string;
  priority?: boolean;
  className?: string;
  alt?: string;
}) {
  const variants: Array<Size | undefined> = [media.sizes?.card, media.sizes?.screen, media.sizes?.hero, media];
  const usable = variants.filter((v): v is Size => Boolean(v?.url && v.width));
  const srcSet = [...new Map(usable.map((v) => [v.width, v])).values()]
    .sort((a, b) => (a.width ?? 0) - (b.width ?? 0))
    .map((v) => `${v.url} ${v.width}w`)
    .join(', ');
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={media.sizes?.screen?.url ?? media.url ?? undefined}
      srcSet={srcSet || undefined}
      sizes={sizes}
      width={media.width ?? undefined}
      height={media.height ?? undefined}
      alt={alt ?? media.alt ?? ''}
      loading={priority ? 'eager' : 'lazy'}
      decoding={priority ? 'sync' : 'async'}
      fetchPriority={priority ? 'high' : 'auto'}
      className={className}
    />
  );
}
