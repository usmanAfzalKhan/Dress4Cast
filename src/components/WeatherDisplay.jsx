import React, { useState, useEffect } from 'react';
import getWeather from '../utils/getWeather.js';

// WeatherDisplay with auto-refresh every 5 minutes, last-updated tag, live clock and dynamic theming
export default function WeatherDisplay({ location, unit, onToggleUnit }) {
  const [weather, setWeather]     = useState(null);
  const [error, setError]         = useState('');
  const [now, setNow]             = useState(Date.now());
  const [lastFetch, setLastFetch] = useState(null);

  // Fetch once + every 5m
  useEffect(() => {
    if (!location) return;
    setError(''); setWeather(null);
    const fetchWeather = async () => {
      try {
        const data = await getWeather(location.lat, location.lon, unit);
        setWeather(data);
        setLastFetch(Date.now());
      } catch (e) {
        setError(e.message);
      }
    };
    fetchWeather();
    const id = setInterval(fetchWeather, 5 * 60 * 1000);
    return () => clearInterval(id);
  }, [location, unit]);

  // Tick clock each minute
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 60 * 1000);
    return () => clearInterval(id);
  }, []);

  if (!location) return <p style={styles.message}>Search for a city…</p>;
  if (error)      return <p style={styles.error}>Error: {error}</p>;
  if (!weather)   return <p style={styles.message}>Loading weather…</p>;

  // Compute local time for target
  const targetMs = now + weather.tz * 1000;
  const dt       = new Date(targetMs);
  let  hh = dt.getUTCHours(), mm = dt.getUTCMinutes();
  const ampm = hh >= 12 ? 'PM' : 'AM';
  hh = hh % 12 === 0 ? 12 : hh % 12;
  const minuteP = mm < 10 ? '0'+mm : mm;
  const timeStr = `${hh}:${minuteP} ${ampm}`;
  const dateStr = dt.toLocaleDateString('en-US',{
    weekday:'short',month:'short',day:'numeric'
  });

  // Last-updated text
  const diffMin = lastFetch ? Math.floor((now - lastFetch)/60000) : 0;
  const updatedStr = lastFetch
    ? `Updated ${diffMin} minute${diffMin===1?'':'s'} ago`
    : '';

  // Theming
  const cond = weather.condition.toLowerCase();
  let theme = 'default';
  if (cond.includes('clear'))     theme='sunny';
  else if (cond.includes('cloud')) theme='cloudy';
  else if (cond.includes('rain'))  theme='rainy';
  else if (cond.includes('snow'))  theme='snowy';
  else if (['haze','mist','fog'].some(k=>cond.includes(k))) theme='hazy';

  // Time-of-day overlay
  let tod='day';
  const rawH = dt.getUTCHours();
  if (rawH<5)       tod='night';
  else if (rawH<8)  tod='morning';
  else if (rawH<18) tod='day';
  else if (rawH<20) tod='evening';
  else              tod='night';

  const themes = {
    sunny:  'linear-gradient(135deg,#FFE57F,#FFD740)',
    cloudy: 'linear-gradient(135deg,#ECEFF1,#CFD8DC)',
    rainy:  'linear-gradient(135deg,#81D4FA,#4FC3F7)',
    snowy:  'linear-gradient(135deg,#E1F5FE,#B3E5FC)',
    hazy:   'linear-gradient(135deg,#CFD8DC,#B0BEC5)',
    default:'linear-gradient(135deg,#FDFDFD,#ECEFF1)'
  };
  const overlays = {
    morning:'rgba(255,235,59,0.2)',
    day:    'rgba(255,255,255,0)',
    evening:'rgba(255,183,77,0.3)',
    night:  'rgba(33,33,33,0.4)'
  };
  const bg       = themes[theme];
  const overlay  = overlays[tod];
  const textColor= theme==='rainy'?'#022F40':'#333';

  // Round values
  const t0 = Math.round(weather.temp);
  const f0 = Math.round(weather.feels_like);
  const p0 = weather.precipitation;

  return (
    <div style={{
      ...styles.card,
      background:        bg,
      backgroundColor:   overlay,
      backgroundBlendMode:'overlay',
      color:             textColor
    }}>
      <header style={styles.header}>
        <div>
          <p style={styles.date}>{dateStr}</p>
          <p style={styles.time}>{timeStr}</p>
          {updatedStr && <p style={styles.updated}>{updatedStr}</p>}
        </div>
        <button
          style={{ ...styles.toggle, borderColor:textColor, color:textColor }}
          onClick={()=> onToggleUnit(unit==='metric'?'imperial':'metric')}
        >
          °{unit==='metric'?'F':'C'}
        </button>
      </header>

      <div style={styles.main}>
        <h1 style={styles.temp}>{t0}°{unit==='metric'?'C':'F'}</h1>
        <p style={styles.condition}>{weather.condition}</p>
      </div>

      <div style={styles.detailsRow}>
        <div style={{...styles.detailBox,borderColor:textColor}}>
          <p style={styles.detailLabel}>Feels like</p>
          <p style={styles.detailValue}>{f0}°</p>
        </div>
        <div style={{...styles.detailBox,borderColor:textColor}}>
          <p style={styles.detailLabel}>Humidity</p>
          <p style={styles.detailValue}>{weather.humidity}%</p>
        </div>
      </div>

      <div style={styles.detailsRow}>
        <div style={{...styles.detailBox,borderColor:textColor}}>
          <p style={styles.detailLabel}>Wind</p>
          <p style={styles.detailValue}>
            {weather.wind_speed} {unit==='metric'?'m/s':'mph'}
          </p>
        </div>
        <div style={{...styles.detailBox,borderColor:textColor}}>
          <p style={styles.detailLabel}>Precip.</p>
          <p style={styles.detailValue}>{p0} mm</p>
        </div>
      </div>
    </div>
  );
}

const styles = {
  card:       { maxWidth:380, margin:'24px auto', padding:24, borderRadius:16,
                boxShadow:'0 6px 16px rgba(0,0,0,0.1)', fontFamily:'Helvetica,Arial',
                backgroundSize:'cover' },
  header:     { display:'flex',justifyContent:'space-between',alignItems:'flex-start',
                gap:12, marginBottom:20 },
  date:       { margin:0,fontSize:'0.95rem',opacity:0.8 },
  time:       { margin:'4px 0',fontSize:'0.95rem',fontWeight:500 },
  updated:    { margin:0,fontSize:'0.75rem',opacity:0.7 },
  toggle:     { border:'2px solid',background:'transparent',padding:'6px 10px',
                borderRadius:8, cursor:'pointer',fontSize:'0.9rem' },
  main:       { textAlign:'center',marginBottom:24 },
  temp:       { margin:0,fontSize:'3rem',lineHeight:1 },
  condition:  { margin:'8px 0 0',textTransform:'capitalize',fontWeight:500 },
  detailsRow: { display:'flex',justifyContent:'space-between',marginBottom:12 },
  detailBox:  { flex:'0 0 48%',padding:12,border:'1px solid',borderRadius:8,
                textAlign:'center',background:'rgba(255,255,255,0.3)' },
  detailLabel:{ margin:0,fontSize:'0.85rem',opacity:0.8 },
  detailValue:{ margin:'4px 0 0',fontSize:'1.15rem',fontWeight:600 },
  message:    { textAlign:'center',color:'#666',marginTop:20 },
  error:      { textAlign:'center',color:'red',marginTop:20 }
};
