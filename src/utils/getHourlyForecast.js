// Fetches hourly weather forecast data for specified coordinates and units
export default async function getHourlyForecast(lat, lon, units = 'metric') {
  // Retrieve API key from environment variables
  const key = import.meta.env.VITE_OPENWEATHER_API_KEY;

  // Build request URL for the One Call endpoint, excluding unneeded sections
  const url =
    `https://api.openweathermap.org/data/2.5/onecall` +
    `?lat=${lat}&lon=${lon}` +
    `&exclude=current,minutely,daily,alerts` +
    `&units=${units}&appid=${key}`;

  // Perform HTTP request to the OpenWeather One Call API
  const res = await fetch(url);

  // Throw an error if the response status indicates failure
  if (!res.ok) throw new Error(`Forecast API ${res.status}`);

  // Parse JSON response payload
  const data = await res.json();

  // Extract and return only the hourly entries and timezone offset
  return {
    hourly: data.hourly.map(h => ({
      dt:      h.dt,       // Unix timestamp for the forecast hour
      temp:    h.temp,     // Temperature at that hour
      weather: h.weather,  // Array of weather condition objects
      pop:     h.pop       // Probability of precipitation
    })),
    tz: data.timezone_offset  // Timezone offset in seconds
  };
}
