---
name: Coderoach Studio
description: A light control room for a two-person dev studio; paper and ink, one signal colour, instruments that report.
colors:
  electric: "#2C70FE"
  ink: "#08090A"
  paper-50: "#FAFBFA"
  paper-100: "#F4F7F5"
  paper-200: "#E8ECEA"
  mist-400: "#C4C0C5"
  mist-500: "#A7A2A9"
  mist-600: "#7A767C"
  shadow-700: "#3A4140"
  shadow-800: "#222823"
  shadow-900: "#13171A"
  success: "#2BB673"
  warning: "#F2A93B"
  error: "#E5484D"
typography:
  display:
    fontFamily: "Satoshi, Inter, system-ui, sans-serif"
    fontSize: "clamp(40px, 5.5vw, 72px)"
    fontWeight: 700
    lineHeight: 1.02
    letterSpacing: "-0.03em"
    fontFeature: "\"ss01\" 1"
  headline:
    fontFamily: "Satoshi, Inter, system-ui, sans-serif"
    fontSize: "clamp(40px, 5vw, 64px)"
    fontWeight: 700
    lineHeight: 1
    letterSpacing: "-0.02em"
  title:
    fontFamily: "Satoshi, Inter, system-ui, sans-serif"
    fontSize: "22px"
    fontWeight: 700
    lineHeight: 1.25
    letterSpacing: "-0.015em"
  body-lede:
    fontFamily: "Satoshi, Inter, system-ui, sans-serif"
    fontSize: "18px"
    fontWeight: 400
    lineHeight: 1.5
  body:
    fontFamily: "Satoshi, Inter, system-ui, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "Satoshi, Inter, system-ui, sans-serif"
    fontSize: "11px"
    fontWeight: 600
    lineHeight: 1
    letterSpacing: "0.18em"
  label-mono:
    fontFamily: "JetBrains Mono, SF Mono, Menlo, monospace"
    fontSize: "11px"
    fontWeight: 500
    lineHeight: 1
    letterSpacing: "0.05em"
    fontFeature: "\"tnum\" 1"
rounded:
  sm: "4px"
  md: "6px"
  lg: "8px"
  xl: "12px"
  2xl: "16px"
  narrative: "20px"
  full: "9999px"
spacing:
  gutter: "32px"
  container: "1180px"
  section: "120px"
  head-to-content: "48px"
  grid-gap: "24px"
  card: "24px"
  card-feature: "48px"
components:
  button-primary:
    backgroundColor: "{colors.electric}"
    textColor: "{colors.paper-100}"
    rounded: "{rounded.md}"
    padding: "0 22px"
    height: "52px"
  button-primary-hover:
    backgroundColor: "#2562E0"
  button-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "0 22px"
    height: "52px"
  button-nav:
    backgroundColor: "{colors.electric}"
    textColor: "{colors.paper-100}"
    rounded: "{rounded.md}"
    padding: "0 14px"
    height: "36px"
  badge-neutral:
    backgroundColor: "{colors.mist-400}"
    textColor: "{colors.ink}"
    typography: "{typography.label-mono}"
    rounded: "{rounded.full}"
    padding: "0 10px"
    height: "24px"
  badge-electric:
    textColor: "{colors.electric}"
    typography: "{typography.label-mono}"
    rounded: "{rounded.full}"
    padding: "0 10px"
    height: "24px"
  filter-segment-active:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper-100}"
    typography: "{typography.label-mono}"
    rounded: "{rounded.full}"
    padding: "0 16px"
    height: "32px"
  card-project:
    backgroundColor: "{colors.paper-50}"
    textColor: "{colors.ink}"
    rounded: "{rounded.2xl}"
    padding: "24px"
  ops-console:
    backgroundColor: "{colors.shadow-900}"
    textColor: "{colors.paper-100}"
    typography: "{typography.label-mono}"
    rounded: "{rounded.2xl}"
    padding: "12px 20px"
---

# Design System: Coderoach Studio

## Overview

**Creative North Star: "Ruang Kendali" (The Control Room)**

A light control room. The walls are daylight paper (#F4F7F5), the type is near-black ink, and nothing on the page raises its voice; the instruments do the talking. Mono status lines, bracketed counters such as `[ 02 / 07 ] · WORK`, a live green dot that pulses every 2.6s, a clock that ticks, hairline rules that measure off one region from the next, and a 28px blueprint grid behind anything that has no picture yet. Signal Blue appears where something can be acted on or where a reading matters, and almost nowhere else.

Dark surfaces exist, but as instruments embedded in the light room: the ops console beside the hero headline, the code block in prose, the deploy console that opens on submit, the dark featured-work panel, the ink footer. Each is bounded, rounded, and labelled like a device. The hero itself stays on paper; the console sits in its right column at the same weight as the headline, not behind it. Density is calm: 120px between sections, a single 1180px column with 32px gutters, and copy that sits in 520–720px measures.

This file documents the site-wide system as shipped. The project pages at `/work/[slug]` are about to receive their own Apple-product-page treatment (docs/decisions/0003); a project-page section will be added here from that shipped code later.

**Key Characteristics:**
- Paper-and-ink daylight with one signal colour; dark panels are instruments, never backdrops.
- Measurement voice: mono, tabular, uppercase, bracketed; labels report position, count, time, or status.
- Hairlines (1px paper-200 on light, shadow-700 on dark) do the structural work; shadows are soft and rare.
- Octagon geometry as the brand motif: watermark, divider dots, pill glyph, spinner.
- Motion is instrument-like (ticks, pulses, rows sliding in, bars filling) and every animation has a reduced-motion off switch.

## Colors

A cool, near-neutral paper-and-ink palette with a single saturated blue; the greys carry a faint violet (mist) and green (paper, slate) cast.

### Primary
- **Signal Blue** (electric): the only colour that means something. Primary buttons, the nav CTA, the accent word in the hero headline, active filter chips, focus border on dark fields, the filled process rail, prose links and blockquote rule, the desktop announcement bar. Hover darkens to #2562E0, which is hard-coded in 15+ places (Nav.tsx:75, Hero.tsx:62, Contact.tsx:361, CTABannerBlockRenderer.tsx:29, the opsscore pages) and is not a token.

### Neutral
- **Console Ink** (ink): all primary text on light, the footer and the Studio section background, the active segmented-filter thumb, the 1px top rule of FAQ columns.
- **Lit Paper** (paper-50): raised surfaces in the room: cards, FAQ and Products section bands, the hero pill, the trusted-by strip.
- **Daylight Paper** (paper-100): the room itself (`html, body` background) and text on dark/electric surfaces.
- **Hairline Paper** (paper-200): every 1px divider and card border on light; inline `code` background.
- **Faint Mist** (mist-400): non-text marks on light (meta separators, octagon dots at rest, `##` prose markers, the secondary button border); readable secondary text on dark.
- **Instrument Mist** (mist-500): secondary text on **dark** surfaces (console status, footer labels, featured-work copy).
- **Readout Mist** (mist-600): secondary text on **light** surfaces (ledes, section markers, card excerpts, FAQ answers).
- **Panel Edge** (shadow-700): hairlines and borders inside dark instruments; process icon stroke.
- **Panel Slate** (shadow-800): hover border on light cards.
- **Console Slate** (shadow-900): the body of the ops console and prose `pre` blocks.

### Status
- **Uplink Green** (success), **Caution Amber** (warning), **Fault Red** (error): status dots, console categories, badges, alerts. On dark surfaces the readable green is #5DD79A, hard-coded in 20+ places (OpsConsole.tsx:19-20, Badge.tsx:8, Work.tsx:80) and not a token. StatusAlert.tsx and Toast.tsx use a parallel untokenized set (#3FAE7A, #C13439, #F5A524, #A47A14) whose amber differs from the warning token.

### Named Rules
**The One Signal Rule.** Signal Blue is the only hue that carries meaning, at roughly 5–10% of any viewport. Status colours appear only as status (a dot, a category, a badge), never as decoration, and never as a second accent beside the blue.

**The Light-Room Ramp Rule.** On light surfaces secondary text uses mist-600; on dark surfaces mist-500 (or mist-400). Swapping them breaks legibility: mist-500 on paper-100 measures 2.32:1, mist-600 on shadow-900 measures 4.04:1. Mist-600 itself measures 4.13:1 on paper-100 and 4.30:1 on paper-50, below the 4.5:1 body floor PRODUCT.md sets, so it is a known gap, not a cleared value; body copy that must be read sits in ink.

## Typography

**Display Font:** Satoshi Variable (self-hosted, `--font-sans`, weight 100–900; falls back to Inter, system-ui)
**Body Font:** Satoshi Variable, with stylistic set `ss01` on globally
**Label/Mono Font:** JetBrains Mono 400/500/700 (`--font-mono`; falls back to SF Mono, Menlo)

**Character:** A tight, confident geometric grotesk for anything said in sentences, and a mono for anything read as a measurement. Headlines are bold with negative tracking; the mono is small, uppercase, and tabular.

### Hierarchy
- **Display** (700, clamp(40px, 5.5vw, 72px), 1.02, -0.03em): the hero H1 only, max 16ch, balanced, with one accent span in Signal Blue.
- **Headline** (700, clamp(40px, 5vw, 64px), 1.0, -0.02em): section H2 under the section marker, max 880px. Prose H2 is 32px/1.15.
- **Title** (700, 22px, -0.015em): card titles; scales to 28px (process phases), 32–36px (feature cards), 44–48px (featured-work metrics and headline). FAQ questions are 19px semibold.
- **Body** (400, 15px/1.6 in components; 18px/1.65 in `.prose-coderoach`, max 720px): ledes are 18px/1.5–1.55 in mist-600 at 520–620px measure.
- **Label** (600, 11px, 0.18em, uppercase, sans): field and column labels: footer headings, "Deliverable", the trusted-by label, filter labels. 69 uses of this exact recipe; a 10px variant exists.
- **Measurement** (JetBrains Mono 500, 11–12px, 0.05em, uppercase, tabular-nums): section markers, badges, filter options, years, industries, console rows, footer meta line.

### Named Rules
**The Measurement Rule.** Mono is reserved for things that could be read off an instrument: a position (`[ 04 / 07 ]`, `[ Q.03 ]`), a count, a time, a version, a status, a category. Sentences are never set in mono, and a mono label never carries a marketing tagline.

**The Tabular Rule.** Any mono or number-heavy element gets `font-variant-numeric: tabular-nums` (the `.tabular` utility), so ticking clocks and counters never shift.

## Layout

One centred column: max-width 1180px with 32px side padding, used 53 times and never varied. Sections are separated by 120px vertical padding (narrative sections use clamp(72px, 9vw, 120px)), and alternate between the bare room (paper-100) and a raised band (paper-50 with 1px paper-200 top and bottom borders). A section opens with its head block, then content 48px below.

Grids are asymmetric where there is a story (hero 1.1fr / 1fr, featured work 1.1fr / 1fr, footer 2fr / 1fr / 1fr / 1fr) and even where there is a list (FAQ two columns, Products two columns, Process four columns on a shared rail). Card grids use a 24px gap. These are literal Tailwind values in each component; spacing is not tokenized.

Breakpoints are the Tailwind defaults: navigation collapses below 768px into a drawer, multi-column grids open at 1024px. The sticky nav is 72px tall and anchors scroll with a 96px scroll-padding.

## Elevation & Depth

Mostly flat. Depth comes from tonal layering (paper-100 room, paper-50 surfaces, shadow-900 instruments) and 1px hairlines. Shadows exist but are soft, negatively spread, and low-alpha; the most common one is an inner top highlight, not a drop.

### Shadow Vocabulary
- **Lit edge** (`box-shadow: inset 0 1px 0 rgba(255,255,255,0.6)`): light cards (project, product, post, prev/next). A 1px catch-light along the top edge.
- **Instrument seat** (`box-shadow: inset 0 1px 0 rgba(255,255,255,0.04), 0 24px 48px -24px rgba(8,9,10,0.4)`): the ops console; the featured-work panel uses 0.5 alpha. The dark instrument sits slightly into the page.
- **Narrative card** (`box-shadow: 0 0 1px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.05), 0 8px 24px rgba(0,0,0,0.04)`): cards in the narrative landing sections.
- **Floating layer** (`box-shadow: 0 12px 32px -12px rgba(8,9,10,0.18)` nav drawer; `0 18px 40px -16px rgba(8,9,10,0.25)` toast; `0 18px 36px -12px rgba(8,9,10,0.4)` mobile announcement).
- **Pressed thumb** (`box-shadow: 0 2px 6px -2px rgba(8,9,10,0.3)`): the active option in a segmented filter.
- **Field halo** (`box-shadow: 0 0 0 3px rgba(44,112,254,0.14)`): focus on opsscore inputs.

### Named Rules
**The Hairline-First Rule.** Separate with a 1px line before reaching for a shadow. A shadow is allowed to seat an instrument or float a layer, never to make a static card look important.

## Shapes

Gently rounded, never soft. Cards and instruments use 16px corners (narrative cards 20px); buttons, deliverable boxes, and small chips use 6px; icon wells use 8px; badges, segmented filters, scope pills, and status dots are fully round. The contact "ticket" is a deliberate exception at 3px.

Three geometric signatures recur: the regular **octagon** (`7,2 17,2 22,7 22,17 17,22 7,22 2,17 2,7` on a 24 grid) as watermark at 520px and 8% opacity, divider dots, and spinner; the **crosshair corner** (12px L-brackets at 15% ink in the corners of blueprint placeholders); and the **blueprint grid** (1px lines at rgba(8,9,10,0.05) on a 28px pitch on light, rgba(244,247,245,0.5) at 6% on a 32px pitch on dark).

## Components

### Buttons
Decisive and squared-off.
- **Shape:** 6px corners; 52px tall in content, 36px in the nav, 44px inside dark panels.
- **Primary:** Signal Blue fill, paper text, 15px semibold, 22px side padding, optional 18px arrow. Hover #2562E0; contact submit adds `active:scale(0.98)`.
- **Secondary:** transparent with a 1px mist-400 border and ink text; hover tints 4% ink.
- **On dark:** paper fill, ink text; hover mist-400.
- **Focus:** no custom style; the browser default ring is what ships.

### Chips and Filters
Instrument switches.
- **Badge:** 24px pill, mono 11px uppercase. Neutral (mist-400 at 30%, ink text), electric (10% tint, 30% border, blue text), dark (paper at 8%).
- **Segmented filter:** a paper-100 track with 1px paper-200 border and 4px padding; 32px options; active is an ink thumb with paper text and the pressed-thumb shadow; inactive is mist-600 that turns ink on hover.
- **Chip filter:** 28px, 6px corners, mono 10px; active is an 8% blue tint with blue text and 30% blue border.

### Cards / Containers
Specimen trays.
- **Corner Style:** 16px.
- **Background:** paper-50 with a paper-100 media well above a 1px paper-200 rule.
- **Shadow Strategy:** lit edge only (see Elevation).
- **Border:** 1px paper-200, darkening to shadow-800 on hover with a 2px lift; the media scales 1.05 over 700ms and the title turns Signal Blue.
- **Internal Padding:** 24px; 32–40px on feature cards. A footer row under a hairline carries the mono industry and a "Read →" readout.
- **Blueprint placeholder:** without a cover image the media well draws the 28px grid, two crosshair corners, a mono meta line with a 6px blue square, and the client name set bold at clamp(26px, 8.5cqw, 72px).

### Inputs / Fields
Instrument readouts, not boxes. On the dark contact surface, fields are bare: no fill, a 1px shadow-700 underline, 22px medium paper text, mist-600 placeholder, blue caret, underline turning Signal Blue on focus. On light opsscore forms, focus adds the field halo.

### Navigation
A sticky 72px bar of paper-100 at 85% with a medium backdrop blur and a 1px paper-200 bottom rule. Logo plus a two-line lowercase wordmark at 14px; links 14px medium in ink, Signal Blue on hover; blue CTA at the right. Below 768px a 44px hamburger opens a drawer of 17px links separated by hairlines over a 30% ink scrim.

### Ops Console (signature)
The instrument that proves the room is live. A shadow-900 panel, 16px corners, 1px shadow-700 border, mono 12px tabular throughout. Header: pulsing green dot, `coderoach.studio · uplink` in mist-400, live clock. Body: three event rows (category in its status colour, subject in paper, status in mist-500) fading 100/80/50% by age; a new row slides in every 3.2s. Hover pauses it; reduced motion stops the clock and the feed.

### Section Head
A mono measurement line (`[ 02 / 07 ] · WORK` in mist-600 with a mist-400 dot) above the headline, an 18px gap, then an optional mist-600 lede. The marker is a position on the page, not a tagline.

### Process Rail
A 2px rail across four columns that fills with Signal Blue as the reader scrolls (`--progress`), 14px ring dots in ink sitting on it, each phase tagged `[ tag ]` in mono with a deliverable box (paper-50, 6px corners) beneath.

## Do's and Don'ts

### Do:
- **Do** keep the room light: page background paper-100, raised surfaces paper-50, structure in 1px paper-200 hairlines.
- **Do** frame dark panels (shadow-900 or ink) as bounded instruments with 16px corners, a 1px shadow-700 border, and a mono header that says what the device is.
- **Do** set every position, count, time, version, and status in JetBrains Mono, uppercase, tabular, 10–12px.
- **Do** use Signal Blue for the one action or reading that matters in a view, and hover it to #2562E0.
- **Do** use mist-600 for secondary text on light and mist-500 for secondary text on dark, and keep text that must be read in ink.
- **Do** give every animation a `prefers-reduced-motion: reduce` path that removes it and leaves content visible.
- **Do** fill a missing image with the blueprint placeholder (28px grid, crosshair corners, name set large), never a stock photo.

### Don't:
- **Don't** use a full-bleed dark hero or dark panel for drama; the hero stays on paper and the console sits in it.
- **Don't** introduce a second accent hue, gradient washes, or warm cream backgrounds.
- **Don't** answer a section with a uniform grid of icon cards.
- **Don't** put mist-500 or lighter text on a light surface, or mist-600 text on a dark one.
- **Don't** use mono for sentences, or a bracketed label for anything that is not a real position or measurement.
- **Don't** add hard drop shadows or shadows to static cards beyond the 1px lit edge.
