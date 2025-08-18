import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import RatingModal from '../components/RatingModal.jsx';
import Button from '../components/Button.jsx';
import StarRatingDisplay from '../components/StarRatingDisplay.jsx';
import '../App.css';
import { FaStar } from 'react-icons/fa';

function ProfilePage() {
  const [user, setUser] = useState(null);
  const [myRides, setMyRides] = useState([]);
  const [myRatings, setMyRatings] = useState([]);
  const [ratingsGiven, setRatingsGiven] = useState([]);
  const [selectedRideForRating, setSelectedRideForRating] = useState(null);
  const navigate = useNavigate();

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

  const handleSubmitRating = async (ratingData) => {
    const token = localStorage.getItem('token');
    try {
      await axios.post('http://localhost:8080/api/ratings', ratingData, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      alert('Thank you for your feedback!');
      setSelectedRideForRating(null); // Close the modal
      fetchData(); // Refresh all data to show the new "Rated" status
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to submit rating.';
      alert(errorMessage);
    }
  };

  const averageRating = useMemo(() => {
    if (!myRatings || myRatings.length === 0) return "Not Rated Yet";
    const total = myRatings.reduce((acc, rating) => acc + rating.score, 0);
    return (total / myRatings.length).toFixed(1);
  }, [myRatings]);

  if (!user) {
    return <div className="dashboard-container">Loading profile...</div>;
  }

  // ✅ NEW: Helper function to check if a user has already been rated for a specific ride
  const findGivenRating = (rideId, rateeId) => {
    return ratingsGiven.find(rating => 
      rating.rideRequest.id === rideId && 
      rating.ratee.id === rateeId
    );
  };

  return (
    <div className="dashboard-container">
      <h1>My Profile</h1>
      <div className="profile-details">
        <p><strong>Name:</strong> {user.name}</p>
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>Average Rating:</strong> {averageRating} <FaStar color="#ffc107" style={{ verticalAlign: 'middle' }} /></p>
      </div>

      <h2>Feedback Received</h2>
      <div className="ratings-list">
        {myRatings.length > 0 ? myRatings.map(rating => (
          <div key={rating.id} className="rating-card">
            <p><strong>"{rating.comment}"</strong></p>
            <span>- Rated {rating.score}/5 by {rating.rater.name}</span>
          </div>
        )) : <p>You have not received any feedback yet.</p>}
      </div>

      <h2>My Travel History</h2>
      <div className="ride-list">
        {myRides.map(ride => {
          // Get a list of all other users in the ride
          const otherUsers = [];
          if (ride.requester.id !== user.id) otherUsers.push(ride.requester);
          if (ride.driver && ride.driver.id !== user.id) otherUsers.push(ride.driver);
          ride.participants.forEach(p => {
              if(p.participant.id !== user.id) otherUsers.push(p.participant);
          });
          // Remove duplicates
          const uniqueRatees = [...new Map(otherUsers.map(item => [item['id'], item])).values()];

          return (
            <div key={ride.id} className="history-ride-card">
              <div className="history-ride-info">
                <p><strong>{ride.origin} to {ride.destination}</strong></p>
                {/* ✅ FIX: Correctly formats the date and time */}
                <p>Date: {new Date(ride.travelDateTime).toLocaleString()}</p>
              </div>
              <div className="history-ride-feedback">
                {uniqueRatees.map(ratee => {
                    const givenRating = findGivenRating(ride.id, ratee.id);
                    return (
                        <div key={ratee.id} className="feedback-item">
                            <span>Your Feedback for {ratee.name}:</span>
                            <div className="rating-display">
                            {givenRating ? (
                                <StarRatingDisplay score={givenRating.score} />
                            ) : (
                                <Button onClick={() => setSelectedRideForRating({ride, ratee})}>Rate</Button>
                            )}
                            </div>
                        </div>
                    )
                })}
              </div>
            </div>
          );
        })}
      </div>

      {selectedRideForRating && (
        <RatingModal 
          ride={selectedRideForRating.ride}
          ratee={selectedRideForRating.ratee}
          onClose={() => setSelectedRideForRating(null)}
          onSubmitRating={handleSubmitRating}
        />
      )}
    </div>
  );
}

export default ProfilePage;