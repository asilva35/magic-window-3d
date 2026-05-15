// magic — Hero
// Full-bleed photographic hero with overlaid heading + sub + CTAs.

function Hero({ eyebrow, title, subtitle, ctaPrimary = "Book a Quote", ctaSecondary = "Learn More", image, onPrimary, onSecondary }) {
  return (
    <section className="mw-hero" style={{ backgroundImage: `url(${image})` }}>
      <div className="mw-hero__scrim" />
      <div className="mw-hero__inner">
        {eyebrow && <div className="mw-eyebrow mw-eyebrow--light">{eyebrow}</div>}
        <h1 className="mw-hero__title">{title}</h1>
        {subtitle && <p className="mw-hero__sub">{subtitle}</p>}
        <div className="mw-hero__ctas">
          <button className="mw-btn mw-btn--primary" onClick={onPrimary}>{ctaPrimary}</button>
          <button className="mw-btn mw-btn--ghost-light" onClick={onSecondary}>{ctaSecondary}</button>
        </div>
      </div>
    </section>
  );
}

window.Hero = Hero;
