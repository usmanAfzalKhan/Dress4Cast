// src/components/ForecastList.jsx
import React, { useState } from "react";
import OutfitSuggestion from "./OutfitSuggestion.jsx";

export default function ForecastList({
  forecastData,
  unit,
  maxSlots = 5,  // show up to 5 cards
}) {
  // take only the first `maxSlots` entries
  const slots = forecastData.list.slice(0, maxSlots);
  const [selectedDt, setSelectedDt] = useState(null);

  return (
    <div
      style={{
        display: "grid",
        gap: 16,
        gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
        marginTop: 24,
      }}
    >
      {slots.map((item) => {
        const date = new Date(item.dt * 1000);
        const labelDate = date.toLocaleDateString(undefined, {
          month: "numeric",
          day: "numeric",
        });
        const labelTime = date.toLocaleTimeString(undefined, {
          hour: "numeric",
          hour12: true,
        });
        const temp = Math.round(item.main.temp);

        return (
          <div
            key={item.dt}
            style={{
              border: "1px solid #ccc",
              borderRadius: 8,
              padding: 12,
              textAlign: "center",
            }}
          >
            <div style={{ fontWeight: "bold", marginBottom: 4 }}>
              {labelDate}
            </div>
            <div style={{ marginBottom: 8 }}>{labelTime}</div>
            <div style={{ fontSize: 24, marginBottom: 4 }}>
              {temp}°{unit === "metric" ? "C" : "F"}
            </div>
            <div
              style={{ textTransform: "capitalize", marginBottom: 12 }}
            >
              {item.weather[0].description}
            </div>

            <button
              onClick={() =>
                setSelectedDt((dt) => (dt === item.dt ? null : item.dt))
              }
              style={{
                padding: "6px 12px",
                borderRadius: 4,
                border: "none",
                background: "#333",
                color: "#fff",
                cursor: "pointer",
              }}
            >
              View suggestion
            </button>

            {selectedDt === item.dt && (
              <div style={{ marginTop: 16 }}>
                <OutfitSuggestion weather={item} unit={unit} />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
