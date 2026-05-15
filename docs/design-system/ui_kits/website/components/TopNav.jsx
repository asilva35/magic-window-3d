// magic — TopNav
// Sticky top navigation; brand wordmark left, product links centre, CTA right.
// Source: magicwindow.ca header.

function TopNav({ active = "home", onNavigate = () => {}, onQuote = () => {} }) {
  const links = [
    { id: "windows",   label: "Windows" },
    { id: "walls",     label: "Window Walls" },
    { id: "patio",     label: "Patio Doors" },
    { id: "front",     label: "Front Doors" },
    { id: "gallery",   label: "Photos" },
    { id: "videos",    label: "Videos" },
  ];
  return (
    <header className="mw-nav">
      <a className="mw-nav__brand" onClick={() => onNavigate("home")}>
        <span className="mw-wordmark">magic</span>
        <sup className="mw-tm">™</sup>
      </a>
      <nav className="mw-nav__links">
        {links.map(l => (
          <a key={l.id}
             className={"mw-nav__link" + (active === l.id ? " is-active" : "")}
             onClick={() => onNavigate(l.id)}>
            {l.label}
          </a>
        ))}
        <div className="mw-nav__dropdown">
          <span className="mw-nav__link">Discover ▾</span>
          <div className="mw-nav__menu">
            <a onClick={() => onNavigate("faq")}>FAQ</a>
            <a onClick={() => onNavigate("warranty")}>Warranty</a>
            <a onClick={() => onNavigate("blog")}>Blog</a>
            <a onClick={() => onNavigate("stories")}>Neighbourhood Stories</a>
          </div>
        </div>
      </nav>
      <div className="mw-nav__cta">
        <button className="mw-btn mw-btn--ghost" onClick={() => onNavigate("call")}>Call Us</button>
        <button className="mw-btn mw-btn--primary" onClick={onQuote}>Book a Quote</button>
      </div>
    </header>
  );
}

window.TopNav = TopNav;
