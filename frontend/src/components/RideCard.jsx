import React from 'react';
import { useNavigate } from 'react-router-dom';
import './RideCard.css';
import axios from 'axios';
import { useNotification } from '../context/NotificationContext.jsx';
import { FiTrash2, FiCalendar } from 'react-icons/fi';
import { FaUserCircle } from 'react-icons/fa';

function RideCard({ ride, currentUser, onActionSuccess }) {
    const navigate = useNavigate();
    const { showConfirmation, showNotification } = useNotification();

    const driver = ride.requester;
    const isMyRide = currentUser?.id === driver?.id;
    const hasDeparted = new Date(ride.travelDateTime) < new Date();

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
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleCardClick(e);
                }
            }}
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

                    <span className="location-value start" title={ride.origin}>
                        {ride.origin}
                    </span>
                    <span className="location-value end" title={ride.destination}>
                        {ride.destination}
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
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                    e.preventDefault();
                                    handleDelete(e);
                                }
                            }}
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