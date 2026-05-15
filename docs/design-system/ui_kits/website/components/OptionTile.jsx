// magic — OptionTile
// A square selectable tile with a thumbnail/SVG and a 1–2 line label.
// Used in the configurator option grids (window styles, frame colours, etc).

function OptionTile({ active, label, swatch, thumb, onClick, dimensions }) {
  return (
    <button
      className={"cfg-tile" + (active ? " is-active" : "")}
      onClick={onClick}
    >
      <div className="cfg-tile__media">
        {swatch && <div className="cfg-tile__swatch" style={{ background: swatch }} />}
        {thumb  && <div className="cfg-tile__thumb"  dangerouslySetInnerHTML={{ __html: thumb }} />}
      </div>
      <div className="cfg-tile__label">{label}</div>
      {dimensions && <div className="cfg-tile__dim">{dimensions}</div>}
    </button>
  );
}

window.OptionTile = OptionTile;
