# Coderoach Studio — product context

## Register

**Brand.** This repo is the studio's marketing site plus its Payload CMS. The design is the product: a visitor's impression is what's being made. The admin at `/admin` is the one product-register surface inside it.

## Users & purpose

Owners and directors of Indonesian businesses, roughly 10–200 staff, in F&B, food manufacturing, professional services, and media. Usually not technical. They arrive from a referral or a search like "jasa pembuatan ERP custom", on a laptop during working hours, already running two or three subscriptions that no longer talk to each other.

The job they're doing on this page: decide whether building their own system is worth it, and whether this studio can be trusted to build it. The page has to answer both in one scroll.

What it should evoke: the feeling of talking to someone who has already run this exact operation. Calm, specific, unhurried. Not pitched at.

## Brand personality

**Tenang · teknis · blak-blakan.** Calm, technical, blunt. It says when something is a bad idea, including when the answer is "don't build this yet". Proof over adjectives: real systems, named clients, numbers that can be traced to a commit.

## Anti-references

- Indonesian software-house pages built on stock photos, "solusi digital terpadu", and a stack of WhatsApp buttons
- SaaS-cream landing pages: warm near-white background, soft gradients, three icon cards
- Uniform icon-card grids as the answer to every section
- Check-and-cross comparison tables
- Dark hero panels used for drama
- Editorial-magazine costume: display serif, italic, drop caps, on a brief that isn't a magazine

## Design principles

1. **Proof over adjectives.** Every claim on the page can be traced to a system that runs, a client who can be named, or a number in a repository. Nothing is decorated with a statistic we can't source.
2. **Plain Indonesian.** "Anda" throughout. Jargon (agentic, LLM, data layer, vibecoding) lives on service and notes pages, never on the landing.
3. **Blueprint, not brochure.** The brand's own system: hairlines, grid fields, crosshair corners, mono labels used as measurements. Technical because the work is technical, not as costume.
4. **One accent.** Electric blue `#2C70FE` is the only colour that ever means something. Everything else is paper and ink.
5. **Art direction per section.** Narrative sections may each have their own composition — asymmetry, oversized type, rules that cut across the grid — as long as the voice holds.

## Exception: project pages (draft, to agree with wafi in the PR)

ADR 0003 gives `/work/[slug]` the full apple.com product-page manner. That stretches two lines above, so the exception is written down instead of drifting:

- **Allowed there only:** the product-page formula (name, one line, then one idea per section), motion bound to scroll, one dark chapter that holds the tour (never the hero), and the blueprint ornaments where a picture is missing.
- **Still binding:** one accent (`#2C70FE`), proof over adjectives (every number footnoted to its source), plain Indonesian, and the accessibility rules below.
- **Not extended:** the landing, services, notes, and studio pages keep the rules above as they are.

## Accessibility

Body text ≥4.5:1 on its background; the mist ramp stops at `mist-600` for anything that must be read. Every reveal has a `prefers-reduced-motion` path, and content is visible by default rather than gated behind a transition.
