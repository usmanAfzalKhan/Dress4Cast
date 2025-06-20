// src/components/OutfitSuggestion.jsx
import React, { useState, useEffect } from "react";
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
  const [style, setStyle]       = useState(STYLE_OPTIONS[0].value);
  const [gender, setGender]     = useState(GENDER_OPTIONS[0].value);
  const [text, setText]         = useState("");
  const [imgUrl, setImgUrl]     = useState("");
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");

  // pull your Vite‐bundled key
  const OPENAI_KEY = import.meta.env.VITE_OPENAI_KEY;

  useEffect(() => {
    if (!weather) return;

    setLoading(true);
    setError("");
    setText("");
    setImgUrl("");

    // build prompts
    const temp   = Math.round(weather.main.temp);
    const desc   = weather.weather[0].description;
    const tUnit  = unit === "metric" ? "C" : "F";
    const styleLower  = style.toLowerCase();
    const genderLabel = gender === "male" ? "men's" : "women's";

    const promptText  = `Weather: ${temp}°${tUnit}, ${desc}. Recommend a ${styleLower} ${genderLabel} outfit.`;
    const promptImage = `A ${styleLower} ${genderLabel} outfit for ${desc}, ${temp}°${tUnit}.`;

    (async () => {
      try {
        // 1) Chat completion
        const chatRes = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${OPENAI_KEY}`,
          },
          body: JSON.stringify({
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: promptText }],
            max_tokens: 60,
            temperature: 0.8,
          }),
        });
        if (!chatRes.ok) throw new Error(`Chat failed: ${await chatRes.text()}`);
        const chatJson = await chatRes.json();
        const aiText   = chatJson.choices[0].message.content.trim();
        setText(aiText);

        // 2) Image generation
        const imgRes = await fetch("https://api.openai.com/v1/images/generations", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${OPENAI_KEY}`,
          },
          body: JSON.stringify({
            prompt: promptImage,
            n:      1,
            size:   "512x512",
          }),
        });
        if (!imgRes.ok) throw new Error(`Image failed: ${await imgRes.text()}`);
        const imgJson = await imgRes.json();
        setImgUrl(imgJson.data[0].url);
      } catch (e) {
        console.error(e);
        setError(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [weather, unit, style, gender]);

  if (!weather) return null;
  if (loading)   return <div className="loader">Loading suggestion…</div>;
  if (error)     return <div className="error">Error: {error}</div>;

  return (
    <div className="outfit-box">
      <p><strong>What to wear:</strong> {text}</p>
      {imgUrl && (
        <img src={imgUrl} alt="Outfit suggestion" className="outfit-image" />
      )}
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
    </div>
  );
}
