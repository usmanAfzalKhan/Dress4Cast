// src/components/OutfitSuggestion.jsx
import React, { useState, useEffect } from "react";
import OpenAI from "openai";

export default function OutfitSuggestion({ weather, unit }) {
  const [text, setText] = useState("");
  const [imgUrl, setImgUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!weather) return;

    const key = import.meta.env.VITE_OPENAI_KEY;
    if (!key) {
      setError("Missing OpenAI key in VITE_OPENAI_KEY");
      return;
    }

    setLoading(true);
    setError("");
    setText("");
    setImgUrl("");

    const openai = new OpenAI({
      apiKey: key,
      dangerouslyAllowBrowser: true,
    });

    (async () => {
      try {
        const temp = Math.round(weather.main.temp);
        const desc = weather.weather[0].description;
        const prompt = `The weather is ${temp}°${unit === "metric" ? "C" : "F"} and ${desc}. Recommend one stylish outfit in plain language.`;

        // 1) Text
        const chat = await openai.chat.completions.create({
          model: "gpt-3.5-turbo",
          messages: [{ role: "user", content: prompt }],
          max_tokens: 60,
          temperature: 0.8,
        });
        const suggestion = chat.choices[0]?.message?.content?.trim();
        if (!suggestion) throw new Error("No text suggestion");
        setText(suggestion);

        // 2) Image
        const imagePrompt = `A photorealistic fashion display: ${suggestion}`;
        const imgResp = await openai.images.generate({
          prompt: imagePrompt,
          n: 1,
          size: "512x512",
        });
        setImgUrl(imgResp.data[0].url);
      } catch (e) {
        console.error(e);
        setError(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [weather, unit]);

  if (!weather) return null;

  return (
    <div
      style={{
        margin: 16,
        padding: 16,
        background: "#F0F4F8",
        borderRadius: 8,
      }}
    >
      {loading && <div>Thinking…</div>}
      {error && <div style={{ color: "red" }}>{error}</div>}
      {!loading && !error && (
        <>
          <strong>What to wear:</strong>
          <p>{text}</p>
          {imgUrl && (
            <img
              src={imgUrl}
              alt="Outfit suggestion"
              style={{
                width: 256,
                height: 256,
                borderRadius: 8,
                marginTop: 12,
              }}
            />
          )}
        </>
      )}
    </div>
  );
}
