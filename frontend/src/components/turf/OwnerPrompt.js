// frontend/src/components/turf/OwnerPrompt.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/OwnerPrompt.css';

const OwnerPrompt = ({ onClose }) => {
  const navigate = useNavigate();

  const handleRegister = () => {
    navigate('/owner/add-turf');
    onClose();
  };

  return (
    <div className="owner-prompt-overlay">
      <div className="owner-prompt">
        <h3>Do you have a turf?</h3>
        <p>Register your turf with us and start receiving bookings!</p>
        <div className="prompt-buttons">
          <button className="btn-register" onClick={handleRegister}>Register</button>
          <button className="btn-cancel" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default OwnerPrompt;