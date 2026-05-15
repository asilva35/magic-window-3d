// magic — TrustStrip
// Section divider with award/partner badges.

function TrustStrip({ title = "Proven. Trusted. Awarded." }) {
  const badges = [
    "assets/golf-canada.svg",
    "assets/google-review.svg",
    "assets/ontario-made.svg",
    "assets/toronto-star.svg",
    "assets/window-awards.svg",
  ];
  return (
    <section className="mw-trust">
      <h6 className="mw-trust__title">{title}</h6>
      <div className="mw-trust__row">
        {badges.map((b, i) => (
          <img key={i} src={"../../" + b} alt="" className="mw-trust__badge" />
        ))}
      </div>
    </section>
  );
}

window.TrustStrip = TrustStrip;
