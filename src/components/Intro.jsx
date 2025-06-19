// src/components/Intro.jsx
import React from "react";
import { motion } from "framer-motion";

export default function Intro() {
  return (
    <motion.div
      className="intro"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
    >
      <h2>Dress Sharp, Rain or Shine</h2>
      <p>
        Pop in a city or drop a pin, hit Go, and our AI-powered engine instantly serves up the live forecast—plus on-point outfit picks tuned to the skies. No more weather wardrobe drama—just data-driven style intelligence guiding you from drizzle to sunshine. Behind the scenes, machine learning crunches temperature, wind, and precipitation to recommend the perfect look for whatever the day throws at you.
      </p>
    </motion.div>
  );
}
