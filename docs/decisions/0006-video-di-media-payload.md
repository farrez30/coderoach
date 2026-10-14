# 0006 — Portfolio video lives in Payload Media, sourced from the repo

- Date: 2026-10-14
- Status: Accepted

## Context

The catalog previews projects with 3–6 s muted loops (ADR 0002), project pages
show tours (ADR 0003), and demos start as recordings (ADR 0004). Presentation
mode has to play them offline. Media currently accepts images only. On
2026-10-14 `/api/media/file/*` answered Range requests with 206 through a
Cloudflare cache hit, so Safari can play files served from the Railway volume.

## Options considered

1. **Payload Media accepts mp4/webm/vtt.** Source files are committed to
   `scripts/portfolio-assets/` and synced, like the screenshots today.
2. **Cloudflare Stream or R2:** built for video, but a new service and bill on
   wafi's account and a new upload path.
3. **YouTube unlisted:** free, but about 1 MB of third-party JS (LCP), tracking
   cookies, an iframe in the CSP, and no offline playback.

Recommended by Claude: 1.

## Decision (decided by: farrez)

Option 1.

## Reasoning (farrez)

"Mending video disimpan bareng gambar di Payload biar nggak nambah layanan baru dan tetap bisa diputar offline pas presentasi."

## Consequences

- Budgets, enforced by a test: loop ≤ 600 KB, tour ≤ 8 MB, poster ≤ 150 KB.
  H.264 MP4 with `+faststart`; captions as WebVTT plus a text transcript.
- Filenames are versioned (`laporta-tour.v1.mp4`): the sync matches by filename
  and never re-uploads changed bytes under the same name.
- The repository grows by tens of megabytes over time.
- Revisit if video passes roughly 100 MB in total, or traffic makes egress or
  Cloudflare's terms on serving video a concern; R2 is the next step.
