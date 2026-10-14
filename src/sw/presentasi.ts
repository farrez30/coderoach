/// <reference lib="webworker" />
/**
 * Service worker for the offline presentation (ADR 0008), bundled by @serwist/next into
 * public/presentasi-sw.js and registered only by /work/presentasi with that scope.
 *
 * Nothing is precached (next.config.mjs leaves the manifest empty). Pages in the presentation go
 * network first, built assets and media files cache first; media answers Range requests from the
 * cached file, so a video can be scrubbed offline. Everything else, including the admin, the rest
 * of the API, and non-GET requests, never touches a cache. The "Siapkan offline" button fills and
 * prunes these caches; the worker only reads what it put there.
 */
import {
  CacheableResponsePlugin,
  CacheFirst,
  NetworkFirst,
  type PrecacheEntry,
  RangeRequestsPlugin,
  Serwist,
  type SerwistGlobalConfig,
} from 'serwist';
import { CACHES, type CacheName, cacheFor, SCOPE } from '../lib/presentasi/rules';

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}
declare const self: ServiceWorkerGlobalScope;

const complete = new CacheableResponsePlugin({ statuses: [200] });
// Next varies its HTML on router headers that a cached navigation and a warm-up fetch never share.
const matchOptions = { ignoreVary: true };
const asset =
  (name: CacheName) =>
  ({ request, url, sameOrigin }: { request: Request; url: URL; sameOrigin: boolean }) =>
    sameOrigin && request.method === 'GET' && cacheFor(url.pathname) === name;

if (new URL(self.registration.scope).pathname.replace(/\/$/, '') === SCOPE) {
  const serwist = new Serwist({
    precacheEntries: self.__SW_MANIFEST,
    skipWaiting: true,
    clientsClaim: true,
    navigationPreload: false,
    runtimeCaching: [
      {
        matcher: ({ request, url, sameOrigin }) => sameOrigin && request.mode === 'navigate' && cacheFor(url.pathname) === CACHES.pages,
        handler: new NetworkFirst({ cacheName: CACHES.pages, networkTimeoutSeconds: 4, matchOptions, plugins: [complete] }),
      },
      { matcher: asset(CACHES.static), handler: new CacheFirst({ cacheName: CACHES.static, matchOptions, plugins: [complete] }) },
      {
        matcher: asset(CACHES.media),
        handler: new CacheFirst({ cacheName: CACHES.media, matchOptions, plugins: [complete, new RangeRequestsPlugin()] }),
      },
    ],
  });
  serwist.addEventListeners();
} else {
  // Registered anywhere wider than the presentation: cache nothing and take itself out.
  self.addEventListener('install', () => self.skipWaiting());
  self.addEventListener('activate', (event) => event.waitUntil(self.registration.unregister()));
}
