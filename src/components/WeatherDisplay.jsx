// src/components/WeatherDisplay.jsx

import React, { useState, useEffect } from 'react';
import getOutfit from '../utils/getOutfit.js';

export default function WeatherDisplay({ location }) {
  const [weather, setWeather] = useState(null);
  const [error, setError]     = useState('');
  const [unit, setUnit]       = useState('metric');
  const [gender, setGender]   = useState('male');
  const [modesty, setModesty] = useState('modest');

  // Fetch current weather from OpenWeatherMap
  useEffect(() => {
    if (!location) return;
    setError('');
    setWeather(null);

    (async () => {
      try {
        const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;
        const url = `https://api.openweathermap.org/data/2.5/weather` +
                    `?lat=${location.lat}&lon=${location.lon}` +
                    `&units=${unit}&appid=${API_KEY}`;
        const res = await fetch(url);
        if (!res.ok) {
          const text = await res.text();
          throw new Error(`Weather API error ${res.status}: ${text}`);
        }
        const data = await res.json();
        setWeather({
          temp:            data.main.temp,
          feels_like:      data.main.feels_like,
          weather:         data.weather,
          dt:              data.dt,
          timezone_offset: data.timezone
        });
      } catch (e) {
        console.error(e);
        setError(e.message);
      }
    })();
  }, [location, unit]);

  // UI states
  if (!location) {
    return <div className="weather-display">Search for a city…</div>;
  }
  if (error) {
    return <div className="weather-display error">Error: {error}</div>;
  }
  if (!weather) {
    return <div className="weather-display">Loading weather…</div>;
  }

  // Compute local date & time
  const localMs   = (weather.dt + weather.timezone_offset) * 1000;
  const localDate = new Date(localMs);
  const timeStr   = localDate.toLocaleTimeString('en-US', {
    hour: '2-digit', minute: '2-digit', hour12: true, timeZone: 'UTC'
  });
  const dateStr   = localDate.toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC'
  });

  const temp      = Math.round(weather.temp);
  const condition = weather.weather[0].description;

  // Step 2: Build two image URLs (primary and fallback)
  const { primaryPath, fallbackPath } = getOutfit(
    gender,
    modesty,
    temp,
    condition
  );

  return (
    <div className="weather-display">
      <small>{dateStr} — Local time: {timeStr}</small>

      <h2>
        {temp}°{unit === 'metric' ? 'C' : 'F'}
      </h2>
      <p className="text-capitalize">{condition}</p>

      {/* Step 3: Gender & Modesty toggles */}
      <div className="controls">
        <button onClick={() => setUnit(u => u === 'metric' ? 'imperial' : 'metric')}>
          Switch to {unit === 'metric' ? '°F' : '°C'}
        </button>
        <button onClick={() => setGender(g => g === 'male' ? 'female' : 'male')}>
          {gender === 'male' ? 'Switch to Female' : 'Switch to Male'}
        </button>
        <button onClick={() => setModesty(m => m === 'modest' ? 'unmodest' : 'modest')}>
          {modesty === 'modest' ? 'Switch to Unmodest' : 'Switch to Modest'}
        </button>
      </div>

      {/* Outfit image with fallback */}
      <div className="outfit-image">
        <img
          src={primaryPath}
          alt="Outfit Suggestion"
          onError={e => {
            e.target.onerror = null;
            e.target.src = fallbackPath;
          }}
        />
      </div>
    </div>
  );
}
