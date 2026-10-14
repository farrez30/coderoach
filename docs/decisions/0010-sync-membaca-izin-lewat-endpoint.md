# 0010 — The portfolio sync reads permissions from a scoped endpoint

- Date: 2026-10-14
- Status: Accepted

## Context

Per ADR 0009, permissions live in Coderoach OS. The portfolio sync has to know
which refs are granted before it writes anything to Payload. The public site
must stay up when Coderoach OS is down, and grantor names and evidence must
never leave Coderoach OS.

## Options considered

1. **`GET /api/portofolio/izin` in Coderoach OS**, authenticated with the
   existing MCP token machinery (random 256-bit token, stored as sha256, with
   audit and expiry) under a new `read:portofolio` scope.
2. **An MCP tool** on the existing server; the sync becomes an MCP client.
3. **A signed export file** downloaded from Coderoach OS and passed to the sync
   by hand.

Recommended by Claude: 1.

## Decision (decided by: farrez)

Option 1.

## Reasoning (farrez)

"Mending sync yang narik izin pakai token baca dari Coderoach OS, jadi situsnya tetap jalan walau Coderoach OS lagi mati dan detail izinnya nggak ikut keluar."

## Consequences

- The response carries only ref, status, scope, metric keys, site slug,
  industry, and expiry.
- Only `scripts/portfolio-sync.ts` calls it; pages never do. If Coderoach OS is
  unreachable, the sync stops without writing (fail closed).
- The token lives in the web service's environment as `CODEROACH_OS_TOKEN`;
  it expires, so rotating it is a recurring chore.
- Revisit if the site should hold no credential for Coderoach OS at all; then
  option 3.
