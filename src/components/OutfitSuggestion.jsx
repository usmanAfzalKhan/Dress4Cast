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
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");

  useEffect(() => {
    if (!weather) return;

    setLoading(true);
    setError("");
    setText("");
    setImageUrl("");

    // 1) Kick off the background job
    fetch("/.netlify/functions/outfit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ weather, unit, style, gender }),
    })
      .then(async (res) => {
        if (res.status !== 202) {
          // ran inline or errored
          if (!res.ok) throw new Error(await res.text());
          return res.json();
        }
        // background invocation started
        const statusUrl = res.headers.get("Location");
        if (!statusUrl) throw new Error("Missing Location header");

        // 2) Poll until the job finishes
        while (true) {
          await new Promise((r) => setTimeout(r, 1000));
          const poll = await fetch(statusUrl);
          if (poll.status === 202) continue;    // still running
          if (!poll.ok) throw new Error(await poll.text());
          return poll.json();                   // done
        }
      })
      .then(({ text: aiText, imageUrl: url }) => {
        setText(aiText);
        setImageUrl(url);
      })
      .catch((err) => {
        console.error(err);
        setError(err.message);
      })
      .finally(() => setLoading(false));
  }, [weather, unit, style, gender]);

  if (!weather) return null;
  if (loading)   return <div>Loading suggestion…</div>;
  if (error)     return <div style={{ color: "red" }}>Error: {error}</div>;

  return (
    <div className="outfit-box">
      <p><strong>What to wear:</strong> {text}</p>
      {imageUrl && (
        <img src={imageUrl} alt="Outfit suggestion" className="outfit-image" />
      )}
      <div className="controls">
        <label>
          Style:{" "}
          <select value={style} onChange={(e) => setStyle(e.target.value)}>
            {STYLE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </label>
        <label>
          Gender:{" "}
          <select value={gender} onChange={(e) => setGender(e.target.value)}>
            {GENDER_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </label>
      </div>
    </div>
  );
}
