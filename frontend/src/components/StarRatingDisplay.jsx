import React from 'react';
import { FaStar } from 'react-icons/fa';

function StarRatingDisplay({ score }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
      {[...Array(5)].map((_, index) => (
        <FaStar
          key={index}
          color={index < Math.round(score) ? "#ffc107" : "#4b5563"}
        />
      ))}
      <span style={{fontWeight: '600', marginLeft: '5px', color: 'var(--text-primary)'}}>
        Rated
      </span>
    </div>
  );
}

export default StarRatingDisplay;
