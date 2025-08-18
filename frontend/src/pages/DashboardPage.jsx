import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button.jsx';
import RideCard from '../components/RideCard.jsx';
import RideRequestForm from '../components/RideRequestForm.jsx';
import '../App.css';
import axios from 'axios';

function DashboardPage() {
  const [currentUser, setCurrentUser] = useState(null);
  const [offeredRides, setOfferedRides] = useState([]);
  const [requestedRides, setRequestedRides] = useState([]);
  const navigate = useNavigate();

  const fetchData = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    try {
      const config = { headers: { 'Authorization': `Bearer ${token}` } };
      const [userResponse, ridesResponse] = await Promise.all([
        axios.get('http://localhost:8080/api/employees/me', config),
        axios.get('http://localhost:8080/api/rides', config)
      ]);
      setCurrentUser(userResponse.data);
      setOfferedRides(ridesResponse.data.filter(ride => ride.rideType === 'OFFERED'));
      setRequestedRides(ridesResponse.data.filter(ride => ride.rideType === 'REQUESTED'));
    } catch (error) {
      console.error('Failed to fetch data:', error);
      navigate('/login');
    }
  }, [navigate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);
  
  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
    window.location.reload();
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Welcome, {currentUser ? currentUser.name : 'User'}!</h1>
        
      </header>
      <main>
        <RideRequestForm onRideCreated={fetchData} />
        <div className="ride-lists-container">
          <div className="ride-list">
            <h2>Rides Offered (You can join)</h2>
            {offeredRides.map((ride) => (
              <RideCard key={ride.id} ride={ride} currentUser={currentUser} onActionSuccess={fetchData} />
            ))}
          </div>
          <div className="ride-list">
            <h2>Rides Requested (Looking for drivers)</h2>
            {requestedRides.map((ride) => (
              <RideCard key={ride.id} ride={ride} currentUser={currentUser} onActionSuccess={fetchData} />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

export default DashboardPage;