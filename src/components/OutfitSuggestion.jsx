// src/components/OutfitSuggestion.jsx
import React, { useState, useEffect, useRef } from "react";

const fallbackAdvice = (weather) => {
  const t = Math.round(weather.main.temp);
  if (t <= 5)   return "Bundle up in a warm coat, scarf, and gloves.";
  if (t <= 15)  return "Try a light jacket or cardigan with jeans.";
  if (t <= 25)  return "A T-shirt and light pants should be comfy.";
  return "Something breezy—shorts and a tank top!";
};

export default function OutfitSuggestion({ weather, unit }) {
  const [text,   setText]   = useState("");
  const [imgUrl, setImgUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");
  const askedOnceRef = useRef(false);

  useEffect(() => {
    if (!weather || askedOnceRef.current) return;
    askedOnceRef.current = true;

    setLoading(true);
    fetch("/.netlify/functions/outfit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ weather, unit }),
    })
      .then(async (res) => {
        const payload = await res.json();
        if (!res.ok) throw new Error(payload.error || "Function error");
        return payload;
      })
      .then(({ text, imageUrl }) => {
        setText(text);
        setImgUrl(imageUrl);
      })
      .catch((err) => {
        console.error(err);
        setError(err.message);
        setText(fallbackAdvice(weather));
      })
      .finally(() => setLoading(false));
  }, [weather, unit]);

  if (!weather) return null;
  if (loading)   return <div style={{ padding: 16 }}>Thinking…</div>;

  return (
    <div style={{ margin: 16, padding: 16, background: "#F0F4F8", borderRadius: 8 }}>
      {error && <div style={{ color: "orange", marginBottom: 8 }}>{error}</div>}
      <strong>What to wear:</strong>
      <p>{text}</p>
      {imgUrl && (
        <img
          src={imgUrl}
          alt="Outfit suggestion"
          style={{ width: 256, height: 256, borderRadius: 8, marginTop: 12 }}
        />
      )}
    </div>
  );
}
