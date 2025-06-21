// src/components/ForecastCard.jsx

import React, { useState } from "react";

// Converts Celsius to Fahrenheit for display when needed
function cToF(celsius) {
  return Math.round(celsius * 9 / 5 + 32);
}

// Selects a random element from an array
function getRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Generates a context-aware, one-sentence style suggestion based on
 * temperature and description. Offers varied wording for rain, snow,
 * clouds, clear/sunny conditions, or a generic fallback.
 */
function generateSuggestion(temp, description, unit) {
  const tUnit = unit === "metric" ? "°C" : "°F";
  const lowerDesc = description.toLowerCase();

  if (lowerDesc.includes("rain")) {
    const options = [
      `Light rain expected with ${temp}${tUnit}. Bring an umbrella and a waterproof jacket.`,
      `Rainy conditions at ${temp}${tUnit}. Waterproof boots and a raincoat are your friends.`,
      `Expect showers and ${temp}${tUnit}. Layer up and grab a hooded jacket.`,
      `Drizzly weather, ${temp}${tUnit}. Consider a rain hat and water-resistant shoes.`,
      `Don't forget your raincoat—${temp}${tUnit} and rain are on the way.`
    ];
    return getRandom(options);
  }

  if (lowerDesc.includes("snow")) {
    const options = [
      `Snowy skies at ${temp}${tUnit}. Bundle up in a warm coat and boots.`,
      `It's snowing and ${temp}${tUnit}. Wear insulated gloves and a scarf.`,
      `Expect snow and temperatures around ${temp}${tUnit}. Thermal socks recommended!`,
      `Chilly and snowy—${temp}${tUnit}. Time for a puffer jacket and hat.`,
      `Snowfall with ${temp}${tUnit}. Waterproof footwear and thick layers will keep you cozy.`
    ];
    return getRandom(options);
  }

  if (lowerDesc.includes("cloud")) {
    const options = [
      `Overcast skies at ${temp}${tUnit}. Try a cozy hoodie and jeans.`,
      `Cloudy and ${temp}${tUnit}. A light jacket should do the trick.`,
      `It's cloudy with temps around ${temp}${tUnit}. Layer up and stay comfy.`,
      `A bit grey outside—${temp}${tUnit}. Go for a casual sweater and pants.`,
      `Clouds ahead with ${temp}${tUnit}. Keep a windbreaker handy just in case.`
    ];
    return getRandom(options);
  }

  if (lowerDesc.includes("clear") || lowerDesc.includes("sun")) {
    const options = [
      `Clear skies and ${temp}${tUnit}. Sunglasses and a tee are perfect.`,
      `Sunny with ${temp}${tUnit}. Dress light and bring a hat for sun protection.`,
      `It's bright and ${temp}${tUnit}. Shorts and a tank top will keep you cool.`,
      `Sunny day at ${temp}${tUnit}. Don’t forget sunscreen and comfy sneakers.`,
      `Clear and warm—${temp}${tUnit}. Go for breathable fabrics and light colors.`
    ];
    return getRandom(options);
  }

  // Generic fallback suggestion varying wording each time
  const fallbackOptions = [
    `Currently ${temp}${tUnit} with ${description}. Dress comfortably for the conditions.`,
    `Weather is ${description}, about ${temp}${tUnit}. Adjust your outfit as needed.`,
    `Expect ${description} and ${temp}${tUnit}. Comfort is key today.`,
    `Conditions: ${description}, ${temp}${tUnit}. Pick your favorite go-to pieces.`,
    `${description} at ${temp}${tUnit}. Choose layers for flexibility.`
  ];
  return getRandom(fallbackOptions);
}

/**
 * ForecastCard:
 * Renders date, time, temperature, and description for a single forecast slot.
 * Displays a button to toggle a context-aware style suggestion beneath the card.
 */
export default function ForecastCard({ item, unit }) {
  // Guard against missing data
  if (!item || !item.main || !item.weather) return null;

  // Format date (MM/DD) and 12-hour time
  const dateObj = new Date(item.dt_txt);
  const date = dateObj.toLocaleDateString(undefined, { month: "numeric", day: "numeric" });
  const time = dateObj.toLocaleTimeString(undefined, { hour: "numeric", hour12: true });

  // Always start from Celsius value; convert to Fahrenheit if needed
  const tempC = Math.round(item.main.temp);
  const temp = unit === "metric" ? tempC : cToF(tempC);

  // Description text for weather condition
  const description = item.weather[0].description;

  // Local state controls whether suggestion is shown
  const [shown, setShown] = useState(false);

  // Generate conversational suggestion once per render
  const suggestion = generateSuggestion(temp, description, unit);

  // Inline style for the suggestion text
  const suggestionStyle = {
    marginTop: 8,
    fontStyle: "italic",
    color: "#f8eebd",
    minHeight: 38,
    marginBottom: 2,
  };

  return (
    <div className="forecast-card">
      {/* Date and time */}
      <div className="date">{date}</div>
      <div className="hour">{time}</div>

      {/* Temperature display */}
      <div className="temp">
        {temp}°{unit === "metric" ? "C" : "F"}
      </div>

      {/* Weather description */}
      <div style={{ marginBottom: 8, textTransform: "capitalize" }}>
        <small>{description}</small>
      </div>

      {/* Suggestion toggle and content */}
      <div className="suggestion-area">
        {!shown ? (
          <button onClick={() => setShown(true)}>
            View suggestion
          </button>
        ) : (
          <>
            <div style={suggestionStyle}>{suggestion}</div>
            <button onClick={() => setShown(false)}>
              Hide suggestion
            </button>
          </>
        )}
      </div>
    </div>
  );
}
