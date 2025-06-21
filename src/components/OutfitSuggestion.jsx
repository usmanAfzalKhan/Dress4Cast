// src/components/OutfitSuggestion.jsx
import React, { useState, useEffect, useRef } from "react";

const STYLE_OPTIONS = [
  { value: "Stylish", label: "Stylish" },
  { value: "Casual",  label: "Casual"  },
  { value: "Sporty",  label: "Sporty"  },
  { value: "Formal",  label: "Formal"  },
];
const GENDER_OPTIONS = [
  { value: "female", label: "Women’s" },
  { value: "male",   label: "Men’s"   },
];

export default function OutfitSuggestion({ weather, unit }) {
  const [style, setStyle]       = useState(STYLE_OPTIONS[0].value);
  const [gender, setGender]     = useState(GENDER_OPTIONS[0].value);
  const [suggestion, setSuggestion] = useState("");
  const [imgUrl, setImgUrl]     = useState("");
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");
  const [expanded, setExpanded] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const lastDeps = useRef({ loc: null, style, gender });
  const OPENAI_KEY = import.meta.env.VITE_OPENAI_KEY;

  useEffect(() => {
    if (!weather || !expanded) return;
    const loc = weather.name;
    if (
      lastDeps.current.loc === loc &&
      lastDeps.current.style === style &&
      lastDeps.current.gender === gender
    ) return;

    setLoading(true);
    setError("");
    setSuggestion("");
    setImgUrl("");

    const temp  = Math.round(weather.main.temp);
    const desc  = weather.weather[0].description;
    const unitLabel = unit === "metric" ? "C" : "F";
    const promptText =
      `It's ${temp}°${unitLabel} with ${desc}. In one friendly paragraph, recommend a ${style.toLowerCase()} ${gender.toLowerCase()} outfit—no lists, just conversational tone.`;
    const promptImage =
      `Photo of a ${style.toLowerCase()} ${gender.toLowerCase()} outfit on a neutral background—no people, clear garments and accessories.`;

    (async () => {
      try {
        const chatRes = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${OPENAI_KEY}`,
          },
          body: JSON.stringify({
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: promptText }],
            max_tokens: 120,
            temperature: 0.7,
          }),
        });
        if (!chatRes.ok) throw new Error();
        const { choices } = await chatRes.json();
        setSuggestion(choices[0].message.content.trim());

        const imgRes = await fetch("https://api.openai.com/v1/images/generations", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${OPENAI_KEY}`,
          },
          body: JSON.stringify({ prompt: promptImage, n: 1, size: "512x512" }),
        });
        if (!imgRes.ok) throw new Error();
        const { data } = await imgRes.json();
        setImgUrl(data[0].url);

        lastDeps.current = { loc, style, gender };
      } catch {
        setError("Sorry, something went wrong. Please try again.");
      } finally {
        setLoading(false);
      }
    })();
  }, [weather?.name, style, gender, expanded]);

  // allow ESC to close
  useEffect(() => {
    if (!modalOpen) return;
    const onEsc = e => e.key === "Escape" && setModalOpen(false);
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, [modalOpen]);

  if (!weather) return null;

  return (
    <div className="outfit-box">
      <button
        className="expand-toggle"
        onClick={() => setExpanded(e => !e)}
        style={{ display: "block", margin: "0.5rem auto" }}
      >
        {expanded ? "Hide Outfit Suggestion" : "Show Outfit Suggestion"}
      </button>

      {expanded && (
        <>
          {loading && (
            <div className="ai-loader">
              <div className="ai-spinner" />
              <span>
                Loading suggestion
                <span className="animated-dots" />
              </span>
            </div>
          )}
          {error && <div className="error">{error}</div>}

          {!loading && !error && (
            <div className="outfit-content">
              <p className="outfit-text">{suggestion}</p>

              {imgUrl && (
                <>
                  <img
                    src={imgUrl}
                    alt="Suggested outfit"
                    className="outfit-image"
                    onClick={() => setModalOpen(true)}
                  />
                  <div
                    style={{
                      fontStyle: "italic",
                      fontSize: "0.9rem",
                      color: "#c2d8f6",
                      textAlign: "center",
                      marginTop: 6
                    }}
                  >
                    Click the image to enlarge
                  </div>

                  {modalOpen && (
                    <div
                      className="modal-backdrop"
                      onClick={() => setModalOpen(false)}
                      style={{ background: "transparent" }}       /* no black overlay */
                    >
                      <img
                        src={imgUrl}
                        alt="Outfit preview"
                        className="modal-image"
                        onClick={e => e.stopPropagation()}
                      />
                    </div>
                  )}
                </>
              )}

              <div className="outfit-controls">
                <label style={{ marginRight: 16, color: "#c2d8f6" }}>
                  Style:
                  <select
                    value={style}
                    onChange={e => setStyle(e.target.value)}
                    style={{
                      marginLeft: 5,
                      padding: "4.5px 12px",
                      borderRadius: 8,
                      border: "1.5px solid #37598b",
                      background: "#22375e",
                      color: "#fff",
                      fontWeight: 500,
                      fontSize: "1em"
                    }}
                  >
                    {STYLE_OPTIONS.map(o => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </label>

                <label style={{ color: "#c2d8f6" }}>
                  Gender:
                  <select
                    value={gender}
                    onChange={e => setGender(e.target.value)}
                    style={{
                      marginLeft: 5,
                      padding: "4.5px 12px",
                      borderRadius: 8,
                      border: "1.5px solid #37598b",
                      background: "#22375e",
                      color: "#fff",
                      fontWeight: 500,
                      fontSize: "1em"
                    }}
                  >
                    {GENDER_OPTIONS.map(o => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </label>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
