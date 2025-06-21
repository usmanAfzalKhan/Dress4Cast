// src/components/ForecastList.jsx

import React from "react";
import ForecastCard from "./ForecastCard.jsx";

/**
 * ForecastList:
 * Renders a grid of forecast cards based on provided forecast data.
 * - forecastData.list: array of forecast entries (API-provided)
 * - unit: temperature unit indicator ("metric" or "imperial")
 * - maxSlots: maximum number of forecast cards to display (default 4)
 */
export default function ForecastList({ forecastData, unit, maxSlots = 4 }) {
  // Ensure a safe array even if forecastData is undefined
  const list = forecastData?.list || [];
  // Select the first maxSlots entries for display
  const slots = list.slice(0, maxSlots);

  // Render nothing if there are no forecast entries
  if (slots.length === 0) return null;

  // Grid styling for responsive layout:
  // - Up to 4 slots: display as 2x2
  // - 1 or 2 slots: display in a single row
  const gridStyles = {
    display: "grid",
    gap: 18,
    marginTop: 18,
    marginBottom: 12,
    width: "100%",
    maxWidth: 520,
    justifyItems: "center",
    alignItems: "stretch",
    gridTemplateColumns: slots.length > 2
      ? "1fr 1fr"
      : `repeat(${slots.length}, 1fr)`,
    gridTemplateRows: slots.length > 2 ? "1fr 1fr" : "1fr",
  };

  return (
    <div style={gridStyles}>
      {slots.map((item) => (
        // ForecastCard displays individual slot details and suggestion toggle
        <ForecastCard
          key={item.dt}
          item={item}
          unit={unit}
        />
      ))}
    </div>
  );
}
