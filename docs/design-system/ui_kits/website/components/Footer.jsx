// magic — Footer
// Navy footer with phone, links, social, brochure download.

function Footer() {
  return (
    <footer className="mw-footer">
      <div className="mw-footer__inner">
        <div className="mw-footer__col">
          <span className="mw-footer__brand">magic<sup>™</sup></span>
          <p className="mw-footer__tag">Trusted in Ontario since 1979.</p>
        </div>

        <div className="mw-footer__col">
          <h6 className="mw-footer__h">Call us now for a free quote</h6>
          <a className="mw-footer__phone" href="tel:1-866-65-62442">1-866-OK-MAGIC</a>
          <p className="mw-footer__small">Book a free consultation today</p>
          <div className="mw-footer__ctas">
            <a className="mw-btn mw-btn--ghost-light">Call</a>
            <a className="mw-btn mw-btn--on-dark">Get a Quote</a>
          </div>
        </div>

        <div className="mw-footer__col">
          <h6 className="mw-footer__h">Explore</h6>
          <a className="mw-footer__link">Contact Us</a>
          <a className="mw-footer__link">Brochure</a>
          <a className="mw-footer__link">Warranty</a>
          <a className="mw-footer__link">Careers</a>
        </div>

        <div className="mw-footer__col">
          <h6 className="mw-footer__h">Follow</h6>
          <div className="mw-footer__social">
            <a>Facebook</a><a>Instagram</a><a>YouTube</a><a>TikTok</a><a>LinkedIn</a>
          </div>
        </div>
      </div>
      <div className="mw-footer__bar">
        <span>© {new Date().getFullYear()} Magic™ Windows &amp; Doors. Made in Ontario, Canada.</span>
        <span>Serving Toronto · Mississauga · Oakville · The GTA</span>
      </div>
    </footer>
  );
}

window.Footer = Footer;
