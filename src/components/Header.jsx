// src/components/Header.jsx

import React, { useState, useRef } from 'react'
import getGeo from '../utils/getGeo.js'

// Header component renders the fixed top bar with logo and location search input
export default function Header({ onSelectLocation }) {
  // State for the current query string in the search input
  const [q, setQ] = useState('')
  // State for the list of geocoding results
  const [list, setList] = useState([])
  // State for the index of the highlighted suggestion
  const [idx, setIdx] = useState(-1)
  // State for whether the suggestions dropdown is open
  const [open, setOpen] = useState(false)
  // Ref to the input element for programmatic focus
  const ref = useRef()

  /**
   * fetchGeo:
   * Retrieves geocoding results for the given text.
   * Clears the list when the input is empty.
   */
  const fetchGeo = async txt => {
    if (!txt) {
      setList([])
      return
    }
    const results = await getGeo(txt)
    setList(results)
    setIdx(-1) // reset highlighted index
  }

  /**
   * openField:
   * Opens the suggestions dropdown and focuses the input field.
   */
  const openField = () => {
    setOpen(true)
    setTimeout(() => ref.current?.focus(), 0)
  }

  /**
   * onBlur:
   * Closes the dropdown when focus is lost and input is empty.
   */
  const onBlur = () => {
    if (!q) setOpen(false)
  }

  /**
   * onKey:
   * Handles keyboard navigation within the suggestions list.
   * ArrowUp/ArrowDown adjust the highlighted index.
   * Enter selects the highlighted suggestion.
   */
  const onKey = e => {
    if (!list.length) return
    if (e.key === 'ArrowDown') {
      setIdx(i => Math.min(i + 1, list.length - 1))
    }
    if (e.key === 'ArrowUp') {
      setIdx(i => Math.max(i - 1, 0))
    }
    if (e.key === 'Enter' && idx >= 0) {
      selectLocation(list[idx])
    }
  }

  /**
   * selectLocation:
   * Formats the selected location label, clears suggestions,
   * and notifies the parent via onSelectLocation callback.
   */
  const selectLocation = r => {
    const region = r.region || r.state || ''
    const label = region
      ? `${r.name}, ${region}, ${r.country}`
      : `${r.name}, ${r.country}`

    setQ(label)
    setList([])
    onSelectLocation({
      lat: r.lat,
      lon: r.lon,
      timezoneOffset: r.timezone
    })
  }

  return (
    <header className="app-header">
      {/* Logo linking to GitHub repository */}
      <a
        className="logo-link"
        href="https://github.com/usmanAfzalKhan/Dress4Cast"
        target="_blank"
        rel="noopener"
      >
        <img
          className="header-logo"
          src="/logo/logo.png"
          alt="Dress4Cast logo"
        />
      </a>

      {/* Search bar with input and suggestions dropdown */}
      <div className="search-bar">
        <input
          ref={ref}
          className={open ? 'expanded' : ''}
          value={q}
          onClick={openField}
          onChange={e => {
            setQ(e.target.value)
            fetchGeo(e.target.value)
          }}
          onKeyDown={onKey}
          onBlur={onBlur}
          placeholder="Search for a city..."
        />

        {/* Suggestions list shown when open and results exist */}
        {open && list.length > 0 && (
          <ul className="suggestions">
            {list.map((r, i) => (
              <li
                key={i}
                className={i === idx ? 'highlighted' : ''}
                onMouseEnter={() => setIdx(i)}
                onClick={() => selectLocation(r)}
              >
                {r.name}
                {r.region || r.state ? `, ${r.region || r.state}` : ''}
                , {r.country}
              </li>
            ))}
          </ul>
        )}
      </div>
    </header>
  )
}
