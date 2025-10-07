import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import RatingModal from '../components/RatingModal.jsx';
import Button from '../components/Button.jsx';
import Input from '../components/Input.jsx';
import StarRatingDisplay from '../components/StarRatingDisplay.jsx';
import ImageCropperModal from '../components/ImageCropperModal.jsx';
import '../App.css';
import { useNotification } from '../context/NotificationContext.jsx';
import { FaStar, FaEnvelope, FaUserCircle, FaHistory, FaCommentDots, FaArrowRight, FaCalendarAlt, FaCamera, FaTrashAlt, FaPhone } from 'react-icons/fa';

const ITEMS_PER_PAGE = 5;

function ProfilePage() {
  const [user, setUser] = useState(null);
  const [myRides, setMyRides] = useState([]);
  const [myRatings, setMyRatings] = useState([]);
  const [ratingsGiven, setRatingsGiven] = useState([]);
  const [selectedRideForRating, setSelectedRideForRating] = useState(null);
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const { showNotification, showConfirmation } = useNotification(); 
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ name: '', phoneNumber: '' });

  const [imageToCrop, setImageToCrop] = useState(null);
  const [isCropperOpen, setIsCropperOpen] = useState(false);
  
  // State for pagination
  const [visibleRatings, setVisibleRatings] = useState(ITEMS_PER_PAGE);
  const [visibleRides, setVisibleRides] = useState(ITEMS_PER_PAGE);

  const fetchData = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    const config = { headers: { 'Authorization': `Bearer ${token}` } };
    try {
      const [userResponse, ridesResponse, receivedRatingsResponse, givenRatingsResponse] = await Promise.all([
        axios.get('http://localhost:8080/api/employees/me', config),
        axios.get('http://localhost:8080/api/rides/my-rides', config),
        axios.get('http://localhost:8080/api/ratings/my-ratings', config),
        axios.get('http://localhost:8080/api/ratings/given', config)
      ]);
      setUser(userResponse.data);
      setMyRides(ridesResponse.data);
      setMyRatings(receivedRatingsResponse.data);
      setRatingsGiven(givenRatingsResponse.data);
    } catch (error) {
      console.error('Failed to fetch profile data:', error);
      navigate('/login');
    }
  }, [navigate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleEditClick = () => {
    setFormData({
      name: user.name,
      phoneNumber: user.phoneNumber || '',
    });
    setIsEditing(true);
  };

  const handleCancelClick = () => {
    setIsEditing(false);
  };

  const handleFormChange = (event) => {
    const { name, value } = event.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = async (event) => {
    event.preventDefault();
    const token = localStorage.getItem('token');
    try {
      const response = await axios.put('http://localhost:8080/api/employees/me', formData, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setUser(response.data);
      setIsEditing(false);
      showNotification('Profile updated successfully!');
      
    } catch (error) {
      showNotification('Failed to update profile. Please try again.', 'error');
      console.error("Error updating profile:", error);
    }
  };

  const handleFileChange = (event) => {
    if (event.target.files && event.target.files.length > 0) {
      const reader = new FileReader();
      reader.addEventListener('load', () => setImageToCrop(reader.result));
      reader.readAsDataURL(event.target.files[0]);
      setIsCropperOpen(true);
      event.target.value = null;
    }
  };

  const handleCropComplete = (imageElement, crop) => {
    const canvas = document.createElement('canvas');
    const scaleX = imageElement.naturalWidth / imageElement.width;
    const scaleY = imageElement.naturalHeight / imageElement.height;
    canvas.width = crop.width * scaleX;
    canvas.height = crop.height * scaleY;
    const ctx = canvas.getContext('2d');

    ctx.drawImage(
      imageElement,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      crop.width * scaleX,
      crop.height * scaleY
    );

    canvas.toBlob(async (blob) => {
      if (!blob) {
        console.error('Canvas is empty');
        return;
      }
      const formData = new FormData();
      formData.append('file', blob, 'profile.jpg');
      const token = localStorage.getItem('token');
      try {
        const response = await axios.post('http://localhost:8080/api/employees/me/profile-picture', formData, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        });
        setUser(response.data);
        showNotification('Profile picture updated successfully!');
      } catch (error) {
        showNotification('Failed to update profile. Please try again.', 'error');
      } finally {
        setIsCropperOpen(false);
      }
    }, 'image/jpeg');
  };

  const handleChangePicture = () => {
    fileInputRef.current.click();
  };

   const handleRemovePicture = () => {
    showConfirmation("Are you sure you want to remove your profile picture?", async () => {
        const token = localStorage.getItem('token');
        try {
            const response = await axios.delete('http://localhost:8080/api/employees/me/profile-picture', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setUser(response.data);
            showNotification('Profile picture removed.');
        } catch (error) {
            showNotification('Failed to remove profile picture.', 'error');
        }
    });
  };
  
  const handleSubmitRating = async (ratingData) => {
    const token = localStorage.getItem('token');
    try {
      await axios.post('http://localhost:8080/api/ratings', ratingData, {
        headers: { 'Authorization': `Bearer ${token}` } 
      });
      showNotification('Thank you for your feedback!');
      setSelectedRideForRating(null);
      fetchData();
    } catch (error) {
      showNotification(error.response?.data?.message || 'Failed to submit rating.', 'error');
  
    }
  };

  const averageRating = useMemo(() => {
    if (!myRatings || myRatings.length === 0) return "Not Rated Yet";
    const total = myRatings.reduce((acc, rating) => acc + rating.score, 0);
    return (total / myRatings.length).toFixed(1);
  }, [myRatings]);

  const findGivenRating = (rideId, rateeId) => {
    return ratingsGiven.find(rating => 
      rating.rideRequest.id === rideId && 
      rating.ratee.id === rateeId
    );
  };
  
  const sortedRides = useMemo(() => {
      return [...myRides]
        .filter(ride => ride.rideType !== 'REQUESTED' || ride.driver)
        .sort((a, b) => new Date(b.travelDateTime) - new Date(a.travelDateTime));
  }, [myRides]);
  
  const sortedRatings = useMemo(() => {
      return [...myRatings]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [myRatings]);

  if (!user) {
    return <div className="main-container">Loading profile...</div>;
  }

  return (
    <div className="main-container">
      <header className="page-header">
        <h1>My Profile</h1>
      </header>
      
      <div className="profile-details-grid">
        {isEditing ? (
          <form onSubmit={handleFormSubmit} className="profile-edit-form">
            <div className="profile-picture-edit-area">
              {user.profilePictureUrl ? (
                <img src={user.profilePictureUrl} alt="Profile" className="profile-picture" />
              ) : (
                <FaUserCircle size={120} className="profile-picture-placeholder" />
              )}
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                style={{ display: 'none' }} 
                accept="image/png, image/jpeg"
              />
              <div className="profile-picture-actions">
                {user.profilePictureUrl ? (
                  <>
                    <Button type="button" onClick={handleChangePicture} className="secondary"><FaCamera /> Update</Button>
                    <Button type="button" onClick={handleRemovePicture} className="secondary remove"><FaTrashAlt /> Remove</Button>
                  </>
                ) : (
                  <Button type="button" onClick={handleChangePicture} className="secondary"><FaCamera /> Add Picture</Button>
                )}
              </div>
            </div>
            <div className="profile-fields-container">
              <Input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleFormChange}
                required
              />
              <Input
                type="tel"
                name="phoneNumber"
                placeholder="Your Phone Number"
                value={formData.phoneNumber}
                onChange={handleFormChange}
              />
              <div className="profile-edit-buttons">
                <Button type="button" onClick={handleCancelClick} className="secondary">Cancel</Button>
                <Button type="submit">Save Changes</Button>
              </div>
            </div>
          </form>
        ) : (
          <>
            <div className="profile-picture-container">
              {user.profilePictureUrl ? (
                <img src={user.profilePictureUrl} alt="Profile" className="profile-picture" />
              ) : (
                <FaUserCircle size={120} className="profile-picture-placeholder" />
              )}
            </div>
            <div className="profile-display-info">
              <div>
                <p><strong><FaUserCircle /> Name:</strong> {user.name}</p>
                <p><strong><FaEnvelope /> Email:</strong> {user.email}</p>
                <p><strong><FaPhone /> Phone:</strong> {user.phoneNumber || 'Not provided'}</p>
                <p><strong><FaStar /> Average Rating:</strong> {averageRating} {typeof averageRating === 'string' && !isNaN(averageRating) && <FaStar size={14} style={{ color: '#ffc107', marginLeft: '4px' }} />}</p>
              </div>
              <Button onClick={handleEditClick}>Edit Profile</Button>
            </div>
          </>
        )}
      </div>

      <div className="profile-content-grid">
        <div className="feedback-column">
          <h2><FaCommentDots /> Feedback Received</h2>
          <div className="ratings-list">
            {sortedRatings.length > 0 ? (
              <>
                {sortedRatings.slice(0, visibleRatings).map(rating => (
                  <div key={rating.id} className="rating-card" style={{backgroundColor: 'var(--surface-color)', padding: '15px', borderRadius: 'var(--border-radius)', marginBottom: '10px', border: '1px solid var(--surface-color-light)'}}>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '8px' }}>
                      For ride: <strong>{rating.rideRequest.origin} <FaArrowRight size={10} /> {rating.rideRequest.destination}</strong>
                    </p>
                    <p><strong>"{rating.comment || 'No comment provided.'}"</strong></p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                      <span>- Rated {rating.score}/5 by {rating.rater.name}</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.8rem' }}>
                        <FaCalendarAlt />
                        {new Date(rating.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
                {visibleRatings < sortedRatings.length && (
                  <div className="load-more-container">
                    <Button onClick={() => setVisibleRatings(prev => prev + ITEMS_PER_PAGE)}>Load More</Button>
                  </div>
                )}
              </>
            ) : (
              <p>You have not received any feedback yet.</p>
            )}
          </div>
        </div>

        <div className="history-column">
          <h2><FaHistory /> My Travel History</h2>
          <div className="ride-list">
            {sortedRides.length > 0 ? (
              <>
                {sortedRides.slice(0, visibleRides).map(ride => {
                  const otherUsers = [];
                  if (ride.requester.id !== user.id) otherUsers.push(ride.requester);
                  if (ride.driver && ride.driver.id !== user.id) otherUsers.push(ride.driver);
                  ride.participants.forEach(p => {
                      if(p.participant.id !== user.id) otherUsers.push(p.participant);
                  });
                  const uniqueRatees = [...new Map(otherUsers.map(item => [item['id'], item])).values()];
                  const hasDeparted = new Date(ride.travelDateTime) < new Date();

                  return (
                    <div key={ride.id} className="history-ride-card">
                      <div className="history-ride-info">
                        <p><strong>{ride.origin} to {ride.destination}</strong></p>
                        <p style={{color: 'var(--text-secondary)'}}>Date: {new Date(ride.travelDateTime).toLocaleString()}</p>
                      </div>
                      <div className="history-ride-feedback">
                        {uniqueRatees.length > 0 ? uniqueRatees.map(ratee => {
                            const givenRating = findGivenRating(ride.id, ratee.id);
                            return (
                                <div key={ratee.id} className="feedback-item">
                                    <span>Your Feedback for {ratee.name}:</span>
                                    <div className="rating-display">
                                    {givenRating ? (
                                        <StarRatingDisplay score={givenRating.score} />
                                    ) : (
                                        hasDeparted ? (
                                            <Button onClick={() => setSelectedRideForRating({ride, ratee})}>Rate</Button>
                                        ) : (
                                            <span className="rate-later-message">Rate after trip</span>
                                        )
                                    )}
                                    </div>
                                </div>
                            )
                        }) : <span style={{color: 'var(--text-secondary)', fontSize: '0.9rem'}}>You were the only one on this ride.</span>}
                      </div>
                    </div>
                  );
                })}
                {visibleRides < sortedRides.length && (
                    <div className="load-more-container">
                        <Button onClick={() => setVisibleRides(prev => prev + ITEMS_PER_PAGE)}>Load More</Button>
                    </div>
                )}
              </>
            ) : (
              <p>You have no completed rides in your history.</p>
            )}
          </div>
        </div>
      </div>

      {selectedRideForRating && (
        <RatingModal 
          ride={selectedRideForRating.ride}
          ratee={selectedRideForRating.ratee}
          onClose={() => setSelectedRideForRating(null)}
          onSubmitRating={handleSubmitRating}
        />
      )}

      {isCropperOpen && (
        <ImageCropperModal
          imageSrc={imageToCrop}
          onClose={() => setIsCropperOpen(false)}
          onCropComplete={handleCropComplete}
        />
      )}
    </div>
  );
}

export default ProfilePage;
