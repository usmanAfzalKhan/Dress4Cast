import React, { useState, useRef } from 'react'
import getGeo from '../utils/getGeo.js'
import './SearchBar.css'

export default function SearchBar({ onSelectLocation }) {
  const [q, setQ] = useState('')
  const [list, setList] = useState([])
  const [idx, setIdx] = useState(-1)
  const [open, setOpen] = useState(false)
  const ref = useRef()

  // fetch suggestions
  const fetchGeo = async txt => {
    if (!txt) return setList([])
    setList(await getGeo(txt))
    setIdx(-1)
  }

  // open + focus
  const openField = () => {
    setOpen(true)
    setTimeout(() => ref.current?.focus(), 0)
  }

  // close if empty
  const onBlur = () => {
    if (!q) setOpen(false)
  }

  // navigate list
  const onKey = e => {
    if (!list.length) return
    if (e.key === 'ArrowDown') setIdx(i => Math.min(i + 1, list.length - 1))
    if (e.key === 'ArrowUp')   setIdx(i => Math.max(i - 1, 0))
    if (e.key === 'Enter' && idx >= 0) {
      const r = list[idx]
      setQ(`${r.name}, ${r.country}`)
      setList([])
      onSelectLocation({ lat: r.lat, lon: r.lon, timezoneOffset: r.timezone })
    }
  }

  return (
    <div className="search-container">
      <input
        ref={ref}
        className={open ? 'expanded' : ''}
        value={q}
        onChange={e => { setQ(e.target.value); fetchGeo(e.target.value) }}
        onKeyDown={onKey}
        onBlur={onBlur}
        placeholder="Search for a city..."
      />

      <button
        type="button"
        onClick={openField}
        className="search-button"
        aria-label="Search"
      >
        {/* inline magnifier SVG */}
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle
            cx="11"
            cy="11"
            r="8"
            stroke="#2d5d75"
            strokeWidth="2"
          />
          <line
            x1="17"
            y1="17"
            x2="21"
            y2="21"
            stroke="#2d5d75"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </button>

      {open && list.length > 0 && (
        <ul>
          {list.map((r, i) => (
            <li
              key={i}
              className={i === idx ? 'highlighted' : ''}
              onMouseEnter={() => setIdx(i)}
              onClick={() => {
                setQ(`${r.name}, ${r.country}`)
                setList([])
                onSelectLocation({ lat: r.lat, lon: r.lon, timezoneOffset: r.timezone })
              }}
            >
              {r.name}, {r.country}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
