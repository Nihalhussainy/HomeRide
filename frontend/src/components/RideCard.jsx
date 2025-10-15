// src/components/RideCard.jsx - Always show city names for all users
import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import './RideCard.css';
import axios from 'axios';
import { useNotification } from '../context/NotificationContext.jsx';
import { FiTrash2, FiCalendar, FiMapPin } from 'react-icons/fi';
import { FaUserCircle } from 'react-icons/fa';

function RideCard({ ride, currentUser, onActionSuccess }) {
    const navigate = useNavigate();
    const { showConfirmation, showNotification } = useNotification();

    const driver = ride.requester;
    const isMyRide = currentUser?.id === driver?.id;
    const hasDeparted = new Date(ride.travelDateTime) < new Date();
    const mySegment = ride.participants?.find(p => p.participant.id === currentUser?.id);

    // Create arrays of route points and cities
    const routePoints = useMemo(() => {
        if (!ride) return [];
        return [ride.origin, ...(ride.stopovers || []).map(s => s.point), ride.destination];
    }, [ride]);

    const routeCities = useMemo(() => {
        if (!ride) return [];
        return [ride.originCity, ...(ride.stopovers || []).map(s => s.city), ride.destinationCity];
    }, [ride]);

    // Helper function to get city name from point address
    const getCityFromPoint = (point) => {
        if (!point) return '';
        const pointIndex = routePoints.indexOf(point);
        if (pointIndex !== -1 && routeCities[pointIndex]) {
            return routeCities[pointIndex];
        }
        return point.split(',')[0]; // Fallback
    };

    // Get display origin and destination with city names
    const displayOrigin = mySegment?.pickupPoint 
        ? getCityFromPoint(mySegment.pickupPoint) 
        : ride.originCity;
    
    const displayDestination = mySegment?.dropoffPoint 
        ? getCityFromPoint(mySegment.dropoffPoint) 
        : ride.destinationCity;
    
    // Don't show intermediate stops in the card - only show pickup and dropoff

    const handleCardClick = (e) => {
        if (e.target.closest('.card-action')) return;
        navigate(`/ride/${ride.id}`);
    };

    const handleDelete = (e) => {
        e.stopPropagation();
        showConfirmation("Are you sure you want to delete this ride?", async () => {
            const token = localStorage.getItem('token');
            try {
                await axios.delete(`http://localhost:8080/api/rides/${ride.id}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                showNotification("Ride deleted successfully.", 'success');
                if (onActionSuccess) onActionSuccess();
            } catch (error) {
                console.error('Delete error:', error);
                showNotification(
                    error.response?.data?.message || "Failed to delete ride.",
                    'error'
                );
            }
        });
    };

    const formatTime = (dateTimeString) => {
        try {
            return new Date(dateTimeString).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
            });
        } catch (error) {
            return '--:--';
        }
    };

    const calculateArrivalTime = () => {
        try {
            const departureTime = new Date(ride.travelDateTime).getTime();
            const durationMs = (ride.duration || 0) * 60000;
            return new Date(departureTime + durationMs);
        } catch (error) {
            return new Date();
        }
    };

    const formatDuration = (minutes) => {
        if (minutes == null || minutes < 1) return '';
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        if (hours > 0) return `${hours}h${mins > 0 ? ` ${mins}m` : ''}`;
        return `${mins}m`;
    };

    const formatDate = (dateTimeString) => {
        try {
            return new Date(dateTimeString).toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric'
            });
        } catch (error) {
            return 'Invalid Date';
        }
    };

    return (
        <div
            className={`ride-card-final ${hasDeparted ? 'departed' : ''}`}
            onClick={handleCardClick}
            role="button"
            tabIndex={0}
        >
            <div className="card-top-section">
                <div className="timeline-container">
                    <span className="time-value start">
                        {formatTime(ride.travelDateTime)}
                    </span>

                    <div className="timeline-graphic">
                        <div className="dot"></div>
                        <div className="line"></div>
                        <span className="duration">
                            {formatDuration(ride.duration)}
                        </span>
                        <div className="line"></div>
                        <div className="dot"></div>
                    </div>

                    <span className="time-value end">
                        {formatTime(calculateArrivalTime())}
                    </span>

                    <span className="location-value start" title={mySegment ? mySegment.pickupPoint : ride.origin}>
                        {displayOrigin}
                        {mySegment && <span style={{
                            fontSize: '0.7rem',
                            color: '#10b981',
                            marginLeft: '6px',
                            fontWeight: '600'
                        }}>●</span>}
                    </span>
                    
                    <span className="location-value end" title={mySegment ? mySegment.dropoffPoint : ride.destination}>
                        {displayDestination}
                        {mySegment && <span style={{
                            fontSize: '0.7rem',
                            color: '#ef4444',
                            marginLeft: '6px',
                            fontWeight: '600'
                        }}>●</span>}
                    </span>
                </div>
            </div>

            <div className="card-footer">
                <div className="driver-details">
                    {driver.profilePictureUrl ? (
                        <img
                            src={driver.profilePictureUrl}
                            alt={`${driver.name}'s profile`}
                            className="driver-avatar-small"
                        />
                    ) : (
                        <FaUserCircle className="driver-avatar-small" />
                    )}
                    <span title={`Driver: ${driver.name}`}>
                        {driver.name}
                    </span>
                </div>

                <div className="date-details">
                    <FiCalendar size={16} />
                    <span>{formatDate(ride.travelDateTime)}</span>
                </div>

                <div className="card-action" onClick={(e) => e.stopPropagation()}>
                    {hasDeparted ? (
                        <span className="status-tag departed">
                            Departed
                        </span>
                    ) : isMyRide ? (
                        <div
                            className="delete-btn-wrapper"
                            onClick={handleDelete}
                            title="Delete Ride"
                            role="button"
                            tabIndex={0}
                        >
                            <FiTrash2 size={16} />
                        </div>
                    ) : (
                        <div className="status-placeholder"></div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default RideCard;