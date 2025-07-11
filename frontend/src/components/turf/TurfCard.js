// frontend/src/components/turf/TurfCard.js
import React from 'react';
import { Link } from 'react-router-dom';
import { FaMapMarkerAlt, FaCalendarAlt } from 'react-icons/fa';
import '../../styles/TurfCard.css';

const TurfCard = ({ turf }) => {
  const imageUrl = turf.primary_image || 
    (turf.images && turf.images.length > 0 ? 
      turf.images.find(img => img.is_primary)?.image || turf.images[0].image : 
      '/images/turf-placeholder.jpg');

  return (
    <Link to={`/turf/${turf.id}`} className="turf-card">
      <div className="turf-image">
        <img src={imageUrl} alt={turf.name} />
      </div>
      <div className="turf-info">
        <h3>{turf.name}</h3>
        <div className="turf-location">
          <FaMapMarkerAlt />
          <span>{turf.location.split(',')[0]}</span>
        </div>
        <div className="turf-price">
          <span>₹{turf.weekday_price}/hr</span> weekdays
        </div>
        <div className="turf-book">
          <FaCalendarAlt />
          <span>Book Now</span>
        </div>
      </div>
    </Link>
  );
};

export default TurfCard;