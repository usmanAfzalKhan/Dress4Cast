import React, { useState } from 'react';
import SearchBar from './components/SearchBar.jsx';
import WeatherDisplay from './components/WeatherDisplay.jsx';

export default function App() {
  const [location, setLocation] = useState(null);

  return (
    <div className="app-container" style={{ maxWidth: 400, margin: 'auto', padding: 20 }}>
      <SearchBar onSelectLocation={loc => setLocation(loc)} />
      <WeatherDisplay location={location} />
    </div>
  );
}
