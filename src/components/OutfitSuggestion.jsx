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
  const [modalOpen, setModalOpen] = useState(false);

  // Cooldown (in ms) after hitting a 429 from OpenAI
  const cooldownRef = useRef(0);
  // Used to block re-fetching when only expanding/collapsing or changing units
  const lastPromptRef = useRef({});

  const OPENAI_KEY = import.meta.env.VITE_OPENAI_KEY;

  // This useEffect will **NOT** run on unit changes!
  useEffect(() => {
    if (!weather) return;

    const temp  = Math.round(weather.main.temp);
    const desc  = weather.weather[0].description;
    const styleLower  = style.toLowerCase();
    const genderLabel = gender.toLowerCase();

    const promptText =
      `It's ${temp} degrees with ${desc}. Recommend a ` +
      `${styleLower} ${genderLabel} outfit (list items only, no people).`;

    const promptImage =
      `High-resolution photo of a ${styleLower} ${genderLabel} outfit ` +
      `displayed on a neutral white background—just the garments and accessories.`;

    // Only fetch if prompt is new (weather, style, or gender changes)
    const promptKey = `${weather?.location?.lat || ""}_${weather?.location?.lon || ""}_${style}_${gender}_${temp}_${desc}`;
    if (lastPromptRef.current.key === promptKey) return;

    setLoading(true);
    setError("");
    setText("");
    setImgUrl("");

    (async () => {
      try {
        // Text completion (always runs)
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

        // Image generation (only runs if NOT in cooldown)
        const now = Date.now();
        if (now < cooldownRef.current) {
          setError("AI image temporarily unavailable. Please try again later.");
          setImgUrl("");
          return;
        }

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

        if (!imgRes.ok) {
          if (imgRes.status === 429) {
            cooldownRef.current = Date.now() + 90_000; // 90 seconds cooldown
            setError("AI image unavailable (quota limit reached). Try again later!");
          } else {
            setError("Failed to generate image. Try again later.");
          }
          setImgUrl("");
          return;
        }

        const { data } = await imgRes.json();
        setImgUrl(data[0].url);

        lastPromptRef.current = { key: promptKey };
      } catch (e) {
        console.error(e);
        setError("Failed to generate outfit suggestion. Please try again.");
        setImgUrl("");
      } finally {
        setLoading(false);
      }
    })();
    // *** NO "unit" in dependency list ***
  }, [weather, style, gender]);

  // Reset prompt cache when city changes
  useEffect(() => {
    lastPromptRef.current = {};
    setExpanded(false); // Optionally collapse on new city
  }, [weather]);

  if (!weather) return null;

  // Utility to dynamically convert Celsius <-> Fahrenheit in suggestion
  function renderSuggestion(text) {
    // Try to convert "XX°C" or "XX degrees" to match selected unit
    return text.replace(/(-?\d{1,3})\s?(°?C|°?F|degrees?)/gi, (m, n) => {
      let val = Number(n);
      if (isNaN(val)) return m;
      if (unit === "metric") return `${Math.round(val)}°C`;
      return `${Math.round(val * 9 / 5 + 32)}°F`;
    });
  }

  return (
    <div className={`outfit-box ${style.toLowerCase()} ${gender}`}>
      {!expanded && (
        <div style={{
          width: "100%",
          display: "flex",
          justifyContent: "center",
          alignItems: "flex-start",
          marginTop: 0,
          marginBottom: 0
        }}>
          <button
            className="expand-toggle"
            onClick={() => setExpanded(true)}
            style={{
              minWidth: "220px",
              padding: "12px 24px",
              fontSize: "1.05rem",
              fontWeight: 600,
              borderRadius: 12,
              background: "#406bda",
              color: "#fff",
              border: "none",
              boxShadow: "0 2px 10px #193e9744",
              cursor: "pointer",
              transition: "background 0.18s"
            }}
          >
            Show Outfit Suggestion
          </button>
        </div>
      )}

      {expanded && (
        <div style={{
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center"
        }}>
          <div style={{
            width: "100%",
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "flex-start",
            marginTop: 0,
            marginBottom: 0
          }}>
            <button
              className="expand-toggle"
              onClick={() => setExpanded(false)}
              style={{
                background: "#1b233c",
                color: "#fff",
                fontWeight: 500,
                fontSize: "0.98em",
                borderRadius: 10,
                padding: "8px 18px",
                marginTop: 0,
                marginBottom: 0
              }}
            >
              Hide Outfit Suggestion
            </button>
          </div>
          {loading && (
            <div className="loader" style={{
              margin: "16px auto 12px auto",
              textAlign: "center",
              width: "100%",
              display: "flex",
              justifyContent: "center",
              alignItems: "center"
            }}>
              <span style={{
                display: "inline-block",
                width: 22, height: 22,
                marginRight: 10,
                border: "3px solid #406bda",
                borderRadius: "50%",
                borderTop: "3px solid #e8eaf6",
                animation: "spin 1s linear infinite"
              }} />
              <span>Loading suggestion…</span>
              <style>
                {`
                  @keyframes spin {
                    0%   { transform: rotate(0deg);}
                    100% { transform: rotate(360deg);}
                  }
                `}
              </style>
            </div>
          )}
          {error && (
            <div style={{
              margin: "18px auto",
              color: "#ffb53f",
              background: "#2a3550",
              borderRadius: "10px",
              padding: "10px 18px",
              textAlign: "center"
            }}>
              <b>
                {error.includes("AI image unavailable") || error.includes("quota") ?
                  <>AI image unavailable<br /></> :
                  <>Suggestion unavailable<br /></>
                }
              </b>
              <span style={{ fontSize: "0.98em", opacity: 0.7 }}>
                {error}
              </span>
            </div>
          )}
          {!loading && !error && (
            <div className="outfit-content">
              <div className="outfit-text">
                <strong>What to wear:</strong>
                <p>{renderSuggestion(text)}</p>
              </div>
              {imgUrl ? (
                <>
                  <img
                    src={imgUrl}
                    alt="Outfit suggestion"
                    className="outfit-image"
                    style={{ cursor: "zoom-in" }}
                    onClick={() => setModalOpen(true)}
                  />
                  {modalOpen && (
                    <div
                      onClick={e => { if (e.target === e.currentTarget) setModalOpen(false); }}
                      style={{
                        position: "fixed",
                        top: 0, left: 0, right: 0, bottom: 0,
                        background: "rgba(17, 30, 48, 0.86)",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        zIndex: 9999
                      }}
                    >
                      <div style={{
                        position: "relative",
                        maxWidth: "92vw",
                        maxHeight: "92vh",
                        borderRadius: 18,
                        background: "#22375e",
                        padding: 24,
                        boxShadow: "0 8px 40px #0007"
                      }}>
                        <button
                          onClick={() => setModalOpen(false)}
                          style={{
                            position: "absolute",
                            top: 10, right: 15,
                            background: "none",
                            border: "none",
                            color: "#fff",
                            fontSize: "2rem",
                            cursor: "pointer",
                            zIndex: 99999,
                            fontWeight: "bold",
                            lineHeight: 1
                          }}
                          aria-label="Close image"
                        >
                          ×
                        </button>
                        <img
                          src={imgUrl}
                          alt="Outfit suggestion large"
                          style={{
                            maxWidth: "80vw",
                            maxHeight: "75vh",
                            borderRadius: 13,
                            display: "block",
                            margin: "0 auto"
                          }}
                        />
                      </div>
                    </div>
                  )}
                </>
              ) : null}
              <div className="controls">
                <label>
                  Style:
                  <select value={style} onChange={e => setStyle(e.target.value)}>
                    {STYLE_OPTIONS.map(o => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </label>
                <label>
                  Gender:
                  <select value={gender} onChange={e => setGender(e.target.value)}>
                    {GENDER_OPTIONS.map(o => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </label>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
