# 0001 — The portfolio lives in coderoach.id/work, not a new site

- Date: 2026-10-14
- Status: Accepted

## Context

In the field, prospects ask what the studio has built, and the links farrez
opened were down or pointed at old versions. coderoach.id already has `/work`
with six case studies managed in `src/lib/portfolio/projects.ts` and synced to
Payload, but no live links, before/after, sourced numbers, or testimonials.

## Options considered

1. **Upgrade `/work` on coderoach.id.** SEO, brand, content, Payload and the
   sync pipeline already exist.
2. **A separate microsite** (e.g. `karya.coderoach.id`): free styling, but split
   SEO, duplicated content, one more deployment.
3. **Static pages outside the site:** fastest, but detached from brand and CMS.

Recommended by Claude: 1.

## Decision (decided by: farrez)

Option 1.

## Reasoning (farrez)

"Orang taunya coderoach.id dan /work-nya sudah ada, jadi mending itu yang dibenerin daripada bikin situs baru yang nambah link lagi buat diingat."

## Consequences

- Every case study gets a live link with a last-checked status and a dated
  screenshot as fallback, so a dead client site never leaves the page empty.
- Numbers and logos appear only with recorded client permission.
- Revisit if the portfolio needs a visual language the main site cannot carry,
  or a deployment cadence independent of the site.
