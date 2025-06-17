import React, { useState, useEffect } from 'react';
import getForecast from '../utils/getForecast.js';

export default function ForecastDisplay({ location, unit }) {
  const [slots, setSlots]   = useState([]);
  const [error, setError]   = useState('');

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
  if (error)     return <div style={{ color: 'red', textAlign: 'center' }}>Error: {error}</div>;
  if (!slots.length) return <div style={{ textAlign: 'center' }}>Loading forecast…</div>;

  return (
    <div style={{ display: 'flex', gap: 8, justifyContent: 'space-between', marginTop: 16 }}>
      {slots.map((h, i) => {
        const dt = new Date(h.dt * 1000);
        const hour12 = dt.getHours() % 12 || 12;
        const ampm   = dt.getHours() >= 12 ? 'PM' : 'AM';
        const date   = dt.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' });
        const icon   = h.weather?.[0]?.icon;

        return (
          <div
            key={i}
            style={{
              flex: '1 1 auto',
              padding: 8,
              borderRadius: 8,
              background: '#ECEDF1',
              textAlign: 'center',
            }}
          >
            <p style={{ margin: 0, fontSize: '0.9rem', color: '#555' }}>{date}</p>
            <p style={{ margin: '4px 0', fontWeight: 500 }}>{`${hour12}${ampm}`}</p>
            {icon && (
              <img
                src={`https://openweathermap.org/img/wn/${icon}@2x.png`}
                alt=""
                style={{ width: 40, height: 40 }}
              />
            )}
            <p style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>
              {Math.round(h.main.temp)}°
            </p>
          </div>
        );
      })}
    </div>
  );
}
