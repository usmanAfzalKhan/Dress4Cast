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
  const [location, setLocation] = useState(null);
  const [unit, setUnit] = useState("metric"); // "metric" or "imperial" for display only!
  const [weather, setWeather] = useState(null); // always stores METRIC data
  const [forecastData, setForecastData] = useState(null);
  const [error, setError] = useState("");

  const toggleUnit = () =>
    setUnit((u) => (u === "metric" ? "imperial" : "metric"));

  function buildParam() {
    if (typeof location === "string")
      return `q=${encodeURIComponent(location)}`;
    if (location?.lat != null && location?.lon != null)
      return `lat=${location.lat}&lon=${location.lon}`;
    return "";
  }

  // Fetch weather ONLY in metric
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

  // Fetch forecast ONLY in metric
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

  // Simple hook to detect mobile width
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 800);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 800);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <>
      <Header onSelectLocation={setLocation} />

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
            {error && <div className="error">⚠️ {error}</div>}

            {/* Desktop: side-by-side, Mobile: stacked */}
            {!isMobile ? (
              <>
                <div className="top-row-desktop">
                  <div className="weather-side">
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
                  {weather && <OutfitSuggestion weather={weather} unit={unit} />}
                </div>
              </>
            ) : (
              <>
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

      <Footer />
    </>
  );
}
