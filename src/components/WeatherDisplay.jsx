// src/components/WeatherDisplay.jsx

import React from 'react';

// Maps weather conditions to corresponding icon file paths
const ICON_MAP = {
  clear:        '/assets/icons/sun.svg',
  clouds:       '/assets/icons/cloud.svg',
  rain:         '/assets/icons/rain.svg',
  drizzle:      '/assets/icons/rain.svg',
  snow:         '/assets/icons/snowflake.svg',
  thunderstorm: '/assets/icons/thunder.svg',
  mist:         '/assets/icons/mist.svg',
  fog:          '/assets/icons/fog.svg',
  haze:         '/assets/icons/haze.svg',
};

// Converts a temperature value from Celsius to Fahrenheit
function cToF(c) {
  return Math.round(c * 9 / 5 + 32);
}

/**
 * Renders the current weather card with date, time, temperature, and details.
 *
 * Props:
 * - location: Object or string identifying the selected location
 * - unit:      String, either 'metric' or 'imperial', for display units
 * - onToggleUnit: Function callback to switch between Celsius and Fahrenheit
 * - weather:   Weather data object (always in metric) fetched by the parent
 */
export default function WeatherDisplay({
  location,
  unit,
  onToggleUnit,
  weather,
}) {
  // No UI rendered if location has not been provided
  if (!location) return null;

  // Display loading message if weather data is not yet available
  if (!weather) return <div style={styles.message}>Loading weather…</div>;

  // Calculate local date and time based on timezone offset
  const now = Date.now();
  const remoteNowMs = now + weather.timezone * 1000;
  const dt = new Date(remoteNowMs);
  const days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const dateStr = `${days[dt.getUTCDay()]}, ${months[dt.getUTCMonth()]} ${dt.getUTCDate()}`;
  let hh = dt.getUTCHours();
  const mm = dt.getUTCMinutes().toString().padStart(2,'0');
  const ampm = hh >= 12 ? 'PM' : 'AM';
  hh = hh % 12 || 12;
  const timeStr = `${hh}:${mm} ${ampm}`;

  // Select the correct icon and color filter based on weather condition
  const key = weather.weather[0].main.toLowerCase();
  const iconSrc = ICON_MAP[key] || ICON_MAP.clouds;
  const filter =
    key === 'clear'
      ? 'invert(93%) sepia(7%) saturate(1200%) hue-rotate(190deg) brightness(1.15)'
      : 'invert(95%) sepia(7%) saturate(900%) hue-rotate(185deg) brightness(1.12)';

  // Determine displayed temperature based on selected unit
  const displayTemp = unit === "metric"
    ? Math.round(weather.main.temp)
    : cToF(weather.main.temp);

  // Determine displayed "feels like" value based on selected unit
  const displayFeelsLike = unit === "metric"
    ? Math.round(weather.main.feels_like)
    : cToF(weather.main.feels_like);

  return (
    <div className="weather-card" style={styles.card}>
      <header style={styles.header}>
        <div>
          <div style={styles.dateTime}>{dateStr}</div>
          <div style={styles.dateTime}>{timeStr}</div>
        </div>
        {/* Button toggles between Celsius and Fahrenheit */}
        <button onClick={onToggleUnit} style={styles.toggle}>
          °{unit === 'metric' ? 'F' : 'C'}
        </button>
      </header>

      {/* Weather icon display */}
      <div style={styles.iconWrap}>
        <img
          src={iconSrc}
          alt={weather.weather[0].description}
          style={{ ...styles.icon, filter }}
        />
      </div>

      {/* Main temperature and condition display */}
      <div style={styles.mainTemp}>
        {displayTemp}°{unit === 'metric' ? 'C' : 'F'}
      </div>
      <div style={styles.condition}>
        {weather.weather[0].description}
      </div>

      {/* Additional weather details: 'feels like', humidity, wind, precipitation */}
      <div style={styles.detailsRow}>
        <div style={styles.detail}>
          <strong>Feels like</strong>
          <div>{displayFeelsLike}°</div>
        </div>
        <div style={styles.detail}>
          <strong>Humidity</strong>
          <div>{weather.main.humidity}%</div>
        </div>
      </div>
      <div style={styles.detailsRow}>
        <div style={styles.detail}>
          <strong>Wind</strong>
          <div>{weather.wind.speed} m/s</div>
        </div>
        <div style={styles.detail}>
          <strong>Precip.</strong>
          <div>{weather.rain?.['1h'] ?? 0} mm</div>
        </div>
      </div>
    </div>
  );
}

// Inline styles object for consistent theming of the weather card
const styles = {
  card: {
    background: '#22375e',
    borderRadius: 18,
    padding: 20,
    maxWidth: 355,
    boxShadow: '0 4px 18px #0002, 0 1.5px 6px 0 #0e172033',
    margin: 'auto',
    color: '#fff',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12
  },
  dateTime: {
    fontSize: '0.98rem',
    color: '#cce4fa'
  },
  toggle: {
    background: '#406bda',
    color: '#fff',
    border: 'none',
    borderRadius: 7,
    padding: '5px 12px',
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: 600
  },
  iconWrap: {
    textAlign: 'center',
    marginBottom: 12
  },
  icon: {
    width: 60,
    height: 60
  },
  mainTemp: {
    fontSize: '2.5rem',
    fontWeight: 600,
    textAlign: 'center',
    marginBottom: 4,
    color: '#fff'
  },
  condition: {
    textTransform: 'capitalize',
    textAlign: 'center',
    color: '#ffea8a',
    marginBottom: 16,
    fontSize: '1.13rem',
    fontWeight: 500
  },
  detailsRow: {
    display: 'flex',
    gap: 12,
    marginBottom: 8
  },
  detail: {
    flex: '1 1 0',
    background: '#18315a',
    borderRadius: 10,
    padding: 8,
    textAlign: 'center',
    boxShadow: '0 1.5px 5px #0002',
    color: '#cde0f6'
  },
  message: {
    textAlign: 'center',
    margin: 16
  }
};
