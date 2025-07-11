// frontend/src/pages/TurfDetails.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { turfAPI, bookingAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import BookingForm from '../components/booking/BookingForm';
import { FaMapMarkerAlt, FaPhone, FaClock, FaCalendarAlt } from 'react-icons/fa';
import '../styles/TurfDetails.css';

const TurfDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [turf, setTurf] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    const fetchTurfDetails = async () => {
      try {
        const response = await turfAPI.getTurfById(id);
        setTurf(response.data);
      } catch (error) {
        setError('Failed to load turf details. Please try again later.');
        console.error('Error fetching turf details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTurfDetails();
  }, [id]);

  const handleBookNow = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { redirectTo: `/turf/${id}` } });
      return;
    }
    setShowBookingForm(true);
  };

  const handleCloseBooking = () => {
    setShowBookingForm(false);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading turf details...</p>
      </div>
    );
  }

  if (error || !turf) {
    return (
      <div className="error-container">
        <p>{error || 'Turf not found'}</p>
        <button onClick={() => navigate('/')} className="btn btn-primary">
          Go Back Home
        </button>
      </div>
    );
  }

  const images = turf.images && turf.images.length > 0 
    ? turf.images 
    : [{ image: '/images/turf-placeholder.jpg' }];

  return (
    <div className="turf-details-container">
      <div className="turf-gallery">
        <div className="main-image">
          <img 
            src={images[activeImage].image} 
            alt={`${turf.name} - Image ${activeImage + 1}`} 
          />
        </div>
        {images.length > 1 && (
          <div className="thumbnail-images">
            {images.map((img, index) => (
              <div 
                key={index} 
                className={`thumbnail ${activeImage === index ? 'active' : ''}`}
                onClick={() => setActiveImage(index)}
              >
                <img src={img.image} alt={`${turf.name} - Thumbnail ${index + 1}`} />
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="turf-info-container">
        <h1>{turf.name}</h1>

        <div className="turf-meta">
          <div className="meta-item">
            <FaMapMarkerAlt />
            <span>{turf.location.split(',')[0]}</span>
          </div>
          <div className="meta-item">
            <FaPhone />
            <span>{turf.owner_phone}</span>
          </div>
        </div>

        <div className="turf-description">
          <h3>About this turf</h3>
          <p>{turf.description || 'No description available for this turf.'}</p>
        </div>

        <div className="turf-pricing">
          <h3>Pricing</h3>
          <div className="price-details">
            <div className="price-item">
              <div className="price-label">
                <FaCalendarAlt />
                <span>Weekdays</span>
              </div>
              <div className="price-value">₹{turf.weekday_price}/hour</div>
            </div>
            <div className="price-item">
              <div className="price-label">
                <FaCalendarAlt />
                <span>Weekends</span>
              </div>
              <div className="price-value">₹{turf.weekend_price}/hour</div>
            </div>
          </div>
        </div>

        <div className="turf-location">
          <h3>Location</h3>
          <div className="map-container">
            <iframe
              title="Turf Location"
              src={`https://maps.google.com/maps?q=${turf.map_coordinates || turf.location}&z=15&output=embed`}
              width="100%"
              height="300"
              frameBorder="0"
              allowFullScreen
            ></iframe>
          </div>
        </div>

        <div className="booking-action">
          <button className="book-now-btn" onClick={handleBookNow}>
            Book a Slot
          </button>
        </div>
      </div>

      {showBookingForm && (
        <BookingForm 
          turf={turf} 
          onClose={handleCloseBooking} 
        />
      )}
    </div>
  );
};

export default TurfDetails;