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
        // add() stores the whole file; a video the browser streamed with Range requests never was.
        await (await caches.open(name)).add(url);
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

/** Takes the presentation offline mode down: the kill switch, and what a build without the flag runs. */
export async function removeOffline(): Promise<void> {
  if ('serviceWorker' in navigator) {
    for (const reg of await navigator.serviceWorker.getRegistrations()) {
      if (new URL(reg.scope).pathname.startsWith('/work/presentasi')) await reg.unregister();
    }
  }
  if ('caches' in window) for (const name of Object.values(CACHES)) await caches.delete(name);
}
