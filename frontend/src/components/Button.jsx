import React from 'react';
import './Button.css';

function Button({ children, onClick, disabled }) {
  return (
    <button className="custom-button" onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
}

export default Button;