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
  const [text, setText]         = useState("");
  const [imgUrl, setImgUrl]     = useState("");
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");
  const [expanded, setExpanded] = useState(false);

  // Modal state for the image
  const [modalOpen, setModalOpen] = useState(false);

  // Track the last *location name*, style, and gender
  const lastLocationRef = useRef(null);
  const lastStyleRef    = useRef(style);
  const lastGenderRef   = useRef(gender);

  const OPENAI_KEY = import.meta.env.VITE_OPENAI_KEY;

  useEffect(() => {
    // Only run if weather exists and user has expanded
    if (!weather || !expanded) return;
    // Only fetch if LOCATION, STYLE, or GENDER has changed
    if (
      lastLocationRef.current === weather.name &&
      lastStyleRef.current === style &&
      lastGenderRef.current === gender
    ) {
      return; // Nothing changed (incl. unit) — don't regenerate!
    }

    setLoading(true);
    setError("");
    setText("");
    setImgUrl("");

    const temp  = Math.round(weather.main.temp);
    const desc  = weather.weather[0].description;
    const unitLabel = unit === "metric" ? "C" : "F";
    const styleLower  = style.toLowerCase();
    const genderLabel = gender.toLowerCase();

    const promptText =
      `It's ${temp}°${unitLabel} with ${desc}. Recommend a ${styleLower} ${genderLabel} outfit (list items only, no people).`;

    const promptImage =
      `High-resolution photo of a ${styleLower} ${genderLabel} outfit displayed on a neutral white background—just the garments and accessories.`;

    (async () => {
      try {
        // Text completion
        const chatRes = await fetch(
          "https://api.openai.com/v1/chat/completions",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${OPENAI_KEY}`,
            },
            body: JSON.stringify({
              model: "gpt-3.5-turbo",
              messages: [{ role: "user", content: promptText }],
              max_tokens: 80,
              temperature: 0.7,
            }),
          }
        );
        if (!chatRes.ok) throw new Error(await chatRes.text());
        const { choices } = await chatRes.json();
        setText(choices[0].message.content.trim());

        // Image generation
        const imgRes = await fetch(
          "https://api.openai.com/v1/images/generations",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${OPENAI_KEY}`,
            },
            body: JSON.stringify({
              prompt: promptImage,
              n: 1,
              size: "512x512",
            }),
          }
        );
        if (!imgRes.ok) throw new Error(await imgRes.text());
        const { data } = await imgRes.json();
        setImgUrl(data[0].url);

        // Save current context
        lastLocationRef.current = weather.name;
        lastStyleRef.current = style;
        lastGenderRef.current = gender;
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    })();

    // Only depend on location name, style, gender, and expanded!
    // DO NOT depend on unit or the full weather object
    // eslint-disable-next-line
  }, [weather?.name, style, gender, expanded]);

  // Close modal on Esc key
  useEffect(() => {
    if (!modalOpen) return;
    const handleEsc = e => {
      if (e.key === "Escape") setModalOpen(false);
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [modalOpen]);

  if (!weather) return null;

  return (
    <div className={`outfit-box ${style.toLowerCase()} ${gender}`}>
      <button
        className="expand-toggle"
        onClick={() => setExpanded(e => !e)}
        style={{ alignSelf: "center" }}
      >
        {expanded ? "Hide Outfit Suggestion" : "Show Outfit Suggestion"}
      </button>
      {expanded && (
        <>
          {loading && (
            <div className="ai-loader">
              <div className="ai-spinner"></div>
              <span>
                Loading suggestion<span className="animated-dots"></span>
              </span>
            </div>
          )}
          {error && <div className="error">{error}</div>}
          {!loading && !error && (
            <div className="outfit-content">
              <div className="outfit-text">
                <strong>What to wear:</strong>
                <p>{text}</p>
              </div>
              {imgUrl && (
                <>
                  <img
                    src={imgUrl}
                    alt="Outfit suggestion"
                    className="outfit-image"
                    onClick={() => setModalOpen(true)}
                    style={{ cursor: "zoom-in" }}
                  />
                  {modalOpen && (
                    <div
                      className="modal-backdrop"
                      onClick={() => setModalOpen(false)}
                    >
                      <button
                        style={{
                          position: "absolute",
                          top: 30,
                          right: 38,
                          fontSize: 24,
                          color: "#fff",
                          background: "rgba(30,42,70,0.7)",
                          border: "none",
                          borderRadius: "50%",
                          width: 42,
                          height: 42,
                          cursor: "pointer",
                          zIndex: 202,
                        }}
                        onClick={e => {
                          e.stopPropagation();
                          setModalOpen(false);
                        }}
                        aria-label="Close"
                      >×</button>
                      <img
                        src={imgUrl}
                        alt="Outfit large preview"
                        className="modal-image"
                        onClick={e => e.stopPropagation()}
                      />
                    </div>
                  )}
                </>
              )}
              <div className="controls outfit-controls">
                <label style={{
                  marginRight: "16px",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  fontWeight: 500,
                  color: "#c2d8f6",
                }}>
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
                      fontSize: "1em",
                    }}
                  >
                    {STYLE_OPTIONS.map(o => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </label>
                <label style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  fontWeight: 500,
                  color: "#c2d8f6",
                }}>
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
                      fontSize: "1em",
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
