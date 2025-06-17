import React, { useState, useRef } from "react";
import { getCachedOutfit, setCachedOutfit } from "../utils/cache.js";

const STYLES = ["stylish", "casual", "sporty", "formal"];

export default function ForecastCard({ forecast, unit }) {
  const [style,   setStyle]   = useState(null);
  const [outfit,  setOutfit]  = useState(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");
  const keyRef              = useRef("");

  const temp      = Math.round(forecast.main.temp);
  const desc      = forecast.weather[0].description;
  const unitLabel = unit === "metric" ? "C" : "F";

  function makeKey(s) {
    return `${forecast.dt}_${s}`;
  }

  async function fetchOutfit(s) {
    const key = makeKey(s);
    keyRef.current = key;

    const cached = getCachedOutfit(key);
    if (cached) {
      setOutfit(cached);
      return;
    }

    setLoading(true);
    setError("");
    try {
      const res = await fetch("/.netlify/functions/outfit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ weather: forecast, unit, style: s }),
      });
      const js = await res.json();
      if (!res.ok) throw new Error(js.error || "Function error");
      setCachedOutfit(key, js);
      setOutfit(js);
    } catch (e) {
      console.error(e);
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      width: 220,
      margin: 8,
      padding: 12,
      border: "1px solid #ddd",
      borderRadius: 8,
      textAlign: "center"
    }}>
      <div>
        <strong>
          {new Date(forecast.dt * 1000).toLocaleTimeString()}
        </strong>
        <div>{temp}°{unitLabel}</div>
        <div style={{ fontSize: 12, color: "#555" }}>{desc}</div>
      </div>

      <div style={{ marginTop: 8 }}>
        {STYLES.map((s) => (
          <button
            key={s}
            onClick={() => {
              setStyle(s);
              fetchOutfit(s);
            }}
            style={{
              margin: 4,
              padding: "6px 8px",
              background: style === s ? "#0366d6" : "#e1e4e8",
              color: style === s ? "#fff" : "#000",
              border: "none",
              borderRadius: 4,
              cursor: "pointer",
              fontSize: 12
            }}
          >
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      {loading && <div style={{ marginTop: 8 }}>Loading…</div>}
      {error   && <div style={{ marginTop: 8, color: "red" }}>{error}</div>}

      {outfit && !loading && !error && (
        <div style={{ marginTop: 8 }}>
          <p style={{ fontSize: 14 }}>
            <strong>Outfit:</strong> {outfit.text}
          </p>
          {outfit.imageUrl && (
            <img
              src={outfit.imageUrl}
              alt=""
              style={{ width: 160, borderRadius: 6, marginTop: 6 }}
            />
          )}
        </div>
      )}
    </div>
  );
}
