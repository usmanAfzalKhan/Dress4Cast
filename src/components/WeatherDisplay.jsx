import React, { useState, useEffect } from 'react';
import getWeather from '../utils/getWeather.js';

// WeatherDisplay with dynamic theming and precise 12‑hr clock, updated every minute
export default function WeatherDisplay({ location }) {
  const [weather, setWeather] = useState(null);
  const [error, setError]     = useState('');
  const [unit, setUnit]       = useState('metric');
  const [now, setNow]         = useState(Date.now());

  // Fetch weather data
  useEffect(() => {
    if (!location) return;
    setError('');
    setWeather(null);
    (async () => {
      try {
        const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;
        const url = `https://api.openweathermap.org/data/2.5/weather?lat=${location.lat}` +
                    `&lon=${location.lon}&units=${unit}&appid=${API_KEY}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error(`API ${res.status}`);
        const data = await res.json();
        setWeather({
          temp:          data.main.temp,
          feels_like:    data.main.feels_like,
          humidity:      data.main.humidity,
          wind_speed:    data.wind.speed,
          precipitation: data.rain?.['1h'] ?? data.snow?.['1h'] ?? 0,
          condition:     data.weather[0].description,
          tz:            data.timezone
        });
      } catch (e) {
        setError(e.message);
      }
    })();
  }, [location, unit]);

  // Update clock every 60s
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 60000);
    return () => clearInterval(id);
  }, []);

  // UI states
  if (!location) return <p style={styles.message}>Search for a city…</p>;
  if (error)      return <p style={styles.error}>Error: {error}</p>;
  if (!weather)   return <p style={styles.message}>Loading weather…</p>;

  // Calculate target local time using UTC epoch + tz offset
  const targetMs = now + weather.tz * 1000;
  const dt       = new Date(targetMs);

  // Format 12‑hr clock
  const hours   = dt.getUTCHours();
  const minutes = dt.getUTCMinutes();
  const ampm    = hours >= 12 ? 'PM' : 'AM';
  const hour12  = hours % 12 === 0 ? 12 : hours % 12;
  const minuteP = minutes < 10 ? '0' + minutes : minutes;
  const timeStr = `${hour12}:${minuteP} ${ampm}`;

  // Format date
  const dateStr = dt.toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric'
  });

  // Determine condition theme
  const cond = weather.condition.toLowerCase();
  let theme = 'default';
  if (cond.includes('clear'))     theme = 'sunny';
  else if (cond.includes('cloud')) theme = 'cloudy';
  else if (cond.includes('rain'))  theme = 'rainy';
  else if (cond.includes('snow'))  theme = 'snowy';
  else if (['haze','mist','fog'].some(k => cond.includes(k))) theme = 'hazy';

  // Time-of-day overlay
  let timeTheme = 'day';
  if (hours < 5)                     timeTheme = 'night';
  else if (hours < 8)                timeTheme = 'morning';
  else if (hours < 18)               timeTheme = 'day';
  else if (hours < 20)               timeTheme = 'evening';
  else                                timeTheme = 'night';

  // Backgrounds & overlays
  const themes = {
    sunny:   'linear-gradient(135deg, #FFE57F, #FFD740)',
    cloudy:  'linear-gradient(135deg, #ECEFF1, #CFD8DC)',
    rainy:   'linear-gradient(135deg, #81D4FA, #4FC3F7)',
    snowy:   'linear-gradient(135deg, #E1F5FE, #B3E5FC)',
    hazy:    'linear-gradient(135deg, #CFD8DC, #B0BEC5)',
    default: 'linear-gradient(135deg, #FDFDFD, #ECEFF1)'
  };
  const overlays = {
    morning: 'rgba(255,235,59,0.2)',
    day:     'rgba(255,255,255,0)',
    evening: 'rgba(255,183,77,0.3)',
    night:   'rgba(33,33,33,0.4)'
  };

  const bgGradient = themes[theme];
  const overlay    = overlays[timeTheme];
  const textColor  = theme === 'rainy' ? '#022F40' : '#333';

  // Round values
  const tempRounded   = Math.round(weather.temp);
  const feelsRounded  = Math.round(weather.feels_like);
  const precipRounded = weather.precipitation;

  return (
    <div style={{
      ...styles.card,
      background: bgGradient,
      backgroundColor: overlay,
      backgroundBlendMode: 'overlay',
      color: textColor
    }}>
      <header style={styles.header}>
        <div>
          <p style={styles.date}>{dateStr}</p>
          <p style={styles.time}>{timeStr}</p>
        </div>
        <button
          style={{ ...styles.toggle, borderColor: textColor, color: textColor }}
          onClick={() => setUnit(u => u === 'metric' ? 'imperial' : 'metric')}
        >
          °{unit === 'metric' ? 'F' : 'C'}
        </button>
      </header>
      <div style={styles.main}>
        <h1 style={styles.temp}>{tempRounded}°{unit === 'metric' ? 'C' : 'F'}</h1>
        <p style={styles.condition}>{weather.condition}</p>
      </div>
      <div style={styles.detailsRow}>
        <div style={{ ...styles.detailBox, borderColor: textColor }}>
          <p style={styles.detailLabel}>Feels like</p>
          <p style={styles.detailValue}>{feelsRounded}°</p>
        </div>
        <div style={{ ...styles.detailBox, borderColor: textColor }}>
          <p style={styles.detailLabel}>Humidity</p>
          <p style={styles.detailValue}>{weather.humidity}%</p>
        </div>
      </div>
      <div style={styles.detailsRow}>
        <div style={{ ...styles.detailBox, borderColor: textColor }}>
          <p style={styles.detailLabel}>Wind</p>
          <p style={styles.detailValue}>{weather.wind_speed} {unit === 'metric' ? 'm/s' : 'mph'}</p>
        </div>
        <div style={{ ...styles.detailBox, borderColor: textColor }}>
          <p style={styles.detailLabel}>Precip.</p>
          <p style={styles.detailValue}>{precipRounded} mm</p>
        </div>
      </div>
    </div>
  );
}

const styles = {
  card: {
    maxWidth: 380,
    margin: '24px auto',
    padding: 24,
    borderRadius: 16,
    boxShadow: '0 6px 16px rgba(0,0,0,0.1)',
    fontFamily: 'Helvetica, Arial, sans-serif',
    backgroundSize: 'cover'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20
  },
  date:    { margin: 0, fontSize: '0.95rem', opacity: 0.8 },
  time:    { margin: 0, fontSize: '0.95rem', fontWeight: 500 },
  toggle:  { border: '2px solid', background: 'transparent', padding: '6px 10px', borderRadius: 8, cursor: 'pointer', fontSize: '0.9rem' },
  main:    { textAlign: 'center', marginBottom: 24 },
  temp:    { margin: 0, fontSize: '3rem', lineHeight: 1 },
  condition:{ margin: '8px 0 0', textTransform: 'capitalize', fontWeight: 500 },
  detailsRow:{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 },
  detailBox:{ flex: '0 0 48%', padding: 12, border: '1px solid', borderRadius: 8, textAlign: 'center', background: 'rgba(255,255,255,0.3)' },
  detailLabel:{ margin: 0, fontSize: '0.85rem', opacity: 0.8 },
  detailValue:{ margin: '4px 0 0', fontSize: '1.15rem', fontWeight: 600 },
  message:  { textAlign: 'center', color: '#666', marginTop: 20 },
  error:    { textAlign: 'center', color: 'red', marginTop: 20 }
};
