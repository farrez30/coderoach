# 0004 — ERP demos: guided tours first, per-session sandbox later

- Date: 2026-10-14
- Status: Accepted

## Context

Prospects should be able to "try it" from a case study. Access depends on
whose data a system holds, not on whether it is an ERP. Some systems belong to
clients (RPN OS, Uruzin OS, Terasol), and the site promises clients own their
source code. Known authorization gaps are still open in several products.

## Options considered

1. **A. Guided tour / recordings:** click-through tour with placeholder data and
   30–60 s videos. Zero data risk, cheap, works offline.
2. **B. Shared demo instance reset nightly:** simplest, but visitors see each
   other's input.
3. **C. Per-session sandbox:** Turnstile, a fresh demo tenant in a separate demo
   database, a signed one-time login link per role, 2-hour TTL, nightly reset.
4. **D. Database branch per session:** strongest isolation, but complex and
   bounded by branch limits.

Recommended by Claude: A for every project first, then C for studio products
only (Laporta as pilot) once the known gaps are closed.

## Decision (decided by: farrez)

The recommendation, delegated by farrez on 2026-10-14.

## Reasoning (farrez)

"Tur dan rekaman dulu buat semua proyek karena aman, murah, dan tetap jalan walau offline di lapangan; sandbox beneran nanti khusus produk kita sendiri, setelah celah keamanannya beres."

## Consequences

- Client systems appear only as tours unless the client gives written
  permission. Future contracts get a portfolio/demo clause with fictional data.
- A sandbox never runs on production deployments or databases, and never uses
  copied production data, even anonymized.
- Revisit if the target prospects are highly technical and decide by hands-on
  trial; then C comes first for the main product.
