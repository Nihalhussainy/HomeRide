import React, { useState } from 'react';
import './RatingModal.css';
import Button from './Button.jsx';
import { FaStar } from 'react-icons/fa';
import { FiSend } from 'react-icons/fi';

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
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
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
                  color={currentRating <= (hover || score) ? "#ffc107" : "#4b5563"}
                  onMouseEnter={() => setHover(currentRating)}
                  onMouseLeave={() => setHover(0)}
                />
              </label>
            );
          })}
        </div>
        <textarea
          placeholder="Leave a comment (optional)..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
        <div className="modal-actions">
          <Button onClick={onClose} className="secondary">Cancel</Button>
          <Button onClick={handleSubmit}>
            <FiSend/>
            Submit Rating
          </Button>
        </div>
      </div>
    </div>
  );
}

export default RatingModal;
