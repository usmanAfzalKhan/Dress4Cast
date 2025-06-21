// src/components/Intro.jsx

import React from "react";
import { motion } from "framer-motion";

/**
 * Intro component that renders a centered hero section with
 * animated entrance, explanatory text, and a clickable logo.
 */
export default function Intro() {
  return (
    <>
      {/* Inline styles scoped to this component */}
      <style>
        {`
          /* Container ensures correct width and spacing below fixed header */
          .intro-hero {
            width: 100vw;
            max-width: 100vw;
            margin: 0;
            margin-top: 128px; /* More space from header */
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: flex-start;
            padding: 0;
          }
          /* Inner card styling: background, shadow, padding, rounded corners */
          .intro-hero-content {
            width: 100%;
            max-width: 530px;
            background: rgba(34, 55, 94, 0.96);
            border-radius: 22px;
            box-shadow: 0 4px 24px 0 #0003, 0 2px 10px 0 #406bda2a;
            padding: 2.3rem 2rem 2.1rem 2rem;
            text-align: center;
            margin: 0 auto;
            color: #fff;
            margin-bottom: 30px;
            opacity: 0.97;
            transition: box-shadow 0.18s cubic-bezier(.4,0,.2,1);
          }
          /* Heading typography: size, weight, color, subtle text-shadow */
          .intro-hero-content h2 {
            font-size: 2.1rem;
            font-weight: 800;
            margin-bottom: 1.1rem;
            letter-spacing: 0.03em;
            color: #fafbff;
            text-shadow: 0 2px 14px #406bda22;
          }
          /* Paragraph styling: line height, font weight, color */
          .intro-hero-content p {
            font-size: 1.12rem;
            line-height: 1.54;
            color: #e3edfd;
            margin: 0;
            font-weight: 500;
            letter-spacing: 0.01em;
          }
          /* Logo link container: centers the logo */
          .intro-logo-link {
            display: flex;
            justify-content: center;
            margin-top: 36px;
            margin-bottom: 0;
            text-decoration: none;
          }
          /* Logo image styling: circular, shadow, border, hover transform */
          .intro-logo-img {
            height: 168px;
            width: 168px;
            border-radius: 50%;
            object-fit: cover;
            box-shadow: 0 2px 36px #406bda2a;
            background: #fff;
            border: 4.5px solid #406bda;
            transition:
              transform 0.22s cubic-bezier(.4,0,.2,1),
              box-shadow 0.2s cubic-bezier(.4,0,.2,1);
          }
          .intro-logo-img:hover {
            transform: scale(1.18) rotate(-8deg);
            box-shadow: 0 0 52px 0 #406bda99, 0 2px 24px #406bda33;
            border-color: #284577;
          }
          /* Adjustments for smaller viewports: spacing and sizes */
          @media (max-width: 700px) {
            .intro-hero {
              margin-top: 82px; /* less space on mobile */
            }
            .intro-hero-content {
              max-width: 96vw;
              padding: 1.4rem 0.6rem 1.2rem 0.6rem;
            }
            .intro-hero-content h2 {
              font-size: 1.32rem;
            }
            .intro-hero-content p {
              font-size: 0.98rem;
            }
            .intro-logo-img {
              height: 94px;
              width: 94px;
              border-width: 3.2px;
            }
          }
        `}
      </style>

      {/* Wrapper div provides horizontal centering and vertical offset */}
      <div className="intro-hero">
        {/* Motion div animates entrance with fade + vertical movement */}
        <motion.div
          className="intro-hero-content"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -24 }}
          transition={{ duration: 0.5 }}
        >
          {/* Main heading */}
          <h2>Welcome to Dress4Cast!</h2>
          {/* Explanatory paragraph */}
          <p>
            Discover your perfect look—whatever the weather.<br /><br />
            Just enter a city or drop a pin, hit Go, and let our AI-powered engine instantly serve up the live forecast along with on-point outfit ideas tailored to the skies.<br /><br />
            No more guessing games or last-minute wardrobe changes. Dress4Cast combines real-time weather data with smart style suggestions, guiding you from drizzle to sunshine.<br /><br />
            Our machine learning models analyze temperature, wind, and precipitation to recommend the best outfits for any forecast—so you’re always ready, rain or shine.
          </p>
          {/* Clickable logo linking to GitHub repository */}
          <a
            className="intro-logo-link"
            href="https://github.com/usmanAfzalKhan/Dress4Cast"
            target="_blank"
            rel="noopener noreferrer"
            title="Visit GitHub repository"
          >
            <img
              className="intro-logo-img"
              src="/logo/logo.png"
              alt="Dress4Cast Logo"
            />
          </a>
        </motion.div>
      </div>
    </>
  );
}
