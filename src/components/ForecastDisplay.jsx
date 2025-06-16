// src/components/ForecastDisplay.jsx
import React, { useState, useEffect } from 'react';
import getForecast from '../utils/getForecast.js';

export default function ForecastDisplay({ location, unit }) {
  const [slots, setSlots] = useState([]);
  const [tzOffset, setTzOffset] = useState(0);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!location) return;
    setError('');
    setSlots([]);

    (async () => {
      try {
        const data = await getForecast(location.lat, location.lon, unit);
        const list = Array.isArray(data.list) ? data.list : [];
        if (!list.length) throw new Error('No forecast data available');

        // save the timezone offset from the payload
        setTzOffset(data.city?.timezone || 0);

        // take the next six 3-hour slots straight off the list
        setSlots(list.slice(0, 6));
      } catch (e) {
        setError(e.message);
      }
    })();
  }, [location, unit]);

  if (!location) return null;
  if (error) return <p style={{ color: 'red', textAlign: 'center' }}>Error: {error}</p>;
  if (!slots.length) return <p style={{ textAlign: 'center' }}>Loading forecast…</p>;

  return (
    <div style={{ display: 'flex', gap: 8, justifyContent: 'space-between', marginTop: 16 }}>
      {slots.map((h, i) => {
        // build a JS Date using the payload's tz offset
        const dt = new Date((h.dt + tzOffset) * 1000);
        const hour12 = dt.getHours() % 12 || 12;
        const ampm = dt.getHours() >= 12 ? 'PM' : 'AM';
        const dateLabel = dt.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' });
        const icon = h.weather?.[0]?.icon || '';

        // simple sky-based tint
        const bg = icon.startsWith('01') ? '#FFEFC4'
                 : icon.startsWith('02') ? '#E1F5FE'
                 : icon.startsWith('03') ? '#CFDBDC'
                 : icon.startsWith('09') || icon.startsWith('10') ? '#B3CFFF'
                 : icon.startsWith('13') ? '#E1F5FE'
                 : '#ECEDF1';

        return (
          <div
            key={i}
            style={{
              flex: '1 1 auto',
              padding: 8,
              borderRadius: 8,
              background: bg,
              textAlign: 'center'
            }}
          >
            <p style={{ margin: 0, fontSize: '0.9rem', color: '#555' }}>{dateLabel}</p>
            <p style={{ margin: '4px 0', fontWeight: 500 }}>{`${hour12}${ampm}`}</p>
            {icon && (
              <img
                src={`https://openweathermap.org/img/wn/${icon}@2x.png`}
                alt={h.weather[0].description}
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
