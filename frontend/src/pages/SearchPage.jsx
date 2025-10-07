import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FiSearch, FiCalendar, FiUsers, FiMapPin, FiPlus, FiMinus } from 'react-icons/fi';
import SimpleRideCard from "../components/SimpleRideCard";
import './SearchPage.css';

function Input({ type, placeholder, value, onChange, min, ...props }) {
  return (
    <input
      className="custom-input search-input"
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      min={min}
      {...props}
    />
  );
}

function Button({ children, onClick, disabled, type = 'button', className }) {
  const buttonClassName = `custom-button ${className || ''}`;
  return (
    <button
      className={buttonClassName}
      onClick={onClick}
      disabled={disabled}
      type={type}
    >
      {children}
    </button>
  );
}

const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => { setDebouncedValue(value); }, delay);
    return () => { clearTimeout(handler); };
  }, [value, delay]);
  return debouncedValue;
};

function AutocompleteInput({ value, onChange, placeholder, ...props }) {
  const [suggestions, setSuggestions] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const wrapperRef = useRef(null);
  const debouncedValue = useDebounce(value, 300);

  const fetchSuggestions = async (query) => {
    if (query.trim().length < 3) {
      setSuggestions([]);
      return;
    }
    setIsSearching(true);
    try {
      const response = await axios.get(`http://localhost:8080/api/places/autocomplete?query=${query}`);
      setSuggestions(response.data || []);
    } catch (error) {
      console.error('Error fetching autocomplete suggestions:', error);
      setSuggestions([]);
    } finally {
      setIsSearching(false);
    }
  };

  useEffect(() => {
    if (debouncedValue && isFocused) {
      fetchSuggestions(debouncedValue);
    } else {
      setSuggestions([]);
    }
  }, [debouncedValue, isFocused]);

  const handleSelect = (suggestion) => {
    onChange(suggestion);
    setSuggestions([]);
    setIsFocused(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => { document.removeEventListener('mousedown', handleClickOutside); };
  }, []);

  return (
    <div className="autocomplete-wrapper" ref={wrapperRef}>
      <Input
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setIsFocused(true)}
        autoComplete="off"
        {...props}
      />
      {isFocused && value.length > 2 && (
        <ul className="suggestions-list">
          {isSearching ? (
            <li className="loading-item">Searching...</li>
          ) : suggestions.length > 0 ? (
            suggestions.map((suggestion, index) => (
              <li key={index} onMouseDown={() => handleSelect(suggestion)}>
                <FiMapPin size={16} className="suggestion-icon" />
                {suggestion}
              </li>
            ))
          ) : null}
        </ul>
      )}
    </div>
  );
}


function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [origin, setOrigin] = useState(searchParams.get('origin') || '');
  const [destination, setDestination] = useState(searchParams.get('destination') || '');
  const [travelDateTime, setTravelDateTime] = useState(searchParams.get('travelDateTime') || '');
  const [passengerCount, setPassengerCount] = useState(parseInt(searchParams.get('passengerCount')) || 1);
  
  const [rides, setRides] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchPerformed, setSearchPerformed] = useState(false);

  const fetchData = useCallback(async (params) => {
    setIsLoading(true);
    setSearchPerformed(true);
    const token = localStorage.getItem('token');

    if (!token) {
      navigate('/login');
      return;
    }

    try {
      const response = await axios.get('http://localhost:8080/api/rides', {
        params: params,
        headers: { Authorization: `Bearer ${token}` },
      });
      setRides(response.data);
    } catch (error) {
      console.error('Failed to fetch search results:', error);
      setRides([]);
    } finally {
      setIsLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    const hasSearchParams = searchParams.get('origin') || searchParams.get('destination');
    if (hasSearchParams) {
      const paramsToFetch = {
        origin: searchParams.get('origin'),
        destination: searchParams.get('destination'),
        travelDateTime: searchParams.get('travelDateTime'),
        passengerCount: searchParams.get('passengerCount')
      };
      fetchData(paramsToFetch);
    }
  }, [searchParams, fetchData]);

  const handleSearch = (event) => {
    event.preventDefault();
    const newParams = { origin, destination, travelDateTime, passengerCount };
    setSearchParams(newParams);
  };

  const handleReset = () => {
    setOrigin('');
    setDestination('');
    setTravelDateTime('');
    setPassengerCount(1);
    setSearchParams({});
    setRides([]);
    setSearchPerformed(false);
  };

  const handlePassengerCountChange = (value) => {
    if (value >= 1 && value <= 8) {
      setPassengerCount(value);
    }
  };

  const renderResults = () => {
    if (isLoading) {
      return (
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <h3>Searching for rides...</h3>
        </div>
      );
    }
    if (searchPerformed && rides.length === 0) {
      return (
        <div className="empty-state">
          <div className="empty-icon">🚗</div>
          <h3>No rides found for this route</h3>
          <p>Try adjusting your search criteria or be the first to offer a ride on this route!</p>
          <div style={{ marginTop: '2rem' }}>
            <Button onClick={() => navigate('/offer-ride')} className="search-btn-primary">Offer a Ride</Button>
          </div>
        </div>
      );
    }
    if (rides.length > 0) {
      return (
        <div className="results-container">
          <div className="results-header"><h2>{rides.length} ride{rides.length !== 1 ? 's' : ''} found</h2></div>
          <div className="ride-list results-list">
            {rides.map(ride => <SimpleRideCard key={ride.id} ride={ride} />)}
          </div>
        </div>
      );
    }
    return (
      <div className="welcome-state">
        <div className="welcome-icon">🔍</div>
        <h2>Ready to find your ride?</h2>
        <p>Enter your trip details above to discover available rides offered by your colleagues.</p>
      </div>
    );
  }

  return (
    <div className={`main-container ${searchPerformed ? 'has-results' : ''}`}>
      {!searchPerformed && (
        <header className="page-header">
          <h1>Find Your Perfect Ride</h1>
          <p className="page-description">Connect with colleagues going your way.</p>
        </header>
      )}

      <div className={`search-form-wrapper ${searchPerformed ? 'compact' : ''}`}>
        <form onSubmit={handleSearch} className="enhanced-search-form" noValidate>
          <div className="search-fields-grid">
            {/* From Field */}
            <div className="search-field-group">
              <label className="field-label">
                <FiMapPin className="label-icon" /> From
              </label>
              <AutocompleteInput
                placeholder="Enter departure location..."
                value={origin}
                onChange={setOrigin}
              />
            </div>

            {/* To Field */}
            <div className="search-field-group">
              <label className="field-label">
                <FiMapPin className="label-icon destination-icon" /> To
              </label>
              <AutocompleteInput
                placeholder="Enter destination..."
                value={destination}
                onChange={setDestination}
              />
            </div>

            {/* Travel Date Field */}
            <div className="search-field-group">
              <label className="field-label">
                <FiCalendar className="label-icon" /> Travel Date
              </label>
              <div className="date-input-wrapper">
                <Input
                  type="date"
                  value={travelDateTime}
                  onChange={(e) => setTravelDateTime(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  onClick={(e) => e.target.showPicker && e.target.showPicker()}
                  style={{ cursor: 'pointer' }}
                />
              </div>
            </div>

            {/* Passengers Field */}
            <div className="search-field-group">
              <label className="field-label">
                <FiUsers className="label-icon" /> Passengers
              </label>
              <div className="passenger-counter">
                <span className="passenger-display">{passengerCount} Passenger{passengerCount > 1 ? 's' : ''}</span>
                <div className="counter-buttons">
                  <button 
                    type="button" 
                    className="counter-btn" 
                    onClick={() => handlePassengerCountChange(passengerCount - 1)} 
                    disabled={passengerCount <= 1}
                  >
                    <FiMinus />
                  </button>
                  <button 
                    type="button" 
                    className="counter-btn" 
                    onClick={() => handlePassengerCountChange(passengerCount + 1)} 
                    disabled={passengerCount >= 8}
                  >
                    <FiPlus />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="search-actions-bottom">
            <Button type="submit" disabled={isLoading} className="search-btn-primary">
              <FiSearch className="btn-icon" />
              {isLoading ? 'Searching...' : 'Search Rides'}
            </Button>
            <Button type="button" onClick={handleReset} className="reset-btn-secondary" disabled={isLoading}>
              Reset
            </Button>
          </div>
        </form>
      </div>

      <div className="search-results-section">
        {renderResults()}
      </div>

    </div>
  );
}

export default SearchPage;