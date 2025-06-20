// src/components/ForecastCard.jsx
import React, { useState } from "react";

// Local C to F converter
function cToF(c) {
  return Math.round(c * 9 / 5 + 32);
}

// generate a short, dynamic suggestion
function getRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateSuggestion(temp, desc, unit) {
  const tUnit = unit === "metric" ? "°C" : "°F";
  const lower = desc.toLowerCase();

  if (lower.includes("rain")) {
    const suggestions = [
      `Light rain expected with ${temp}${tUnit}. Bring an umbrella and a waterproof jacket.`,
      `Rainy conditions at ${temp}${tUnit}. Waterproof boots and a raincoat are your friends.`,
      `Expect showers and ${temp}${tUnit}. Layer up and grab a hooded jacket.`,
      `Drizzly weather, ${temp}${tUnit}. Consider a rain hat and water-resistant shoes.`,
      `Don't forget your raincoat—${temp}${tUnit} and rain are on the way.`
    ];
    return getRandom(suggestions);
  }
  if (lower.includes("snow")) {
    const suggestions = [
      `Snowy skies at ${temp}${tUnit}. Bundle up in a warm coat and boots.`,
      `It's snowing and ${temp}${tUnit}. Wear insulated gloves and a scarf.`,
      `Expect snow and temperatures around ${temp}${tUnit}. Thermal socks recommended!`,
      `Chilly and snowy—${temp}${tUnit}. Time for a puffer jacket and hat.`,
      `Snowfall with ${temp}${tUnit}. Waterproof footwear and thick layers will keep you cozy.`
    ];
    return getRandom(suggestions);
  }
  if (lower.includes("cloud")) {
    const suggestions = [
      `Overcast skies at ${temp}${tUnit}. Try a cozy hoodie and jeans.`,
      `Cloudy and ${temp}${tUnit}. A light jacket should do the trick.`,
      `It's cloudy with temps around ${temp}${tUnit}. Layer up and stay comfy.`,
      `A bit grey outside—${temp}${tUnit}. Go for a casual sweater and pants.`,
      `Clouds ahead with ${temp}${tUnit}. Keep a windbreaker handy just in case.`
    ];
    return getRandom(suggestions);
  }
  if (lower.includes("clear") || lower.includes("sun")) {
    const suggestions = [
      `Clear skies and ${temp}${tUnit}. Sunglasses and a tee are perfect.`,
      `Sunny with ${temp}${tUnit}. Dress light and bring a hat for sun protection.`,
      `It's bright and ${temp}${tUnit}. Shorts and a tank top will keep you cool.`,
      `Sunny day at ${temp}${tUnit}. Don’t forget sunscreen and comfy sneakers.`,
      `Clear and warm—${temp}${tUnit}. Go for breathable fabrics and light colors.`
    ];
    return getRandom(suggestions);
  }
  // fallback - always vary wording
  const fallback = [
    `Currently ${temp}${tUnit} with ${desc}. Dress comfortably for the conditions.`,
    `Weather is ${desc}, about ${temp}${tUnit}. Adjust your outfit as needed.`,
    `Expect ${desc} and ${temp}${tUnit}. Comfort is key today.`,
    `Conditions: ${desc}, ${temp}${tUnit}. Pick your favorite go-to pieces.`,
    `${desc} at ${temp}${tUnit}. Choose layers for flexibility.`
  ];
  return getRandom(fallback);
}

export default function ForecastCard({ item, unit }) {
  if (!item || !item.main || !item.weather) return null;

  const dateObj = new Date(item.dt_txt);
  const date = dateObj.toLocaleDateString(undefined, {
    month: "numeric",
    day: "numeric",
  });
  const time = dateObj.toLocaleTimeString(undefined, {
    hour: "numeric",
    hour12: true,
  });

  // Always start from metric (°C)
  const tempC = Math.round(item.main.temp);
  const temp = unit === "metric" ? tempC : cToF(tempC);

  const desc = item.weather[0].description;
  const [shown, setShown] = useState(false);

  const suggestion = generateSuggestion(temp, desc, unit);

  // ...styles unchanged

  const cardStyle = {
    background: "#22375e",
    color: "#e8ecf8",
    borderRadius: "18px",
    boxShadow: "0 4px 28px 0 rgba(0,0,0,0.16), 0 2px 10px 0 rgba(20,40,80,0.13)",
    textAlign: "center",
    padding: "1.0rem 0.7rem",
    minWidth: 0,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "0.4rem",
    border: "1.5px solid #406bda28",
  };

  const buttonStyle = {
    marginTop: "7px",
    padding: "5.5px 14px",
    borderRadius: "7px",
    background: shown ? "#406bda" : "#27496d",
    color: "#fff",
    border: "none",
    fontSize: "1em",
    cursor: "pointer",
    transition: "background 0.13s",
    fontWeight: 600,
  };

  const dateStyle = {
    fontSize: "0.92em",
    color: "#e7ecf9b3",
  };

  const hourStyle = {
    fontSize: "1.06em",
    fontWeight: 500,
    color: "#ffea8a",
  };

  const tempStyle = {
    fontSize: "1.38em",
    fontWeight: 600,
    marginBottom: "0.16em",
  };

  const suggestionStyle = {
    marginTop: 8,
    fontStyle: "italic",
    color: "#f8eebd",
    minHeight: 38,
    marginBottom: 2,
  };

  return (
    <div style={cardStyle}>
      <div style={dateStyle}>{date}</div>
      <div style={hourStyle}>{time}</div>
      <div style={tempStyle}>
        {temp}°{unit === "metric" ? "C" : "F"}
      </div>
      <div style={{ marginBottom: 8, textTransform: "capitalize" }}>
        <small>{desc}</small>
      </div>
      {!shown ? (
        <button onClick={() => setShown(true)} style={buttonStyle}>
          View suggestion
        </button>
      ) : (
        <>
          <div style={suggestionStyle}>{suggestion}</div>
          <button onClick={() => setShown(false)} style={buttonStyle}>
            Hide suggestion
          </button>
        </>
      )}
    </div>
  );
}
