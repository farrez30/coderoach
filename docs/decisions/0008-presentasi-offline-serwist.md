# 0008 — Offline presentation mode runs on Serwist, scoped and patched

- Date: 2026-10-14
- Status: Accepted

## Context

ADR 0002 requires the console-style presentation mode to work offline at a
client's office. That needs a service worker. A service worker that caches the
wrong thing, or covers the whole site, is hard to take back.

## Options considered

1. **Hand-written service worker** scoped to `/work/presentasi`. No dependency.
2. **Serwist** (`@serwist/next`): a maintained PWA toolkit with a webpack plugin.
3. **No offline mode:** full screen only, relying on a phone hotspot.

Recommended by Claude: 1.

## Decision (decided by: farrez)

Serwist as the base, patched by hand where it falls short, with its security
verified.

## Reasoning (farrez)

"Pakai Serwist biar nggak bikin dari nol yang rawan salah, tapi yang kurang ditambal sendiri dan dicek keamanannya biar hasilnya paling bagus."

## Consequences

- `@serwist/next` and `serwist` pinned at 9.5.13 (MIT; released 2026-10-04; no
  GitHub advisories on 2026-10-14). `npm audit` runs when they are installed.
- Scope is `/work/presentasi` only. No precache manifest, `reloadOnOnline` off,
  disabled in dev (`next dev --turbo`).
- The hand-written part: a "Siapkan offline" warm-up that caches exactly what
  the page loaded plus its media, prunes the rest, and reports the size.
- Never cached: `/admin`, any `/api` other than `/api/media/file`, non-GET,
  cross-origin. A kill-switch build unregisters the worker.
- Revisit if Serwist goes unmaintained, if its per-page `sw-entry` proves too
  costly (fallback: compile with `@serwist/build` after the build), or when the
  production build moves to Turbopack.
