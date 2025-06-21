// src/components/OutfitSuggestion.jsx

import React, { useState, useEffect, useRef } from "react";

// Available style options for outfit suggestions
const STYLE_OPTIONS = [
  { value: "Stylish", label: "Stylish" },
  { value: "Casual",  label: "Casual"  },
  { value: "Sporty",  label: "Sporty"  },
  { value: "Formal",  label: "Formal"  },
];

// Available gender options for outfit suggestions
const GENDER_OPTIONS = [
  { value: "female", label: "Women’s" },
  { value: "male",   label: "Men’s"   },
];

/**
 * Component that fetches and displays an AI-generated outfit suggestion
 * based on current weather conditions, style, and gender preferences.
 *
 * Props:
 * - weather: Weather data object containing temperature, description, etc.
 * - unit:    String, either 'metric' or 'imperial', for display purposes.
 */
export default function OutfitSuggestion({ weather, unit }) {
  // Selected style (e.g., Stylish, Casual)
  const [style, setStyle]       = useState(STYLE_OPTIONS[0].value);
  // Selected gender context (e.g., female, male)
  const [gender, setGender]     = useState(GENDER_OPTIONS[0].value);
  // AI-generated text suggestion in a single paragraph
  const [suggestion, setSuggestion] = useState("");
  // URL of the AI-generated outfit image
  const [imgUrl, setImgUrl]     = useState("");
  // Loading indicator while fetching from AI API
  const [loading, setLoading]   = useState(false);
  // Error message in case of fetch failure
  const [error, setError]       = useState("");
  // Toggle to show or hide the suggestion section
  const [expanded, setExpanded] = useState(false);
  // Controls visibility of the image modal
  const [modalOpen, setModalOpen] = useState(false);

  // Ref to track the last weather location, style, and gender to avoid redundant fetches
  const lastDeps = useRef({ loc: null, style, gender });
  const OPENAI_KEY = import.meta.env.VITE_OPENAI_KEY;

  /**
   * Effect hook responsible for requesting a new suggestion and image
   * whenever weather, style, or gender changes and the section is expanded.
   */
  useEffect(() => {
    if (!weather || !expanded) return;

    const loc = weather.name;
    // Skip fetch if dependencies have not changed
    if (
      lastDeps.current.loc === loc &&
      lastDeps.current.style === style &&
      lastDeps.current.gender === gender
    ) return;

    // Reset UI state before starting new fetch
    setLoading(true);
    setError("");
    setSuggestion("");
    setImgUrl("");

    // Prepare prompts for text and image generation
    const temp  = Math.round(weather.main.temp);
    const desc  = weather.weather[0].description;
    const unitLabel = unit === "metric" ? "C" : "F";
    const promptText =
      `It's ${temp}°${unitLabel} with ${desc}. In one friendly paragraph, recommend a ${style.toLowerCase()} ${gender.toLowerCase()} outfit—no lists, just conversational tone.`;
    const promptImage =
      `Photo of a ${style.toLowerCase()} ${gender.toLowerCase()} outfit on a neutral background—no people, clear garments and accessories.`;

    // Async IIFE to perform API calls
    (async () => {
      try {
        // Text completion request to OpenAI
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

        // Image generation request to OpenAI
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

        // Update ref to current dependencies
        lastDeps.current = { loc, style, gender };
      } catch {
        setError("Sorry, something went wrong. Please try again.");
      } finally {
        setLoading(false);
      }
    })();
  }, [weather?.name, style, gender, expanded]);

  /**
   * Effect hook that listens for the Escape key to close the modal.
   */
  useEffect(() => {
    if (!modalOpen) return;
    const onEsc = e => e.key === "Escape" && setModalOpen(false);
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, [modalOpen]);

  // No UI if weather data is missing
  if (!weather) return null;

  return (
    <div className="outfit-box">
      {/* Button to expand or collapse the suggestion panel */}
      <button
        className="expand-toggle"
        onClick={() => setExpanded(e => !e)}
        style={{ display: "block", margin: "0.5rem auto" }}
      >
        {expanded ? "Hide Outfit Suggestion" : "Show Outfit Suggestion"}
      </button>

      {expanded && (
        <>
          {/* Display loading spinner and animated dots while fetching */}
          {loading && (
            <div className="ai-loader">
              <div className="ai-spinner" />
              <span>
                Loading AI based suggestion
                <span className="animated-dots" />
              </span>
            </div>
          )}
          {/* Show error message if fetch failed */}
          {error && <div className="error">{error}</div>}

          {/* Render suggestion text, image, and controls when ready */}
          {!loading && !error && (
            <div className="outfit-content">
              {/* Conversational paragraph with outfit recommendation */}
              <p className="outfit-text">{suggestion}</p>

              {/* AI-generated outfit image with click-to-enlarge hint */}
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

                  {/* Modal displays the enlarged image; click outside or press Esc to close */}
                  {modalOpen && (
                    <div
                      className="modal-backdrop"
                      onClick={() => setModalOpen(false)}
                      style={{ background: "transparent" }}
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

              {/* Dropdown controls for style and gender selection */}
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
