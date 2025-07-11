// frontend/src/components/common/Header.js
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { FaUser, FaSignOutAlt, FaFootballBall, FaCalendarAlt, FaTachometerAlt } from 'react-icons/fa';
import '../../styles/Header.css';

const Header = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  return (
    <header className="header">
      <div className="header-container">
        <Link to="/" className="logo">
          <FaFootballBall />
          <span>TurfBooker</span>
        </Link>

        <nav className="nav-menu">
          <Link to="/" className="nav-link">Home</Link>
          <Link to="/about" className="nav-link">About</Link>
          <Link to="/contact" className="nav-link">Contact</Link>
        </nav>

        <div className="auth-section">
          {isAuthenticated ? (
            <div className="user-menu">
              <button className="user-button" onClick={toggleDropdown}>
                <FaUser />
                <span>{user?.first_name || 'User'}</span>
              </button>

              {showDropdown && (
                <div className="dropdown-menu">
                  {user?.user_type === 'owner' && (
                    <Link to="/owner/dashboard" className="dropdown-item">
                      <FaTachometerAlt />
                      <span>Owner Dashboard</span>
                    </Link>
                  )}

                  {user?.user_type === 'admin' && (
                    <Link to="/admin/dashboard" className="dropdown-item">
                      <FaTachometerAlt />
                      <span>Admin Dashboard</span>
                    </Link>
                  )}

                  <Link to="/dashboard" className="dropdown-item">
                    <FaCalendarAlt />
                    <span>My Bookings</span>
                  </Link>

                  <button onClick={handleLogout} className="dropdown-item logout">
                    <FaSignOutAlt />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="auth-buttons">
              <Link to="/login" className="login-btn">Login</Link>
              <Link to="/register" className="register-btn">Register</Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;