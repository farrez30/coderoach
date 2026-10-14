import { assetUrls, CACHES, type CacheName, cacheFor, cssUrls } from './rules';

export type WarmResult = { files: number; bytes: number };

const PARALLEL = 4;

/**
 * "Siapkan offline": fetches every presentation page, everything those pages reference (scripts,
 * styles and their fonts, images in every srcset width, posters, videos), and stores them whole,
 * so the worker can answer offline, Range requests included. Whatever the caches held that is no
 * longer referenced is deleted, so withdrawn projects don't linger on the laptop. Browser only.
 */
export async function warmUp(pages: string[], onProgress: (done: number, total: number) => void): Promise<WarmResult> {
  const origin = window.location.origin;
  const keep = new Map<CacheName, Set<string>>(Object.values(CACHES).map((name) => [name, new Set<string>()]));
  const assets = new Set<string>();

  const pageCache = await caches.open(CACHES.pages);
  for (const [i, page] of pages.entries()) {
    const url = new URL(page, origin).href;
    const res = await fetch(url, { cache: 'no-store', credentials: 'same-origin' });
    if (!res.ok) throw new Error(`${page} membalas ${res.status}`);
    for (const a of assetUrls(await res.clone().text(), origin)) assets.add(a);
    // Next varies its HTML on router headers and client hints, so an entry the worker stored for a
    // navigation doesn't match this request: put() then fails with "Entry already exists" and a
    // plain delete() finds nothing. Clear every entry for the URL first, whatever it varied on.
    await pageCache.delete(url, { ignoreVary: true });
    await pageCache.put(url, res);
    keep.get(CACHES.pages)?.add(url);
    onProgress(i + 1, pages.length);
  }

  for (const sheet of [...assets].filter((a) => new URL(a).pathname.endsWith('.css'))) {
    const res = await fetch(sheet);
    if (res.ok) for (const a of cssUrls(await res.text(), sheet)) assets.add(a);
  }

  const queue = [...assets];
  const total = pages.length + queue.length;
  let done = pages.length;
  const worker = async () => {
    for (let url = queue.shift(); url; url = queue.shift()) {
      const name = cacheFor(new URL(url).pathname);
      if (name) {
        await store(await caches.open(name), url);
        keep.get(name)?.add(url);
      }
      onProgress(++done, total);
    }
  };
  await Promise.all(Array.from({ length: PARALLEL }, worker));

  let files = 0;
  let bytes = 0;
  for (const [name, wanted] of keep) {
    const cache = await caches.open(name);
    for (const request of await cache.keys()) {
      if (!wanted.has(request.url)) {
        await cache.delete(request);
        continue;
      }
      const res = await cache.match(request);
      const length = Number(res?.headers.get('content-length'));
      bytes += Number.isFinite(length) && length > 0 ? length : ((await res?.blob())?.size ?? 0);
      files++;
    }
  }
  await navigator.storage?.persist?.().catch(() => false);
  return { files, bytes };
}

/**
 * Static chunks and media files have versioned names, so one already cached (by the worker or an
 * earlier warm-up) is current. Otherwise add() stores the whole file: a video the browser streamed
 * with Range requests never was. Matching ignores Vary for the same reason as pages above.
 */
async function store(cache: Cache, url: string): Promise<void> {
  if (await cache.match(url, { ignoreVary: true })) return;
  await cache.delete(url, { ignoreVary: true });
  await cache.add(url);
}

/** Takes the presentation offline mode down: the kill switch, and what a build without the flag runs. */
export async function removeOffline(): Promise<void> {
  if ('serviceWorker' in navigator) {
    for (const reg of await navigator.serviceWorker.getRegistrations()) {
      if (new URL(reg.scope).pathname.startsWith('/work/presentasi')) await reg.unregister();
    }
  }
  if ('caches' in window) {
    // Serwist keeps an (empty) precache of its own next to ours; it goes too.
    for (const name of await caches.keys()) {
      if ((Object.values(CACHES) as string[]).includes(name) || name.startsWith('serwist-')) await caches.delete(name);
    }
  }
}
