import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Input from './Input.jsx';
import { FiMapPin } from 'react-icons/fi';
import './AutocompleteInput.css';

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
    const debouncedValue = useDebounce(value, 300); // Faster debounce for better UX

    const fetchSuggestions = async (query) => {
        if (query.trim().length < 3) { // Don't search for very short strings
            setSuggestions([]);
            return;
        }
        setIsSearching(true);
        try {
            // MODIFIED: Pointing to the new backend endpoint for Google Places
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
    }, [wrapperRef]);
    
    return (
        <div className="autocomplete-wrapper" ref={wrapperRef}>
            <Input
                type="text"
                placeholder={placeholder}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onFocus={() => setIsFocused(true)}
                autoComplete="off" // Prevent browser's native autocomplete
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
                    ) : (
                        <li className="no-results-item">No results found</li>
                    )}
                </ul>
            )}
        </div>
    );
}

export default AutocompleteInput;