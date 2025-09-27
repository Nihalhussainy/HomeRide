import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import RideCard from '../components/RideCard.jsx';
import RideRequestForm from '../components/RideRequestForm.jsx';
import '../App.css';
import axios from 'axios';

function DashboardPage() {
  const [currentUser, setCurrentUser] = useState(null);
  const [rides, setRides] = useState([]);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const navigate = useNavigate();

  const fetchData = useCallback(async (isFirstLoad = false) => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    if (isFirstLoad) {
      setIsInitialLoading(true);
    }

    try {
      const config = { 
        headers: { 'Authorization': `Bearer ${token}` }
      };
      
      const [userResponse, ridesResponse] = await Promise.all([
        axios.get('http://localhost:8080/api/employees/me', config),
        axios.get('http://localhost:8080/api/rides', config)
      ]);
      setCurrentUser(userResponse.data);
      setRides(ridesResponse.data);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      localStorage.removeItem('token');
      navigate('/login');
    } finally {
      if (isFirstLoad) {
        setIsInitialLoading(false);
      }
    }
  }, [navigate]);

  useEffect(() => {
    fetchData(true);
  }, [fetchData]);

  const offeredRides = rides
    .filter(ride => ride.rideType === 'OFFERED')
    .sort((a, b) => b.id - a.id);

  const requestedRides = rides
    .filter(ride => ride.rideType === 'REQUESTED')
    .sort((a, b) => b.id - a.id);

  return (
    <div className="main-container">
      <header className="page-header">
        <h1>Welcome, {currentUser ? currentUser.name : '...'}!</h1>
      </header>
      <main>
        <RideRequestForm onRideCreated={fetchData} />
        
        {isInitialLoading ? (
          <p>Loading rides...</p>
        ) : (
          <div className="ride-lists-container">
            <div className="ride-list">
              <h2>Rides Offered</h2>
              {offeredRides.length > 0 ? (
                offeredRides.map((ride) => (
                  <RideCard key={ride.id} ride={ride} currentUser={currentUser} onActionSuccess={fetchData} />
                ))
              ) : (
                <p>No rides are being offered right now.</p>
              )}
            </div>
            <div className="ride-list">
              <h2>Rides Requested</h2>
              {requestedRides.length > 0 ? (
                requestedRides.map((ride) => (
                  <RideCard key={ride.id} ride={ride} currentUser={currentUser} onActionSuccess={fetchData} />
                ))
              ) : (
                <p>No one is requesting a ride right now.</p>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default DashboardPage;