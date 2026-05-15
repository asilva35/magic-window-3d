# magic™ — Marketing website UI kit

An interactive, hi-fi recreation of the magicwindow.ca marketing site, built against the design tokens in `../../colors_and_type.css`.

## Files

```
index.html              ← demo app — open this
styles.css              ← all component CSS (BEM-ish .mw- prefix)
components/
  TopNav.jsx            ← sticky top nav with brand, links, CTAs
  Hero.jsx              ← full-bleed photographic hero
  ProductGrid.jsx       ← 4-up product line grid
  TrustStrip.jsx        ← awards / partners row
  FeatureBlock.jsx      ← alternating media+copy section
  QuoteForm.jsx         ← Get-a-free-quote form with validation
  Footer.jsx            ← navy footer with phone + links + social
```

## What's interactive
- Top-nav links update active state.
- "Book a Quote" buttons (nav, hero, feature actions) open a centred modal containing the QuoteForm.
- The QuoteForm validates Name / Email / Phone client-side, shows error states (red 0.5 px border + red message) and a Thank-you state on submit.

## What's stubbed / cut
- Carousels, video heroes, hover-to-play videos.
- The Discover dropdown menu hovers but does not route.
- Phone / social / brochure links are non-routing.
- "Neighbourhood Stories" testimonial block — omitted (no testimonial template in the Figma source).

## Notes
- Built from the live magicwindow.ca markup (the only source of UI layout — the Figma file contains a style guide artboard only, not screen designs).
- Imagery is the actual brand photography from the Webflow CDN.
- Wordmark is a typographic substitute in Mulish Black until the licensed Harmonia Sans Pro / official SVG logo is supplied.
