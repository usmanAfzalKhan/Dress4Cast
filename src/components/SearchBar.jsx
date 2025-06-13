// src/components/SearchBar.jsx
import React, { useState } from 'react';
import { useCombobox } from 'downshift';
import { Form, ListGroup, Button, InputGroup } from 'react-bootstrap';

console.log('Env key:', import.meta.env.VITE_OPENWEATHER_API_KEY);


export default function SearchBar({ onSelect }) {
  const [items, setItems] = useState([]);

  const {
    isOpen,
    getMenuProps,
    getInputProps,
    getItemProps,
    highlightedIndex,
    openMenu,
  } = useCombobox({
    items,
    onInputValueChange: async ({ inputValue }) => {
      if (!inputValue || inputValue.length < 2) {
        setItems([]);
        return;
      }

      try {
        const res = await fetch(
          `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(
            inputValue
          )}&limit=5&appid=${import.meta.env.VITE_OPENWEATHER_API_KEY}`
        );
        const data = await res.json();

        if (Array.isArray(data)) {
          setItems(data);
        } else {
          setItems([]);
          console.warn('Geocode API returned error:', data);
        }
      } catch (err) {
        console.error('Network error fetching geocode:', err);
        setItems([]);
      }
      // —→ end replacement
    },
    onSelectedItemChange: ({ selectedItem }) => {
      if (selectedItem) onSelect(selectedItem);
    },
    itemToString: (item) => (item ? `${item.name}, ${item.country}` : ''),
  });

  return (
    <div className="position-relative mb-3">
      <InputGroup>
        <Form.Control
          {...getInputProps({ placeholder: 'Search city…', onFocus: openMenu })}
        />
        <Button variant="dark" onClick={() => items[0] && onSelect(items[0])}>
          Go
        </Button>
      </InputGroup>
      <ListGroup {...getMenuProps()} className="position-absolute w-100" style={{ zIndex: 1000 }}>
        {isOpen &&
          items.map((item, index) => (
            <ListGroup.Item
              key={`${item.name}-${index}`}
              {...getItemProps({ item, index })}
              active={highlightedIndex === index}
              action
            >
              {item.name}, {item.country}
            </ListGroup.Item>
          ))}
      </ListGroup>
    </div>
  );
}
