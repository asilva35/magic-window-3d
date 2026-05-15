# Magic™ Windows & Doors — 3D Configurator

React + Vite + TypeScript project. Uses React Three Fiber (`@react-three/fiber`) and Three.js for a 3D door/window product configurator.

## Design system

All brand tokens and UI kit classes live in `src/design-system/`:

| File | Contents |
|---|---|
| `tokens.css` | CSS custom properties — colors, type scale, spacing, radii, shadows, motion |
| `components.css` | Full UI kit — `.mw-btn`, `.mw-nav`, `.mw-form`, `.mw-field`, etc. |
| `configurator.css` | Configurator shell — `.cfg`, `.cfg__viewport`, `.cfg__panel`, `.cfg-steps`, etc. |

Full brand guidelines → `docs/design-system/README.md`
Quick token/component reference → `docs/design-system/SKILL.md`

## Layout structure

```
.mw-app                        (flex column, 100vh)
  .mw-nav                      (sticky top nav, ~65px)
  .cfg                         (flex column, fills remaining height)
    .cfg__topbar               (chip + estimated price)
    .cfg__body                 (grid: 1fr | 460px panel | 96px step rail)
      .cfg__viewport           (React Three Fiber <Canvas> fills this cell)
      .cfg__panel              (scrollable config options)
      aside.cfg-steps          (vertical step rail)
    .cfg__footer               (back | progress | save | next/book)
```

## Key conventions

- Always use brand tokens — never hard-code `#001B70`, use `var(--magic-dark-blue)`
- Typography: Mulish Black for display/headings, Open Sans for body — never any other family
- Sliders/controls: use `cfg-size__field` with +/− buttons from the design system
- No emoji, no decorative elements — the windows/doors are the hero
- Three.js material colors (door/frame hex values) are WebGL values, not CSS — they are exempt from the token rule
- `Stage` was removed from drei imports — it was unused
