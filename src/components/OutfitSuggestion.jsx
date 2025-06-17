// src/components/OutfitSuggestion.jsx
import React, { useState, useEffect } from "react";

const STYLE_OPTIONS = [
  { value: "Stylish", label: "Stylish" },
  { value: "Casual", label: "Casual" },
  { value: "Sporty", label: "Sporty" },
  { value: "Formal", label: "Formal" },
];

export default function OutfitSuggestion({ weather, unit }) {
  const [style, setStyle] = useState(STYLE_OPTIONS[0].value);
  const [text, setText] = useState("");
  const [imgUrl, setImgUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [lightboxOpen, setLightboxOpen] = useState(false);

  useEffect(() => {
    if (!weather) return;
    setLoading(true);
    setError("");
    setText("");
    setImgUrl("");

    fetch("/.netlify/functions/outfit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ weather, unit, style }),
    })
      .then((res) => {
        if (!res.ok) throw new Error(`Server error ${res.status}`);
        return res.json();
      })
      .then(({ text, imageUrl }) => {
        setText(text);
        setImgUrl(imageUrl);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [weather, unit, style]);

  if (!weather) return null;

  return (
    <div
      style={{
        margin: 16,
        padding: 16,
        background: "#F0F4F8",
        borderRadius: 8,
      }}
    >
      {/* style picker + error */}
      <div style={{ marginBottom: 8, display: "flex", alignItems: "center" }}>
        <label style={{ marginRight: 8, fontWeight: "bold" }}>
          Pick a style:
        </label>
        <select
          value={style}
          onChange={(e) => setStyle(e.target.value)}
        >
          {STYLE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
      {error && (
        <div style={{ color: "orange", marginBottom: 8 }}>{error}</div>
      )}

      {/* suggestion text + image */}
      <strong>What to wear:</strong>
      <p>{loading ? "Thinking…" : text}</p>

      {imgUrl && !loading && (
        <div style={{ textAlign: "center", marginTop: 12 }}>
          <img
            src={imgUrl}
            alt="Outfit suggestion"
            style={{
              width: 256,
              height: 256,
              borderRadius: 8,
              cursor: "zoom-in",
            }}
            onClick={() => setLightboxOpen(true)}
          />
        </div>
      )}

      {/* lightbox/modal */}
      {lightboxOpen && (
        <div
          onClick={() => setLightboxOpen(false)}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background: "rgba(0,0,0,0.8)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            cursor: "zoom-out",
          }}
        >
          <img
            src={imgUrl}
            alt="Outfit suggestion (full size)"
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: "90vw",
              maxHeight: "90vh",
              borderRadius: 8,
            }}
          />
        </div>
      )}
    </div>
  );
}
