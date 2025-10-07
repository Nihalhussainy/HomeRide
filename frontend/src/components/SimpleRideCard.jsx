import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUserCircle, FaStar } from 'react-icons/fa';
import { FiUsers, FiMapPin, FiNavigation } from 'react-icons/fi';
import './SimpleRideCard.css';

function SimpleRideCard({ ride }) {
    const navigate = useNavigate();
    const driver = ride.requester;
    const availableSeats = ride.vehicleCapacity - ride.participants.length;

    const formatTime = (dateTimeString) => {
        return new Date(dateTimeString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
    };

    const calculateArrivalTime = () => {
        const departureTime = new Date(ride.travelDateTime);
        const durationMs = (ride.duration || 0) * 60000;
        return new Date(departureTime.getTime() + durationMs);
    };

    // --- NEW FUNCTION TO FORMAT DURATION ---
    const formatDuration = (minutes) => {
        if (!minutes || minutes < 1) return 'N/A';
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        if (hours > 0) {
            return `${hours}h ${mins > 0 ? `${mins}m` : ''}`.trim();
        }
        return `${mins}m`;
    };

    if (!driver) {
        return <div className="simple-ride-card-error">Ride data is incomplete.</div>;
    }

    return (
        <div className="simple-ride-card" onClick={() => navigate(`/ride/${ride.id}`)}>
            <div className="card-grid-container">
                {/* --- Column 1: Timeline --- */}
                <div className="time-start">{formatTime(ride.travelDateTime)}</div>
                <div className="timeline-connector">
                    <div className="timeline-line"></div>
                    <div className="duration-text">{formatDuration(ride.duration)}</div>
                </div>
                <div className="time-end">{formatTime(calculateArrivalTime())}</div>
                
                {/* --- Column 2: Route --- */}
                <div className="location-start">
                    <FiMapPin className="location-icon origin" />
                    <span className="location-text">{ride.origin}</span>
                </div>
                <div className="location-end">
                    <FiNavigation className="location-icon destination" />
                    <span className="location-text">{ride.destination}</span>
                </div>

                {/* --- Column 3: Price (MODIFIED) --- */}
                <div className="price-container">
                    <span className="price-value">₹{ride.price ? ride.price.toFixed(0) : '0'}</span>
                    {/* "PER SEAT" label removed */}
                </div>
                
                {/* --- Bottom Row Elements --- */}
                <div className="card-divider"></div>

                <div className="driver-container">
                    <div className="driver-avatar-wrapper">
                        {driver.profilePictureUrl ? (
                            <img src={driver.profilePictureUrl} alt={driver.name} className="driver-avatar" />
                        ) : (
                            <FaUserCircle className="driver-avatar-placeholder" />
                        )}
                    </div>
                    <div className="driver-info-text">
                        <span className="driver-name">{driver.name}</span>
                        <div className="driver-rating">
                            <FaStar className="star-icon" />
                            <span className="rating-value">
                                {driver.averageRating ? driver.averageRating.toFixed(1) : 'New'}
                            </span>
                        </div>
                    </div>
                </div>

                <div className={`seats-container ${availableSeats <= 2 ? 'low-seats' : ''}`}>
                    <FiUsers className="seats-icon" />
                    <span className="seats-text">{availableSeats} seat{availableSeats !== 1 ? 's' : ''} left</span>
                </div>
            </div>
        </div>
    );
}

export default SimpleRideCard;