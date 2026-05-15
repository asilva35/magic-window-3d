// magic — ConfiguratorSidebar
// Vertical stepper on the far right of the configurator. Each step has a tiny
// glyph and a 2-line label. Active step has navy fill + sky underline.

function ConfiguratorSidebar({ steps, active, onSelect }) {
  return (
    <aside className="cfg-steps">
      {steps.map((s, i) => {
        const isActive = i === active;
        const isDone   = i < active;
        return (
          <button
            key={s.id}
            className={"cfg-steps__item" + (isActive ? " is-active" : "") + (isDone ? " is-done" : "")}
            onClick={() => onSelect(i)}
          >
            <div className="cfg-steps__glyph" dangerouslySetInnerHTML={{ __html: s.glyph }} />
            <div className="cfg-steps__label">{s.label}</div>
          </button>
        );
      })}
    </aside>
  );
}

window.ConfiguratorSidebar = ConfiguratorSidebar;
