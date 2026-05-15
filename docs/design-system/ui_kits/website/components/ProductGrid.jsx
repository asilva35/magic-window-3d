// magic — Product grid
// 4-up grid of product lines. Hover lifts subtle overlay.

function ProductGrid({ items, onSelect = () => {} }) {
  return (
    <section className="mw-products">
      {items.map(p => (
        <a key={p.id} className="mw-product" onClick={() => onSelect(p.id)}>
          <div className="mw-product__media" style={{ backgroundImage: `url(${p.image})` }}>
            <div className="mw-product__scrim" />
          </div>
          <div className="mw-product__copy">
            <h2 className="mw-product__title">{p.title}</h2>
            <p className="mw-product__sub">{p.sub}</p>
            <div className="mw-product__ctas">
              <span className="mw-product__cta">Learn More →</span>
              <span className="mw-product__cta mw-product__cta--book">Book a Quote</span>
            </div>
          </div>
        </a>
      ))}
    </section>
  );
}

window.ProductGrid = ProductGrid;
