# 0009 — Portfolio permissions are recorded in Coderoach OS

- Date: 2026-10-14
- Status: Accepted

## Context

Client numbers, logos, names, screenshots, and testimonials may appear only
with recorded permission. This repository is public, so who granted a
permission and the evidence for it cannot live here. farrez and wafi both need
to see the records, and a permission has to be revocable.

## Options considered

1. **A `consents` collection in Payload:** admin-only, with opaque refs in
   `projects.ts`. One new table in the site.
2. **Refs in `projects.ts` plus a private file:** no table, but the details
   live on one laptop and revoking means a commit.
3. **Coderoach OS:** a permissions table next to the `klien` table, where the
   studio already keeps its client relationships.

Recommended by Claude: 1.

## Decision (decided by: farrez)

Option 3.

## Reasoning (farrez)

"Izin klien harus tercatat di tempat yang bisa dilihat saya dan wafi tapi nggak ikut ke repo publik, dan data klien memang tinggalnya di Coderoach OS, jadi sekalian di situ."

## Consequences

- Every item in `projects.ts` carries a consent: `studio` (the studio's own
  data), `legacy` (only items frozen in the 2026-10-14 baseline, live before
  the rule), or a Coderoach OS ref `IZN-YYYY-NNN`. A test enforces it.
- Unpermitted data is never committed; it waits outside the repository.
- Coderoach OS gains a table, a migration, and an admin screen (its ADR 0018).
- How the site reads the records is ADR 0010.
- Revisit if permissions stay so rare that a second system is not worth it.
