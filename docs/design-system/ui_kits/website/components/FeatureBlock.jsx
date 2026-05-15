// magic — FeatureBlock
// Alternating media-on-one-side, copy-on-other section.
// Used for Parallex®, Hi-Flo® Drainage, Hybrid Fusion Frame, Retractable Bug Screen.

function FeatureBlock({ eyebrow, title, body, image, side = "left", action }) {
  return (
    <section className={"mw-feature mw-feature--" + side}>
      <div className="mw-feature__media">
        <img src={image} alt="" />
      </div>
      <div className="mw-feature__copy">
        {eyebrow && <div className="mw-eyebrow">{eyebrow}</div>}
        <h2 className="mw-feature__title">{title}</h2>
        <p className="mw-feature__body">{body}</p>
        {action && (
          <button className="mw-btn mw-btn--primary" onClick={action.onClick}>
            {action.label}
          </button>
        )}
      </div>
    </section>
  );
}

window.FeatureBlock = FeatureBlock;
