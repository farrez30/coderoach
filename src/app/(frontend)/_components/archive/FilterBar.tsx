'use client';

type Option = { value: string; label: string; count?: number; href: string };
type Variant = 'segmented' | 'chips';

/**
 * Filters are links, so the archive filters without JavaScript and every view has a URL.
 * With JavaScript, `onSelect` filters in place instead of asking the server again.
 */
export function FilterBar({
  label,
  options,
  active,
  onSelect,
  variant = 'chips',
}: {
  label: string;
  options: Option[];
  active: string;
  onSelect?: (value: string, href: string) => void;
  variant?: Variant;
}) {
  const click = (opt: Option) => (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!onSelect || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
    e.preventDefault();
    onSelect(opt.value, opt.href);
  };

  if (variant === 'segmented') {
    return (
      <nav aria-label={label} className="flex items-center gap-4 flex-wrap">
        <span className="w-16 text-[11px] font-semibold uppercase tracking-[0.18em] text-mist-600 shrink-0">{label}</span>
        {/* Long service names can wrap on a phone; a wrapped pill reads as broken, so it squares off. */}
        <div className="inline-flex items-center bg-paper-100 border border-paper-200 rounded-2xl sm:rounded-full p-1 gap-0.5 flex-wrap">
          {options.map((opt) => {
            const isActive = opt.value === active;
            return (
              <a
                key={opt.value}
                href={opt.href}
                onClick={click(opt)}
                aria-current={isActive ? 'true' : undefined}
                className={`h-8 px-4 rounded-full font-mono text-[11px] font-medium tracking-wider uppercase transition-all active:scale-[0.97] tabular flex items-center whitespace-nowrap
                  ${isActive ? 'bg-ink text-paper shadow-[0_2px_6px_-2px_rgba(8,9,10,0.3)]' : 'text-mist-600 hover:text-ink'}`}
              >
                {opt.label}
                {opt.count !== undefined && (
                  <span className={`ml-1.5 tabular ${isActive ? 'text-mist-400' : 'text-mist-600'}`}>{opt.count}</span>
                )}
              </a>
            );
          })}
        </div>
      </nav>
    );
  }

  // chips variant (secondary filter: smaller, lighter, electric-tinted active)
  return (
    <nav aria-label={label} className="flex items-center gap-2 flex-wrap">
      <span className="w-16 text-[11px] font-semibold uppercase tracking-[0.18em] text-mist-600 shrink-0 mr-2">{label}</span>
      {options.map((opt) => {
        const isActive = opt.value === active;
        return (
          <a
            key={opt.value}
            href={opt.href}
            onClick={click(opt)}
            aria-current={isActive ? 'true' : undefined}
            className={`h-7 px-2.5 rounded-md font-mono text-[10px] font-medium tracking-wider uppercase transition-colors active:scale-[0.97] tabular flex items-center whitespace-nowrap
              ${
                isActive
                  ? 'bg-electric/[0.08] text-electric border border-electric/30'
                  : 'bg-transparent text-mist-600 border border-transparent hover:text-ink hover:bg-paper-100'
              }`}
          >
            {opt.label}
            {opt.count !== undefined && (
              <span className={`ml-1 ${isActive ? 'text-electric/70' : 'text-mist-600'}`}>{opt.count}</span>
            )}
          </a>
        );
      })}
    </nav>
  );
}
