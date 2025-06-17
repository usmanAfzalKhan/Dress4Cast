// src/App.jsx
import React, { useState, useEffect } from "react";
import SearchBar from "./components/SearchBar.jsx";
import WeatherDisplay from "./components/WeatherDisplay.jsx";
import OutfitSuggestion from "./components/OutfitSuggestion.jsx";
import ForecastList from "./components/ForecastList.jsx";

export default function App() {
  // location is now the full geocode object { lat, lon, timezoneOffset, … }
  const [location, setLocation] = useState(null);
  const [unit, setUnit]             = useState("metric");
  const [weather, setWeather]       = useState(null);
  const [forecastData, setForecast] = useState(null);
  const [error, setError]           = useState("");

  const toggleUnit = () =>
    setUnit((u) => (u === "metric" ? "imperial" : "metric"));

  // 1) Fetch current weather by lat/lon
  useEffect(() => {
    if (!location?.lat || !location?.lon) return;
    const apiKey = import.meta.env.VITE_OPENWEATHER_API_KEY;
    if (!apiKey) {
      setError("Missing OpenWeather API key");
      return;
    }

    console.log("▶️ Fetching current weather for coords:", location);
    fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${location.lat}&lon=${location.lon}` +
      `&units=${unit}&appid=${apiKey}`
    )
      .then((res) => {
        if (!res.ok) throw new Error(`Weather API error ${res.status}`);
        return res.json();
      })
      .then((data) => {
        setWeather(data);
        setError("");
      })
      .catch((err) => {
        setWeather(null);
        setError(err.message);
      });
  }, [location, unit]);

  // 2) Fetch 5-day/3-hr forecast by lat/lon
  useEffect(() => {
    if (!location?.lat || !location?.lon || !weather) return;
    const apiKey = import.meta.env.VITE_OPENWEATHER_API_KEY;

    console.log("▶️ Fetching forecast for coords:", location);
    fetch(
      `https://api.openweathermap.org/data/2.5/forecast?lat=${location.lat}&lon=${location.lon}` +
      `&units=${unit}&appid=${apiKey}`
    )
      .then((res) => {
        if (!res.ok) throw new Error(`Forecast API error ${res.status}`);
        return res.json();
      })
      .then((data) => {
        setForecast(data);
      })
      .catch((err) => {
        setForecast(null);
        setError(err.message);
      });
  }, [location, weather, unit]);

  return (
    <div style={{ padding: 16, maxWidth: 800, margin: "0 auto" }}>
      <h1>Dress4Cast</h1>

      {/* 1) City search */}
      <SearchBar
        onSelectLocation={(place) => {
          console.log("✅ onSelectLocation got:", place);
          setLocation(place);
        }}
        // if your SearchBar accepts a `value` prop, you can pass it the
        // display string: either place.name or "" when no place selected
        value={location ? `${location.lat.toFixed(2)},${location.lon.toFixed(2)}` : ""}
      />

      {/* 2) Current weather card */}
      <WeatherDisplay
        location={location}
        unit={unit}
        onToggleUnit={toggleUnit}
        onWeatherChange={setWeather}
      />

      {/* 3) Errors */}
      {error && (
        <div style={{ color: "red", marginTop: 12 }}>
          ⚠️ {error}
        </div>
      )}

      {/* 4) AI outfit suggestion under the current weather */}
      {weather && <OutfitSuggestion weather={weather} unit={unit} />}

      {/* 5) Forecast list (max 4 slots, 3-hr intervals) */}
           {forecastData && (
        <ForecastList
          forecastData={forecastData}
          unit={unit}
          maxSlots={4}   // ← show only 4 slots now
        />
     )}
    </div>
  );
}
