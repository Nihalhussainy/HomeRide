import React, { useState } from 'react';
import './RatingModal.css'; // Reuse modal styles
import Button from './Button.jsx';
import Input from './Input.jsx';

function EditUserModal({ user, onClose, onUserUpdate }) {
  const [role, setRole] = useState(user.role);
  const [travelCredit, setTravelCredit] = useState(user.travelCredit);

  const handleSubmit = () => {
    onUserUpdate(user.id, { role, travelCredit });
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Edit User: {user.name}</h2>
        
        <label>Role (e.g., USER, ADMIN)</label>
        <Input
          type="text"
          value={role}
          onChange={(e) => setRole(e.target.value)}
        />
        
        <label>Travel Credit</label>
        <Input
          type="number"
          value={travelCredit}
          onChange={(e) => setTravelCredit(parseFloat(e.target.value))}
        />

        <div className="modal-actions">
          <Button onClick={handleSubmit}>Save Changes</Button>
          <button className="close-button" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

export default EditUserModal;