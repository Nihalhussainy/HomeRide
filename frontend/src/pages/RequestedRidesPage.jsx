// import React, { useState, useEffect, useCallback } from 'react';
// import axios from 'axios';
// import RequestRideCard from '../components/RequestRideCard.jsx';
// import Button from '../components/Button.jsx';
// import Input from '../components/Input.jsx';
// import AutocompleteInput from '../components/AutocompleteInput.jsx';
// import { useNotification } from '../context/NotificationContext.jsx';
// import { FiSearch } from 'react-icons/fi';
// import '../App.css';

// const RIDES_PER_PAGE = 5;

// function RequestedRidesPage() {
//     const [allRides, setAllRides] = useState([]);
//     const [displayedRides, setDisplayedRides] = useState([]);
//     const [visibleCount, setVisibleCount] = useState(RIDES_PER_PAGE);
//     const [isLoading, setIsLoading] = useState(true);
//     const [error, setError] = useState('');
//     const [currentUser, setCurrentUser] = useState(null);

//     const [originFilter, setOriginFilter] = useState('');
//     const [destinationFilter, setDestinationFilter] = useState('');
//     const [dateFilter, setDateFilter] = useState('');

//     const { showNotification } = useNotification();

//     const fetchData = useCallback(async () => {
//         const token = localStorage.getItem('token');
//         if (!token) {
//             setError("Authentication token not found.");
//             setIsLoading(false);
//             return;
//         }

//         setIsLoading(true);
//         try {
//             const config = { headers: { 'Authorization': `Bearer ${token}` } };
//             const [ridesResponse, userResponse] = await Promise.all([
//                 axios.get('http://localhost:8080/api/rides', { ...config, params: { rideType: 'REQUESTED' } }),
//                 axios.get('http://localhost:8080/api/employees/me', config)
//             ]);

//             const sortedRides = ridesResponse.data.sort((a, b) => new Date(a.travelDateTime) - new Date(b.travelDateTime));
//             setAllRides(sortedRides);
//             setCurrentUser(userResponse.data);

//         } catch (err) {
//             setError('Failed to fetch data. Please try again later.');
//         } finally {
//             setIsLoading(false);
//         }
//     }, []);

//     useEffect(() => {
//         fetchData();
//     }, [fetchData]);

//     useEffect(() => {
//         let filtered = [...allRides];
//         if (originFilter) filtered = filtered.filter(ride => ride.origin.toLowerCase().includes(originFilter.toLowerCase()));
//         if (destinationFilter) filtered = filtered.filter(ride => ride.destination.toLowerCase().includes(destinationFilter.toLowerCase()));
//         if (dateFilter) filtered = filtered.filter(ride => ride.travelDateTime.startsWith(dateFilter));
        
//         setDisplayedRides(filtered.slice(0, visibleCount));
//     }, [allRides, originFilter, destinationFilter, dateFilter, visibleCount]);

//     const handleAcceptRequest = async (rideId) => {
//         const token = localStorage.getItem('token');
//         try {
//             await axios.post(`http://localhost:8080/api/rides/${rideId}/accept`, {}, {
//                 headers: { 'Authorization': `Bearer ${token}` }
//             });
//             showNotification('You have accepted the ride request!');
//             fetchData(); // Refresh data to show the updated status
//         } catch (error) {
//             showNotification(error.response?.data?.message || 'Failed to accept request.', 'error');
//         }
//     };

//     const handleLoadMore = () => setVisibleCount(prev => prev + RIDES_PER_PAGE);

//     return (
//         <div className="main-container">
//             <header className="page-header">
//                 <h1>Ride Requests</h1>
//                 <p className="page-description">Help a colleague out by offering them a ride.</p>
//             </header>
            
//             <div className="filter-container">
//                 <form onSubmit={(e) => e.preventDefault()} className="filter-form">
//                     <AutocompleteInput value={originFilter} onChange={setOriginFilter} placeholder="From..." />
//                     <AutocompleteInput value={destinationFilter} onChange={setDestinationFilter} placeholder="To..." />
//                     <Input type="date" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} />
//                     <Button type="submit"><FiSearch/> Filter</Button>
//                 </form>
//             </div>

//             <div className="rides-list-container">
//                 {isLoading ? <p>Loading requests...</p> : 
//                  error ? <p className="error-message">{error}</p> : 
//                  displayedRides.length > 0 ? (
//                     <>
//                         {displayedRides.map(ride => (
//                             <RequestRideCard 
//                                 key={ride.id} 
//                                 ride={ride} 
//                                 onAccept={handleAcceptRequest}
//                                 currentUser={currentUser}
//                             />
//                         ))}
//                         {displayedRides.length < allRides.filter(r => 
//                             (!originFilter || r.origin.toLowerCase().includes(originFilter.toLowerCase())) &&
//                             (!destinationFilter || r.destination.toLowerCase().includes(destinationFilter.toLowerCase())) &&
//                             (!dateFilter || r.travelDateTime.startsWith(dateFilter))
//                         ).length && (
//                              <div className="load-more-container">
//                                 <Button onClick={handleLoadMore}>Load More</Button>
//                             </div>
//                         )}
//                     </>
//                 ) : (
//                     <div className="no-results">
//                         <h3>No Ride Requests Found</h3>
//                         <p>There are no active ride requests matching your filters.</p>
//                     </div>
//                 )}
//             </div>
//         </div>
//     );
// }

// export default RequestedRidesPage;

