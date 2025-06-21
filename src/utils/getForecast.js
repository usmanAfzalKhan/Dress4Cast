// Retrieves 5-day weather forecast data for specified coordinates and units
export default async function getForecast(lat, lon, units = 'metric') {
  // Load API key from environment configuration
  const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;

  // Construct the OpenWeatherMap forecast endpoint URL
  const url =
    `https://api.openweathermap.org/data/2.5/forecast` +
    `?lat=${lat}&lon=${lon}` +
    `&units=${units}&appid=${API_KEY}`;

  // Execute HTTP GET request to fetch forecast data
  const res = await fetch(url);

  // Throw descriptive error if response status is not OK
  if (!res.ok) throw new Error(`Forecast API error ${res.status}`);

  // Parse and return the JSON payload containing forecast list
  return res.json();
}
