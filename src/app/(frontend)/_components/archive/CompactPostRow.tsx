import { Badge } from '../ui/Badge';
import { PayloadImage } from '../ui/PayloadImage';
import { Meta } from '../ui/Meta';

type Post = {
  id: string | number;
  slug: string;
  title: string;
  excerpt: string;
  category: 'engineering' | 'operating' | 'studio' | 'notes';
  publishedAt?: string | null;
  readingTime?: number | null;
  coverImage?: { url?: string | null; alt?: string | null } | null;
};

const CATEGORY_VARIANTS = {
  engineering: 'electric',
  operating: 'success',
  studio: 'warning',
  notes: 'neutral',
} as const;

const CATEGORY_LABELS = {
  engineering: 'Engineering',
  operating: 'Operating',
  studio: 'Studio',
  notes: 'Notes',
} as const;

function formatDate(iso?: string | null): string {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function CompactPostRow({ post }: { post: Post }) {
  return (
    <a
      href={`/notes/${post.slug}`}
      className="group flex items-start gap-4 py-4 border-b border-paper-200/60 last:border-0 hover:bg-paper-50 -mx-3 px-3 rounded-md transition-colors"
    >
      <div className="w-20 h-16 shrink-0 rounded-md overflow-hidden bg-paper-100 border border-paper-200 relative">
        {post.coverImage?.url ? (
          <PayloadImage
            media={post.coverImage}
            variant="thumbnail"
            alt={post.coverImage.alt || post.title}
            sizesAttr="80px"
            className="absolute inset-0 w-full h-full object-cover transition-transform group-hover:scale-105 duration-500"
            fill
          />
        ) : (
          <div
            className="absolute inset-0 bg-cover opacity-40"
            style={{ backgroundImage: 'url(/assets/bg-grid-clean.png)' }}
          />
        )}
      </div>
      <div className="flex-1 min-w-0 flex flex-col gap-1">
        <Badge
          variant={CATEGORY_VARIANTS[post.category as keyof typeof CATEGORY_VARIANTS]}
          className="self-start"
        >
          {CATEGORY_LABELS[post.category as keyof typeof CATEGORY_LABELS].toUpperCase()}
        </Badge>
        <h3 className="text-[15px] font-bold tracking-[-0.01em] leading-tight m-0 group-hover:text-electric transition-colors line-clamp-2">
          {post.title}
        </h3>
        <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-mist-600 tabular">
          <Meta parts={[formatDate(post.publishedAt), post.readingTime && `${post.readingTime} min`]} />
        </span>
      </div>
    </a>
  );
}
