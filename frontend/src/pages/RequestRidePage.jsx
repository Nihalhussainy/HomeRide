// import React, { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import Input from '../components/Input.jsx';
// import Button from '../components/Button.jsx';
// import AutocompleteInput from '../components/AutocompleteInput.jsx';
// import { useNotification } from '../context/NotificationContext.jsx';
// import './FormPage.css'; // Reusing the same stylesheet
// import axios from 'axios';
// import { FiMapPin, FiCalendar, FiShield, FiSend } from 'react-icons/fi';

// function RequestRidePage() {
//   const [origin, setOrigin] = useState('');
//   const [destination, setDestination] = useState('');
//   const [travelDateTime, setTravelDateTime] = useState('');
//   const [genderPreference, setGenderPreference] = useState('ALL');
//   const [isLoading, setIsLoading] = useState(false);

//   const { showNotification } = useNotification();
//   const navigate = useNavigate();
  
//   const getNowString = () => {
//     const now = new Date();
//     now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
//     return now.toISOString().slice(0, 16);
//   };

//   const handleSubmit = async (event) => {
//     event.preventDefault();
//     const token = localStorage.getItem('token');
    
//     if (!origin || !destination || !travelDateTime) {
//       showNotification('Please fill out all required fields.', 'error');
//       return;
//     }
//     if (new Date(travelDateTime) < new Date()) {
//       showNotification('You cannot request a ride for a past date or time.', 'error');
//       return;
//     }

//     setIsLoading(true);
    
//     const rideData = {
//       origin,
//       destination,
//       travelDateTime,
//       genderPreference,
//       rideType: 'REQUESTED', // This is the key difference
//     };

//     try {
//       await axios.post('http://localhost:8080/api/rides/request', rideData, {
//         headers: { 'Authorization': `Bearer ${token}` }
//       });
      
//       showNotification('Your ride request has been posted successfully!');
//       navigate('/requested-rides'); // Redirect to the requested rides list
      
//     } catch (error) {
//       showNotification(error.response?.data?.message || 'Failed to post request.', 'error');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <div className="main-container">
//       <header className="page-header">
//         <h1>Request a Ride</h1>
//         <p className="page-description">Let drivers know where you need to go.</p>
//       </header>

//       <div className="form-container">
//         <form onSubmit={handleSubmit}>
          
//           <div className="form-section">
//             <h3 className="form-section-title">Your Trip Details</h3>
//             <div className="form-grid">
//                 <div className="form-field">
//                     <label><FiMapPin /> Origin</label>
//                     <AutocompleteInput value={origin} onChange={setOrigin} placeholder="Where are you leaving from?" required />
//                 </div>
//                 <div className="form-field">
//                     <label><FiMapPin /> Destination</label>
//                     <AutocompleteInput value={destination} onChange={setDestination} placeholder="Where are you going?" required />
//                 </div>
//                  <div className="form-field">
//                     <label><FiCalendar /> Desired Departure Time</label>
//                     <Input type="datetime-local" value={travelDateTime} onChange={(e) => setTravelDateTime(e.target.value)} required min={getNowString()} />
//                 </div>
//             </div>
//           </div>

//            <div className="form-section">
//                 <h3 className="form-section-title">Preferences</h3>
//                 <div className="form-field">
//                      <label><FiShield /> Driver Preference</label>
//                       <select className="custom-input" value={genderPreference} onChange={(e) => setGenderPreference(e.target.value)}>
//                         <option value="ALL">Any Driver</option>
//                         <option value="FEMALE_ONLY">Female Driver Only</option>
//                       </select>
//                 </div>
//            </div>

//           <div className="form-actions">
//             <Button type="submit" disabled={isLoading}>
//               <FiSend />
//               {isLoading ? 'Posting Request...' : 'Post Request'}
//             </Button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// }

// export default RequestRidePage;

