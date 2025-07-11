// frontend/src/pages/Home.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { turfAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import TurfCard from '../components/turf/TurfCard';
import OwnerPrompt from '../components/turf/OwnerPrompt';
import '../styles/Home.css';

const Home = () => {
  const { isAuthenticated, user } = useAuth();
  const [turfs, setTurfs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showOwnerPrompt, setShowOwnerPrompt] = useState(false);

  useEffect(() => {
    const fetchTurfs = async () => {
      try {
        const response = await turfAPI.getAllTurfs();
        setTurfs(response.data);
      } catch (error) {
        setError('Failed to load turfs. Please try again later.');
        console.error('Error fetching turfs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTurfs();
  }, []);

  useEffect(() => {
    // Show owner prompt if user is authenticated, is a customer, and hasn't seen the prompt yet
    if (isAuthenticated && user?.user_type === 'customer') {
      const hasSeenPrompt = localStorage.getItem('hasSeenOwnerPrompt');
      if (!hasSeenPrompt) {
        setShowOwnerPrompt(true);
      }
    }
  }, [isAuthenticated, user]);

  const handleClosePrompt = () => {
    setShowOwnerPrompt(false);
    localStorage.setItem('hasSeenOwnerPrompt', 'true');
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading turfs...</p>
      </div>
    );
  }

  return (
    <div className="home-container">
      {showOwnerPrompt && <OwnerPrompt onClose={handleClosePrompt} />}

      <div className="hero-section">
        <div className="hero-content">
          <h1>Find and Book the Perfect Turf</h1>
          <p>Discover and book sports turfs near you with ease</p>
          {!isAuthenticated && (
            <div className="hero-buttons">
              <Link to="/register" className="btn btn-primary">Sign Up</Link>
              <Link to="/login" className="btn btn-secondary">Login</Link>
            </div>
          )}
        </div>
      </div>

      <div className="turfs-section">
        <h2>Available Turfs</h2>

        {error && <div className="error-message">{error}</div>}

        {turfs.length === 0 ? (
          <div className="no-turfs">
            <p>No turfs available at the moment.</p>
          </div>
        ) : (
          <div className="turfs-grid">
            {turfs.map(turf => (
              <TurfCard key={turf.id} turf={turf} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;