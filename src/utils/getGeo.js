// src/utils/getGeo.js

/**
 * Given a city name (e.g. "Brampton, CA"), returns an array of matches from
 * the OpenWeatherMap Geocoding API: [{ name, lat, lon, country, state? }, …]
 */
export default async function getGeo(query, limit = 5) {
  const key = import.meta.env.VITE_OPENWEATHER_API_KEY;
  console.log("🔑 OpenWeather key is:", key);
  const url = `https://api.openweathermap.org/geo/1.0/direct`
            + `?q=${encodeURIComponent(query)}`
            + `&limit=${limit}`
            + `&appid=${key}`;

  const res = await fetch(url);
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Geocode API error ${res.status}: ${txt}`);
  }
  return res.json();
}
