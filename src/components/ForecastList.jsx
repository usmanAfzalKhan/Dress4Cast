// src/components/ForecastList.jsx
import React from "react";
import ForecastCard from "./ForecastCard.jsx";

export default function ForecastList({ forecastData, unit, maxSlots = 4 }) {
  // Safely grab the list (or empty array)
  const list = forecastData?.list || [];
  // Only take up to maxSlots entries
  const slots = list.slice(0, maxSlots);

  if (slots.length === 0) return null;

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${slots.length}, 1fr)`,
        gap: 16,
        marginTop: 24,
      }}
    >
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
