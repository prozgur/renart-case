import React, { useMemo, useState } from "react";
import { Carousel } from "./Carousel.jsx";

export function ProductCard({ product }) {
  // Single source of truth for order: yellow -> white -> rose
  const COLORS = ["yellow", "white", "rose"];
  const COLOR_HEX = { yellow: "#E6CA97", white: "#D9D9D9", rose: "#E1A4A9" };

  // Carousel image list strictly follows COLORS order
  const urls = useMemo(
    () => COLORS.map((c) => product?.images?.[c] ?? null),
    [product]
  );

  const [color, setColor] = useState(COLORS[0]);
  const currentIndex = COLORS.indexOf(color);

  return (
    <div className="card">
      <Carousel
        urls={urls}
        alt={product.name}
        index={currentIndex}
        onIndexChange={(i) => setColor(COLORS[i] || COLORS[0])}
      />

      <div className="content">
        <h3 className="title">{product.name}</h3>
        <p className="price">${product.priceUSD.toFixed(2)}</p>

        <div className="colors" role="radiogroup" aria-label="Gold color">
          {COLORS.map((c) => (
            <div
              key={c}
              className="swatch"
              style={{ background: COLOR_HEX[c] }}
              data-active={color === c}
              role="radio"
              tabIndex={0}
              aria-checked={color === c}
              onKeyDown={(e) => {
                if (["Enter", " "].includes(e.key)) {
                  e.preventDefault();
                  setColor(c);
                }
              }}
              onClick={() => setColor(c)}
              title={`${c} gold`}
            />
          ))}
        </div>

        <div className="footer">
          <span className="muted">{product.popularity5.toFixed(1)}/5</span>
          <span className="muted">{product.weight} g</span>
        </div>
      </div>
    </div>
  );
}
