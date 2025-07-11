// frontend/src/pages/AdminDashboard.js
import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { FaUser, FaFootballBall, FaCalendarAlt, FaTrash } from 'react-icons/fa';
import '../styles/AdminDashboard.css';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [turfs, setTurfs] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('users');

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        setLoading(true);

        // Fetch all data in parallel
        const [usersResponse, turfsResponse, bookingsResponse] = await Promise.all([
          api.get('/accounts/users/'),
          api.get('/turfs/'),
          api.get('/bookings/')
        ]);

        setUsers(usersResponse.data);
        setTurfs(turfsResponse.data);
        setBookings(bookingsResponse.data);
      } catch (error) {
        setError('Failed to load admin data. Please try again later.');
        console.error('Error fetching admin data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();
  }, []);

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      try {
        await api.delete(`/accounts/users/${userId}/`);
        setUsers(users.filter(user => user.id !== userId));
      } catch (error) {
        console.error('Error deleting user:', error);
        alert('Failed to delete user. Please try again.');
      }
    }
  };

  const handleDeleteTurf = async (turfId) => {
    if (window.confirm('Are you sure you want to delete this turf? This action cannot be undone.')) {
      try {
        await api.delete(`/turfs/${turfId}/`);
        setTurfs(turfs.filter(turf => turf.id !== turfId));
      } catch (error) {
        console.error('Error deleting turf:', error);
        alert('Failed to delete turf. Please try again.');
      }
    }
  };

  const handleDeleteBooking = async (bookingId) => {
    if (window.confirm('Are you sure you want to delete this booking? This action cannot be undone.')) {
      try {
        await api.delete(`/bookings/${bookingId}/`);
        setBookings(bookings.filter(booking => booking.id !== bookingId));
      } catch (error) {
        console.error('Error deleting booking:', error);
        alert('Failed to delete booking. Please try again.');
      }
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading admin dashboard...</p>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <h1>Admin Dashboard</h1>

      <div className="admin-stats">
        <div className="stat-card">
          <div className="stat-icon users">
            <FaUser />
          </div>
          <div className="stat-info">
            <h3>Total Users</h3>
            <p>{users.length}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon turfs">
            <FaFootballBall />
          </div>
          <div className="stat-info">
            <h3>Total Turfs</h3>
            <p>{turfs.length}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon bookings">
            <FaCalendarAlt />
          </div>
          <div className="stat-info">
            <h3>Total Bookings</h3>
            <p>{bookings.length}</p>
          </div>
        </div>
      </div>

      <div className="admin-tabs">
        <button 
          className={`tab ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          Users
        </button>
        <button 
          className={`tab ${activeTab === 'turfs' ? 'active' : ''}`}
          onClick={() => setActiveTab('turfs')}
        >
          Turfs
        </button>
        <button 
          className={`tab ${activeTab === 'bookings' ? 'active' : ''}`}
          onClick={() => setActiveTab('bookings')}
        >
          Bookings
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {activeTab === 'users' && (
        <div className="data-table-container">
          <h2>User Management</h2>
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Phone Number</th>
                <th>Name</th>
                <th>User Type</th>
                <th>Verified</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td>{user.phone_number}</td>
                  <td>{user.first_name} {user.last_name}</td>
                  <td>{user.user_type}</td>
                  <td>{user.is_phone_verified ? 'Yes' : 'No'}</td>
                  <td>{new Date(user.date_joined).toLocaleDateString()}</td>
                  <td>
                    <button 
                      className="delete-btn"
                      onClick={() => handleDeleteUser(user.id)}
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

      {activeTab === 'turfs' && (
        <div className="data-table-container">
          <h2>Turf Management</h2>
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Location</th>
                <th>Owner</th>
                <th>Weekday Price</th>
                <th>Weekend Price</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {turfs.map(turf => (
                <tr key={turf.id}>
                  <td>{turf.id}</td>
                  <td>{turf.name}</td>
                  <td>{turf.location.split(',')[0]}</td>
                  <td>{turf.owner_phone}</td>
                  <td>₹{turf.weekday_price}</td>
                  <td>₹{turf.weekend_price}</td>
                  <td>
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

      {activeTab === 'bookings' && (
        <div className="data-table-container">
          <h2>Booking Management</h2>
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Turf</th>
                <th>Customer</th>
                <th>Date</th>
                <th>Time</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map(booking => (
                <tr key={booking.id}>
                  <td>{booking.id}</td>
                  <td>{booking.turf_name}</td>
                  <td>{booking.customer_phone}</td>
                  <td>{new Date(booking.date).toLocaleDateString()}</td>
                  <td>{booking.start_time} - {booking.end_time}</td>
                  <td>₹{booking.total_amount}</td>
                  <td>
                    <span className={`status ${booking.status.toLowerCase()}`}>
                      {booking.status}
                    </span>
                  </td>
                  <td>
                    <button 
                      className="delete-btn"
                      onClick={() => handleDeleteBooking(booking.id)}
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
  );
};

export default AdminDashboard;