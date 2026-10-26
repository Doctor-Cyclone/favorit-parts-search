export default function BrandList({ brands, selectedBrand, onSelect }) {
  return (
    <section className="panel" aria-labelledby="brands-title">
      <div className="section-heading">
        <div>
          <h2 id="brands-title">
            Выберите производителя <small>{brands.length}</small>
          </h2>
        </div>
      </div>
      <div className="brands">
        {brands.map((brand) => (
          <button
            key={brand}
            aria-pressed={selectedBrand === brand}
            className={selectedBrand === brand ? "brand selected" : "brand"}
            onClick={() => onSelect(brand)}
          >
            {brand}
            <span className="brand-check" aria-hidden="true">
              {selectedBrand === brand ? "✓" : "→"}
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}
