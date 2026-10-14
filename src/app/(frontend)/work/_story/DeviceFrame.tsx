/**
 * Generic device frames drawn in CSS: no Apple bezels or product shapes (their trade dress, and the
 * Apple Design Resources licence forbids them in marketing). Zero image requests, and the screen box
 * has a fixed aspect ratio, so nothing shifts while the screenshot loads. Everything inside the screen
 * is stacked edge to edge, so a preview loop can sit on top of its still.
 */
export function DeviceFrame({
  kind,
  children,
  className = '',
}: {
  kind: 'laptop' | 'phone' | 'browser';
  children: React.ReactNode;
  className?: string;
}) {
  if (kind === 'phone') {
    return (
      <div className={`rounded-[2.6rem] bg-ink p-[0.55rem] shadow-[0_30px_60px_-30px_rgba(8,9,10,0.55)] ${className}`}>
        <div className="aspect-[390/844] overflow-hidden rounded-[2.1rem] bg-paper-50 relative [&>*]:absolute [&>*]:inset-0 [&>*]:h-full [&>*]:w-full [&>*]:object-cover [&>*]:object-top">
          {children}
        </div>
      </div>
    );
  }
  if (kind === 'browser') {
    return (
      <div className={`overflow-hidden rounded-xl border border-paper-200 bg-paper-50 shadow-[0_30px_60px_-30px_rgba(8,9,10,0.35)] ${className}`}>
        <div aria-hidden className="flex h-8 items-center gap-1.5 border-b border-paper-200 px-3">
          <span className="h-2 w-2 rounded-full bg-paper-200" />
          <span className="h-2 w-2 rounded-full bg-paper-200" />
          <span className="h-2 w-2 rounded-full bg-paper-200" />
        </div>
        <div className="aspect-[16/10] relative [&>*]:absolute [&>*]:inset-0 [&>*]:h-full [&>*]:w-full [&>*]:object-cover [&>*]:object-top">{children}</div>
      </div>
    );
  }
  return (
    <div className={className}>
      <div className="rounded-[1.1rem] bg-ink p-[1.4%] pb-[2.2%] shadow-[0_40px_80px_-40px_rgba(8,9,10,0.55)]">
        <div className="aspect-[16/10] overflow-hidden rounded-[0.45rem] bg-paper-50 relative [&>*]:absolute [&>*]:inset-0 [&>*]:h-full [&>*]:w-full [&>*]:object-cover [&>*]:object-top">
          {children}
        </div>
      </div>
      {/* The base: wider than the lid, a hairline step where they meet. */}
      <div aria-hidden className="relative mx-[-4%] h-3 rounded-b-[0.9rem] bg-paper-200 shadow-[inset_0_1px_0_rgba(8,9,10,0.12)]">
        <span className="absolute left-1/2 top-0 h-1.5 w-[14%] -translate-x-1/2 rounded-b-md bg-mist-400/50" />
      </div>
    </div>
  );
}
