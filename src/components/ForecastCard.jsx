// src/components/ForecastCard.jsx
import React, { useState } from "react";

// pick a background color based on description keywords
function getBgColor(desc) {
  const d = desc.toLowerCase();
  if (d.includes("rain"))   return "#d2e0ea";
  if (d.includes("snow"))   return "#e8f0fa";
  if (d.includes("cloud"))  return "#f0f0f0";
  if (d.includes("clear") || d.includes("sun")) return "#fff7e6";
  return "#f8f8f8";
}

// generate a short, dynamic suggestion
function generateSuggestion(temp, desc, unit) {
  const tUnit = unit === "metric" ? "°C" : "°F";
  const lower = desc.toLowerCase();

  if (lower.includes("rain")) {
    return `Expect ${desc} and around ${temp}${tUnit}. Don’t forget a waterproof layer or umbrella.`;
  }
  if (lower.includes("snow")) {
    return `Snowy skies at ${temp}${tUnit}. Insulated boots and a warm coat are a must.`;
  }
  if (lower.includes("cloud")) {
    return `Overcast skies, ${temp}${tUnit}. A cozy sweater and light jacket will keep you comfy.`;
  }
  if (lower.includes("clear") || lower.includes("sun")) {
    return `Clear skies and ${temp}${tUnit}. A breathable tee and sunglasses are perfect.`;
  }
  // fallback
  return `Currently ${temp}${tUnit} with ${desc}. Dress comfortably for the conditions.`;
}

export default function ForecastCard({ item, unit }) {
  // guard against missing data
  if (!item || !item.main || !item.weather) return null;

  const dateObj = new Date(item.dt_txt);
  const date = dateObj.toLocaleDateString(undefined, {
    month: "numeric",
    day: "numeric",
  });
  const time = dateObj.toLocaleTimeString(undefined, {
    hour: "numeric",
    hour12: true,
  });

  const temp = Math.round(item.main.temp);
  const desc = item.weather[0].description;
  const [shown, setShown] = useState(false);

  const suggestion = generateSuggestion(temp, desc, unit);
  const bg = getBgColor(desc);

  return (
    <div
      style={{
        background: bg,
        color: "#2d3436",
        borderRadius: 8,
        padding: 12,
        textAlign: "center",
      }}
    >
      <div style={{ fontSize: 12, color: "#666" }}>{date}</div>
      <div style={{ fontWeight: "bold", margin: "4px 0" }}>{time}</div>
      <div style={{ marginBottom: 8 }}>
        {temp}°{unit === "metric" ? "C" : "F"}
        <br />
        <small>{desc}</small>
      </div>

      {!shown ? (
        <button
          onClick={() => setShown(true)}
          style={{
            padding: "6px 12px",
            border: "none",
            borderRadius: 4,
            background: "#2d3436",
            color: "#fff",
            cursor: "pointer",
          }}
        >
          View suggestion
        </button>
      ) : (
        <div style={{ marginTop: 8, fontStyle: "italic" }}>
          {suggestion}
        </div>
      )}
    </div>
  );
}
