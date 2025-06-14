import React, { useEffect, useState } from 'react';
import { Card, Button } from 'react-bootstrap';

export default function WeatherDisplay({ lat, lon }) {
  const [data, setData] = useState(null);
  const [units, setUnits] = useState('metric');

  useEffect(() => {
    if (!lat || !lon) return;

    fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=${units}&appid=${import.meta.env.VITE_OPENWEATHER_API_KEY}`
    )
      .then((res) => res.json())
      .then((json) => {
        setData({
          temp: Math.round(json.main.temp),
          feelsLike: Math.round(json.main.feels_like),
          condition: json.weather[0].description,
          humidity: json.main.humidity,
          wind: (json.wind.speed * (units === 'metric' ? 3.6 : 1)).toFixed(1),
          precip: json.rain?.['1h'] ?? 0,
          timezone: json.timezone
        });
      })
      .catch(console.error);
  }, [lat, lon, units]);

  if (!data) return null;

  const { temp, feelsLike, condition, humidity, wind, precip, timezone } = data;

  const nowUTC = Date.now();
  const localTimestamp = nowUTC + (timezone * 1000);
  const localDate = new Date(localTimestamp);

  const localTime = localDate.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
    timeZone: 'UTC'
  });

  const localDateStr = localDate.toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC'
  });

  return (
    <Card className="my-4 p-3 text-center">
      <small>{localDateStr} — Local time: {localTime}</small>
      <h2>{temp}°{units === 'metric' ? 'C' : 'F'}</h2>
      <p className="text-capitalize">{condition}</p>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '8px',
        fontSize: '0.9rem',
        marginTop: '10px'
      }}>
        <div>Feels like:</div><div>{feelsLike}°{units === 'metric' ? 'C' : 'F'}</div>
        <div>Humidity:</div><div>{humidity}%</div>
        <div>Wind:</div><div>{wind} {units === 'metric' ? 'km/h' : 'mph'}</div>
        <div>Precipitation:</div><div>{precip} mm</div>
      </div>

      <div className="mt-3">
        <Button variant={units === 'metric' ? 'primary' : 'outline-primary'} onClick={() => setUnits('metric')}>°C</Button>{' '}
        <Button variant={units === 'imperial' ? 'primary' : 'outline-primary'} onClick={() => setUnits('imperial')}>°F</Button>
      </div>
    </Card>
  );
}
