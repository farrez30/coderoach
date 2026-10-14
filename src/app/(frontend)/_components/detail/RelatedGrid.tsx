import { ProjectCard } from '../archive/ProjectCard';
import { PostCard } from '../archive/PostCard';

type RelatedItem = any;

export function RelatedGrid({
  heading,
  type,
  items,
}: {
  heading: string;
  type: 'projects' | 'posts';
  items: RelatedItem[];
}) {
  if (!items || items.length === 0) return null;
  return (
    <section className="py-20 border-t border-paper-200">
      <div className="max-w-[1180px] mx-auto px-8">
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-mist-600 mb-8">
          {heading}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.slice(0, 3).map((item) =>
            type === 'projects' ? (
              <ProjectCard key={item.id} project={item} intercept={false} />
            ) : (
              <PostCard key={item.id} post={item} />
            ),
          )}
        </div>
      </div>
    </section>
  );
}
