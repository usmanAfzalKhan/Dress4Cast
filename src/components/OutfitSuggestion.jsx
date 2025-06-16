// src/components/OutfitSuggestion.jsx
import React, { useState, useEffect, useRef } from 'react';
import OpenAI from 'openai';

export default function OutfitSuggestion({ weather }) {
  const [suggestion, setSuggestion] = useState('');
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState('');
  const askedOnce = useRef(false);

  useEffect(() => {
    if (!weather || askedOnce.current) return;
    askedOnce.current = true;

    const key = import.meta.env.VITE_OPENAI_API_KEY;
    if (!key) {
      setError('Missing OpenAI API key');
      return;
    }

    const openai = new OpenAI({ apiKey: key });
    setLoading(true);
    setError('');
    setSuggestion('');

    (async () => {
      try {
        const res = await openai.chat.completions.create({
          model: 'gpt-3.5-turbo',
          messages: [
            { role: 'system', content: 'You are a friendly fashion stylist.' },
            {
              role: 'user',
              content: `Current weather: ${Math.round(weather.main.temp)}°${
                weather.unit === 'metric' ? 'C' : 'F'
              }, ${weather.weather[0].description}, humidity ${
                weather.main.humidity
              }%, wind ${weather.wind.speed} m/s. Suggest a stylish, comfortable outfit.`
            }
          ],
          max_tokens: 120,
        });
        setSuggestion(res.choices?.[0]?.message?.content?.trim() ?? '');
      } catch (e) {
        if (e.code === '429') setError('Rate limit exceeded. Try again in a minute.');
        else setError(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [weather]);

  if (!weather) return null;
  if (loading)    return <div style={styles.loading}>Generating outfit…</div>;
  if (error)      return <div style={styles.error}>Error: {error}</div>;

  return (
    <div style={styles.container}>
      <strong style={styles.heading}>What to wear:</strong>
      <p style={styles.text}>{suggestion}</p>
    </div>
  );
}

const styles = {
  container: { marginTop: 16, padding: 16, background: '#E8F4FF', borderRadius: 8 },
  heading:   { margin: 0, fontSize: '1rem' },
  text:      { marginTop: 8, fontSize: '0.95rem', lineHeight: 1.4 },
  loading:   { textAlign: 'center', marginTop: 16 },
  error:     { color: 'red',    textAlign: 'center', marginTop: 16 },
};
