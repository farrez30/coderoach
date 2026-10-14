import { withPayload } from '@payloadcms/next/withPayload';
import withSerwistInit from '@serwist/next';

const isProd = process.env.NODE_ENV === 'production';

/**
 * The offline presentation (ADR 0008). Only built in production with the flag on; without it the
 * page unregisters any worker it finds, which is the kill switch. @serwist/next adds a small
 * registration helper to every page's main bundle (~1.8 KB gzip); the page registers the worker
 * itself, and only under /work/presentasi. Nothing is precached: the warm-up decides what is kept.
 */
const offline = process.env.NEXT_PUBLIC_PRESENTASI_OFFLINE === 'on';
const withSerwist = withSerwistInit({
  swSrc: 'src/sw/presentasi.ts',
  swDest: 'public/presentasi-sw.js',
  swUrl: '/presentasi-sw.js',
  scope: '/work/presentasi',
  register: false,
  reloadOnOnline: false,
  cacheOnNavigation: false,
  additionalPrecacheEntries: [],
  exclude: [() => true],
  disable: !isProd || !offline,
});

/**
 * Content security policy for the public site. The admin and the API are left out: Payload ships
 * its own inline assets and the API returns JSON. Scripts stay inline-allowed because Next's
 * bootstrap is inline, but only our own origin and the three services we actually load can supply
 * script files: Turnstile, GA4, and the Meta pixel.
 */
const csp = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'self'",
  "form-action 'self'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  "style-src 'self' 'unsafe-inline'",
  `script-src 'self' 'unsafe-inline'${isProd ? '' : " 'unsafe-eval'"} https://challenges.cloudflare.com https://static.cloudflareinsights.com https://www.googletagmanager.com https://connect.facebook.net`,
  "connect-src 'self' https://challenges.cloudflare.com https://static.cloudflareinsights.com https://cloudflareinsights.com https://www.google-analytics.com https://region1.google-analytics.com https://connect.facebook.net",
  'frame-src https://challenges.cloudflare.com',
  "worker-src 'self'",
  "media-src 'self'",
  "manifest-src 'self'",
].join('; ');

const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=()' },
  ...(isProd ? [{ key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' }] : []),
];

const cspHeader = [{ key: 'Content-Security-Policy', value: csp }];

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    reactCompiler: false,
  },
  async headers() {
    return [
      { source: '/:path*', headers: securityHeaders },
      { source: '/', headers: cspHeader },
      { source: '/:path((?!admin|api).*)', headers: cspHeader },
      // A worker script must never be served stale from a cache, or a fix (or the kill switch) can't land.
      { source: '/presentasi-sw.js', headers: [{ key: 'Cache-Control', value: 'no-cache, no-store, must-revalidate' }] },
    ];
  },
};

export default withPayload(withSerwist(nextConfig));
