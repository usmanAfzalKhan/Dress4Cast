import React, { useState, useEffect } from 'react';
import getForecast from '../utils/getForecast.js';

export default function ForecastDisplay({ location, unit }) {
  const [slots, setSlots] = useState([]);
  const [err, setErr]     = useState('');

  useEffect(() => {
    if (!location) return setSlots([]);
    setErr('');
    (async () => {
      try {
        const data = await getForecast(location.lat, location.lon, unit);
        const list = Array.isArray(data.list) ? data.list : [];
        if (!list.length) throw new Error('No forecast data');
        // timezone offset
        const tz = (data.city.timezone || 0) * 1000;
        // today’s date
        const today = new Date(list[0].dt*1000 + tz).getUTCDate();
        // filter to today’s slots
        const todaySlots = list.filter(i =>
          new Date(i.dt*1000 + tz).getUTCDate() === today
        ).slice(0,6);
        setSlots(todaySlots.length ? todaySlots : list.slice(0,6));
      } catch (e) {
        setErr(e.message);
      }
    })();
  }, [location, unit]);

  if (!location) return null;
  if (err)       return <p style={{ color:'red', textAlign:'center' }}>Error: {err}</p>;
  if (!slots.length) return <p style={{ textAlign:'center' }}>Loading forecast…</p>;

  return (
    <div style={{ display:'flex', gap:8, justifyContent:'space-between', marginTop:16 }}>
      {slots.map((h,i) => {
        const tz = (location.timezoneOffset || 0) * 1000;
        const dt = new Date(h.dt*1000 + tz);
        const mon = dt.getUTCMonth()+1, day = dt.getUTCDate();
        let hr = dt.getUTCHours(), am = hr>=12?'PM':'AM';
        hr = hr%12||12;
        const icon = h.weather[0].icon;
        const bg = icon.startsWith('01') ? '#FFEFC4'
                 : icon.startsWith('02') ? '#E1F5FE'
                 : icon.startsWith('03') ? '#CFDBDC'
                 : icon.startsWith('09')||icon.startsWith('10') ? '#B3CFFF'
                 : icon.startsWith('13') ? '#E1F5FE'
                 : '#ECEDF1';

        return (
          <div key={i} style={{
            flex:'1 1 auto', padding:8, borderRadius:8,
            background:bg, textAlign:'center'
          }}>
            <div style={{ fontSize:'0.9rem', color:'#555' }}>{`${mon}/${day}`}</div>
            <div style={{ margin:'4px 0', fontWeight:500 }}>{`${hr}${am}`}</div>
            <img
              src={`https://openweathermap.org/img/wn/${icon}@2x.png`}
              alt={h.weather[0].description}
              style={{ width:40, height:40 }}
            />
            <div style={{ fontSize:'1rem', fontWeight:600 }}>
              {Math.round(h.main.temp)}°
            </div>
          </div>
        );
      })}
    </div>
  );
}
