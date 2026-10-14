# 0002 — Catalog: grid, URL-addressable overlay, and a presentation mode

- Date: 2026-10-14
- Status: Accepted

## Context

The catalog must work for two audiences: a prospect browsing on their own, and
farrez presenting on a phone or laptop in a meeting, sometimes with a weak
connection. farrez asked for something like the PS5 / Steam Deck menu: open a
project, show it, and get back without losing place.

## Options considered

1. **Grid + filter by pillar/industry.** Cards preview on hover/focus (3–6 s
   muted loop, static poster under `prefers-reduced-motion`, tap-to-preview on
   touch). A click opens a "screen in screen" overlay via a Next.js
   intercepting route, so each project still has a shareable URL and Back
   returns to the same grid position. Plus an optional console-style
   presentation mode: full screen, works offline.
2. **Console shelf as the main view:** memorable, but a carousel hides content
   and hover does not exist on phones.
3. **Grid + full pages:** simple, but constant back-and-forth.

Recommended by Claude: 1.

## Decision (decided by: farrez)

Option 1.

## Reasoning (farrez)

"Pas ditanya di lapangan saya harus bisa buka proyek, tunjukin, terus balik lagi ke daftar tanpa nyasar, kayak milih game di PS5."

## Consequences

- Overlay and full page share one component; the URL decides which one renders.
- Presentation mode needs its assets cached for offline use, which bounds its
  size.
- Revisit if analytics show most visitors arrive straight on project pages
  rather than through the catalog.
