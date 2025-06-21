// src/App.jsx
import React, { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Header from "./components/Header.jsx";
import Intro from "./components/Intro.jsx";
import WeatherDisplay from "./components/WeatherDisplay.jsx";
import OutfitSuggestion from "./components/OutfitSuggestion.jsx";
import ForecastList from "./components/ForecastList.jsx";
import Footer from "./components/Footer.jsx";
import "./App.css";

export default function App() {
  // Holds the user-selected location (string or { lat, lon })
  const [location, setLocation] = useState(null);

  // Tracks whether temperatures are shown in metric or imperial units
  const [unit, setUnit] = useState("metric");

  // Stores the current weather data (always fetched in metric)
  const [weather, setWeather] = useState(null);

  // Stores the 5-day/3-hour forecast data (always fetched in metric)
  const [forecastData, setForecastData] = useState(null);

  // Any error message from API requests
  const [error, setError] = useState("");

  // Toggles the displayed unit between metric and imperial
  const toggleUnit = () =>
    setUnit((u) => (u === "metric" ? "imperial" : "metric"));

  // Builds the appropriate query string based on whether location is a city name or coords
  function buildParam() {
    if (typeof location === "string") {
      return `q=${encodeURIComponent(location)}`;
    }
    if (location?.lat != null && location?.lon != null) {
      return `lat=${location.lat}&lon=${location.lon}`;
    }
    return "";
  }

  // Fetches the current weather when the location changes
  useEffect(() => {
    if (!location) return;

    setError("");
    setWeather(null);
    setForecastData(null);

    const key = import.meta.env.VITE_OPENWEATHER_API_KEY;
    const param = buildParam();

    fetch(
      `https://api.openweathermap.org/data/2.5/weather?${param}&units=metric&appid=${key}`
    )
      .then((r) => {
        if (!r.ok) throw new Error(`Weather API error ${r.status}`);
        return r.json();
      })
      .then(setWeather)
      .catch((e) => setError(e.message));
  }, [location]);

  // Fetches the forecast after the current weather has loaded
  useEffect(() => {
    if (!location || !weather) return;

    const key = import.meta.env.VITE_OPENWEATHER_API_KEY;
    const param = buildParam();

    fetch(
      `https://api.openweathermap.org/data/2.5/forecast?${param}&units=metric&appid=${key}`
    )
      .then((r) => {
        if (!r.ok) throw new Error(`Forecast API error ${r.status}`);
        return r.json();
      })
      .then(setForecastData)
      .catch((e) => setError(e.message));
  }, [location, weather]);

  // Custom hook: watches window width to set a mobile vs desktop layout flag
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 800);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 800);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <>
      {/* Fixed header with search input */}
      <Header onSelectLocation={setLocation} />

      {/* Animate between intro screen and main app content */}
      <AnimatePresence exitBeforeEnter>
        {!location ? (
          <motion.div
            className="intro-wrapper"
            key="intro"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Splash intro until a location is chosen */}
            <Intro />
          </motion.div>
        ) : (
          <motion.main
            key="app"
            className="app-content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            {/* Display any API errors */}
            {error && <div className="error">⚠️ {error}</div>}

            {/* Desktop splits weather + forecast side by side;
                mobile stacks them vertically */}
            {!isMobile ? (
              <>
                <div className="top-row-desktop">
                  <div className="weather-side">
                    {/* Current weather card */}
                    {weather && (
                      <WeatherDisplay
                        location={location}
                        unit={unit}
                        onToggleUnit={toggleUnit}
                        weather={weather}
                      />
                    )}
                  </div>
                  <div className="forecast-side">
                    {/* Forecast cards */}
                    {forecastData && (
                      <ForecastList
                        forecastData={forecastData}
                        unit={unit}
                        maxSlots={4}
                      />
                    )}
                  </div>
                </div>
                <div className="suggestion-bottom">
                  {/* Outfit suggestion powered by AI */}
                  {weather && <OutfitSuggestion weather={weather} unit={unit} />}
                </div>
              </>
            ) : (
              <>
                {/* Mobile layout */}
                {weather && (
                  <WeatherDisplay
                    location={location}
                    unit={unit}
                    onToggleUnit={toggleUnit}
                    weather={weather}
                  />
                )}
                <div className="suggestion-bottom">
                  {weather && <OutfitSuggestion weather={weather} unit={unit} />}
                </div>
                {forecastData && (
                  <ForecastList
                    forecastData={forecastData}
                    unit={unit}
                    maxSlots={4}
                  />
                )}
              </>
            )}
          </motion.main>
        )}
      </AnimatePresence>

      {/* Fixed footer with credits */}
      <Footer />
    </>
  );
}
