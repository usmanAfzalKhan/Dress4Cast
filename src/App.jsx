// src/App.jsx
import React, { useState } from 'react';
import SearchBar from './components/SearchBar';
import WeatherDisplay from './components/WeatherDisplay';

export default function App() {
  const [location, setLocation] = useState(null);

  return (
    <div className="container py-5">
      <SearchBar onSelect={setLocation} />

      {location && (
        <WeatherDisplay lat={location.lat} lon={location.lon} />
      )}
    </div>
  );
}
