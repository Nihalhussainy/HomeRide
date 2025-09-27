import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Input from './Input.jsx';
import { FiMapPin } from 'react-icons/fi';
import './AutocompleteInput.css';

// Using a custom hook for debouncing API calls to prevent excessive requests
const useDebounce = (value, delay) => {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debouncedValue;
};


function AutocompleteInput({ value, onChange, placeholder, ...props }) {
    const [suggestions, setSuggestions] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const wrapperRef = useRef(null);

    // Debounce the user input to prevent too many API calls
    const debouncedValue = useDebounce(value, 500);

    // --- NEW: API call for location suggestions from backend (or a direct API)
    // NOTE: This example uses a placeholder API call. You would replace this with a call to your new backend endpoint.
    // The backend endpoint would then call a service like Google Maps Geocoding.
    const fetchSuggestions = async (query) => {
        if (query.trim() === '') {
            setSuggestions([]);
            return;
        }

        setIsSearching(true);
        try {
            // Placeholder for backend call
            // In a real implementation, the backend would call a service like Google Maps API
            const response = await axios.get(`http://localhost:8080/api/locations/autocomplete?query=${query}`);
            const apiSuggestions = response.data; // Assuming backend returns an array of strings
            setSuggestions(apiSuggestions);
        } catch (error) {
            console.error('Error fetching autocomplete suggestions:', error);
            setSuggestions([]);
        } finally {
            setIsSearching(false);
        }
    };

    useEffect(() => {
        if (debouncedValue) {
            fetchSuggestions(debouncedValue);
        } else {
            setSuggestions([]);
        }
    }, [debouncedValue]);

    const handleSelect = (suggestion) => {
        onChange(suggestion);
        setSuggestions([]);
        setIsFocused(false);
    };

    // Close suggestions when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setSuggestions([]);
                setIsFocused(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [wrapperRef]);
    
    return (
        <div className="autocomplete-wrapper" ref={wrapperRef}>
            <Input
                type="text"
                placeholder={placeholder}
                value={value}
                onChange={(e) => {
                    onChange(e.target.value);
                    setIsFocused(true);
                }}
                onFocus={() => setIsFocused(true)}
                {...props}
            />
            {isFocused && (isSearching || suggestions.length > 0) && (
                <ul className="suggestions-list">
                    {isSearching ? (
                        <li className="loading-item">Searching...</li>
                    ) : suggestions.length > 0 ? (
                        suggestions.map((suggestion, index) => (
                            <li key={index} onClick={() => handleSelect(suggestion)}>
                                <FiMapPin size={16} className="suggestion-icon" />
                                {suggestion}
                            </li>
                        ))
                    ) : (
                        <li className="no-results-item">No results found</li>
                    )}
                </ul>
            )}
        </div>
    );
}

export default AutocompleteInput;
