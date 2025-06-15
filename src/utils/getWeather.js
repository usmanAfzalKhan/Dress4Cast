export default async function getWeather(lat, lon, units = 'metric') {
  const key = import.meta.env.VITE_OPENWEATHER_API_KEY;
  const url = `https://api.openweathermap.org/data/2.5/weather`
    + `?lat=${lat}&lon=${lon}&units=${units}&appid=${key}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Weather API ${res.status}`);
  const d = await res.json();
  return {
    temp:          d.main.temp,
    feels_like:    d.main.feels_like,
    humidity:      d.main.humidity,
    wind_speed:    d.wind.speed,
    precipitation: d.rain?.['1h'] ?? d.snow?.['1h'] ?? 0,
    condition:     d.weather[0].description,
    tz:            d.timezone
  };
}
