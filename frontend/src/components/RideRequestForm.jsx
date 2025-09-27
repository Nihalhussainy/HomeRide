import React, { useState } from 'react';
import Input from './Input.jsx';
import Button from './Button.jsx';
import { useNotification } from '../context/NotificationContext.jsx';
import './RideRequestForm.css';
import axios from 'axios';
import { FaPlusCircle, FaMinusCircle, FaPlus } from 'react-icons/fa';

function RideRequestForm({ onRideCreated }) {
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [travelDateTime, setTravelDateTime] = useState('');
  const [rideType, setRideType] = useState('REQUESTED');
  
  const [vehicleModel, setVehicleModel] = useState('');
  const [vehicleCapacity, setVehicleCapacity] = useState('');
  const [genderPreference, setGenderPreference] = useState('ALL');
  
  // NEW: State for optional stops
  const [stops, setStops] = useState(['']);

  const [isLoading, setIsLoading] = useState(false);
  const { showNotification } = useNotification();

  // Function to handle changes to a stop input field
  const handleStopChange = (index, value) => {
    const newStops = [...stops];
    newStops[index] = value;
    setStops(newStops);
  };

  // Function to add a new stop input field
  const handleAddStop = () => {
    setStops([...stops, '']);
  };

  // Function to remove a stop input field
  const handleRemoveStop = (index) => {
    const newStops = stops.filter((_, i) => i !== index);
    setStops(newStops);
  };
  
  const getNowString = () => {
    const now = new Date();
    // Adjust for the local timezone offset
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    // Format to the 'YYYY-MM-DDTHH:mm' string required by the input
    return now.toISOString().slice(0, 16);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const token = localStorage.getItem('token');
    
    if (!token) {
      showNotification('You must be logged in to post a ride.', 'error');
      return;
    }
    if (!origin || !destination || !travelDateTime) {
      showNotification('Please fill out all required fields.', 'error');
      return;
    }

    const selectedDate = new Date(travelDateTime);
    if (selectedDate < new Date()) {
      showNotification('You cannot schedule a ride for a past date or time.', 'error');
      return;
    }

    setIsLoading(true);
    
    // Filter out any empty stop inputs
    const filteredStops = stops.filter(stop => stop.trim() !== '');

    const rideData = {
      origin,
      destination,
      travelDateTime,
      rideType,
      genderPreference,
      isEmergency: false,
      vehicleModel: rideType === 'OFFERED' ? vehicleModel : null,
      vehicleCapacity: rideType === 'OFFERED' ? parseInt(vehicleCapacity) : null,
      stops: rideType === 'OFFERED' ? filteredStops : [],
    };

    try {
      await axios.post('http://localhost:8080/api/rides/request', rideData, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      showNotification(`Your ride has been posted successfully!`);
      onRideCreated();
      
      setOrigin('');
      setDestination('');
      setTravelDateTime('');
      setVehicleModel('');
      setVehicleCapacity('');
      setGenderPreference('ALL');
      setStops(['']); // Reset stops
    } catch (error) {
      showNotification('Failed to post ride. Please try again.', 'error');
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
        
        {/* NEW: Optional Stops Section */}
        {rideType === 'OFFERED' && (
          <div className="optional-stops-container">
            <h4 className="optional-stops-title">Optional Stops</h4>
            {stops.map((stop, index) => (
              <div key={index} className="stop-input-group">
                <Input
                  type="text"
                  placeholder={`Stop ${index + 1}`}
                  value={stop}
                  onChange={(e) => handleStopChange(index, e.target.value)}
                />
                {stops.length > 1 && (
                  <button type="button" onClick={() => handleRemoveStop(index)} className="remove-stop-btn">
                    <FaMinusCircle />
                  </button>
                )}
              </div>
            ))}
            <button type="button" onClick={handleAddStop} className="add-stop-btn">
              <FaPlus /> Add another stop
            </button>
          </div>
        )}

        <Input
          type="datetime-local"
          value={travelDateTime}
          onChange={(e) => setTravelDateTime(e.target.value)}
          required
          min={getNowString()}
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
          <label htmlFor="gender-pref" className="input-label">Passenger Preference</label>
          <select
            id="gender-pref"
            className="custom-input custom-select"
            value={genderPreference}
            onChange={(e) => setGenderPreference(e.target.value)}
          >
            <option value="ALL">All Genders Welcome</option>
            <option value="FEMALE_ONLY">Female Passengers Only</option>
          </select>
        </div>

        <Button type="submit" disabled={isLoading}>
          <FaPlusCircle />
          {isLoading ? 'Posting...' : 'Post Your Ride'}
        </Button>
      </form>
    </div>
  );
}

export default RideRequestForm;
