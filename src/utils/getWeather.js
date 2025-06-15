// src/utils/getWeather.js

import axios from 'axios';

const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;

/**
 * Fetch current weather from the free OpenWeatherMap Current Weather API.
 *
 * @param {number} lat   Latitude
 * @param {number} lon   Longitude
 * @param {'metric'|'imperial'} unit  Units
 * @returns {Promise<{
 *   temp: number,
 *   feels_like: number,
 *   weather: Array,
 *   dt: number,
 *   timezone: number
 * }>}
 */
export default async function getWeather(lat, lon, unit = 'metric') {
  try {
    const res = await axios.get('https://api.openweathermap.org/data/2.5/weather', {
      params: {
        lat,
        lon,
        units: unit,
        appid: API_KEY
      }
    });

    const d = res.data;
    return {
      temp:            d.main.temp,
      feels_like:      d.main.feels_like,
      weather:         d.weather,          // [{ id, main, description, icon }, …]
      dt:               d.dt,               // UTC seconds since epoch
      timezone:         d.timezone         // shift in seconds from UTC
    };
  } catch (err) {
    console.error('Error fetching weather:', err.response?.status, err.response?.data || err.message);
    throw new Error(
      err.response?.data?.message 
        ? `Weather API: ${err.response.data.message}`
        : `Weather fetch failed: ${err.message}`
    );
  }
}
