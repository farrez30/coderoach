# 0005 — Project pages keep Satoshi, tuned to an Apple-style type scale

- Date: 2026-10-14
- Status: Accepted

## Context

ADR 0003 gives project pages the full Apple product-page style. apple.com sets
its type in SF Pro through the system font stack, but SF is not licensed for
web embedding, so outside Apple devices that stack falls back to Segoe UI or
Roboto. Prospects mostly open the site on a work laptop, and in Indonesia that
is usually Windows. The site already loads Satoshi (variable) and JetBrains Mono.

## Options considered

1. **Satoshi tuned Apple-style:** large display sizes, tight tracking, heavy
   weights, 17–21 px body. Same rendering everywhere, no new font request.
2. **System stack** (`-apple-system, BlinkMacSystemFont, …`): identical to
   apple.com on Apple devices and 0 KB, but a different face on every platform.
3. **Mixed:** Satoshi for display, system stack for body. Two sans families
   side by side.

Recommended by Claude: 1.

## Decision (decided by: farrez)

Option 1.

## Reasoning (farrez)

"Halaman proyek tetap pakai Satoshi biar kelihatan satu merek di laptop Windows calon klien; SF juga nggak boleh dipasang sebagai web font."

## Consequences

- The Apple feel has to come from scale, tracking, weight, and whitespace, not
  from the typeface.
- Satoshi ships as WOFF2 instead of the current 127 KB TTF, to protect LCP.
- Revisit if most presentations happen on Apple devices and SF fidelity starts
  to matter more than one brand voice, or if Satoshi's licence changes.
