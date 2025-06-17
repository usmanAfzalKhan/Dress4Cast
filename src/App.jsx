import React, { useState } from "react";
import SearchBar from "./components/SearchBar.jsx";
import WeatherDisplay from "./components/WeatherDisplay.jsx";
import ForecastDisplay from "./components/ForecastDisplay.jsx";
import OutfitSuggestion from "./components/OutfitSuggestion.jsx";

export default function App() {
  const [location, setLocation] = useState(null);
  const [unit, setUnit] = useState("metric");
  const [weather, setWeather] = useState(null);

  const toggleUnit = () =>
    setUnit((u) => (u === "metric" ? "imperial" : "metric"));

  return (
    <div style={{ padding: 16 }}>
      <SearchBar onSelectLocation={setLocation} />

      {/* fetches + displays current weather, and lifts it via onWeatherChange */}
      <WeatherDisplay
        location={location}
        unit={unit}
        onToggleUnit={toggleUnit}
        onWeatherChange={setWeather}
      />

      <ForecastDisplay location={location} unit={unit} />
      <OutfitSuggestion weather={weather} unit={unit} />
    </div>
  );
}
