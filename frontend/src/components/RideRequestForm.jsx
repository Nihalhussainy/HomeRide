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
  
  const [vehicleModel, setVehicleModel] = useState('');
  const [vehicleCapacity, setVehicleCapacity] = useState('');
  const [genderPreference, setGenderPreference] = useState('ALL');

  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) {
      alert('You must be logged in to post a ride.');
      return;
    }
    if (!origin || !destination || !travelDateTime) {
      alert('Please fill out all required fields.');
      return;
    }

    setIsLoading(true);

    const rideData = {
      origin,
      destination,
      travelDateTime,
      rideType,
      genderPreference,
      isEmergency: false,
      vehicleModel: rideType === 'OFFERED' ? vehicleModel : null,
      vehicleCapacity: rideType === 'OFFERED' ? parseInt(vehicleCapacity) : null,
    };

    try {
      await axios.post('http://localhost:8080/api/rides/request', rideData, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      alert(`Your ride has been posted successfully!`);
      onRideCreated();
      
      setOrigin('');
      setDestination('');
      setTravelDateTime('');
      setVehicleModel('');
      setVehicleCapacity('');
      setGenderPreference('ALL');

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
        <div className="form-grid">
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
        </div>
        <Input
          type="datetime-local"
          value={travelDateTime}
          onChange={(e) => setTravelDateTime(e.target.value)}
          required
        />

        {rideType === 'OFFERED' && (
          <div className="form-grid">
            <Input
              type="text"
              placeholder="Vehicle Model (e.g., Toyota Camry)"
              value={vehicleModel}
              onChange={(e) => setVehicleModel(e.target.value)}
              required
            />
            <Input
              type="number"
              placeholder="Available Seats"
              value={vehicleCapacity}
              onChange={(e) => setVehicleCapacity(e.target.value)}
              required
              min="1"
            />
          </div>
        )}
        
        <div className="input-wrapper">
          <label htmlFor="gender-pref" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '8px', display: 'block' }}>Passenger Preference</label>
          <select
            id="gender-pref"
            className="custom-input"
            value={genderPreference}
            onChange={(e) => setGenderPreference(e.target.value)}
            style={{ appearance: 'none' }}
          >
            <option value="ALL">All Genders Welcome</option>
            <option value="FEMALE_ONLY">Female Passengers Only</option>
          </select>
        </div>

        {/* FIX: Added type="submit" to the button */}
        <Button type="submit" disabled={isLoading}>
          <FaPlusCircle />
          {isLoading ? 'Posting...' : 'Post Your Ride'}
        </Button>
      </form>
    </div>
  );
}

export default RideRequestForm;
