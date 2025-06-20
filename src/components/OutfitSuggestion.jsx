// src/components/OutfitSuggestion.jsx
import React, { useState, useEffect } from "react";
import getOutfit from "../utils/getOutfit.js";
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
  const [style, setStyle]   = useState(STYLE_OPTIONS[0].value);
  const [gender, setGender] = useState(GENDER_OPTIONS[0].value);
  const [imgSrc, setImgSrc] = useState("");

  useEffect(() => {
    if (!weather) return;

    // Convert to Celsius if needed
    const tempC = unit === "metric"
      ? weather.main.temp
      : (weather.main.temp - 32) * (5/9);

    // Map your “style” into “modesty” if that util expects it:
    const modesty = style === "Casual" ? "regular" : "modest";

    const { primaryPath, fallbackPath } = getOutfit(
      gender,
      modesty,
      tempC,
      weather.weather[0].description
    );

    // Try the primary, then fallback on error
    setImgSrc(primaryPath);
    const img = new Image();
    img.onload  = () => setImgSrc(primaryPath);
    img.onerror = () => setImgSrc(fallbackPath);
    img.src = primaryPath;
  }, [weather, unit, style, gender]);

  if (!weather) return null;

  return (
    <div className="outfit-box">
      <div className="controls">
        <label>
          Style:{" "}
          <select value={style} onChange={e => setStyle(e.target.value)}>
            {STYLE_OPTIONS.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </label>
        <label>
          Gender:{" "}
          <select value={gender} onChange={e => setGender(e.target.value)}>
            {GENDER_OPTIONS.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </label>
      </div>
      {imgSrc && (
        <img
          src={imgSrc}
          alt="Outfit suggestion"
          className="outfit-image"
        />
      )}
    </div>
  );
}
