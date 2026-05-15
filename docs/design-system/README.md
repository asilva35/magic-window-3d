# Magic™ Windows & Doors — Design System

**Brand:** Magic™ Windows & Doors
**Site:** https://www.magicwindow.ca
**Established:** 1979 (Ontario, Canada)
**Tagline / promise:** *"Revolutionary innovation in Ontario."* Trusted in Ontario since 1979.

Magic is a designer, manufacturer and installer of replacement windows, patio doors, front doors and window walls serving Toronto, Mississauga, Oakville and the Greater Toronto Area. The brand is engineering-led — the marketing voice is built around a handful of patented technologies (**Parallex® Hardware**, **Hi-Flo® Drainage**, **Hybrid Fusion Frame**, the **Retractable Bug Screen**) and a 40-year parts-and-labour warranty. "Magic" is positioned as the premium, made-in-Canada option for Canadian climate.

The visual identity is a confident, almost utilitarian system: deep navy + crisp white, one accent of sky-blue, a single display sans, and large editorial photography of real homes. There is almost no decoration — the windows themselves are the hero.

---

## Products represented in this system

There is **one product surface**: the marketing website (Webflow-built). It is split into four product lines, each with its own landing page:

| Line | URL |
|---|---|
| Windows | `/windows` |
| Window Walls | `/window-wall` |
| Patio Doors | `/patio-doors` |
| Front Doors | `/front-doors` |

Plus supporting pages: Photos, Videos, FAQ, Careers, Warranty, Blog, Neighbourhood Stories.

No native app, dashboard, or authenticated product exists. The whole funnel ends at one of two CTAs: **Book a Quote** or **Call Us**.

---

## Sources used to build this system

1. **Figma file** — `Style Guide.fig`, mounted as a virtual filesystem.
   - Page `/Page-1/Frame-46` — the full style guide frame: primary/secondary colours, full type ramp (Headings, Sub-Headings, Body), three button families with default/hover/label states, two form-input variants (Active/Error/Label).
2. **Live website** — `https://www.magicwindow.ca` and `/windows`. Used to confirm copywriting voice, asset URLs, and section composition.
3. **Webflow CDN assets** — copied into `assets/` (logos, partner badges, lifestyle photography, product icons).

The user also referenced four uploaded files (`uploads/Magic_Logo_Trademark_Dark Blue_RGB (2) (2).png`, three screenshots). **These were not present in the project filesystem when this system was built** — see Caveats at the bottom.

---

## ✦ Content fundamentals

**Voice.** Confident, plain-spoken, lightly technical. Sentences are short and declarative. The brand is not afraid to make absolute claims: *"Never wrestle with a crank ever again."* *"Never use a ladder again."* *"Buy once, use them forever."* Compare-and-claim language is constant — "50% more natural light", "50% stronger", "40-year warranty", "50% more argon gas" — but it is always tied to a specific feature, never abstract.

**Person.** "We" for the brand, "you/your" for the customer. Direct and a little warm: *"We're here to craft the perfect window for your needs!"*

**Casing.**
- Headlines use **sentence case** (`# Windows`, `# Window Walls`, `## Made in Canada`). Title-case is reserved for award/proof-point labels (`40 Year Warranty`, `Hi-Flo® Drainage`).
- Buttons use **Title Case** (`Get a Quote`, `Submit Information`, `Book a Quote`, `Give us a call` — note "us" stays lowercase, a friendly tic worth preserving).
- Trademarks (`™`, `®`) appear on first use and stay on every use of feature names: **Parallex®**, **Hi-Flo®**, **Magic™**.

**Punctuation.** Sparse exclamation points (allowed in form copy, not in product copy). Sentence-final periods are sometimes dropped on short headline lines ("Trusted in Ontario since 1979."). Lists are short, parallel, and feature-first.

**Tense.** Present-tense product claims, future-tense customer benefit. *"Our patented Parallex® hardware eliminates the crank mechanism, easing operation with a simple push out function."*

**No emoji.** Never. The brand does not use emoji anywhere in marketing copy.

**No unicode flair.** No bullets in body text, no en-dashes as decoration, no `•` chips. Lists use plain `-`. Trademarks (`™`, `®`) are the only special characters that appear with any frequency.

**Examples to mirror:**
- *"Trusted in Ontario since 1979."*
- *"Canadian made for Canadian climate."*
- *"The ultra smooth sliding door."*
- *"Never wrestle with a crank ever again."*
- *"Slim frames, big views."*
- *"A warranty that means something."*
- *"Ready to see Magic? Drop your information below and we'll contact you to book a free in-home consultation."*

**Don't write:** corporate filler ("solutions", "synergies", "elevate"), AI-flavoured boilerplate ("In today's fast-paced world…"), or feature-soup paragraphs. Every paragraph names a real component or a measurable outcome.

---

## ✦ Visual foundations

### Colour vibe
A two-colour world. **Dark navy** (`#001B70`) is roughly 70% of every screen — used for type, primary buttons, full-bleed hero panels, and footer. **White** is the page background. **Sky blue** (`#6AC3E7`) appears as a thin accent — input focus borders, occasional accent lines, swatch-only. Cool, calm, premium. No warm tones.

Imagery is **cool**: editorial interior photography of Ontario homes, often at golden hour but graded toward neutral/cool. No film grain, no overlay, no duotone. Lifestyle shots feature the window glass front-and-centre, often with a person operating the hardware. No stock photography.

### Type
**Display:** Harmonia Sans Pro (substituted with **Mulish** until licensed font is supplied). Used in three weights — **Black** for all headings (H1–H7) and button labels, **Regular** for sub-headings, **Bold** for short capitalised labels (12–16px).

**Body:** **Open Sans Regular** at 16/14/12/8 px. Open Sans is the only non-Harmonia family in the system.

A complete ramp lives in `colors_and_type.css`. All type sits at `line-height: 100%` per the Figma source (we relax to `1.55` for body paragraphs longer than one line).

### Backgrounds
- **White by default** for content surfaces.
- **Navy (`#001B70`)** for hero bars at the top of pages and footer.
- **Soft brand gradient** (`linear-gradient(rgba(199,210,236,0.30) 0%, #E1E1E1 100%)`) appears on a single tertiary surface in the Figma style guide. Used sparingly — think the bottom of a card or a soft chip.
- **Full-bleed photography** is the dominant treatment for hero and "Discover" sections. Image-on-image with overlaid white type.
- **No** patterns, textures, hand-drawn illustration, blob shapes, mesh gradients, or noise.

### Hover & press states
Established by Figma:
- **Button (default → hover):** background lifts from `#00134E` to `#001B70` (about 8% brighter). Underline persists. No scale, no shadow.
- **Button "Label" state:** identical to default fill, **underline removed** — this is the "marketing label" treatment for non-interactive button-shaped chips.
- **Press / clicked:** the figma "Clicked" pair switches the underlined treatment off and uses the deepest blue `#00134E`.

Transitions are quick (`150–200ms`) and use a soft `cubic-bezier(0.2, 0.6, 0.2, 1)` ease.

### Borders & dividers
- Inputs: **0.5–0.7 px hairline**. Active uses sky-blue (`#6AC3E7`), Error uses red, Label uses grey (`#ADADAD`).
- Buttons: solid 1 px navy on the "Give us a call" tertiary button only; primary buttons are border-less.
- Section dividers: **1 px solid `#ADADAD`** horizontal rules between major content blocks (you can see them between "Styles / Sub Headings / Body Text" in the style guide).

### Shadow system
The Figma style guide defines **no shadows**. Cards and surfaces are flat. We extend the system minimally:
- `--shadow-sm` for raised form-card surfaces
- `--shadow-md` for floating CTAs / modals
- `--shadow-lg` for image-over-image layering

Use these *only* where the design genuinely needs depth cueing — the brand's preference is flat-on-white.

### Corner radii
Two radii do nearly everything:
- **3 px** — form inputs, "Submit C" pill button
- **5 px** — primary buttons, colour swatches, "Get a Quote" CTAs
- **8 px** — soft-gradient surfaces (rare)

No 12/16/24 px radii. No fully-pill buttons. The aesthetic is *just* rounded — never soft.

### Cards
There is no "card" component in the Figma source. Where a card-like containment is needed (testimonial, feature, modal), build it as:
- White fill
- 1 px `#E1E1E1` border **or** `--shadow-sm`
- 5 px radius
- 24 px internal padding

Avoid: tinted backgrounds, coloured left-border accents, multi-layer borders, layered translucency.

### Transparency & blur
Used sparingly. The Figma form inputs have `backdrop-filter: blur(0px)` — i.e. effectively none, but the field is reserved. The brand does not use frosted-glass panels, modal scrims with heavy blur, or translucent navigation. The only translucency in the system is the soft gradient's `rgba(199,210,236,0.30)` top stop.

### Layout rules
- **Max content width** ≈ 1280 px on desktop. The Figma frame is 1347 px wide.
- **Sticky elements:** the site sticks the primary nav on scroll. No floating CTAs, no chat widgets.
- **Section vertical rhythm:** 80–120 px between major sections, 48 px within a section, 24 px within a card.
- **Grid:** 12-column, 24-gutter is a safe default — the Figma source is hand-laid, not strict grid, but column proportions track to thirds and halves.

### Animation
- Page hovers are fast (150–200 ms).
- Hero videos auto-play, loop, muted, in `.mp4` — used to demonstrate hardware operation (Parallex® push-out, Hi-Flo® drainage).
- Scroll-triggered fades on long product pages are subtle and short. **No bounces, no spring physics, no parallax-tilt**, no Lottie illustration animations.
- Buttons have no hover lift / scale.

### Iconography vibe
Product icons are **photo-real renders of the actual product silhouette** on transparent background (see `assets/windows-icon.png` — a real photo of a casement window, knocked out). UI icons (Photos, Videos, FAQ, Discover) are simple line glyphs in SVG. See `ICONOGRAPHY` section below.

### Fixed elements
- **Sticky top nav** with the wordmark on the left and product links inline.
- **No** floating action buttons, no bottom-fixed CTA bar on desktop. On the quote form, the submit button is in-flow.

---

## ✦ Iconography

Magic uses three icon registers in parallel:

1. **Product renders (PNG/AVIF on transparent).** The four product-line icons in the main nav are tiny photographic renders of the actual hardware. Example: `assets/windows-icon.png` is a head-on shot of a closed casement window, ~226×180. These exist for `windows`, `window-walls`, `patio-doors`, and `front-doors`. Always crisp, always centred, always on transparent. Never illustrate these — copy the existing renders or request new ones.

2. **Line glyphs (SVG).** Supporting nav items (Photos, Videos, Discover) use thin-stroke monoline SVG glyphs at ~24 px, stroked in the current navy. The strokes are ~1.5 px at the source size. Look at `assets/photos-icon.svg`, `assets/videos-icon.svg`, `assets/discovery-icon.svg`.

3. **Partner / award badges (SVG).** Trust strip uses original-art SVG logos: Golf Canada, Google Review, Ontario Made, Toronto Star, Window Awards, Muse Awards. Stored in `assets/` at full colour, on transparent backgrounds. Render at ~40 px tall, with even gaps.

**Substitution policy.** If you need a UI icon that does not exist in the brand library (search, menu, chevron, close, phone, mail, etc.), use **Lucide** (https://lucide.dev/) with `stroke-width: 1.75` and `currentColor` — its weight is the closest match to the existing supporting glyphs. Always flag the substitution in PRs/handoffs.

**Never used.** Emoji. Unicode-character icons (`✓`, `★`, `→`). Filled / two-tone / glyph-fonts (FontAwesome, Material). Hand-drawn or marker-style.

---

## ✦ Index — what's in this folder

```
README.md                 ← you are here
SKILL.md                  ← Claude Code skill manifest
colors_and_type.css       ← all design tokens (vars) + semantic .h1/.body-1/etc.
assets/                   ← logos, partner badges, lifestyle photography, product icons
fonts/                    ← (empty; brand fonts are paid — see Caveats)
preview/                  ← Design-System-tab preview cards (one card per concept)
ui_kits/
  website/                ← UI Kit for the marketing site
    index.html            ← interactive demo
    components/           ← reusable JSX components
slides/                   ← (not provided — no slide template in source)
```

### UI kits available
- **`ui_kits/website/`** — Marketing website. Sticky top nav, hero, product grid, trust strip, feature blocks, quote form, footer.

---

## ✦ Caveats & open questions

1. **Font substitution.** Harmonia Sans Pro is a paid Monotype family. Until licensed `.woff2` files are added to `fonts/`, headlines render in **Mulish** (closest Google Fonts match: geometric humanist sans, similar terminals and x-height). Please supply the licensed font files when possible — drop them in `fonts/` and update the `@font-face` block at the top of `colors_and_type.css`.
2. **Logo.** The uploaded `Magic_Logo_Trademark_Dark Blue_RGB (2) (2).png` referenced in the task brief was not present in the project filesystem. We have provided `assets/magic-wordmark.svg` as a typographic stand-in (white + dark-blue variants), and `assets/magic-og.jpg` (the brand's OG share image) for reference. **Please re-upload the official logo SVG/PNG.**
3. **Three reference screenshots** mentioned in the brief were also not attached. The website was used as the primary visual source instead.
4. **No slide template provided**, so `slides/` was not created. Slides can be added later once a template lands.
5. **Single source page in Figma.** The provided `.fig` is the style guide artboard only — colors, type, buttons, and form inputs. No real screen designs were included. The UI kit was built by reading magicwindow.ca directly. Component-level fidelity is therefore guided by **the live site** rather than Figma.
6. **No dark mode** is defined. The brand operates light-on-white only.

— end of README —
