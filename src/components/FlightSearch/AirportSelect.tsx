import React, { useState } from 'react';
import { Airport } from '../../types';
import './AirportSelect.css';

interface AirportSelectProps {
  id?: string;
  airports: Airport[];
  value: Airport | null;
  onChange: (airport: Airport) => void;
  placeholder?: string;
  isLoading?: boolean;
}

const AirportSelect: React.FC<AirportSelectProps> = ({ 
  id,
  airports = [], 
  value, 
  onChange,
  placeholder = "Search for airport, city or country", 
  isLoading = false 
}) => {
  const [query, setQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  
  // Filter airports based on query
  const filteredAirports = airports.filter(airport => {
    const searchString = `${airport.code} ${airport.city} ${airport.name} ${airport.country}`.toLowerCase();
    return searchString.includes(query.toLowerCase());
  });
  
  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    setShowDropdown(true);
  };
  
  // Handle airport selection
  const handleAirportSelect = (airport: Airport) => {
    onChange(airport);
    setQuery('');
    setShowDropdown(false);
  };

  return (
    <div className="airport-select">
      <div className="input-container">
        <input
          id={id}
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={handleInputChange}
          onFocus={() => setShowDropdown(true)}
          autoComplete="off"
          disabled={isLoading}
        />
        
        {value && !query && (
          <div className="selected-airport">
            <div className="airport-code">{value.code}</div>
            <div className="airport-name">{value.city}, {value.country}</div>
          </div>
        )}
        
        {isLoading && (
          <div className="loading-indicator">Loading...</div>
        )}
      </div>
      
      {showDropdown && query && (
        <div className="dropdown">
          {filteredAirports.length === 0 ? (
            <div className="no-results">No airports found</div>
          ) : (
            filteredAirports.slice(0, 10).map(airport => (
              <div 
                key={airport.code} 
                className="airport-option"
                onClick={() => handleAirportSelect(airport)}
              >
                <div className="airport-code">{airport.code}</div>
                <div className="airport-name">{airport.city}, {airport.country}</div>
                <div className="airport-full-name">{airport.name}</div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default AirportSelect;
