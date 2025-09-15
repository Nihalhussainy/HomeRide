import React, { useState, useMemo } from 'react';
import './RideCard.css';
import Button from './Button.jsx';
import axios from 'axios';
import { useNotification } from '../context/NotificationContext.jsx';
import { 
    FiCheckCircle, 
    FiClock, 
    FiUser, 
    FiArrowRight, 
    FiUsers, 
    FiGitMerge,
    FiShield,
    FiTrash2,
    FiAlertTriangle,
    FiXCircle,
    FiMessageSquare
} from 'react-icons/fi';
import { FaCar, FaUserCircle } from 'react-icons/fa';
import PublicProfileModal from './PublicProfileModal.jsx';
import ChatBox from './ChatBox.jsx';
import ChatModal from './ChatModal.jsx';

function RideCard({ ride, currentUser, onActionSuccess }) {
  const [isLoading, setIsLoading] = useState(false);
  const [isActionDone, setIsActionDone] = useState(false);
  const { showNotification, showConfirmation } = useNotification();
  
  const [selectedProfileId, setSelectedProfileId] = useState(null);
  const [showChatModal, setShowChatModal] = useState(false);

  // Consolidated list of all unique participants, including the requester and driver
  const allParticipants = useMemo(() => {
    const participantsList = ride.participants.map(p => p.participant);
    if (ride.requester) {
        participantsList.push(ride.requester);
    }
    if (ride.driver) {
        participantsList.push(ride.driver);
    }
    const uniqueParticipantsMap = new Map();
    participantsList.forEach(p => uniqueParticipantsMap.set(p.id, p));
    
    return Array.from(uniqueParticipantsMap.values());
  }, [ride]);

  const isAlreadyInvolved = useMemo(() => {
    if (!currentUser || !ride) return false;
    return allParticipants.some(p => p.id === currentUser.id);
  }, [currentUser, allParticipants]);

  const handleViewProfile = (userId) => {
    setSelectedProfileId(userId);
  };
  
  const handleCloseModal = () => {
    setSelectedProfileId(null);
  };
  
  const handleOpenChat = () => {
      setShowChatModal(true);
  };

  const handleCloseChatModal = () => {
    setShowChatModal(false);
  };

  const handleDelete = () => {
    showConfirmation("Are you sure you want to delete this ride post?", async () => {
      const token = localStorage.getItem('token');
      try {
          await axios.delete(`http://localhost:8080/api/rides/${ride.id}`, {
              headers: { 'Authorization': `Bearer ${token}` }
          });
          showNotification("Ride deleted successfully.");
          onActionSuccess();
      } catch (error) {
          showNotification("Failed to delete ride. You may not be authorized.", 'error');
      }
    });
  };

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
      showNotification(errorMessage, 'error');
    } finally {
        setIsLoading(false);
    }
  };

  const isMyRide = currentUser?.id === ride.requester?.id;
  const isDriverFound = ride.rideType === 'REQUESTED' && ride.driver;
  const isRideFull = ride.rideType === 'OFFERED' 
    ? (ride.vehicleCapacity != null && ride.participants.length >= ride.vehicleCapacity)
    : isDriverFound;

  const hasDeparted = new Date(ride.travelDateTime) < new Date();

  let pastRideStatus = null;
  if (hasDeparted) {
    if (ride.rideType === 'REQUESTED' && !ride.driver) {
      pastRideStatus = (
        <div className="ride-status-cancelled">
          <FiXCircle />
          <span>Cancelled</span>
        </div>
      );
    } else {
      pastRideStatus = (
        <div className="ride-status-departed">
          <FiAlertTriangle />
          <span>Departed</span>
        </div>
      );
    }
  }

  return (
    <>
      <div className={`ride-card ${hasDeparted ? 'departed' : ''}`}>
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
            <div className="info-item" onClick={() => handleViewProfile(ride.requester.id)} style={{ cursor: 'pointer' }}>
              <FiUser />
              Posted by <span>{isMyRide ? 'You' : ride.requester?.name}</span>
            </div>
            {ride.vehicleModel && (
              <div className="info-item">
                <FaCar />
                <span>{ride.vehicleModel}</span>
              </div>
            )}
          </div>
          <div className="ride-actions">
            {/* UPDATED: We now conditionally render both buttons inside the same div */}
            {isMyRide && !pastRideStatus && (
              <>
                <Button onClick={handleOpenChat} className="chat-action-btn">
                  <FiMessageSquare />
                </Button>
                <Button onClick={handleDelete} className="secondary">
                  <FiTrash2 />
                </Button>
              </>
            )}
            {/* This handles the case where it's not my ride but I am involved */}
            {!isMyRide && isAlreadyInvolved && !pastRideStatus && (
              <Button onClick={handleOpenChat} className="chat-action-btn">
                  <FiMessageSquare />
              </Button>
            )}
            {!isMyRide && (
              pastRideStatus ? pastRideStatus : (
                isActionDone || isAlreadyInvolved ? (
                  <div className="ride-status-success">
                    <FiCheckCircle size={20} />
                    <span>{ride.rideType === 'REQUESTED' ? 'Accepted' : 'Joined'}</span>
                  </div>
                ) : isRideFull ? (
                  <span className="ride-status-label">Ride is full</span>
                ) : (
                  <Button onClick={handleAction} disabled={isLoading}>
                    {isLoading ? 'Processing...' : (ride.rideType === 'OFFERED' ? 'Request to Join' : 'Offer to Drive')}
                  </Button>
                )
              )
            )}
          </div>
        </div>

        <div className="ride-card-footer">
          <div className="participants-list">
            <strong><FiUsers /> 
              {ride.rideType === 'OFFERED' ? ' People in Car:' : ' People in Group:'}
            </strong>
              <div className="participants-pills">
                {ride.rideType === 'OFFERED' && (
                  <span className="participant-pill driver" onClick={() => handleViewProfile(ride.requester.id)}>
                    {ride.requester.profilePictureUrl ? (
                      <img src={ride.requester.profilePictureUrl} alt={ride.requester.name} />
                    ) : (
                      <FaUserCircle className="participant-icon" />
                    )}
                    {ride.requester.name} (Driver)
                  </span>
                )}
                {ride.rideType === 'REQUESTED' && (
                  <span className="participant-pill" onClick={() => handleViewProfile(ride.requester.id)}>
                    {ride.requester.profilePictureUrl ? (
                      <img src={ride.requester.profilePictureUrl} alt={ride.requester.name} />
                    ) : (
                      <FaUserCircle className="participant-icon" />
                    )}
                    {ride.requester.name} (Requester)
                  </span>
                )}
                {ride.participants.map(p => (
                  <span key={p.id} className="participant-pill" onClick={() => handleViewProfile(p.participant.id)}>
                    {p.participant.profilePictureUrl ? (
                      <img src={p.participant.profilePictureUrl} alt={p.participant.name} />
                    ) : (
                      <FaUserCircle className="participant-icon" />
                    )}
                    {p.participant.name}
                  </span>
                ))}
                {isDriverFound && (
                  <span className="participant-pill driver" onClick={() => handleViewProfile(ride.driver.id)}>
                    {ride.driver.profilePictureUrl ? (
                      <img src={ride.driver.profilePictureUrl} alt={ride.driver.name} />
                    ) : (
                      <FaUserCircle className="participant-icon" />
                    )}
                    {ride.driver.name} (Driver)
                  </span>
                )}
              </div>
          </div>
          <div className="ride-meta-info">
              {ride.vehicleCapacity != null && (
                  <div className="info-item">
                      <FiGitMerge />
                      <span>
                        {ride.participants.length} / {ride.vehicleCapacity} seats taken
                      </span>
                  </div>
              )}
              {ride.genderPreference && (
                  <div className="info-item">
                      <FiShield />
                      <span>{ride.genderPreference === 'FEMALE_ONLY' ? 'Female passengers only' : 'All genders welcome'}</span>
                  </div>
              )}
          </div>
        </div>

        {/* The chat button is now rendered inside the ride-actions div */}
        {/* We moved the conditional rendering logic above */}
      </div>
      
      {showChatModal && (
        <ChatModal
          ride={ride}
          currentUser={currentUser}
          participants={allParticipants}
          onClose={handleCloseChatModal}
        />
      )}
      
      {selectedProfileId && (
        <PublicProfileModal
          userId={selectedProfileId}
          onClose={handleCloseModal}
        />
      )}
    </>
  );
}

export default RideCard;
