// src/components/Footer.jsx

import React from "react";

/**
 * Footer:
 * Renders a fixed footer bar with a personalized credit link.
 * Includes an accessible link to the GitHub repository.
 */
export default function Footer() {
  return (
    <footer className="app-footer">
      {/* Static text with emoji for a friendly sign-off */}
      Made with ❤️ by{" "}
      {/* Clickable link opening in a new tab to the GitHub profile */}
      <a
        href="https://github.com/usmanAfzalKhan/Dress4Cast"
        target="_blank"
        rel="noopener noreferrer"
      >
        Usman Afzal Khan
      </a>
    </footer>
  );
}
