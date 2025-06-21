// Retrieves current weather data for a given latitude/longitude in specified units
export default async function getWeather(lat, lon, units = 'metric') {
  // Load the OpenWeather API key from environment variables
  const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;

  // Construct the request URL with query parameters for coordinates, units, and API key
  const url =
    `https://api.openweathermap.org/data/2.5/weather` +
    `?lat=${lat}&lon=${lon}` +
    `&units=${units}&appid=${API_KEY}`;

  // Send the HTTP request to the OpenWeather endpoint
  const res = await fetch(url);

  // Throw an error if the response status indicates a failure
  if (!res.ok) throw new Error(`Weather API error ${res.status}`);

  // Parse and return the JSON payload containing the weather data
  return res.json();
}
