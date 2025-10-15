// src/components/BookingConfirmationModal.jsx
import React, { useState } from 'react';
import { FaWhatsapp } from 'react-icons/fa';
import { FiX, FiMapPin, FiNavigation } from 'react-icons/fi';
import './BookingConfirmationModal.css';

const BookingConfirmationModal = ({ 
  ride, 
  pickupPoint, 
  dropoffPoint, 
  pickupCity,
  dropoffCity,
  segmentPrice, 
  driver,
  onConfirm, 
  onClose,
  isLoading 
}) => {
  const [message, setMessage] = useState('');

  const formatTime = (dateTime) => {
    return new Date(dateTime).toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit', 
      hour12: false 
    });
  };

  const formatDate = (dateTime) => {
    return new Date(dateTime).toLocaleDateString('en-US', { 
      weekday: 'short', 
      day: 'numeric', 
      month: 'short' 
    });
  };

  const calculateArrivalTime = () => {
    const baseTime = new Date(ride.travelDateTime);
    const totalDuration = ride.duration || 0;
    return new Date(baseTime.getTime() + (totalDuration * 60000));
  };

  const handleWhatsAppContact = () => {
    if (driver && driver.phoneNumber) {
      const phoneNumber = driver.phoneNumber.replace(/\D/g, '');
      const defaultMessage = message || `Hello, I've just booked your ride from ${pickupCity} to ${dropoffCity}. Looking forward to traveling with you!`;
      const whatsappUrl = `https://wa.me/91${phoneNumber}?text=${encodeURIComponent(defaultMessage)}`;
      window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="booking-modal-overlay" onClick={onClose}>
      <div className="booking-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="booking-modal-header">
          <h2>Book now and secure your seat</h2>
          <button className="booking-close-btn" onClick={onClose}>
            <FiX />
          </button>
        </div>

        <div className="booking-modal-body">
          {/* Trip Details */}
          <div className="booking-section">
            <h3 className="booking-date">{formatDate(ride.travelDateTime)}</h3>
            
            <div className="booking-route">
              <div className="route-point">
                <div className="route-time">{formatTime(ride.travelDateTime)}</div>
                <div className="route-icon origin">
                  <FiMapPin />
                </div>
                <div className="route-location">{pickupCity}</div>
              </div>

              <div className="route-connector"></div>

              <div className="route-point">
                <div className="route-time">{formatTime(calculateArrivalTime())}</div>
                <div className="route-icon destination">
                  <FiNavigation />
                </div>
                <div className="route-location">{dropoffCity}</div>
              </div>
            </div>
          </div>

          {/* Price Summary */}
          <div className="booking-section">
            <h3 className="section-title">Price summary</h3>
            <div className="price-summary">
              <div className="price-row">
                <span className="price-label">1 seat: ₹{segmentPrice?.toFixed(2)}</span>
                <span className="payment-method">Cash</span>
              </div>
              <p className="payment-note">Pay in the car</p>
            </div>
          </div>

          {/* Message Section */}
          <div className="booking-section">
            <h3 className="section-title">
              Send a message to {driver?.name} through WhatsApp for more information
            </h3>
            <textarea
              className="message-input"
              placeholder={`Hello, I've just booked your ride! I'd be glad to travel with you. Can I get more information on...?`}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
            />
            <button 
              className="whatsapp-btn"
              onClick={handleWhatsAppContact}
              type="button"
            >
              <FaWhatsapp />
              Contact via WhatsApp
            </button>
          </div>

          {/* Book Button */}
          <button 
            className="book-btn"
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? 'Booking...' : '⚡ Book'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookingConfirmationModal;