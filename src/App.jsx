// src/App.jsx
import React, { useState } from 'react';
import SearchBar from './components/SearchBar.jsx';
import WeatherDisplay from './components/WeatherDisplay.jsx';
import ForecastDisplay from './components/ForecastDisplay.jsx';

export default function App() {
  const [location, setLocation] = useState(null);
  const [unit, setUnit]         = useState('metric');

  return (
    <div style={{ padding: 16 }}>
      <SearchBar onSelectLocation={setLocation} />
      <WeatherDisplay
        location={location}
        unit={unit}
        onToggleUnit={setUnit}
      />
      <ForecastDisplay
        location={location}
        unit={unit}
      />
    </div>
  );
}
