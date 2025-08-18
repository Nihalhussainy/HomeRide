import React from 'react';
import './Input.css';

function Input({ type, placeholder, value, onChange }) {
  return (
    <input
      className="custom-input"
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
    />
  );
}

export default Input;