import React, { useState, useMemo } from 'react';
import './RideCard.css';
import Button from './Button.jsx';
import axios from 'axios';
import { FiCheckCircle, FiClock, FiUser, FiArrowRight, FiUsers } from 'react-icons/fi';

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
      setTimeout(() => onActionSuccess(), 1500); // Give user time to see success state
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Action failed. You might have already joined or the ride is full.';
      alert(errorMessage); // We can replace this with a toast notification later
    } finally {
      setIsLoading(false);
    }
  };

  const isMyRide = currentUser?.id === ride.requester?.id;
  const isDriverFound = ride.rideType === 'REQUESTED' && ride.driver;

  return (
    <div className="ride-card">
      <div className="ride-card-header">
        <div className="ride-path">
          <h3>
            {ride.origin} <FiArrowRight className="ride-path-icon" /> {ride.destination}
          </h3>
        </div>
        <span className={`ride-type-badge ${ride.rideType}`}>{ride.rideType}</span>
      </div>

      <div className="ride-card-body">
        <div className="ride-info">
          <div className="info-item">
            <FiClock />
            <span>{new Date(ride.travelDateTime).toLocaleString()}</span>
          </div>
          <div className="info-item">
            <FiUser />
            Posted by <span>{isMyRide ? 'You' : ride.requester?.name}</span>
          </div>
        </div>
        <div className="ride-actions">
          {isMyRide ? (
            <span className="ride-status-label">This is your post</span>
          ) : isActionDone || isAlreadyInvolved ? (
            <div className="ride-status-success">
              <FiCheckCircle size={20} />
              <span>{ride.rideType === 'REQUESTED' ? 'Accepted' : 'Joined'}</span>
            </div>
          ) : isDriverFound ? (
            <span className="ride-status-label">Ride is full</span>
          ) : (
            <Button onClick={handleAction} disabled={isLoading}>
              {isLoading ? 'Processing...' : (ride.rideType === 'OFFERED' ? 'Request to Join' : 'Offer to Drive')}
            </Button>
          )}
        </div>
      </div>

      <div className="ride-card-footer">
        <div className="participants-list">
          <strong><FiUsers /> {ride.rideType === 'OFFERED' ? 'Passengers:' : 'Driver:'}</strong>
          {ride.rideType === 'OFFERED' ? (
            ride.participants?.length > 0 ? (
              <div className="participants-pills">
                {ride.participants.map(p => <span key={p.id} className="participant-pill">{p.participant.name}</span>)}
              </div>
            ) : <p className="no-participants">No passengers have joined yet.</p>
          ) : (
            isDriverFound ? (
              <div className="participants-pills">
                <span className="participant-pill">{ride.driver.name}</span>
              </div>
            ) : <p className="no-participants">Looking for a driver.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default RideCard;
