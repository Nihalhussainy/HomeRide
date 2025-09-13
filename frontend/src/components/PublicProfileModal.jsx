import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Button from './Button.jsx';
import StarRatingDisplay from './StarRatingDisplay.jsx';
import '../App.css';
import './RatingModal.css';
import './PublicProfileModal.css';
import { FaUserCircle, FaEnvelope, FaStar, FaCarSide, FaCommentDots, FaArrowRight, FaCalendarAlt } from 'react-icons/fa';
import { useNotification } from '../context/NotificationContext.jsx';

function PublicProfileModal({ userId, onClose }) {
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { showNotification } = useNotification();

  useEffect(() => {
    const fetchProfileData = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(`http://localhost:8080/api/employees/${userId}`);
        setProfile(response.data);
      } catch (error) {
        console.error('Failed to fetch profile data:', error);
        showNotification('Could not load profile.', 'error');
      } finally {
        setIsLoading(false);
      }
    };

    if (userId) {
      fetchProfileData();
    }
  }, [userId, showNotification]);

  if (isLoading) {
    return (
      <div className="modal-overlay">
        <div className="modal-content">
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="modal-overlay">
        <div className="modal-content">
          <p>Profile not found or could not be loaded.</p>
          <div className="modal-actions">
            <Button onClick={onClose}>OK</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>User Profile</h2>
        </div>
        
        <div className="profile-summary">
          <div className="profile-summary-picture">
            {profile.profilePictureUrl ? (
              <img src={profile.profilePictureUrl} alt="Profile" className="profile-picture" />
            ) : (
              <FaUserCircle size={96} className="profile-picture-placeholder" />
            )}
          </div>
          <div className="profile-summary-info">
            <p><strong><FaUserCircle /> Name:</strong> {profile.name}</p>
            <p><strong><FaEnvelope /> Email:</strong> {profile.email}</p>
            <p>
              <strong><FaStar /> Avg Rating:</strong> {profile.averageRating ? profile.averageRating.toFixed(1) : 'N/A'} {profile.averageRating && <FaStar size={14} style={{ color: '#ffc107', marginLeft: '4px' }} />}
            </p>
            <p><strong><FaCarSide /> Rides:</strong> {profile.totalRides}</p>
          </div>
        </div>

        <div className="feedback-section">
          <h2><FaCommentDots /> Feedback Received</h2>
          <div className="ratings-list">
            {profile.receivedRatings && profile.receivedRatings.length > 0 ? (
              profile.receivedRatings.map(rating => (
                <div key={rating.id} className="feedback-card">
                  <p className="feedback-origin-destination">
                    From ride: <strong>{rating.rideRequest.origin} <FaArrowRight size={10} /> {rating.rideRequest.destination}</strong>
                  </p>
                  <p className="feedback-comment">"{rating.comment || 'No comment provided.'}"</p>
                  <div className="feedback-meta">
                    <span className="feedback-author">- Rated {rating.score}/5 by {rating.rater.name}</span>
                    <span className="feedback-date">
                      <FaCalendarAlt /> {new Date(rating.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="no-feedback-message">This user has not received any feedback yet.</p>
            )}
          </div>
        </div>

        <div className="modal-actions" style={{ marginTop: '20px' }}>
          <Button onClick={onClose}>Close</Button>
        </div>
      </div>
    </div>
  );
}

export default PublicProfileModal;