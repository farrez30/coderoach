/**
 * What the presentation's service worker may cache (ADR 0008). Shared by the worker
 * (src/sw/presentasi.ts) and the "Siapkan offline" warm-up, so the two can't disagree.
 */
export const SCOPE = '/work/presentasi';

export const CACHES = {
  pages: 'presentasi-halaman',
  static: 'presentasi-statis',
  media: 'presentasi-media',
} as const;

export type CacheName = (typeof CACHES)[keyof typeof CACHES];

/**
 * The cache a same-origin GET belongs in, or null. Null covers the admin, every API route other
 * than media files, and every page outside the presentation: those always go to the network.
 */
export function cacheFor(pathname: string): CacheName | null {
  if (pathname === SCOPE || pathname.startsWith(`${SCOPE}/`)) return CACHES.pages;
  if (pathname.startsWith('/_next/static/')) return CACHES.static;
  if (pathname.startsWith('/api/media/file/')) return CACHES.media;
  return null;
}

const keepAsset = (url: URL, origin: string) => url.origin === origin && (cacheFor(url.pathname) === CACHES.static || cacheFor(url.pathname) === CACHES.media);

/**
 * Asset URLs a presentation page needs, read from its HTML: script and style tags, img src and
 * srcset, video sources and posters, and the chunk paths inside the RSC payload. Paths may hold
 * parentheses (route groups), so a URL ends at whitespace, a quote, a comma, a backslash, or < >.
 */
export function assetUrls(html: string, origin: string): string[] {
  const found = new Set<string>();
  for (const m of html.matchAll(/(?:https?:\/\/[^/\s"']+)?\/(?:_next\/static|api\/media\/file)\/[^\s"'<>\\,]+/g)) {
    try {
      const url = new URL(m[0].replace(/&amp;/g, '&'), origin);
      if (keepAsset(url, origin)) found.add(url.href);
    } catch {
      // Not a URL after all.
    }
  }
  return [...found];
}

/** Fonts and images a stylesheet pulls in through url(...), resolved against the stylesheet's URL. */
export function cssUrls(css: string, stylesheet: string): string[] {
  const origin = new URL(stylesheet).origin;
  const found = new Set<string>();
  for (const m of css.matchAll(/url\(\s*(['"]?)([^'")]+)\1\s*\)/g)) {
    if (m[2].startsWith('data:')) continue;
    try {
      const url = new URL(m[2], stylesheet);
      if (keepAsset(url, origin)) found.add(url.href);
    } catch {
      // Not a URL after all.
    }
  }
  return [...found];
}
