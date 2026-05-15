// magic — Configurator
// Main configurator surface. Hosts the live preview viewport, step content,
// far-right step sidebar, and the floating action footer (Save Quote + Get Quote).
//
// Steps array drives both the rail and the content. Each step has:
//   id, label, glyph (svg string), render(state, setState)

function Configurator({ open, onClose, onSubmit }) {
  const [state, setState] = React.useState({
    productType: "window",
    style: "casement",
    width: 36,
    height: 60,
    frame: "white",
    glass: "triple",
    hardware: "parallex",
    screen: "retractable",
    zip: "M5V 2K7",
  });
  const update = (patch) => setState(s => ({ ...s, ...patch }));

  const [stepIdx, setStepIdx] = React.useState(0);
  const steps = STEPS;

  const price = computePrice(state);

  return (
    <div className="cfg">
      <div className="cfg__topbar">
        <div className="cfg__chip">
          <span className="cfg__chip-ribbon">Limited</span>
          <span>Free in-home consultation · 40-year warranty</span>
        </div>
        <div className="cfg__topbar-right">
          <div className="cfg__price">
            <div className="cfg__price-label">Estimated</div>
            <div className="cfg__price-amount">${price.toLocaleString()} <span>CAD</span></div>
          </div>
          <button className="mw-btn mw-btn--ghost cfg__details">Details</button>
        </div>
      </div>

      <div className="cfg__body">
        <div className="cfg__viewport">
          <div className="cfg__zip">
            <div className="cfg__zip-label">Installing in</div>
            <div className="cfg__zip-value">Toronto · {state.zip}</div>
          </div>
          <Viewport state={state} />
          <div className="cfg__tools">
            <button title="Rotate" className="cfg__tool"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><path d="M21 12a9 9 0 1 1-3-6.7"/><path d="M21 4v5h-5"/></svg></button>
            <button title="Pan" className="cfg__tool"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><path d="M5 9l-3 3 3 3M9 5l3-3 3 3M19 9l3 3-3 3M9 19l3 3 3-3M2 12h20M12 2v20"/></svg></button>
            <button title="Fullscreen" className="cfg__tool"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><path d="M3 9V3h6M21 9V3h-6M3 15v6h6M21 15v6h-6"/></svg></button>
          </div>
          <div className="cfg__viewport-meta">
            <button className="cfg__viewport-chip">Show Interior</button>
            <button className="cfg__viewport-chip">Show Top View</button>
          </div>
        </div>

        <div className="cfg__panel">
          <div className="cfg__panel-inner">
            {steps[stepIdx].render(state, update)}
          </div>
        </div>

        <ConfiguratorSidebar steps={steps} active={stepIdx} onSelect={setStepIdx} />
      </div>

      <div className="cfg__footer">
        <button className="mw-btn mw-btn--tertiary cfg__back" onClick={() => setStepIdx(Math.max(0, stepIdx - 1))} disabled={stepIdx === 0}>
          ← Back
        </button>
        <div className="cfg__progress">
          Step {stepIdx + 1} of {steps.length} · {steps[stepIdx].label.replace("\n", " ")}
        </div>
        <button className="mw-btn mw-btn--ghost" onClick={onSubmit}>Save Configuration</button>
        {stepIdx < steps.length - 1 ? (
          <button className="mw-btn mw-btn--primary" onClick={() => setStepIdx(stepIdx + 1)}>
            Next: {steps[stepIdx + 1].label.replace("\n", " ")} →
          </button>
        ) : (
          <button className="mw-btn mw-btn--primary" onClick={onSubmit}>Book a Quote</button>
        )}
      </div>
    </div>
  );
}

/* ── Viewport ───────────────────────────────────────────────────── */
function Viewport({ state }) {
  // The "3D preview" — a high-fidelity placeholder. We show the brand
  // lifestyle photo behind a stylised window/door illustration that
  // reflects the user's choices.
  const isDoor   = state.productType === "patio" || state.productType === "front";
  const isWall   = state.productType === "wall";
  const frameRgb = FRAME_SWATCHES[state.frame];
  const aspect   = isWall ? 2.2 : (isDoor ? 0.55 : (state.width / state.height));
  return (
    <div className="cfg__stage">
      <div className="cfg__stage-bg" />
      <div className="cfg__product" style={{ aspectRatio: aspect, "--frame": frameRgb }}>
        <WindowSVG style={state.style} type={state.productType} />
      </div>
      <div className="cfg__product-caption">
        <strong>{PRODUCT_TYPES.find(t => t.id === state.productType).label}</strong>
        <span> · {STYLES[state.productType].find(s => s.id === state.style)?.label || ""}</span>
        <span> · {state.width}" × {state.height}"</span>
      </div>
    </div>
  );
}

/* SVG window placeholder — switches lite-pattern based on style */
function WindowSVG({ style, type }) {
  // Common: outer frame, sash. The internal lite pattern changes per style.
  // 100x100 viewBox; the .cfg__product element sets the actual aspect ratio.
  const lites = LITE_PATTERNS[type]?.[style] || LITE_PATTERNS.default;
  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="cfg__window">
      {/* Outer frame */}
      <rect x="0" y="0" width="100" height="100" fill="var(--frame)" />
      {/* Glass area */}
      <rect x="4" y="4" width="92" height="92" fill="url(#cfg-glass)" />
      {/* Lite divisions */}
      {lites.map((line, i) =>
        <line key={i} x1={line[0]} y1={line[1]} x2={line[2]} y2={line[3]}
              stroke="var(--frame)" strokeWidth={line[4] || 2.4} strokeLinecap="square" />
      )}
      <defs>
        <linearGradient id="cfg-glass" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%"   stopColor="#C7D2EC" stopOpacity="0.55" />
          <stop offset="50%"  stopColor="#E8F1F8" stopOpacity="0.65" />
          <stop offset="100%" stopColor="#6AC3E7" stopOpacity="0.55" />
        </linearGradient>
      </defs>
    </svg>
  );
}

/* ── Static data ───────────────────────────────────────────────── */

const PRODUCT_TYPES = [
  { id: "window", label: "Window",      sub: "Casement, awning, hung, slider, picture",
    glyph: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="3" y="3" width="18" height="18" rx="0.5"/><line x1="12" y1="3" x2="12" y2="21"/><line x1="3" y1="12" x2="21" y2="12"/></svg>` },
  { id: "patio",  label: "Patio Door",  sub: "Sliding patio doors, French doors",
    glyph: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="3" y="3" width="18" height="18" rx="0.5"/><line x1="12" y1="3" x2="12" y2="21"/><circle cx="10" cy="13" r="0.7" fill="currentColor"/></svg>` },
  { id: "front",  label: "Front Door",  sub: "The ultimate entry door",
    glyph: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16"/><line x1="3" y1="21" x2="21" y2="21"/><circle cx="15" cy="13" r="0.7" fill="currentColor"/></svg>` },
  { id: "wall",   label: "Window Wall", sub: "Floor-to-ceiling, slim-frame",
    glyph: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="3" y="3" width="18" height="18" rx="0.5"/><line x1="9" y1="3" x2="9" y2="21"/><line x1="15" y1="3" x2="15" y2="21"/></svg>` },
];

const STYLES = {
  window: [
    { id: "casement",   label: "Casement",     sub: "Push-out, Parallex® hardware" },
    { id: "awning",     label: "Awning",       sub: "Top-hinged, opens outward" },
    { id: "hung",       label: "Double Hung",  sub: "Traditional vertical slide" },
    { id: "slider",     label: "Slider",       sub: "Horizontal glide" },
    { id: "picture",    label: "Picture",      sub: "Fixed, maximum view" },
    { id: "bay",        label: "Bay",          sub: "Three-panel projection" },
  ],
  patio: [
    { id: "slider2",    label: "2-Panel Slider", sub: "Ultra smooth glide" },
    { id: "slider3",    label: "3-Panel Slider", sub: "Wide opening" },
    { id: "slider4",    label: "4-Panel Slider", sub: "Maximum aperture" },
    { id: "french",     label: "French",         sub: "Centre-hinged double" },
  ],
  front: [
    { id: "single",     label: "Single",         sub: "Standard residential" },
    { id: "single-side",label: "Single + Sidelite", sub: "One side panel" },
    { id: "double",     label: "Double",         sub: "Two equal panels" },
    { id: "double-side",label: "Double + Sidelites", sub: "Grand entry" },
  ],
  wall: [
    { id: "wall-3",     label: "3-Bay Wall",     sub: "Slim frames, big views" },
    { id: "wall-4",     label: "4-Bay Wall",     sub: "Floor-to-ceiling glass" },
    { id: "wall-corner",label: "Corner Wall",    sub: "Wraparound glass" },
  ],
};

const FRAME_SWATCHES = {
  white:  "#F4F5F7",
  almond: "#E5DCC9",
  cobble: "#888A8C",
  black:  "#1B1B1F",
  navy:   "#001B70",
  espresso: "#3B2A1E",
};

const GLASS_PACKAGES = [
  { id: "double", label: "Double Pane",  sub: "Standard argon · ER 21", price: 0 },
  { id: "triple", label: "Triple Pane",  sub: "50% more argon · ER 38", price: 480 },
  { id: "lowe",   label: "Triple + Low-E", sub: "Best year-round comfort", price: 720 },
];

const HARDWARE = [
  { id: "parallex",   label: "Parallex® push-out", sub: "Patented · never crank again", price: 0,
    note: "Default. Eliminates the crank mechanism with a simple push." },
  { id: "crank",      label: "Traditional crank",  sub: "Compatible with retrofit setups",     price: -90 },
];

const SCREENS = [
  { id: "retractable", label: "Retractable Bug Screen", sub: "Hidden when not in use", price: 220 },
  { id: "standard",    label: "Standard Screen",        sub: "Fixed, full-coverage", price: 0 },
  { id: "none",        label: "No Screen",              sub: "Skip the screen",      price: -60 },
];

const LITE_PATTERNS = {
  window: {
    casement: [[50, 4, 50, 96, 1.8]],
    awning:   [[4, 50, 96, 50, 1.8]],
    hung:     [[4, 50, 96, 50, 1.8]],
    slider:   [[50, 4, 50, 96, 1.8]],
    picture:  [],
    bay:      [[33.3, 4, 33.3, 96, 1.8], [66.6, 4, 66.6, 96, 1.8]],
  },
  patio: {
    slider2: [[50, 4, 50, 96, 2.5]],
    slider3: [[33.3, 4, 33.3, 96, 2.5], [66.6, 4, 66.6, 96, 2.5]],
    slider4: [[25, 4, 25, 96, 2.5], [50, 4, 50, 96, 2.5], [75, 4, 75, 96, 2.5]],
    french:  [[50, 4, 50, 96, 2.5]],
  },
  front: {
    single:      [],
    "single-side": [[33.3, 4, 33.3, 96, 2.5]],
    double:      [[50, 4, 50, 96, 2.5]],
    "double-side": [[20, 4, 20, 96, 2.5], [50, 4, 50, 96, 2.5], [80, 4, 80, 96, 2.5]],
  },
  wall: {
    "wall-3":      [[33.3, 4, 33.3, 96, 1.5], [66.6, 4, 66.6, 96, 1.5]],
    "wall-4":      [[25, 4, 25, 96, 1.5], [50, 4, 50, 96, 1.5], [75, 4, 75, 96, 1.5]],
    "wall-corner": [[40, 4, 40, 96, 1.5]],
  },
  default: [],
};

function computePrice(state) {
  const base = { window: 1180, patio: 3950, front: 4400, wall: 8600 }[state.productType] || 1200;
  const sizeMult = (state.width * state.height) / (36 * 60);
  const glass = GLASS_PACKAGES.find(g => g.id === state.glass)?.price || 0;
  const screen = SCREENS.find(s => s.id === state.screen)?.price || 0;
  const hw = HARDWARE.find(h => h.id === state.hardware)?.price || 0;
  return Math.round((base * sizeMult + glass + screen + hw) / 10) * 10;
}

/* ── Step renderers ───────────────────────────────────────────── */

function StepHeader({ title, sub }) {
  return (
    <div className="cfg-step__head">
      <div className="cfg-step__h">{title}</div>
      {sub && <div className="cfg-step__sub">{sub}</div>}
    </div>
  );
}

function SectionTitle({ children }) {
  return <div className="cfg-section__title">{children}</div>;
}

const STEPS = [
  /* 1 — Product type */
  {
    id: "type",
    label: "Product\nType",
    glyph: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="3" y="3" width="18" height="18" rx="0.5"/><line x1="12" y1="3" x2="12" y2="21"/><line x1="3" y1="12" x2="21" y2="12"/></svg>`,
    render: (state, update) => (
      <div className="cfg-step">
        <StepHeader title="What are we installing?" sub="Pick a starting product — you can change this any time." />
        <SectionTitle>Select a product</SectionTitle>
        <div className="cfg-grid cfg-grid--2col">
          {PRODUCT_TYPES.map(t => (
            <button key={t.id}
                    className={"cfg-card" + (state.productType === t.id ? " is-active" : "")}
                    onClick={() => update({ productType: t.id, style: STYLES[t.id][0].id })}>
              <div className="cfg-card__glyph" dangerouslySetInnerHTML={{ __html: t.glyph }} />
              <div>
                <div className="cfg-card__label">{t.label}</div>
                <div className="cfg-card__sub">{t.sub}</div>
              </div>
            </button>
          ))}
        </div>
      </div>
    ),
  },

  /* 2 — Style */
  {
    id: "style",
    label: "Style\n& Opening",
    glyph: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="3" y="3" width="18" height="18"/><path d="M3 12h18"/><path d="M16 12 12 8"/></svg>`,
    render: (state, update) => (
      <div className="cfg-step">
        <StepHeader title="Pick a style" sub={`Available for ${PRODUCT_TYPES.find(t => t.id === state.productType).label}.`} />
        <div className="cfg-grid cfg-grid--3col">
          {STYLES[state.productType].map(s => (
            <OptionTile key={s.id}
              active={state.style === s.id}
              label={s.label}
              dimensions={s.sub}
              thumb={`<svg viewBox="0 0 60 60"><rect x="3" y="3" width="54" height="54" fill="#fff" stroke="#001B70" stroke-width="2"/><rect x="8" y="8" width="44" height="44" fill="#E8F1F8"/>${(LITE_PATTERNS[state.productType]?.[s.id] || []).map(l => `<line x1="${8 + (l[0]-4)*0.522}" y1="${8 + (l[1]-4)*0.522}" x2="${8 + (l[2]-4)*0.522}" y2="${8 + (l[3]-4)*0.522}" stroke="#001B70" stroke-width="${l[4] || 2}"/>`).join('')}</svg>`}
              onClick={() => update({ style: s.id })}
            />
          ))}
        </div>
      </div>
    ),
  },

  /* 3 — Size */
  {
    id: "size",
    label: "Size",
    glyph: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M3 21V3M21 21V3M3 12h18"/></svg>`,
    render: (state, update) => (
      <div className="cfg-step">
        <StepHeader title="Rough opening" sub="Width × height in inches. Final measurements taken on-site." />
        <div className="cfg-size">
          <SizeField label="Width"  value={state.width}  min={18} max={96}  step={2} onChange={v => update({ width: v })} />
          <div className="cfg-size__by">by</div>
          <SizeField label="Height" value={state.height} min={24} max={120} step={2} onChange={v => update({ height: v })} />
        </div>
        <div className="cfg-help">
          <SectionTitle>Visual size selection help</SectionTitle>
          <div className="cfg-help__row">
            <div className="cfg-help__diagram">
              <div className="cfg-help__win" style={{
                width:  Math.min(220, state.width * 2.4),
                height: Math.min(260, state.height * 2.4),
              }}>
                <span className="cfg-help__dim cfg-help__dim--w">{state.width}"</span>
                <span className="cfg-help__dim cfg-help__dim--h">{state.height}"</span>
              </div>
            </div>
            <div className="cfg-help__text">
              <p><strong>Minimum:</strong> 18" × 24"</p>
              <p><strong>Maximum:</strong> 96" × 120"</p>
              <p>Custom sizes available outside this range — request during consultation.</p>
            </div>
          </div>
        </div>
      </div>
    ),
  },

  /* 4 — Frame */
  {
    id: "frame",
    label: "Frame\nColour",
    glyph: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="12" cy="12" r="8"/><path d="M12 4v16M4 12h16"/></svg>`,
    render: (state, update) => (
      <div className="cfg-step">
        <StepHeader title="Frame finish" sub="Inside and outside finishes can be matched or contrasted during consultation." />
        <div className="cfg-grid cfg-grid--6col">
          {Object.entries(FRAME_SWATCHES).map(([id, hex]) => (
            <OptionTile key={id}
              active={state.frame === id}
              label={id[0].toUpperCase() + id.slice(1)}
              swatch={hex}
              onClick={() => update({ frame: id })}
            />
          ))}
        </div>
        <div className="cfg-callout">
          <span className="mw-eyebrow">Note</span>
          <p>Magic frames are 50% stronger than vinyl thanks to our <strong>Hybrid Fusion</strong> construction. All finishes come with a 40-year parts &amp; labour warranty.</p>
        </div>
      </div>
    ),
  },

  /* 5 — Glass */
  {
    id: "glass",
    label: "Glass\nPackage",
    glyph: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="4" y="4" width="16" height="16"/><line x1="4" y1="9"  x2="20" y2="9"/><line x1="4" y1="15" x2="20" y2="15"/></svg>`,
    render: (state, update) => (
      <div className="cfg-step">
        <StepHeader title="Choose your glass package" sub="More argon, more layers, lower energy bills." />
        <div className="cfg-list">
          {GLASS_PACKAGES.map(g => (
            <button key={g.id}
              className={"cfg-row" + (state.glass === g.id ? " is-active" : "")}
              onClick={() => update({ glass: g.id })}>
              <div className="cfg-row__check" />
              <div className="cfg-row__main">
                <div className="cfg-row__label">{g.label}</div>
                <div className="cfg-row__sub">{g.sub}</div>
              </div>
              <div className="cfg-row__price">{g.price === 0 ? "Included" : `+ $${g.price} CAD`}</div>
            </button>
          ))}
        </div>
      </div>
    ),
  },

  /* 6 — Hardware */
  {
    id: "hardware",
    label: "Hardware",
    glyph: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="12" cy="12" r="3"/><path d="M12 4v3M12 17v3M4 12h3M17 12h3"/></svg>`,
    render: (state, update) => (
      <div className="cfg-step">
        <StepHeader title="Hardware" sub="Operation and lock mechanism." />
        <div className="cfg-list">
          {HARDWARE.map(h => (
            <button key={h.id}
              className={"cfg-row" + (state.hardware === h.id ? " is-active" : "")}
              onClick={() => update({ hardware: h.id })}>
              <div className="cfg-row__check" />
              <div className="cfg-row__main">
                <div className="cfg-row__label">{h.label}</div>
                <div className="cfg-row__sub">{h.sub}</div>
              </div>
              <div className="cfg-row__price">{h.price === 0 ? "Included" : (h.price > 0 ? `+ $${h.price}` : `– $${Math.abs(h.price)}`)}</div>
            </button>
          ))}
        </div>
        <div className="cfg-callout">
          <span className="mw-eyebrow">Parallex® hardware</span>
          <p>Cranks are mechanically flawed. They strip, loosen and break over time. Our patented Parallex® hardware eliminates the crank with a simple push-out mechanism. <strong>No cranks, no problems.</strong></p>
        </div>
      </div>
    ),
  },

  /* 7 — Screens */
  {
    id: "screen",
    label: "Screens\n& Extras",
    glyph: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="3" y="3" width="18" height="18"/><path d="M3 8h18M3 13h18M3 18h18M8 3v18M13 3v18M18 3v18"/></svg>`,
    render: (state, update) => (
      <div className="cfg-step">
        <StepHeader title="Screen system" sub="The retractable bug screen rolls out of sight when you don't need it." />
        <div className="cfg-list">
          {SCREENS.map(s => (
            <button key={s.id}
              className={"cfg-row" + (state.screen === s.id ? " is-active" : "")}
              onClick={() => update({ screen: s.id })}>
              <div className="cfg-row__check" />
              <div className="cfg-row__main">
                <div className="cfg-row__label">{s.label}</div>
                <div className="cfg-row__sub">{s.sub}</div>
              </div>
              <div className="cfg-row__price">{s.price === 0 ? "Included" : (s.price > 0 ? `+ $${s.price}` : `– $${Math.abs(s.price)}`)}</div>
            </button>
          ))}
        </div>
      </div>
    ),
  },

  /* 8 — Review */
  {
    id: "review",
    label: "Review\n& Quote",
    glyph: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="m5 12 5 5L20 7"/></svg>`,
    render: (state, update) => (
      <div className="cfg-step">
        <StepHeader title="Your configuration" sub="Review the details. A Magic specialist will confirm everything during your in-home consultation." />
        <div className="cfg-summary">
          {[
            ["Product",   PRODUCT_TYPES.find(t => t.id === state.productType).label],
            ["Style",     STYLES[state.productType].find(s => s.id === state.style)?.label],
            ["Size",      `${state.width}" × ${state.height}"`],
            ["Frame",     state.frame[0].toUpperCase() + state.frame.slice(1)],
            ["Glass",     GLASS_PACKAGES.find(g => g.id === state.glass).label],
            ["Hardware",  HARDWARE.find(h => h.id === state.hardware).label],
            ["Screen",    SCREENS.find(s => s.id === state.screen).label],
            ["Install ZIP", state.zip],
          ].map(([k, v]) => (
            <div className="cfg-summary__row" key={k}>
              <div className="cfg-summary__k">{k}</div>
              <div className="cfg-summary__v">{v}</div>
            </div>
          ))}
        </div>
        <div className="cfg-callout cfg-callout--final">
          <span className="mw-eyebrow">What happens next</span>
          <p>Click <strong>Book a Quote</strong> below and we'll contact you within one business day to schedule a free in-home consultation. Final pricing and exact measurements are confirmed on-site — no obligation.</p>
        </div>
      </div>
    ),
  },
];

function SizeField({ label, value, onChange, min, max, step }) {
  return (
    <div className="cfg-size__field">
      <div className="cfg-size__label">{label} (in)</div>
      <div className="cfg-size__control">
        <button className="cfg-size__btn" onClick={() => onChange(Math.max(min, value - step))}>−</button>
        <div className="cfg-size__value">{value}</div>
        <button className="cfg-size__btn" onClick={() => onChange(Math.min(max, value + step))}>+</button>
      </div>
      <input className="cfg-size__range" type="range" min={min} max={max} step={step} value={value} onChange={e => onChange(+e.target.value)} />
    </div>
  );
}

window.Configurator = Configurator;
