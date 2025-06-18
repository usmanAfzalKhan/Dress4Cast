// src/components/OutfitSuggestion.jsx
import React, { useState, useEffect } from "react";

const STYLE_OPTIONS = [
  { value: "Stylish", label: "Stylish" },
  { value: "Casual",  label: "Casual"  },
  { value: "Sporty",  label: "Sporty"  },
  { value: "Formal",  label: "Formal"  },
];

const GENDER_OPTIONS = [
  { value: "female", label: "Female" },
  { value: "male",   label: "Male"   },
];

export default function OutfitSuggestion({ weather, unit }) {
  // store the initial weather once, then ignore updates (e.g. unit toggles)
  const [baseWeather, setBaseWeather] = useState(null);
  useEffect(() => {
    if (weather && !baseWeather) {
      setBaseWeather(weather);
    }
  }, [weather, baseWeather]);

  const [style,   setStyle]   = useState(STYLE_OPTIONS[0].value);
  const [gender,  setGender]  = useState(GENDER_OPTIONS[0].value);
  const [text,    setText]    = useState("");
  const [imgUrl,  setImgUrl]  = useState("");
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");

  // Only re-run when baseWeather, style, or gender change (unit toggles won't affect)
  useEffect(() => {
    if (!baseWeather) return;
    setLoading(true);
    setError("");
    setText("");
    setImgUrl("");

fetch("/.netlify/functions/outfit", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    weather: baseWeather,
    unit,     
    style,
    gender,    
  }),
})

      .then(async (res) => {
        const payload = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(payload.error || "Server error");
        return payload;
      })
      .then(({ text, imageUrl }) => {
        setText(text);
        setImgUrl(imageUrl);
      })
      .catch((err) => {
        setError(err.message);
      })
      .finally(() => setLoading(false));
  }, [baseWeather, style, gender]);

  if (!baseWeather) return null;

  return (
    <div style={{ margin: 16, padding: 16, background: "#F0F4F8", borderRadius: 8 }}>
      {loading && <div>Thinking…</div>}
      {error   && <div style={{ color: "red" }}>{error}</div>}

      {!loading && !error && text && (
        <>
          <strong>What to wear:</strong>
          <p>{text}</p>
          {imgUrl && (
            <img
              src={imgUrl}
              alt="Outfit suggestion"
              style={{
                width: 256,
                height: 256,
                borderRadius: 8,
                marginTop: 12,
                display: "block",
                marginLeft: "auto",
                marginRight: "auto",
              }}
            />
          )}

          <div style={{ display: "flex", gap: 12, marginTop: 16, justifyContent: "center" }}>
            <label>
              <strong>Style:</strong>{" "}
              <select value={style} onChange={(e) => setStyle(e.target.value)}>
                {STYLE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </label>
            <label>
              <strong>Gender:</strong>{" "}
              <select value={gender} onChange={(e) => setGender(e.target.value)}>
                {GENDER_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </label>
          </div>
        </>
      )}
    </div>
  );
}
