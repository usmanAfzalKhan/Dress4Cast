// src/components/ForecastList.jsx
import React from "react";
import ForecastCard from "./ForecastCard.jsx";

export default function ForecastList({ forecastData, unit, maxSlots = 4 }) {
  const list = forecastData?.list || [];
  // Only take up to maxSlots entries (default 4)
  const slots = list.slice(0, maxSlots);

  if (slots.length === 0) return null;

  // Responsive 2x2 grid for up to 4 cards
  const gridStyles = {
    display: "grid",
    gap: 18,
    marginTop: 18,
    marginBottom: 12,
    width: "100%",
    // For 4 cards: 2x2, for 2 cards: 2x1
    gridTemplateColumns:
      slots.length > 2 ? "1fr 1fr" : `repeat(${slots.length}, 1fr)`,
    gridTemplateRows:
      slots.length > 2 ? "1fr 1fr" : "1fr",
    justifyItems: "center",
    alignItems: "stretch",
    maxWidth: 520,
  };

  return (
    <div style={gridStyles}>
      {slots.map((item) => (
        <ForecastCard
          key={item.dt}
          item={item}
          unit={unit}
        />
      ))}
    </div>
  );
}
