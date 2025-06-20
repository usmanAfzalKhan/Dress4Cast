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
      onWeatherChange?.(data);
      setLastFetch(Date.now());
      setError('');
    } catch (e) {
      setError(e.message);
    }
  }, [location, unit, onWeatherChange]);

  useEffect(() => {
    setWeather(null);
    setLastFetch(null);
    fetchWeather();
  }, [fetchWeather]);

  useEffect(() => {
    if (!location) return;
    const id = setInterval(fetchWeather, 300_000);
    return () => clearInterval(id);
  }, [location, fetchWeather]);

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  if (!location) return null;
  if (error)     return <div style={styles.error}>Error: {error}</div>;
  if (!weather)  return <div style={styles.message}>Loading weather…</div>;

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
  // ---- This is the only changed part for filter ----
  const filter =
    key === 'clear'
      ? 'invert(93%) sepia(7%) saturate(1200%) hue-rotate(190deg) brightness(1.15)'
      : 'invert(95%) sepia(7%) saturate(900%) hue-rotate(185deg) brightness(1.12)';
  // --------------------------------------------------

  return (
    <div className="weather-card" style={styles.card}>
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
  card: {
    background: '#22375e',          // dark royal blue card
    borderRadius: 18,
    padding: 20,
    maxWidth: 355,
    boxShadow: '0 4px 18px #0002, 0 1.5px 6px 0 #0e172033',
    margin: 'auto',
    color: '#fff',                  // all text is white
  },
  header: { display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:12 },
  dateTime:{ fontSize:'0.98rem', color:'#cce4fa' },
  updated: { fontSize:'0.86rem', color:'#aacbe5', marginTop:4 },
  toggle:  { background:'#406bda', color:'#fff', border:'none', borderRadius:7, padding:'5px 12px', cursor:'pointer', fontSize:'1rem', fontWeight:600 },
  iconWrap:{ textAlign:'center', marginBottom:12 },
  icon:    { width:60, height:60 },
  mainTemp:{ fontSize:'2.5rem', fontWeight:600, textAlign:'center', marginBottom:4, color:'#fff' },
  condition:{ textTransform:'capitalize', textAlign:'center', color:'#ffea8a', marginBottom:16, fontSize: '1.13rem', fontWeight: 500 },
  detailsRow:{ display:'flex', gap:12, marginBottom:8 },
  detail:  { flex:'1 1 0', background:'#18315a', borderRadius:10, padding:8, textAlign:'center', boxShadow:'0 1.5px 5px #0002', color:'#cde0f6' },
  error:   { color:'red', textAlign:'center', margin:16 },
  message: { textAlign:'center', margin:16 },
};
