export default async function getHourlyForecast(lat, lon, units = 'metric') {
  const key = import.meta.env.VITE_OPENWEATHER_API_KEY;
  const url = `https://api.openweathermap.org/data/2.5/onecall`
    + `?lat=${lat}&lon=${lon}`
    + `&exclude=current,minutely,daily,alerts`
    + `&units=${units}&appid=${key}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Forecast API ${res.status}`);
  const data = await res.json();
  return {
    hourly: data.hourly.map(h => ({
      dt:        h.dt,
      temp:      h.temp,
      weather:   h.weather,
      pop:       h.pop
    })),
    tz: data.timezone_offset
  };
}
