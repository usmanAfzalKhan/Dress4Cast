import React, { useState, useEffect, useRef } from 'react';
import getGeo from '../utils/getGeo.js';

export default function SearchBar({ onSelectLocation }) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [highlight, setHighlight] = useState(-1);
  const [error, setError] = useState('');
  const listRef = useRef(null);

  // Fetch suggestions as user types
  useEffect(() => {
    if (!query) {
      setSuggestions([]);
      return;
    }
    let active = true;
    (async () => {
      try {
        const results = await getGeo(query, 5);
        if (active) {
          setSuggestions(results);
          setHighlight(-1);
        }
      } catch {
        // ignore
      }
    })();
    return () => { active = false; };
  }, [query]);

  // Handle key navigation
  const onKeyDown = e => {
    if (!suggestions.length) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlight(h => Math.min(h + 1, suggestions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlight(h => Math.max(h - 1, 0));
    } else if (e.key === 'Enter') {
      if (highlight >= 0) {
        e.preventDefault();
        choose(suggestions[highlight]);
      }
    }
  };

  const choose = loc => {
    const label = `${loc.name}${loc.state?`, ${loc.state}`:''}, ${loc.country}`;
    onSelectLocation({ lat: loc.lat, lon: loc.lon, label });
    setQuery(label);
    setSuggestions([]);
  };

  return (
    <div style={{ position: 'relative', marginBottom: 16 }}>
      <input
        type="text"
        value={query}
        onChange={e => { setQuery(e.target.value); setError(''); }}
        onKeyDown={onKeyDown}
        placeholder="Enter city"
        style={{ width: '100%', padding: '8px', borderRadius: 4, border: '1px solid #ccc' }}
      />
      <button
        onClick={() => suggestions[0] ? choose(suggestions[0]) : setError('No match')}
        style={{
          position: 'absolute', right: 0, top: 0, bottom: 0,
          padding: '0 12px', background: '#007bff', color: '#fff',
          border: 'none', borderRadius: '0 4px 4px 0', cursor: 'pointer'
        }}
      >
        Go
      </button>

      {suggestions.length > 0 && (
        <ul
          ref={listRef}
          style={{
            listStyle: 'none', margin: 0, padding: 0,
            position: 'absolute', top: '100%', left: 0, right: 0,
            background: '#fff', border: '1px solid #ccc', zIndex: 10,
            maxHeight: 200, overflowY: 'auto'
          }}
        >
          {suggestions.map((s, i) => (
            <li
              key={`${s.lat}-${s.lon}-${i}`}
              onClick={() => choose(s)}
              style={{
                padding: '8px',
                cursor: 'pointer',
                background: i === highlight ? '#eef' : 'transparent'
              }}
            >
              {s.name}{s.state ? `, ${s.state}` : ''}, {s.country}
            </li>
          ))}
        </ul>
      )}

      {error && (
        <div style={{ color: 'red', marginTop: 4 }}>
          {error}
        </div>
      )}
    </div>
  );
}
