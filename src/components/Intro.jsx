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
        Pop in a city or drop a pin, hit Go, and we’ll serve up the live forecast—plus
        on-point outfit picks to match the skies. No more weather wardrobe drama—instant
        style intel awaits.
      </p>
    </motion.div>
  );
}
