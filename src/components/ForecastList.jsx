import React from "react";
import ForecastCard from "./ForecastCard.jsx";

export default function ForecastList({ forecastData, unit }) {
  return (
    <div style={{
      display: "flex",
      flexWrap: "wrap",
      justifyContent: "center",
      marginTop: 16
    }}>
      {forecastData.list.map((f) => (
        <ForecastCard key={f.dt} forecast={f} unit={unit} />
      ))}
    </div>
  );
}
