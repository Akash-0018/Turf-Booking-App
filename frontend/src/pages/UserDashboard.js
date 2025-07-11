// frontend/src/pages/UserDashboard.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { bookingAPI } from '../services/api';
import { FaCalendarAlt, FaClock, FaMapMarkerAlt } from 'react-icons/fa';
import '../styles/UserDashboard.css';

const UserDashboard = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('upcoming');

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);
        const response = await bookingAPI.getMyBookings();
        setBookings(response.data);
      } catch (error) {
        setError('Failed to load bookings. Please try again later.');
        console.error('Error fetching bookings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  // Filter bookings based on active tab
  const filteredBookings = bookings.filter(booking => {
    const bookingDate = new Date(booking.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (activeTab === 'upcoming') {
      return bookingDate >= today && booking.status !== 'cancelled';
    } else if (activeTab === 'past') {
      return bookingDate < today || booking.status === 'completed';
    } else if (activeTab === 'cancelled') {
      return booking.status === 'cancelled';
    }
    return true;
  });

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading bookings...</p>
      </div>
    );
  }

  return (
    <div className="user-dashboard">
      <h1>My Bookings</h1>

      <div className="booking-tabs">
        <button 
          className={`tab ${activeTab === 'upcoming' ? 'active' : ''}`}
          onClick={() => setActiveTab('upcoming')}
        >
          Upcoming
        </button>
        <button 
          className={`tab ${activeTab === 'past' ? 'active' : ''}`}
          onClick={() => setActiveTab('past')}
        >
          Past
        </button>
        <button 
          className={`tab ${activeTab === 'cancelled' ? 'active' : ''}`}
          onClick={() => setActiveTab('cancelled')}
        >
          Cancelled
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {filteredBookings.length === 0 ? (
        <div className="no-bookings">
          <p>No {activeTab} bookings found.</p>
          {activeTab === 'upcoming' && (
            <Link to="/" className="btn btn-primary">
              Book a Turf
            </Link>
          )}
        </div>
      ) : (
        <div className="bookings-list">
          {filteredBookings.map(booking => (
            <div key={booking.id} className="booking-card">
              <div className="booking-header">
                <h3>{booking.turf_name}</h3>
                <span className={`status ${booking.status.toLowerCase()}`}>
                  {booking.status}
                </span>
              </div>

              <div className="booking-details">
                <div className="detail-item">
                  <FaCalendarAlt />
                  <span>{new Date(booking.date).toLocaleDateString()}</span>
                </div>
                <div className="detail-item">
                  <FaClock />
                  <span>{booking.start_time} - {booking.end_time}</span>
                </div>
                <div className="detail-item">
                  <FaMapMarkerAlt />
                  <span>Contact: {booking.owner_phone}</span>
                </div>
              </div>

              <div className="booking-footer">
                <div className="price-details">
                  <div className="price-item">
                    <span>Turf Price:</span>
                    <span>₹{booking.price}</span>
                  </div>
                  <div className="price-item">
                    <span>Convenience Fee:</span>
                    <span>₹{booking.convenience_fee}</span>
                  </div>
                  <div className="price-item total">
                    <span>Total:</span>
                    <span>₹{booking.total_amount}</span>
                  </div>
                </div>

                {booking.status === 'confirmed' && new Date(booking.date) > new Date() && (
                  <button className="cancel-booking">
                    Cancel Booking
                  </button>
                )}

                {activeTab === 'upcoming' && (
                  <Link to={`/turf/${booking.turf}`} className="view-turf">
                    View Turf
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserDashboard;