import React, { useState, useRef } from 'react'
import getGeo from '../utils/getGeo.js'

export default function Header({ onSelectLocation }) {
  const [q, setQ] = useState('')
  const [list, setList] = useState([])
  const [idx, setIdx] = useState(-1)
  const [open, setOpen] = useState(false)
  const ref = useRef()

  const fetchGeo = async txt => {
    if (!txt) return setList([])
    const results = await getGeo(txt)
    setList(results)
    setIdx(-1)
  }

  const openField = () => {
    setOpen(true)
    setTimeout(() => ref.current?.focus(), 0)
  }

  const onBlur = () => {
    if (!q) setOpen(false)
  }

  const onKey = e => {
    if (!list.length) return
    if (e.key === 'ArrowDown') setIdx(i => Math.min(i + 1, list.length - 1))
    if (e.key === 'ArrowUp')   setIdx(i => Math.max(i - 1, 0))
    if (e.key === 'Enter' && idx >= 0) {
      const r = list[idx]
      selectLocation(r)
    }
  }

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
      {/* logo */}
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

      {/* input + suggestions */}
      <div className="search-bar">
        <input
          ref={ref}
          className={open ? 'expanded' : ''}
          value={q}
          onClick={openField}
          onChange={e => { setQ(e.target.value); fetchGeo(e.target.value) }}
          onKeyDown={onKey}
          onBlur={onBlur}
          placeholder="Search for a city..."
        />

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
