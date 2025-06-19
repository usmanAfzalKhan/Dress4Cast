import React, { useState } from "react";
import SearchBar from "./SearchBar.jsx";
import "./Header.css";

export default function Header({ onSelectLocation }) {
  // tracks whether the search input is visible
  const [showSearch, setShowSearch] = useState(false);

  return (
    <header className="app-header">
      {/* brand/logo */}
      <div className="header-brand">
        <a
          href="https://github.com/usmanAfzalKhan/Dress4Cast"
          target="_blank"
          rel="noopener noreferrer"
          className="logo-link"
          onClick={() => setShowSearch(false)} // hide search if open
        >
          <img
            src="/logo/logo.png"
            alt="Dress4Cast"
            className="header-logo"
          />
        </a>
      </div>

      {/* search toggler or full bar */}
      <div className="header-search">
        {showSearch ? (
          <SearchBar
            onSelectLocation={(loc) => {
              onSelectLocation(loc);
              setShowSearch(false); // auto-close after picking
            }}
          />
        ) : (
          <button
            className="search-toggle"
            onClick={() => setShowSearch(true)}
            aria-label="Open search"
          >
            {/* inline SVG magnifier */}
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#2d5d75"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </button>
        )}
      </div>
    </header>
  );
}
