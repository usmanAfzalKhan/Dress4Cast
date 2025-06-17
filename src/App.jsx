// src/App.jsx
import React, { useState, useEffect } from "react";
import SearchBar       from "./components/SearchBar.jsx";
import WeatherDisplay  from "./components/WeatherDisplay.jsx";
import ForecastList    from "./components/ForecastList.jsx";
import OutfitSuggestion from "./components/OutfitSuggestion.jsx";

export default function App() {
  const [location, setLocation]     = useState(null);
  const [unit, setUnit]             = useState("metric");
  const [weather, setWeather]       = useState(null);
  const [forecastData, setForecast] = useState(null);
  const [error, setError]           = useState("");
  const [selectedSlot, setSelectedSlot] = useState(null);

  const toggleUnit = () =>
    setUnit((u) => (u === "metric" ? "imperial" : "metric"));

  // fetch current weather (unchanged)
  // … your existing getWeather useEffect …

  // fetch forecast by coords
  useEffect(() => {
    if (!weather) return;
    const apiKey = import.meta.env.VITE_OPENWEATHER_API_KEY;
    const { lat, lon } = weather.coord;
    fetch(
      `https://api.openweathermap.org/data/2.5/forecast` +
      `?lat=${lat}&lon=${lon}&units=${unit}&appid=${apiKey}`
    )
      .then((r) => {
        if (!r.ok) throw new Error("Forecast fetch failed");
        return r.json();
      })
      .then((data) => {
        setForecast(data);
        setError("");
      })
      .catch((e) => setError(e.message));
  }, [weather, unit]);

  // when you click “View outfit” on a forecast tile
  const handleViewOutfit = (slot) => setSelectedSlot(slot);

  return (
    <div style={{ padding: 16, maxWidth: 800, margin: "0 auto" }}>
      <h1>Dress4Cast</h1>

      {/* 1) City search */}
      <SearchBar onSelectLocation={setLocation} />

      {/* 2) Current weather */}
      <WeatherDisplay
        location={location}
        unit={unit}
        onToggleUnit={toggleUnit}
        onWeatherChange={setWeather}
      />

      {/* 3) AI suggestion for current weather */}
      {weather && !selectedSlot && (
        <OutfitSuggestion weather={weather} unit={unit} />
      )}

      {/* 4) If they clicked a 3-hr slot, show that instead */}
      {selectedSlot && (
        <OutfitSuggestion weather={selectedSlot} unit={unit} />
      )}

      {/* 5) Errors */}
      {error && (
        <div style={{ color: "red", marginTop: 12 }}>⚠️ {error}</div>
      )}

      {/* 6) Forecast list (3-hr) */}
      {forecastData && (
        <ForecastList
          forecastData={forecastData}
          unit={unit}
          onViewOutfit={handleViewOutfit}
        />
      )}
    </div>
  );
}
