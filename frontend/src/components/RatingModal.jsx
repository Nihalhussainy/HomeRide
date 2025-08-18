import React, { useState } from 'react';
import './RatingModal.css';
import Button from './Button.jsx';
import { FaStar } from 'react-icons/fa';

function RatingModal({ ride, ratee, onClose, onSubmitRating }) {
  const [score, setScore] = useState(0);
  const [comment, setComment] = useState('');
  const [hover, setHover] = useState(0);

  const handleSubmit = () => {
    if (score === 0) {
      alert('Please select a star rating.');
      return;
    }
    onSubmitRating({
      rideRequestId: ride.id,
      rateeId: ratee.id,
      score,
      comment
    });
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Rate Your Trip with {ratee.name}</h2>
        <div className="star-rating">
          {[...Array(5)].map((star, index) => {
            const currentRating = index + 1;
            return (
              <label key={index}>
                <input
                  type="radio"
                  name="rating"
                  value={currentRating}
                  onClick={() => setScore(currentRating)}
                />
                <FaStar
                  className="star"
                  size={40}
                  color={currentRating <= (hover || score) ? "#ffc107" : "#e4e5e9"}
                  onMouseEnter={() => setHover(currentRating)}
                  onMouseLeave={() => setHover(0)}
                />
              </label>
            );
          })}
        </div>
        <textarea
          placeholder="Leave a comment..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
        <div className="modal-actions">
          <Button onClick={handleSubmit}>Submit Rating</Button>
          <button className="close-button" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

export default RatingModal;