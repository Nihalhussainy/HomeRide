import React, { useState, useEffect, useCallback, useRef } from 'react'; // ✅ added useRef
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { FiSearch, FiCalendar, FiUsers, FiPlus, FiMinus, FiMapPin, FiArrowRight, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import Input from '../components/Input.jsx';
import Button from '../components/Button.jsx';
import RideCard from '../components/RideCard.jsx';
import { useNotification } from '../context/NotificationContext.jsx';
import '../App.css';
import '../components/SearchFilter.css';

function SearchPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [origin, setOrigin] = useState(searchParams.get('origin') || '');
    const [destination, setDestination] = useState(searchParams.get('destination') || '');
    const initialTravelDate = searchParams.get('travelDateTime') ? searchParams.get('travelDateTime').split('T')[0] : '';
    const [travelDateTime, setTravelDateTime] = useState(initialTravelDate);
    const [passengerCount, setPassengerCount] = useState(parseInt(searchParams.get('passengerCount')) || 1);
    const [rides, setRides] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [searchPerformed, setSearchPerformed] = useState(false);
    const { showNotification } = useNotification();
    const [rideType, setRideType] = useState(searchParams.get('rideType') || 'all');
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

    const resultsRef = useRef(null); // ✅ create ref for rides section

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        const token = localStorage.getItem('token');
        if (!token) {
            showNotification('Session expired. Please log in again.', 'error');
            setIsLoading(false);
            return;
        }
        try {
            const response = await axios.get('http://localhost:8080/api/rides', {
                params: { origin, destination, travelDateTime, passengerCount, rideType },
                headers: { Authorization: `Bearer ${token}` },
            });
            setRides(response.data);
            setSearchPerformed(true);

            // ✅ Scroll into view after results load
            setTimeout(() => {
                if (resultsRef.current) {
                    resultsRef.current.scrollIntoView({ behavior: "smooth" });
                }
            }, 300);

        } catch (error) {
            console.error('Failed to fetch search results:', error);
            if (error.response && error.response.status === 403) {
                showNotification('Access denied. Please log in again.', 'error');
            } else {
                showNotification('Failed to fetch search results. Please try again.', 'error');
            }
        } finally {
            setIsLoading(false);
        }
    }, [origin, destination, travelDateTime, passengerCount, rideType, showNotification]);

    useEffect(() => {
        if (
            searchParams.get('origin') ||
            searchParams.get('destination') ||
            searchParams.get('travelDateTime') ||
            searchParams.get('passengerCount')
        ) {
            fetchData();
        }
    }, [searchParams, fetchData]);

    const handleSearch = (event) => {
        event.preventDefault();
        setSearchParams({ origin, destination, travelDateTime, passengerCount, rideType });
    };

    const handleReset = () => {
        setOrigin('');
        setDestination('');
        setTravelDateTime('');
        setPassengerCount(1);
        setRideType('all');
        setSearchParams({});
        setRides([]);
        setSearchPerformed(false);
    };

    const getNowString = () => {
        const now = new Date();
        now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
        return now.toISOString().slice(0, 10);
    };

    const handlePassengerCountChange = (value) => {
    if (value >= 1 && value <= 8) {
        setPassengerCount(value);
    }
};

    const getPassengerText = () =>
        `${passengerCount} Passenger${passengerCount > 1 ? 's' : ''}`;

    return (
        <div className="main-container">
            <header className="page-header">
                <h1>Find Your Perfect Ride</h1>
                <p className="page-description">Connect with travelers going your way</p>
            </header>
            <div className="search-form-wrapper">
                <form onSubmit={handleSearch} className="enhanced-search-form" noValidate>
                    {/* Primary Search Fields */}
                    <div className="search-fields-primary">
                        <div className="search-field-group">
                            <label className="field-label">
                                <FiMapPin className="label-icon" />
                                From
                            </label>
                            <Input
                                type="text"
                                placeholder="Enter departure location..."
                                value={origin}
                                onChange={(e) => setOrigin(e.target.value)}
                                className="search-input"
                            />
                        </div>
                        <div className="search-field-group">
                            <label className="field-label">
                                <FiMapPin className="label-icon destination-icon" />
                                To
                            </label>
                            <Input
                                type="text"
                                placeholder="Enter destination..."
                                value={destination}
                                onChange={(e) => setDestination(e.target.value)}
                                className="search-input"
                            />
                        </div>
                        <div className="search-field-group">
                            <label className="field-label">
                                <FiCalendar className="label-icon" />
                                Travel Date
                            </label>
                            <Input
                                type="date"
                                value={travelDateTime}
                                onChange={(e) => setTravelDateTime(e.target.value)}
                                min={getNowString()}
                                className="search-input date-input"
                            />
                        </div>
                    </div>

                    {/* Search & Reset Buttons Below */}
                    <div className="search-actions-bottom">
                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="search-btn-primary"
                        >
                            <FiSearch className="btn-icon" />
                            {isLoading ? 'Searching...' : 'Search Rides'}
                        </Button>
                        <Button
                            type="button"
                            onClick={handleReset}
                            className="reset-btn-secondary"
                            disabled={isLoading}
                        >
                            Reset
                        </Button>
                    </div>

                    {/* Advanced Filters Section */}
                    <div className="advanced-filter-toggle">
                        <button type="button" onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}>
                            {showAdvancedFilters ? <FiChevronUp /> : <FiChevronDown />}
                            {showAdvancedFilters ? 'Hide Filters' : 'More Filters'}
                        </button>
                    </div>

                    {showAdvancedFilters && (
                        <div className="search-fields-advanced">
                            <div className="search-field-group">
                                <label className="field-label">
                                    <FiUsers className="label-icon" />
                                    Passengers
                                </label>
                                <div className="passenger-counter">
                                    <span className="passenger-display">{getPassengerText()}</span>
                                    <div className="counter-buttons">
                                        <button
                                            type="button"
                                            className="counter-btn"
                                            onClick={() => handlePassengerCountChange(passengerCount - 1)}
                                            disabled={passengerCount <= 1}
                                            aria-label="Decrease passenger count"
                                        >
                                            <FiMinus />
                                        </button>
                                        <button
    type="button"
    className="counter-btn"
    onClick={() => handlePassengerCountChange(passengerCount + 1)}
    disabled={passengerCount >= 8}   // ✅ disable when at 8
    aria-label="Increase passenger count"
>
    <FiPlus />
</button>

                                    </div>
                                </div>
                            </div>

                            <div className="search-field-group">
                                <label className="field-label">
                                    <FiArrowRight className="label-icon" />
                                    Ride Type
                                </label>
                                <div className="ride-type-dropdown">
                                    <select
                                        className="ride-type-select"
                                        value={rideType}
                                        onChange={(e) => setRideType(e.target.value)}
                                    >
                                        <option value="all">All</option>
                                        <option value="offered">Offered</option>
                                        <option value="requested">Requested</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    )}
                </form>
            </div>

            {/* ✅ Add ref here */}
            <div className="search-results-section" ref={resultsRef}>
                {isLoading ? (
                    <div className="loading-state">
                        <div className="loading-spinner"></div>
                        <h3>Searching for rides...</h3>
                        <p>Finding the best matches for your journey</p>
                    </div>
                ) : searchPerformed && rides.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">🚗</div>
                        <h3>No rides found</h3>
                        <p>
                            No rides available right now
                            {origin && ` from ${origin}`}
                            {destination && ` to ${destination}`}
                            {travelDateTime && ` on ${new Date(travelDateTime).toLocaleDateString()}`}
                            {passengerCount && ` for ${getPassengerText().toLowerCase()}`}.
                            <br />
                            Try adjusting your search criteria or check back later.
                        </p>
                    </div>
                ) : rides.length > 0 ? (
                    <div className="results-container">
                        <div className="results-header">
                            <h2>{rides.length} ride{rides.length !== 1 ? 's' : ''} found</h2>
                        </div>
                        <div className="ride-list results-list">
                            {rides.map(ride => (
                                <RideCard key={ride.id} ride={ride} />
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="welcome-state">
                        <div className="welcome-icon">🔍</div>
                        <h2>Ready to find your ride?</h2>
                        <p>Enter your trip details above to discover available rides and connect with fellow travelers.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default SearchPage;
