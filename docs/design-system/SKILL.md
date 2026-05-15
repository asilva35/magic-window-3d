---
name: magic-design
description: Use this skill to generate well-branded interfaces and assets for Magic™ Windows & Doors, either for production or throwaway prototypes/mocks/etc. Contains essential design guidelines, colors, type, fonts, assets, and UI kit components for prototyping.
user-invocable: true
---

Read the `README.md` file within this skill, and explore the other available files.

This skill bundles the design system for **Magic™ Windows & Doors** — an Ontario-based designer, manufacturer and installer of replacement windows, patio doors, front doors and window walls.

## What lives in this skill

- `README.md` — full brand context, content fundamentals, visual foundations, iconography, and a file manifest. Read this first.
- `colors_and_type.css` — every design token (colour vars, type ramp, spacing, radii, shadows, motion easings) plus semantic `.h1`/`.body-1`/`.eyebrow` classes. Import this CSS at the top of any HTML you create.
- `assets/` — real brand photography, partner/award SVG badges, product icons, wordmark variants (SVG).
- `preview/` — small one-concept-per-card HTML previews of every token group (one card per swatch group, type level, button family, form-input cluster, etc).
- `ui_kits/website/` — fully interactive recreation of the marketing site. Open `index.html` to see it. Each section is a small reusable JSX component in `components/`.
- `SKILL.md` — this file.

## Workflow

If creating visual artifacts (slides, mocks, throwaway prototypes, marketing-page mocks, ad creative, social cards, brochure layouts, etc):
1. Read `README.md` end-to-end before designing anything.
2. Copy referenced assets out of `assets/` into your working folder; never link to them externally.
3. Always start your CSS with `@import url("./colors_and_type.css")` and use the `--magic-*` variables (e.g. `var(--magic-dark-blue)`, `var(--font-display)`).
4. Headlines: Mulish Black (sub for Harmonia Sans Pro). Body: Open Sans. Never use any other family.
5. Colour: navy `#001B70` and white are 90% of any composition. Sky `#6AC3E7` is the only accent. No warm tones, no gradients beyond the documented soft surface.
6. Iconography: use `assets/`-supplied icons first; Lucide stroke-1.75 currentColor is the documented fallback. Never emoji, never unicode glyphs.
7. Tone: short, declarative, plain-spoken, lightly technical. No corporate filler. Trademarks (`™`, `®`) stay on every use of feature names.
8. Build with the components in `ui_kits/website/components/` when you can — they encode the right spacing, hover states, and validation logic.

If working on production code:
- Copy the tokens and the component patterns. Keep `data-` attributes consistent with what's in the kit so analytics/QA conventions stay aligned.
- Sub Harmonia Sans Pro back in (replace the Mulish `@import` with a self-hosted `@font-face`) as soon as licensed files are available.

If the user invokes this skill without any other guidance, ask them what they want to build or design — propose 2–3 directions (a marketing landing page; a print/PDF brochure spread; a social/share card; a quote-form module; a hero variant) — and act as an expert designer who outputs HTML artifacts *or* production code depending on the need.

## Quick reference

| Need | Token / file |
|---|---|
| Navy fill | `var(--magic-dark-blue)` = `#001B70` |
| Accent | `var(--magic-light-blue)` = `#6AC3E7` |
| Hero heading | class `.h1` or `font-size: var(--fs-h1)` (64 px) |
| Body paragraph | class `.body-1` or `var(--fs-body-1)` (16 px Open Sans) |
| Primary button | `.mw-btn.mw-btn--primary` (see `ui_kits/website/styles.css`) |
| Form input | `.mw-field` (Active / Error / Label variants) |
| Wordmark | `assets/magic-wordmark.svg` (currentColor — colour it via `color`) |
| Award badges | `assets/{golf-canada,ontario-made,toronto-star,window-awards,google-review}.svg` |
| Product icons | `assets/{windows,window-walls,patio-doors}-icon.png` |
| Lifestyle photo | `assets/kitchen-hero.jpg`, `assets/patio-doors-hero.jpg` |

## Known substitutions to flag in any handoff

- **Harmonia Sans Pro → Mulish.** Brand font is paid; Mulish is the closest free match. Replace as soon as licensed files exist.
- **Wordmark.** Current `magic-wordmark.svg` is a typographic stand-in (Mulish Black with tight letter-spacing). Replace with the official Magic™ SVG when supplied.
