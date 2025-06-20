// src/components/OutfitSuggestion.jsx
import React, { useState, useEffect, useRef } from "react";
import "./OutfitSuggestion.css";

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
  const cacheRef = useRef({});
  const [baseWeather, setBaseWeather] = useState(null);
  useEffect(() => {
    if (weather && !baseWeather) {
      setBaseWeather(weather);
    }
  }, [weather, baseWeather]);

  const [style, setStyle]     = useState(STYLE_OPTIONS[0].value);
  const [gender, setGender]   = useState(GENDER_OPTIONS[0].value);
  const [text, setText]       = useState("");
  const [imgUrl, setImgUrl]   = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");

  useEffect(() => {
    if (!baseWeather) return;
    const key = `${baseWeather.main.temp}-${style}-${gender}`;
    if (cacheRef.current[key]) {
      const { text: cachedText, imageUrl: cachedUrl } = cacheRef.current[key];
      setText(cachedText);
      setImgUrl(cachedUrl);
      return;
    }

    setLoading(true);
    setError("");
    setText("");
    setImgUrl("");

    fetch("/.netlify/functions/outfit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ weather: baseWeather, unit, style, gender }),
    })
      .then(async (res) => {
        console.log("Outfit function response status:", res.status);
        let json;
        try {
          json = await res.json();
        } catch (e) {
          console.error("Failed to parse JSON:", e);
          throw new Error("Invalid JSON response from outfit function");
        }
        console.log("Outfit function response JSON:", json);
        if (!res.ok) {
          throw new Error(json.error || `Server error ${res.status}`);
        }
        return json;
      })
      .then(({ text: aiText, imageUrl }) => {
        setText(aiText);
        setImgUrl(imageUrl);
        cacheRef.current[key] = { text: aiText, imageUrl };
      })
      .catch((err) => {
        console.error("Outfit suggestion error:", err);
        setError(err.message);
      })
      .finally(() => setLoading(false));
  }, [baseWeather, style, gender, unit]);

  if (!baseWeather) return null;

  return (
    <div className="outfit-box">
      {loading ? (
        <div className="loader">
          Loading suggestion<span className="dots" />
        </div>
      ) : error ? (
        <div className="error">Error: {error}</div>
      ) : text ? (
        <>
          <strong>What to wear:</strong>
          <p>{text}</p>
          {imgUrl && (
            <img
              src={imgUrl}
              alt="Outfit suggestion"
              className="outfit-image"
              onError={(e) => {
                console.error("Image load failed:", e);
                setError("Failed to load outfit image");
              }}
            />
          )}

          <div className="controls">
            <label>
              <strong>Style:</strong>{" "}
              <select value={style} onChange={(e) => setStyle(e.target.value)}>
                {STYLE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <strong>Gender:</strong>{" "}
              <select value={gender} onChange={(e) => setGender(e.target.value)}>
                {GENDER_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </>
      ) : null}
    </div>
  );
}
