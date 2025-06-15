import React, { useState, useEffect } from 'react';
import getGeo from '../utils/getGeo.js';

export default function SearchBar({ onSelectLocation }) {
  const [query, setQuery]           = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [error, setError]           = useState('');

  // Fetch suggestions as user types
  useEffect(() => {
    if (!query) return setSuggestions([]);
    let alive = true;
    getGeo(query, 5)
      .then(results => { if (alive) setSuggestions(results); })
      .catch(() => {/* ignore */});
    return () => { alive = false; };
  }, [query]);

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
        placeholder="Enter city"
        style={{ width:'100%', padding:'8px', borderRadius:4, border:'1px solid #ccc' }}
      />
      <button
        onClick={() => suggestions[0]? choose(suggestions[0]) : setError('No match')}
        style={{
          position:'absolute', right:0, top:0, bottom:0,
          padding:'0 12px', background:'#007bff', color:'#fff', border:'none', borderRadius:'0 4px 4px 0'
        }}
      >
        Go
      </button>

      {suggestions.length > 0 && (
        <ul style={{
          listStyle:'none', margin:0, padding:0,
          position:'absolute', top:'100%', left:0, right:0,
          background:'#fff', border:'1px solid #ccc', zIndex:10
        }}>
          {suggestions.map((s,i) => (
            <li
              key={`${s.lat}-${s.lon}-${i}`}
              onClick={() => choose(s)}
              style={{
                padding:'8px', cursor:'pointer',
                borderBottom: i<suggestions.length-1 ? '1px solid #eee' : 'none'
              }}
            >
              {s.name}{s.state?`, ${s.state}`:''}, {s.country}
            </li>
          ))}
        </ul>
      )}

      {error && <div style={{ color:'red', marginTop:4 }}>{error}</div>}
    </div>
  );
}
