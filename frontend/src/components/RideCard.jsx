import React, { useState, useMemo } from 'react';
import './RideCard.css';
import Button from './Button.jsx';
import axios from 'axios';
import { FiCheckCircle } from 'react-icons/fi';

function RideCard({ ride, currentUser, onActionSuccess }) {
  const [isLoading, setIsLoading] = useState(false);
  const [isActionDone, setIsActionDone] = useState(false);

  const isAlreadyInvolved = useMemo(() => {
    if (!currentUser || !ride) return false;
    const isParticipant = ride.participants?.some(p => p.participant.id === currentUser.id);
    const isDriver = ride.driver?.id === currentUser.id;
    return isParticipant || isDriver;
  }, [ride, currentUser]);

  const handleAction = async () => {
    setIsLoading(true);
    const token = localStorage.getItem('token');
    const isOfferingDrive = ride.rideType === 'REQUESTED';
    const endpoint = isOfferingDrive
      ? `http://localhost:8080/api/rides/${ride.id}/accept`
      : `http://localhost:8080/api/rides/${ride.id}/join`;

    try {
      await axios.post(endpoint, {}, { headers: { 'Authorization': `Bearer ${token}` } });
      setIsActionDone(true);
      setTimeout(() => onActionSuccess(), 1500);
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Action failed.';
      alert(errorMessage);
      setIsLoading(false);
    }
  };

  const isMyRide = currentUser?.id === ride.requester?.id;
  const isDriverFound = ride.rideType === 'REQUESTED' && ride.driver;

  return (
    <div className="ride-card">
      <div className="ride-details">
        <span className={`ride-type ${ride.rideType}`}>{ride.rideType}</span>
        <h3>{ride.origin} to {ride.destination}</h3>
        <p><strong>Posted by:</strong> {ride.requester?.name || 'Unknown'}</p>
        <p><strong>Date & Time:</strong> {new Date(ride.travelDateTime).toLocaleString()}</p>
        <div className="participants-list">
          <strong>{ride.rideType === 'OFFERED' ? 'Passengers:' : 'Driver:'}</strong>
          {ride.rideType === 'OFFERED' ? (
            ride.participants?.length > 0 ? (
              <ul>{ride.participants.map(p => <li key={p.id}>{p.participant.name}</li>)}</ul>
            ) : <p className="no-one-joined">No passengers have joined yet.</p>
          ) : (
            isDriverFound ? (
              <p className="driver-found">{ride.driver.name} has accepted.</p>
            ) : <p className="no-one-joined">Looking for a driver.</p>
          )}
        </div>
      </div>
      <div className="ride-actions">
        {isMyRide ? (
          <span className="your-post-label">This is your post</span>
        ) : isActionDone || isAlreadyInvolved ? (
          <div className="joined-success">
            <FiCheckCircle size={24} color="green" />
            <span>{ride.rideType === 'REQUESTED' ? 'Accepted' : 'Joined'}</span>
          </div>
        ) : isDriverFound ? (
          <span className="ride-full-label">This ride is full</span>
        ) : (
          <Button onClick={handleAction} disabled={isLoading}>
            {isLoading ? 'Processing...' : (ride.rideType === 'OFFERED' ? 'Request to Join' : 'Offer to Drive')}
          </Button>
        )}
      </div>
    </div>
  );
}

export default RideCard;