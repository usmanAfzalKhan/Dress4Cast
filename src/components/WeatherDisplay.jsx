import React, { useState, useEffect, useCallback } from 'react';
import getWeather from '../utils/getWeather.js';

const ICON_MAP = {
  clear:        '/assets/icons/sun.svg',
  clouds:       '/assets/icons/cloud.svg',
  rain:         '/assets/icons/rain.svg',
  drizzle:      '/assets/icons/rain.svg',
  snow:         '/assets/icons/snowflake.svg',
  thunderstorm: '/assets/icons/thunder.svg',
  mist:         '/assets/icons/fog.svg',
  fog:          '/assets/icons/fog.svg',
  haze:         '/assets/icons/haze.svg',
};

export default function WeatherDisplay({
  location,
  unit,
  onToggleUnit,
  onWeatherChange
}) {
  const [weather,   setWeather]   = useState(null);
  const [error,     setError]     = useState('');
  const [lastFetch, setLastFetch] = useState(null);
  const [now,       setNow]       = useState(Date.now());

  const fetchWeather = useCallback(async () => {
    if (!location) return;
    try {
      const data = await getWeather(location.lat, location.lon, unit);
      setWeather(data);
      onWeatherChange?.(data);               // 🔥 lift weather up into App.jsx
      setLastFetch(Date.now());
      setError('');
    } catch (e) {
      setError(e.message);
    }
  }, [location, unit, onWeatherChange]);

  // initial + refetch when location or unit changes
  useEffect(() => {
    setWeather(null);
    setLastFetch(null);
    fetchWeather();
  }, [fetchWeather]);

  // auto-refresh every 5 minutes
  useEffect(() => {
    if (!location) return;
    const id = setInterval(fetchWeather, 300_000);
    return () => clearInterval(id);
  }, [location, fetchWeather]);

  // real-time clock tick every second
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  if (!location) return null;
  if (error)     return <div style={styles.error}>Error: {error}</div>;
  if (!weather)  return <div style={styles.message}>Loading weather…</div>;

  // ——— rendering logic remains unchanged ———

  const remoteNowMs = now + weather.timezone * 1000;
  const dt          = new Date(remoteNowMs);
  const days        = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  const months      = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const dateStr     = `${days[dt.getUTCDay()]}, ${months[dt.getUTCMonth()]} ${dt.getUTCDate()}`;
  let hh            = dt.getUTCHours();
  const mm          = dt.getUTCMinutes().toString().padStart(2,'0');
  const ampm        = hh >= 12 ? 'PM' : 'AM';
  hh                = hh % 12 || 12;
  const timeStr     = `${hh}:${mm} ${ampm}`;
  const minsAgo     = Math.max(0, Math.round((now - lastFetch)/60_000));
  const updatedStr  = minsAgo === 0
    ? 'Updated just now'
    : `Updated ${minsAgo} minute${minsAgo>1?'s':''} ago`;

  const key      = weather.weather[0].main.toLowerCase();
  const iconSrc  = ICON_MAP[key] || ICON_MAP.clouds;
  const filter   = key==='clear'
    ? (dt.getUTCHours()>=6 && dt.getUTCHours()<18
       ? 'invert(60%) sepia(80%) saturate(500%) hue-rotate(5deg)'
       : 'invert(20%) sepia(10%) saturate(200%) hue-rotate(180deg)')
    : 'invert(70%) sepia(10%) saturate(200%) hue-rotate(180deg)';

  return (
    <div style={styles.card}>
      <header style={styles.header}>
        <div>
          <div style={styles.dateTime}>{dateStr}</div>
          <div style={styles.dateTime}>{timeStr}</div>
          <div style={styles.updated}>{updatedStr}</div>
        </div>
        <button onClick={onToggleUnit} style={styles.toggle}>
          °{unit==='metric'?'F':'C'}
        </button>
      </header>

      <div style={styles.iconWrap}>
        <img src={iconSrc}
             alt={weather.weather[0].description}
             style={{ ...styles.icon, filter }} />
      </div>

      <div style={styles.mainTemp}>
        {Math.round(weather.main.temp)}°{unit==='metric'?'C':'F'}
      </div>
      <div style={styles.condition}>
        {weather.weather[0].description}
      </div>

      <div style={styles.detailsRow}>
        <div style={styles.detail}>
          <strong>Feels like</strong>
          <div>{Math.round(weather.main.feels_like)}°</div>
        </div>
        <div style={styles.detail}>
          <strong>Humidity</strong>
          <div>{weather.main.humidity}%</div>
        </div>
      </div>
      <div style={styles.detailsRow}>
        <div style={styles.detail}>
          <strong>Wind</strong>
          <div>{weather.wind.speed} m/s</div>
        </div>
        <div style={styles.detail}>
          <strong>Precip.</strong>
          <div>{weather.rain?.['1h'] ?? 0} mm</div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  /* — as before — */
  card: { background:'#FEF9E6', borderRadius:12, padding:16, maxWidth:320, boxShadow:'0 4px 12px rgba(0,0,0,0.1)', margin:'auto' },
  header: { display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:12 },
  dateTime:{ fontSize:'0.9rem', color:'#555' },
  updated: { fontSize:'0.8rem', color:'#888', marginTop:4 },
  toggle:  { background:'#222', color:'#fff', border:'none', borderRadius:4, padding:'4px 8px', cursor:'pointer', fontSize:'0.9rem' },
  iconWrap:{ textAlign:'center', marginBottom:12 },
  icon:    { width:60, height:60 },
  mainTemp:{ fontSize:'2.5rem', fontWeight:500, textAlign:'center', marginBottom:4 },
  condition:{ textTransform:'capitalize', textAlign:'center', color:'#555', marginBottom:16 },
  detailsRow:{ display:'flex', gap:12, marginBottom:8 },
  detail:  { flex:'1 1 0', background:'#fff', borderRadius:8, padding:8, textAlign:'center', boxShadow:'0 2px 6px rgba(0,0,0,0.05)' },
  error:   { color:'red', textAlign:'center', margin:16 },
  message: { textAlign:'center', margin:16 },
};
