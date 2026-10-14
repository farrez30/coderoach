# 0003 — Project pages use the full Apple product-page style

- Date: 2026-10-14
- Status: Accepted

## Context

Each project page has to earn a prospect's trust. The site's `PRODUCT.md`
defines its own register ("Blueprint, not brochure", one accent `#2C70FE`) and
anti-references that clash with signature Apple patterns, such as dark hero
panels used for drama. There is no `DESIGN.md` yet.

## Options considered

1. **coderoach.id frame + selective Apple techniques + client accent:** product
   as hero in a device frame, one idea per section, one or two scroll moments
   that show the mechanism.
2. **Full Apple style:** premium, but asset-heavy, a Core Web Vitals risk, and a
   second visual language on a consistent site.
3. **Pure coderoach.id:** consistent, but shows the product less.

Recommended by Claude: 1.

## Decision (decided by: farrez)

Option 2.

## Reasoning (farrez)

"Halaman proyek itu etalase buat calon klien, jadi harus kelihatan premium, dan acuan premium yang paling dikenal orang ya halaman produk Apple."

## Consequences

- A conscious override: `PRODUCT.md` gets an explicit exception agreed with
  wafi (project pages only, unless decided otherwise). `DESIGN.md` is then
  written from the shipped code.
- Scope is the project pages. The `/work` catalog, navigation, and footer keep
  the coderoach.id language.
- Guardrails: LCP ≤ 2.5 s and CLS < 0.1 on Lighthouse mobile; video and image
  sequences get posters and lazy loading; `prefers-reduced-motion` disables
  scrubbing; content readable without JavaScript; problem → solution → result
  visible on the first screen.
- Assets (clean screen recordings with fictional data, device frames) come
  before code.
- Revisit if the guardrails cannot be met, or if the two visual languages read
  as two different sites.
