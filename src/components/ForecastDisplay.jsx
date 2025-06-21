// src/components/ForecastDisplay.jsx

import React, { useState, useEffect } from 'react';
import getForecast from '../utils/getForecast.js';

/**
 * ForecastDisplay:
 * Fetches and renders the next several forecast slots for the given location.
 * - location: { lat, lon } coordinates for weather lookup
 * - unit: temperature unit ("metric" or "imperial") for API request
 */
export default function ForecastDisplay({ location, unit }) {
  // State for the upcoming forecast slots
  const [slots, setSlots] = useState([]);
  // State for any errors during fetch
  const [error, setError] = useState('');

  // Effect to fetch forecast whenever location or unit changes
  useEffect(() => {
    // Clear slots when no location is selected
    if (!location) {
      setSlots([]);
      return;
    }
    // Reset error and previous slots before fetching
    setError('');
    setSlots([]);

    (async () => {
      try {
        // Retrieve raw forecast data (list of 3-hour slots)
        const data = await getForecast(location.lat, location.lon, unit);
        if (!Array.isArray(data.list)) {
          throw new Error('No forecast data');
        }
        // Filter out past slots and take up to six future slots
        const nowMs = Date.now();
        const futureSlots = data.list.filter(slot => slot.dt * 1000 > nowMs);
        setSlots(futureSlots.slice(0, 6));
      } catch (e) {
        // Save any fetch or parsing error
        setError(e.message);
      }
    })();
  }, [location, unit]);

  // Render nothing until a location is provided
  if (!location) return null;

  // Display error message if fetch failed
  if (error) {
    return (
      <div className="forecast-error">
        Error: {error}
      </div>
    );
  }

  // Show loading indicator while waiting for slots
  if (!slots.length) {
    return (
      <div className="forecast-loading">
        Loading forecast…
      </div>
    );
  }

  // Render the grid of forecast cards
  return (
    <div className="forecast-container">
      {slots.map((h, i) => {
        // Convert timestamp to Date object
        const dt = new Date(h.dt * 1000);
        // Format hour in 12-hour clock
        const hour12 = dt.getHours() % 12 || 12;
        const ampm = dt.getHours() >= 12 ? 'PM' : 'AM';
        // Format date as MM/DD
        const date = dt.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' });
        // Use OpenWeatherMap icon code
        const icon = h.weather?.[0]?.icon;

        return (
          <div
            key={i}
            className="forecast-card"
            style={{
              background: '#22375e',
              borderRadius: 18,
              boxShadow: '0 4px 18px #0002, 0 1.5px 6px 0 #0e172033',
              color: '#e8ecf8'
            }}
          >
            {/* Display date and time */}
            <p className="date">{date}</p>
            <p className="hour">{`${hour12}${ampm}`}</p>

            {/* Show weather icon if available */}
            {icon && (
              <img
                src={`https://openweathermap.org/img/wn/${icon}@2x.png`}
                alt={h.weather[0].description}
              />
            )}

            {/* Show rounded temperature */}
            <p className="temp">{Math.round(h.main.temp)}°</p>
          </div>
        );
      })}
    </div>
  );
}
