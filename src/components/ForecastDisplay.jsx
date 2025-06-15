import React, { useState, useEffect } from 'react';
import getHourlyForecast from '../utils/getHourlyForecast.js';

export default function ForecastDisplay({ location, unit }) {
  const [forecast, setForecast] = useState([]);
  const [error, setError]       = useState('');

  useEffect(() => {
    if (!location) return;
    (async () => {
      try {
        const data = await getHourlyForecast(location.lat, location.lon, unit);
        setForecast(data.hourly.slice(1,7));
      } catch (e) {
        setError(e.message);
      }
    })();
  }, [location, unit]);

  if (!location)           return null;
  if (error)                return <p style={styles.error}>Error: {error}</p>;
  if (!forecast.length)     return <p style={styles.message}>Loading forecast…</p>;

  return (
    <div style={styles.container}>
      {forecast.map((h, i) => {
        const dt = new Date(h.dt * 1000);
        const hr = dt.getHours() % 12 || 12;
        const ap = dt.getHours() >= 12 ? 'PM' : 'AM';
        return (
          <div key={i} style={styles.cell}>
            <p style={styles.time}>{hr}{ap}</p>
            <img
              src={`https://openweathermap.org/img/wn/${h.weather[0].icon}@2x.png`}
              alt={h.weather[0].description}
              style={styles.icon}
            />
            <p style={styles.temp}>{Math.round(h.temp)}°</p>
          </div>
        );
      })}
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '12px 24px',
    background: 'rgba(255,255,255,0.8)',
    borderRadius: 12,
    marginTop: 16
  },
  cell: {
    textAlign: 'center',
    flex: '1 1 auto'
  },
  time: {
    margin: 0,
    fontSize: '0.9rem',
    color: '#555'
  },
  icon: {
    width: 48,
    height: 48
  },
  temp: {
    margin: '4px 0 0',
    fontSize: '1rem',
    fontWeight: 500
  },
  message: { textAlign:'center', color:'#666', marginTop:12 },
  error:   { textAlign:'center', color:'red', marginTop:12 }
};
