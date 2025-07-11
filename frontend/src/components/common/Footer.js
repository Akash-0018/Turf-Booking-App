// frontend/src/components/common/Footer.js
import React from 'react';
import { Link } from 'react-router-dom';
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin, FaPhoneAlt, FaEnvelope, FaMapMarkerAlt } from 'react-icons/fa';
import '../../styles/Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-section about">
          <h3>About TurfBooker</h3>
          <p>
            TurfBooker is a platform that connects sports enthusiasts with the best turfs in town.
            Book your favorite turf with ease and enjoy your game!
          </p>
          <div className="social-icons">
            <a href="#" className="social-icon"><FaFacebook /></a>
            <a href="#" className="social-icon"><FaTwitter /></a>
            <a href="#" className="social-icon"><FaInstagram /></a>
            <a href="#" className="social-icon"><FaLinkedin /></a>
          </div>
        </div>

        <div className="footer-section links">
          <h3>Quick Links</h3>
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/about">About Us</Link></li>
            <li><Link to="/contact">Contact Us</Link></li>
            <li><Link to="/terms">Terms & Conditions</Link></li>
            <li><Link to="/privacy">Privacy Policy</Link></li>
          </ul>
        </div>

        <div className="footer-section contact">
          <h3>Contact Us</h3>
          <ul>
            <li>
              <FaPhoneAlt />
              <span>+91 9876543210</span>
            </li>
            <li>
              <FaEnvelope />
              <span>info@turfbooker.com</span>
            </li>
            <li>
              <FaMapMarkerAlt />
              <span>123 Main Street, City, State, 123456</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} TurfBooker. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;