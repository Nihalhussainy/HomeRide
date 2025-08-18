import React from 'react';
import { FaStar } from 'react-icons/fa';

function StarRatingDisplay({ score }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
      {[...Array(5)].map((_, index) => (
        <FaStar
          key={index}
          color={index < score ? "#ffc107" : "#e4e5e9"}
        />
      ))}
      <span style={{fontWeight: 'bold', marginLeft: '5px'}}>Rated</span>
    </div>
  );
}

export default StarRatingDisplay;