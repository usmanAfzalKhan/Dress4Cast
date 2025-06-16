import React, { useState } from 'react';
import getGeo from '../utils/getGeo.js';

export default function SearchBar({ onSelectLocation }) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [idx, setIdx] = useState(-1);

  // fetch city suggestions
  const fetchGeo = async q => {
    if (!q) return setSuggestions([]);
    const list = await getGeo(q);
    setSuggestions(list);
    setIdx(-1);
  };

  const handleChange = e => {
    setQuery(e.target.value);
    fetchGeo(e.target.value);
  };

  const handleKey = e => {
    if (!suggestions.length) return;
    if (e.key === 'ArrowDown') {
      setIdx(i => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === 'ArrowUp') {
      setIdx(i => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && idx >= 0) {
      select(suggestions[idx]);
    }
  };

  const select = r => {
    setQuery(`${r.name}, ${r.country}`);
    setSuggestions([]);
    onSelectLocation({ lat: r.lat, lon: r.lon, timezoneOffset: r.timezone });
  };

  return (
    <div style={{ position: 'relative', marginBottom: 16 }}>
      <input
        style={{ width: '300px', padding: 8 }}
        value={query}
        onChange={handleChange}
        onKeyDown={handleKey}
        placeholder="Search for a city..."
      />
      <button onClick={() => fetchGeo(query)}>Go</button>
      {suggestions.length > 0 && (
        <ul style={{
          position: 'absolute', top: '100%', left: 0,
          width: '100%', background: 'white', listStyle: 'none', margin: 0, padding: 0, border: '1px solid #ccc'
        }}>
          {suggestions.map((r, i) => (
            <li
              key={i}
              style={{
                padding: 8,
                background: i === idx ? '#eee' : 'white',
                cursor: 'pointer'
              }}
              onMouseEnter={() => setIdx(i)}
              onClick={() => select(r)}
            >
              {r.name}, {r.country}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
