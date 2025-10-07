import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Input from '../components/Input.jsx';
import Button from '../components/Button.jsx';
import AutocompleteInput from '../components/AutocompleteInput.jsx';
import { useNotification } from '../context/NotificationContext.jsx';
import './FormPage.css';
import axios from 'axios';
import { FiPlus, FiMinusCircle, FiMapPin, FiCalendar, FiUsers, FiDollarSign, FiShield, FiSend, FiMessageSquare } from 'react-icons/fi';

function OfferRidePage() {
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [travelDateTime, setTravelDateTime] = useState('');
  const [vehicleModel, setVehicleModel] = useState('');
  const [vehicleCapacity, setVehicleCapacity] = useState('');
  const [price, setPrice] = useState('');
  const [genderPreference, setGenderPreference] = useState('ALL');
  const [driverNote, setDriverNote] = useState('');
  const [stops, setStops] = useState(['']);
  const [isLoading, setIsLoading] = useState(false);

  const dateTimeInputRef = useRef(null);

  const { showNotification } = useNotification();
  const navigate = useNavigate();

  const handleStopChange = (index, value) => {
    const newStops = [...stops];
    newStops[index] = value;
    setStops(newStops);
  };

  const handleAddStop = () => setStops([...stops, '']);
  const handleRemoveStop = (index) => setStops(stops.filter((_, i) => i !== index));
  
  const getNowString = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  };

  const handleDateTimeClick = () => {
    try {
      dateTimeInputRef.current?.showPicker();
    } catch (err) {
      dateTimeInputRef.current?.focus();
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const token = localStorage.getItem('token');
    
    if (!origin || !destination || !travelDateTime || !vehicleModel || !vehicleCapacity || !price) {
      showNotification('Please fill out all required fields.', 'error');
      return;
    }
    if (new Date(travelDateTime) < new Date()) {
      showNotification('You cannot schedule a ride for a past date or time.', 'error');
      return;
    }

    setIsLoading(true);
    
    const rideData = {
      origin,
      destination,
      travelDateTime,
      vehicleModel,
      vehicleCapacity: parseInt(vehicleCapacity),
      price: parseFloat(price),
      genderPreference,
      driverNote: driverNote.trim() || null,
      stops: stops.filter(stop => stop.trim() !== ''),
      rideType: 'OFFERED',
    };

    try {
      await axios.post('http://localhost:8080/api/rides/request', rideData, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      showNotification('Your ride has been offered successfully!');
      navigate('/offered-rides');
      
    } catch (error) {
      showNotification(error.response?.data?.message || 'Failed to post ride.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      padding: '40px 20px 80px',
      background: `
        radial-gradient(circle at 20% 50%, rgba(59, 130, 246, 0.05) 0%, transparent 50%),
        radial-gradient(circle at 80% 80%, rgba(139, 92, 246, 0.05) 0%, transparent 50%),
        radial-gradient(circle at 40% 20%, rgba(236, 72, 153, 0.03) 0%, transparent 50%),
        var(--background-color)
      `,
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Animated background elements */}
      <div style={{
        position: 'absolute',
        top: '10%',
        left: '5%',
        width: '300px',
        height: '300px',
        background: 'radial-gradient(circle, rgba(59, 130, 246, 0.08) 0%, transparent 70%)',
        borderRadius: '50%',
        filter: 'blur(40px)',
        animation: 'float 20s ease-in-out infinite',
        pointerEvents: 'none'
      }} />
      
      <div style={{
        position: 'absolute',
        bottom: '15%',
        right: '10%',
        width: '400px',
        height: '400px',
        background: 'radial-gradient(circle, rgba(139, 92, 246, 0.06) 0%, transparent 70%)',
        borderRadius: '50%',
        filter: 'blur(50px)',
        animation: 'float 25s ease-in-out infinite reverse',
        pointerEvents: 'none'
      }} />

      <style>
        {`
          @keyframes float {
            0%, 100% {
              transform: translate(0, 0) scale(1);
            }
            33% {
              transform: translate(30px, -30px) scale(1.1);
            }
            66% {
              transform: translate(-20px, 20px) scale(0.9);
            }
          }
        `}
      </style>

      <div style={{
        maxWidth: '800px',
        margin: '0 auto',
        position: 'relative',
        zIndex: 1
      }}>
        <header style={{
          textAlign: 'center',
          marginBottom: '50px'
        }}>
          <h1 style={{
            fontSize: '32px',
            fontWeight: '700',
            marginBottom: '12px',
            background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            Offer a Ride
          </h1>
          <p style={{
            fontSize: '16px',
            color: 'var(--text-secondary)',
            maxWidth: '600px',
            margin: '0 auto'
          }}>
            Share your journey and split the costs with colleagues
          </p>
        </header>

        <div style={{
          background: 'linear-gradient(135deg, var(--surface-color) 0%, rgba(255, 255, 255, 0.02) 100%)',
          border: '1px solid var(--surface-color-light)',
          borderRadius: '20px',
          padding: '40px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
          backdropFilter: 'blur(10px)'
        }}>
          <form onSubmit={handleSubmit}>
            
            <div className="form-section" style={{ marginBottom: '32px' }}>
              <h3 style={{
                fontSize: '18px',
                fontWeight: '600',
                marginBottom: '20px',
                color: 'var(--text-primary)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <FiMapPin style={{ color: '#3b82f6' }} /> Route Details
              </h3>
              <div className="form-grid" style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '20px'
              }}>
                <div className="form-field">
                  <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    marginBottom: '10px',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: 'var(--text-secondary)'
                  }}>
                    <FiMapPin size={16} /> Origin
                  </label>
                  <AutocompleteInput value={origin} onChange={setOrigin} placeholder="e.g., Main Office" required />
                </div>
                <div className="form-field">
                  <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    marginBottom: '10px',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: 'var(--text-secondary)'
                  }}>
                    <FiMapPin size={16} /> Destination
                  </label>
                  <AutocompleteInput value={destination} onChange={setDestination} placeholder="e.g., City Center" required />
                </div>
              </div>
            </div>

            <div className="form-section" style={{ marginBottom: '32px' }}>
              <h3 style={{
                fontSize: '18px',
                fontWeight: '600',
                marginBottom: '20px',
                color: 'var(--text-primary)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <FiMapPin style={{ color: '#8b5cf6' }} /> Intermediate Stops <span style={{ fontSize: '14px', fontWeight: '400', color: 'var(--text-secondary)' }}>(Optional)</span>
              </h3>
              {stops.map((stop, index) => (
                <div key={index} className="stop-input-group" style={{
                  display: 'flex',
                  gap: '12px',
                  marginBottom: '12px',
                  alignItems: 'center'
                }}>
                  <div style={{ flex: 1 }}>
                    <AutocompleteInput
                      placeholder={`Stop ${index + 1}`}
                      value={stop}
                      onChange={(value) => handleStopChange(index, value)}
                    />
                  </div>
                  {stops.length > 1 && (
                    <button 
                      type="button" 
                      onClick={() => handleRemoveStop(index)} 
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#ef4444',
                        cursor: 'pointer',
                        padding: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: '8px',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
                        e.currentTarget.style.transform = 'scale(1.1)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.transform = 'scale(1)';
                      }}
                    >
                      <FiMinusCircle size={20} />
                    </button>
                  )}
                </div>
              ))}
              <button 
                type="button" 
                onClick={handleAddStop} 
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 20px',
                  background: 'rgba(59, 130, 246, 0.1)',
                  border: '1px solid rgba(59, 130, 246, 0.3)',
                  borderRadius: '10px',
                  color: '#3b82f6',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(59, 130, 246, 0.2)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(59, 130, 246, 0.1)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <FiPlus /> Add another stop
              </button>
            </div>

            <div className="form-section" style={{ marginBottom: '32px' }}>
              <h3 style={{
                fontSize: '18px',
                fontWeight: '600',
                marginBottom: '20px',
                color: 'var(--text-primary)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <FiCalendar style={{ color: '#ec4899' }} /> Schedule & Vehicle
              </h3>
              <div className="form-grid" style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '20px'
              }}>
                <div className="form-field">
                  <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    marginBottom: '10px',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: 'var(--text-secondary)'
                  }}>
                    <FiCalendar size={16} /> Departure Time
                  </label>
                  <div onClick={handleDateTimeClick} style={{ cursor: 'pointer' }}>
                    <input
                      ref={dateTimeInputRef}
                      type="datetime-local"
                      className="custom-input"
                      value={travelDateTime}
                      onChange={(e) => setTravelDateTime(e.target.value)}
                      required
                      min={getNowString()}
                      style={{ width: '100%', cursor: 'pointer' }}
                    />
                  </div>
                </div>
                <div className="form-field">
                  <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    marginBottom: '10px',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: 'var(--text-secondary)'
                  }}>
                    Vehicle Model
                  </label>
                  <Input type="text" placeholder="e.g., Toyota Camry" value={vehicleModel} onChange={(e) => setVehicleModel(e.target.value)} required />
                </div>
                <div className="form-field">
                  <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    marginBottom: '10px',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: 'var(--text-secondary)'
                  }}>
                    <FiUsers size={16} /> Available Seats
                  </label>
                  <Input type="number" placeholder="e.g., 3" value={vehicleCapacity} onChange={(e) => setVehicleCapacity(e.target.value)} required min="1" />
                </div>
                <div className="form-field">
                  <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    marginBottom: '10px',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: 'var(--text-secondary)'
                  }}>
                    <FiDollarSign size={16} /> Price per Seat (₹)
                  </label>
                  <Input type="number" placeholder="e.g., 450.00" value={price} onChange={(e) => setPrice(e.target.value)} required min="0" step="0.01" />
                </div>
              </div>
            </div>

            <div className="form-section" style={{ marginBottom: '32px' }}>
              <h3 style={{
                fontSize: '18px',
                fontWeight: '600',
                marginBottom: '20px',
                color: 'var(--text-primary)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <FiShield style={{ color: '#10b981' }} /> Preferences
              </h3>
              <div className="form-field">
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  marginBottom: '10px',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: 'var(--text-secondary)'
                }}>
                  <FiShield size={16} /> Passenger Preference
                </label>
                <select 
                  className="custom-input" 
                  value={genderPreference} 
                  onChange={(e) => setGenderPreference(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '10px',
                    border: '1px solid var(--surface-color-light)',
                    background: 'var(--surface-color)',
                    color: 'var(--text-primary)',
                    fontSize: '14px'
                  }}
                >
                  <option value="ALL">All Genders Welcome</option>
                  <option value="FEMALE_ONLY">Female Passengers Only</option>
                </select>
              </div>
            </div>

            <div className="form-section" style={{ marginBottom: '32px' }}>
              <h3 style={{
                fontSize: '18px',
                fontWeight: '600',
                marginBottom: '20px',
                color: 'var(--text-primary)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <FiMessageSquare style={{ color: '#f59e0b' }} /> Additional Information <span style={{ fontSize: '14px', fontWeight: '400', color: 'var(--text-secondary)' }}>(Optional)</span>
              </h3>
              <div className="form-field">
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  marginBottom: '10px',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: 'var(--text-secondary)'
                }}>
                  <FiMessageSquare size={16} /> Driver's Note
                </label>
                <textarea 
                  className="custom-input"
                  placeholder="e.g., I prefer no smoking in the car. I'll be leaving sharp at the mentioned time."
                  value={driverNote}
                  onChange={(e) => setDriverNote(e.target.value)}
                  rows="4"
                  style={{ 
                    resize: 'vertical', 
                    fontFamily: 'inherit',
                    width: '100%',
                    padding: '12px',
                    borderRadius: '10px',
                    border: '1px solid var(--surface-color-light)',
                    background: 'var(--surface-color)',
                    color: 'var(--text-primary)',
                    fontSize: '14px'
                  }}
                />
                <small style={{ 
                  display: 'block', 
                  marginTop: '8px', 
                  color: 'var(--text-secondary)', 
                  fontSize: '0.85rem' 
                }}>
                  Share any preferences or important information with potential passengers
                </small>
              </div>
            </div>

            <div className="form-actions" style={{
              display: 'flex',
              justifyContent: 'center',
              marginTop: '40px'
            }}>
              <Button 
                type="submit" 
                disabled={isLoading}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '14px 40px',
                  fontSize: '16px',
                  fontWeight: '600',
                  background: isLoading ? 'var(--surface-color-light)' : 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                  border: 'none',
                  borderRadius: '12px',
                  color: 'white',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 16px rgba(59, 130, 246, 0.3)'
                }}
                onMouseEnter={(e) => {
                  if (!isLoading) {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 6px 24px rgba(59, 130, 246, 0.4)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isLoading) {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 16px rgba(59, 130, 246, 0.3)';
                  }
                }}
              >
                <FiSend />
                {isLoading ? 'Posting Ride...' : 'Offer Ride'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default OfferRidePage;