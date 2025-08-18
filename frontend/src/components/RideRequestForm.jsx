import React, { useState } from 'react';
import Input from './Input.jsx';
import Button from './Button.jsx';
import './RideRequestForm.css';
import axios from 'axios';

function RideRequestForm({ onRideCreated }) {
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [travelDateTime, setTravelDateTime] = useState('');
  const [rideType, setRideType] = useState('REQUESTED');

  const handleSubmit = async (event) => {
    event.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) {
      alert('You must be logged in to post a ride.');
      return;
    }

    try {
      await axios.post('http://localhost:8080/api/rides/request',
        { origin, destination, travelDateTime, rideType, isEmergency: false },
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );
      alert(`Ride ${rideType === 'REQUESTED' ? 'requested' : 'offered'} successfully!`);
      onRideCreated();
      
      setOrigin('');
      setDestination('');
      setTravelDateTime('');

    } catch (error) {
      alert('Failed to post ride.');
      console.error('Error posting ride:', error);
    }
  };

  return (
    <div className="ride-request-container">
      <div className="ride-type-toggle">
        <button
          className={rideType === 'REQUESTED' ? 'active' : ''}
          onClick={() => setRideType('REQUESTED')}
        >
          Request a Ride
        </button>
        <button
          className={rideType === 'OFFERED' ? 'active' : ''}
          onClick={() => setRideType('OFFERED')}
        >
          Offer a Ride
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        <Input
          type="text"
          placeholder="Enter pickup location"
          value={origin}
          onChange={(e) => setOrigin(e.target.value)}
        />
        <Input
          type="text"
          placeholder="Enter destination"
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
        />
        <Input
          type="datetime-local"
          value={travelDateTime}
          onChange={(e) => setTravelDateTime(e.target.value)}
        />
        <Button>Submit</Button>
      </form>
    </div>
  );
}

export default RideRequestForm;