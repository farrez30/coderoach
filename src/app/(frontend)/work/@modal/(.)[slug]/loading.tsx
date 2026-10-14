/**
 * Shown while a project loads into the overlay. Without it the nearest boundary is the site's
 * full-screen spinner, which would replace the catalog for a moment.
 */
export default function OverlayLoading() {
  return (
    <div
      role="status"
      aria-label="Memuat proyek"
      className="fixed inset-0 z-50 grid sm:place-items-center bg-[rgba(8,9,10,0.45)]"
    >
      <div className="w-full h-[100dvh] sm:w-[min(1180px,calc(100vw-48px))] sm:h-[calc(100dvh-48px)] sm:rounded-2xl sm:border sm:border-paper-200 bg-paper-100 overflow-hidden">
        <div className="h-14 border-b border-paper-200 bg-paper-50" />
        <div className="max-w-[1180px] mx-auto px-8 pt-16 space-y-5 motion-safe:animate-pulse">
          <div className="h-4 w-40 rounded bg-paper-200" />
          <div className="h-12 w-3/4 max-w-[640px] rounded bg-paper-200" />
          <div className="h-5 w-1/2 max-w-[480px] rounded bg-paper-200" />
          <div className="aspect-[3/1] w-full rounded-xl bg-paper-200 mt-10" />
        </div>
      </div>
    </div>
  );
}
