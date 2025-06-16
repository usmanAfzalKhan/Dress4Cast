// src/utils/getForecast.js

/**
 * Fetches the 5-day / 3-hour forecast from OpenWeatherMap
 * and returns the raw JSON or throws with the API’s error message.
 */
export default async function getForecast(lat, lon, units = 'metric') {
  const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;
  const url =
    `https://api.openweathermap.org/data/2.5/forecast` +
    `?lat=${lat}&lon=${lon}&units=${units}&appid=${API_KEY}`;

  console.log('[getForecast] URL →', url);
  const res = await fetch(url);
  const data = await res.json();

  if (!res.ok) {
    // OpenWeather returns e.g. { cod:"401", message:"Invalid API key" }
    throw new Error(data.message || `Forecast API error ${res.status}`);
  }

  console.log('[getForecast] payload →', data);
  return data;
}
