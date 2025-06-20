// src/components/OutfitSuggestion.jsx
import React, { useState, useEffect } from "react";
import getOutfit from "../utils/getOutfit.js";
import "./OutfitSuggestion.css";

export default function OutfitSuggestion({ weather, unit }) {
  const [gender, setGender]   = useState("female");
  const [modesty, setModesty] = useState("regular");
  const [imgSrc, setImgSrc]   = useState("");
  const [error, setError]     = useState("");

  useEffect(() => {
    if (!weather) return;

    // 1) Ask the AI which outfit to pick
    fetch("/.netlify/functions/outfit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ weather, unit }),
    })
      .then((r) => r.json())
      .then(({ gender: g, modesty: m, error: e }) => {
        if (e) throw new Error(e);
        setGender(g);
        setModesty(m);
      })
      .catch((e) => {
        console.error(e);
        setError("Could not get AI suggestion");
      });
  }, [weather, unit]);

  useEffect(() => {
    if (!weather) return;
    // 2) Once AI gives us gender/modesty, pick the local image
    const tempC = unit === "metric"
      ? weather.main.temp
      : (weather.main.temp - 32) * (5/9);
    const { primaryPath, fallbackPath } = getOutfit(
      gender,
      modesty,
      tempC,
      weather.weather[0].description
    );
    setImgSrc(primaryPath);

    // if the primary 404s, fall back
    const img = new Image();
    img.src = primaryPath;
    img.onerror = () => setImgSrc(fallbackPath);
  }, [gender, modesty, weather, unit]);

  if (!weather) return null;
  if (error)   return <div className="error">{error}</div>;

  return (
    <div className="outfit-box">
      <img src={imgSrc} alt="AI-chosen outfit" className="outfit-image" />
    </div>
  );
}
