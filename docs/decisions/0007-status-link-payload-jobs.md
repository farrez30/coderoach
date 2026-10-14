# 0007 — Live-link status comes from a Payload job and is kept as history

- Date: 2026-10-14
- Status: Accepted

## Context

ADR 0001 promises every case study a live link with its last-checked status,
because client sites do go down (several old links answer 402 or 404). Someone
has to probe those URLs and store the result.

## Options considered

1. **Check at render time:** `unstable_cache` for 12 hours and a status badge
   streamed through `Suspense`. No schema and no cron, but nothing in the admin
   and no history.
2. **Payload Jobs + a new `link-checks` collection without versions:** a
   scheduled task inside the web process probes each link and writes a row.
   Visible in the admin, with history.
3. **A manual script** run before client meetings. Simplest, but goes stale.

Recommended by Claude: 1.

## Decision (decided by: farrez)

Option 2.

## Reasoning (farrez)

"Biar hasil ceknya kelihatan di admin dan ada riwayatnya, jadi kalau situs klien mati saya tahu sejak kapan."

## Consequences

- One schema push adds `payload_jobs`, its log and stats tables, and
  `link_checks`. See `docs/portfolio-ops.md` for the order.
- The job runs only in the production web process with
  `PORTFOLIO_LINKCHECK=on`. In Payload 3.84.1 a `shouldAutoRun` that returns
  false stops the cron until restart, so the flag needs a redeploy.
- The probe runs inside Railway's private network, so it validates every
  address at connect time (public IPs only), re-checks each redirect, and
  stores only the title and origin + path.
- Rows older than 90 days are pruned, keeping the latest per URL. The public
  page hides a status older than 48 hours.
- Revisit if the job adds noticeable load, or if uptime history should come
  from Coderoach OS's probes instead.
