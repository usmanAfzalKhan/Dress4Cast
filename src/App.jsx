// src/App.jsx
import React, { useState } from 'react';
import SearchBar from './components/SearchBar.jsx';
import WeatherDisplay from './components/WeatherDisplay.jsx';
import ForecastDisplay from './components/ForecastDisplay.jsx';
import OutfitSuggestion from './components/OutfitSuggestion.jsx';

export default function App() {
  const [location, setLocation] = useState(null);
  const [unit, setUnit]         = useState('metric');
  const [weather, setWeather]   = useState(null);

  const toggleUnit = () => {
    setUnit(u => u === 'metric' ? 'imperial' : 'metric');
  };

  return (
    <div style={{ padding: 16 }}>
      <SearchBar onSelectLocation={setLocation} />

      {/* current weather + live clock + update counter + unit toggle */}
      <WeatherDisplay
        location={location}
        unit={unit}
        onToggleUnit={toggleUnit}
        onWeather={setWeather}
      />

      {/* 6-slot 3-hour forecast for the rest of today */}
      <ForecastDisplay
        location={location}
        unit={unit}
      />

      {/* AI-powered outfit suggestion based on current conditions */}
      <OutfitSuggestion weather={weather} />
    </div>
  );
}
