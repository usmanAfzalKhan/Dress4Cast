// src/components/WeatherDisplay.jsx
import React, { useEffect, useState } from 'react';
import { Card, ButtonGroup, Button } from 'react-bootstrap';

export default function WeatherDisplay({ lat, lon }) {
  const [weather, setWeather] = useState(null);
  const [units,   setUnits]   = useState('metric'); // 'metric' or 'imperial'

  // 1) Fetch once in metric
  useEffect(() => {
    if (!lat || !lon) return;
    fetch(
      `https://api.openweathermap.org/data/2.5/weather` +
      `?lat=${lat}&lon=${lon}` +
      `&units=metric` +                              // always metric here
      `&appid=${import.meta.env.VITE_OPENWEATHER_API_KEY}`
    )
    .then(res => res.json())
    .then(data => setWeather(data))
    .catch(console.error);
  }, [lat, lon]);

  if (!weather) return null;

  // 2) Temperature conversion
  const celsius = weather.main.temp;
  const temp =
    units === 'metric'
      ? Math.round(celsius)
      : Math.round((celsius * 9) / 5 + 32);

  // 3) Local time computation
  const utcMs      = weather.dt * 1000;          // UTC timestamp in ms
  const offsetMs   = weather.timezone * 1000;    // timezone offset in ms
  const cityDate   = new Date(utcMs + offsetMs);
  const hours24    = cityDate.getUTCHours();
  const minutes    = cityDate.getUTCMinutes();
  const hour12     = hours24 % 12 || 12;
  const ampm       = hours24 < 12 ? 'a.m.' : 'p.m.';
  const minuteStr  = String(minutes).padStart(2, '0');
  const localTime  = `${hour12}:${minuteStr} ${ampm}`;

  const description = weather.weather[0].description;

  return (
    <Card className="my-4 p-3 text-center">
      <h6 className="text-muted">Local time: {localTime}</h6>
      <h2>
        {temp}°{units === 'metric' ? 'C' : 'F'}
      </h2>
      <p className="text-capitalize">{description}</p>

      <ButtonGroup className="mb-2">
        <Button
          variant={units === 'metric' ? 'primary' : 'outline-primary'}
          onClick={() => setUnits('metric')}
        >
          °C
        </Button>
        <Button
          variant={units === 'imperial' ? 'primary' : 'outline-primary'}
          onClick={() => setUnits('imperial')}
        >
          °F
        </Button>
      </ButtonGroup>
    </Card>
  );
}
