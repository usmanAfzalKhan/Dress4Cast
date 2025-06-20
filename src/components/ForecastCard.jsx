// src/components/ForecastCard.jsx
import React, { useState } from "react";

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

  return (
    <div
      style={{
        background: "#22375e",
        color: "#e8ecf8",
        borderRadius: 18,
        padding: 14,
        textAlign: "center",
        minWidth: 130,
        boxShadow: "0 4px 18px #0002, 0 1.5px 6px 0 #0e172033",
        margin: "0 auto",
        display: "flex",
        flexDirection: "column",
        alignItems: "center"
      }}
    >
      <div style={{ fontSize: 12, color: "#cce4fa" }}>{date}</div>
      <div style={{ fontWeight: "bold", margin: "4px 0", color: "#ffea8a" }}>{time}</div>
      <div style={{ marginBottom: 8, fontWeight: 600, fontSize: "1.08em" }}>
        {temp}°{unit === "metric" ? "C" : "F"}
        <br />
        <small style={{ fontWeight: 400, color: "#e8ecf8" }}>{desc}</small>
      </div>

      {!shown ? (
        <button
          onClick={() => setShown(true)}
          style={{
            padding: "6px 12px",
            border: "none",
            borderRadius: 6,
            background: "#406bda",
            color: "#fff",
            cursor: "pointer",
            fontWeight: 600,
            fontSize: "1em",
            marginTop: 4,
            boxShadow: "0 1.5px 8px 0 #193e9733",
            transition: "background 0.15s"
          }}
        >
          View suggestion
        </button>
      ) : (
        <div style={{ marginTop: 8, fontStyle: "italic", color: "#e8eaf6", fontSize: "0.98em" }}>
          {suggestion}
        </div>
      )}
    </div>
  );
}
