// frontend/src/pages/OwnerDashboard.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { turfAPI, bookingAPI } from '../services/api';
import { FaPlus, FaEdit, FaTrash, FaCalendarAlt } from 'react-icons/fa';
import '../styles/OwnerDashboard.css';

const OwnerDashboard = () => {
  const [turfs, setTurfs] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [selectedTurf, setSelectedTurf] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('turfs');

  useEffect(() => {
    const fetchOwnerData = async () => {
      try {
        setLoading(true);
        const turfsResponse = await turfAPI.getAllTurfs();
        // Filter turfs owned by the current user
        const myTurfs = turfsResponse.data.filter(turf => turf.owner === true);
        setTurfs(myTurfs);

        if (myTurfs.length > 0) {
          setSelectedTurf(myTurfs[0].id);
          const bookingsResponse = await bookingAPI.getTurfBookings(myTurfs[0].id);
          setBookings(bookingsResponse.data);
        }
      } catch (error) {
        setError('Failed to load dashboard data. Please try again later.');
        console.error('Error fetching owner data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOwnerData();
  }, []);

  const handleTurfSelect = async (turfId) => {
    setSelectedTurf(turfId);
    try {
      const bookingsResponse = await bookingAPI.getTurfBookings(turfId);
      setBookings(bookingsResponse.data);
    } catch (error) {
      console.error('Error fetching turf bookings:', error);
    }
  };

  const handleDeleteTurf = async (turfId) => {
    if (window.confirm('Are you sure you want to delete this turf? This action cannot be undone.')) {
      try {
        await turfAPI.deleteTurf(turfId);
        setTurfs(turfs.filter(turf => turf.id !== turfId));
        if (selectedTurf === turfId) {
          setSelectedTurf(null);
          setBookings([]);
        }
      } catch (error) {
        console.error('Error deleting turf:', error);
        alert('Failed to delete turf. Please try again.');
      }
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="owner-dashboard">
      <div className="dashboard-header">
        <h1>Owner Dashboard</h1>
        <Link to="/owner/add-turf" className="add-turf-btn">
          <FaPlus /> Add New Turf
        </Link>
      </div>

      <div className="dashboard-tabs">
        <button 
          className={`tab ${activeTab === 'turfs' ? 'active' : ''}`}
          onClick={() => setActiveTab('turfs')}
        >
          My Turfs
        </button>
        <button 
          className={`tab ${activeTab === 'bookings' ? 'active' : ''}`}
          onClick={() => setActiveTab('bookings')}
        >
          Bookings
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {activeTab === 'turfs' && (
        <div className="turfs-section">
          {turfs.length === 0 ? (
            <div className="no-turfs">
              <p>You haven't added any turfs yet.</p>
              <Link to="/owner/add-turf" className="btn btn-primary">
                Add Your First Turf
              </Link>
            </div>
          ) : (
            <div className="turfs-table-container">
              <table className="turfs-table">
                <thead>
                  <tr>
                    <th>Turf Name</th>
                    <th>Location</th>
                    <th>Weekday Price</th>
                    <th>Weekend Price</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {turfs.map(turf => (
                    <tr key={turf.id} className={selectedTurf === turf.id ? 'selected' : ''}>
                      <td>{turf.name}</td>
                      <td>{turf.location.split(',')[0]}</td>
                      <td>₹{turf.weekday_price}/hr</td>
                      <td>₹{turf.weekend_price}/hr</td>
                      <td className="actions">
                        <button 
                          className="view-bookings-btn"
                          onClick={() => {
                            handleTurfSelect(turf.id);
                            setActiveTab('bookings');
                          }}
                        >
                          <FaCalendarAlt /> Bookings
                        </button>
                        <Link to={`/owner/edit-turf/${turf.id}`} className="edit-btn">
                          <FaEdit />
                        </Link>
                        <button 
                          className="delete-btn"
                          onClick={() => handleDeleteTurf(turf.id)}
                        >
                          <FaTrash />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'bookings' && (
        <div className="bookings-section">
          {turfs.length === 0 ? (
            <div className="no-turfs">
              <p>You need to add a turf before you can see bookings.</p>
              <Link to="/owner/add-turf" className="btn btn-primary">
                Add Your First Turf
              </Link>
            </div>
          ) : (
            <>
              <div className="turf-selector">
                <label>Select Turf:</label>
                <select 
                  value={selectedTurf || ''}
                  onChange={(e) => handleTurfSelect(e.target.value)}
                >
                  {turfs.map(turf => (
                    <option key={turf.id} value={turf.id}>
                      {turf.name}
                    </option>
                  ))}
                </select>
              </div>

              {bookings.length === 0 ? (
                <div className="no-bookings">
                  <p>No bookings found for this turf.</p>
                </div>
              ) : (
                <div className="bookings-table-container">
                  <table className="bookings-table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Time</th>
                        <th>Customer</th>
                        <th>Duration</th>
                        <th>Amount</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bookings.map(booking => (
                        <tr key={booking.id}>
                          <td>{new Date(booking.date).toLocaleDateString()}</td>
                          <td>{booking.start_time} - {booking.end_time}</td>
                          <td>{booking.customer_phone}</td>
                          <td>{booking.hours} {booking.hours === 1 ? 'hour' : 'hours'}</td>
                          <td>₹{booking.total_amount}</td>
                          <td>
                            <span className={`status ${booking.status.toLowerCase()}`}>
                              {booking.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default OwnerDashboard;