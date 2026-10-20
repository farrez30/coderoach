export function Pagination({
  current,
  total,
  basePath,
}: {
  current: number;
  total: number;
  basePath: string;
}) {
  if (total <= 1) return null;

  const pages = Array.from({ length: total }, (_, i) => i + 1);
  const prev = current > 1 ? `${basePath}${current - 1 === 1 ? '' : `?page=${current - 1}`}` : null;
  const next = current < total ? `${basePath}?page=${current + 1}` : null;

  return (
    <nav aria-label="Pagination" className="mt-16 flex items-center justify-center gap-2 font-mono text-xs uppercase tracking-wider tabular">
      {prev && (
        <a href={prev} className="px-3 py-2 text-mist-600 hover:text-electric transition-colors">
          <span aria-hidden>←</span> Prev
        </a>
      )}
      {pages.map((p) => {
        const isCurrent = p === current;
        const href = p === 1 ? basePath : `${basePath}?page=${p}`;
        return (
          <a
            key={p}
            href={href}
            aria-current={isCurrent ? 'page' : undefined}
            className={`min-w-9 h-9 px-2.5 inline-flex items-center justify-center rounded-md transition-colors
              ${isCurrent
                ? 'bg-electric/[0.10] text-electric border border-electric/30'
                : 'text-mist-600 border border-paper-200 hover:text-ink hover:border-mist-400'
              }`}
          >
            [ {String(p).padStart(2, '0')} ]
          </a>
        );
      })}
      {next && (
        <a href={next} className="px-3 py-2 text-mist-600 hover:text-electric transition-colors">
          Next <span aria-hidden>→</span>
        </a>
      )}
    </nav>
  );
}
