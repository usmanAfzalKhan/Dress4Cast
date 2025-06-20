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

  useEffect(() => {
    if (!weather) return;

    setLoading(true);
    setError("");
    setText("");
    setImgUrl("");

    // 1) POST to start background job, then poll until it's done
    (async () => {
      try {
        const start = await fetch("/.netlify/functions/outfit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ weather, unit, style, gender }),
        });

        if (!start.ok && start.status !== 202) {
          throw new Error(await start.text());
        }

        // Grab the 202-polling endpoint
        const statusUrl = start.headers.get("Location");
        if (!statusUrl && start.status === 202) {
          throw new Error("Missing Location header for background job");
        }

        if (start.status === 200) {
          // Inline (local) invocation returned immediately
          const result = await start.json();
          setText(result.text);
          setImgUrl(result.imageUrl);
        } else {
          // 2) Poll until it finishes
          let result;
          while (true) {
            await new Promise((r) => setTimeout(r, 1000));
            const poll = await fetch(statusUrl);
            if (poll.status === 202) continue;    // still running
            if (!poll.ok) throw new Error(await poll.text());
            result = await poll.json();           // done
            break;
          }
          setText(result.text);
          setImgUrl(result.imageUrl);
        }
      } catch (e) {
        console.error("OutfitSuggestion error:", e);
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
          <select value={style} onChange={(e) => setStyle(e.target.value)}>
            {STYLE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
        <label>
          Gender:{" "}
          <select value={gender} onChange={(e) => setGender(e.target.value)}>
            {GENDER_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
      </div>
    </div>
  );
}
