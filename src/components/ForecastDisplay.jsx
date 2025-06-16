import React, { useState, useEffect } from 'react';
import getForecast from '../utils/getForecast.js';

export default function ForecastDisplay({ location, unit }) {
  const [slots, setSlots] = useState([]);
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

        const tzOffsetMs = (data.city.timezone || 0) * 1000;
        const todayDay = new Date(list[0].dt * 1000 + tzOffsetMs).getUTCDate();

        // only today's slots, fallback to first six
        const todaySlots = list.filter(item => {
          return new Date(item.dt * 1000 + tzOffsetMs).getUTCDate() === todayDay;
        });
        const selected = todaySlots.length ? todaySlots.slice(0, 6) : list.slice(0, 6);
        setSlots(selected);
      } catch (e) {
        setError(e.message);
      }
    })();
  }, [location, unit]);

  if (!location) return null;
  if (error) return <p style={{ color: 'red', textAlign: 'center' }}>Error: {error}</p>;
  if (!slots.length) return <p style={{ textAlign: 'center' }}>Loading forecast…</p>;

  const container = {
    display: 'flex',
    gap: 12,
    justifyContent: 'space-between',
    marginTop: 24,
    padding: '0 16px'
  };

  return (
    <div style={container}>
      {slots.map((h, i) => {
        const ms = h.dt * 1000 + (location.timezoneOffset || (location.timezone || 0)) * 1000;
        const dt = new Date(ms);
        const dateLabel = dt.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' });
        const hour12 = dt.getHours() % 12 || 12;
        const ampm = dt.getHours() >= 12 ? 'PM' : 'AM';
        const icon = h.weather?.[0]?.icon || '';
        const bgBase = icon.startsWith('01')
          ? '#FFEFC4'
          : icon.startsWith('02')
          ? '#E1F5FE'
          : icon.startsWith('03')
          ? '#CFDBDC'
          : icon.startsWith('09') || icon.startsWith('10')
          ? '#B3CFFF'
          : icon.startsWith('13')
          ? '#E1F5FE'
          : '#ECEDF1';

        return (
          <div
            key={i}
            style={{
              flex: '1 1 auto',
              padding: 12,
              borderRadius: 12,
              background: `linear-gradient(150deg, ${bgBase} 10%, rgba(255,255,255,0.8) 90%)`,
              textAlign: 'center',
              boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
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
