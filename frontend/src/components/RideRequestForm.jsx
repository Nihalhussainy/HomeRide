import React, { useState } from 'react';
import Input from './Input.jsx';
import Button from './Button.jsx';
import './RideRequestForm.css';
import axios from 'axios';
import { FaPlusCircle } from 'react-icons/fa';

function RideRequestForm({ onRideCreated }) {
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [travelDateTime, setTravelDateTime] = useState('');
  const [rideType, setRideType] = useState('REQUESTED');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) {
      alert('You must be logged in to post a ride.');
      return;
    }
    if (!origin || !destination || !travelDateTime) {
      alert('Please fill out all fields.');
      return;
    }

    setIsLoading(true);
    try {
      await axios.post('http://localhost:8080/api/rides/request',
        { origin, destination, travelDateTime, rideType, isEmergency: false },
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );
      // We'll replace this with a better notification later
      alert(`Your ride has been posted successfully!`);
      onRideCreated();
      
      // Reset form
      setOrigin('');
      setDestination('');
      setTravelDateTime('');

    } catch (error) {
      alert('Failed to post ride. Please try again.');
      console.error('Error posting ride:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="ride-request-container">
      <div className="ride-type-toggle">
        <button
          className={rideType === 'REQUESTED' ? 'active' : ''}
          onClick={() => setRideType('REQUESTED')}
        >
          I Need a Ride
        </button>
        <button
          className={rideType === 'OFFERED' ? 'active' : ''}
          onClick={() => setRideType('OFFERED')}
        >
          I'm Offering a Drive
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        <Input
          type="text"
          placeholder="From (e.g., Downtown)"
          value={origin}
          onChange={(e) => setOrigin(e.target.value)}
          required
        />
        <Input
          type="text"
          placeholder="To (e.g., Airport)"
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
          required
        />
        <Input
          type="datetime-local"
          value={travelDateTime}
          onChange={(e) => setTravelDateTime(e.target.value)}
          required
        />
        <Button disabled={isLoading}>
          <FaPlusCircle />
          {isLoading ? 'Posting...' : 'Post Your Ride'}
        </Button>
      </form>
    </div>
  );
}

export default RideRequestForm;
