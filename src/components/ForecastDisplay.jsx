// src/components/ForecastDisplay.jsx
import React, { useState, useEffect } from 'react';
import getForecast from '../utils/getForecast.js';

export default function ForecastDisplay({ location, unit }) {
  const [slots, setSlots] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!location) {
      setSlots([]);
      return;
    }
    setError('');
    setSlots([]);

    (async () => {
      try {
        const data = await getForecast(location.lat, location.lon, unit);
        if (!Array.isArray(data.list)) {
          throw new Error('No forecast data');
        }
        // take the next six slots after “now”
        const nowMs = Date.now();
        const futureSlots = data.list.filter(slot => slot.dt * 1000 > nowMs);
        setSlots(futureSlots.slice(0, 6));
      } catch (e) {
        setError(e.message);
      }
    })();
  }, [location, unit]);

  if (!location) return null;
  if (error)
    return (
      <div className="forecast-error">
        Error: {error}
      </div>
    );
  if (!slots.length)
    return (
      <div className="forecast-loading">
        Loading forecast…
      </div>
    );

  return (
    <div className="forecast-container">
      {slots.map((h, i) => {
        const dt = new Date(h.dt * 1000);
        const hour12 = dt.getHours() % 12 || 12;
        const ampm = dt.getHours() >= 12 ? 'PM' : 'AM';
        const date = dt.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' });
        const icon = h.weather?.[0]?.icon;

        return (
          <div
            key={i}
            className="forecast-card"
            style={{
              background: '#22375e',
              borderRadius: 18,
              boxShadow: '0 4px 18px #0002, 0 1.5px 6px 0 #0e172033',
              color: '#e8ecf8'
            }}
          >
            <p className="date">{date}</p>
            <p className="hour">{`${hour12}${ampm}`}</p>
            {icon && (
              <img
                src={`https://openweathermap.org/img/wn/${icon}@2x.png`}
                alt=""
              />
            )}
            <p className="temp">{Math.round(h.main.temp)}°</p>
          </div>
        );
      })}
    </div>
  );
}
