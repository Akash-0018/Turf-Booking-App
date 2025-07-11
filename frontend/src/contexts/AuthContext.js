// frontend/src/contexts/AuthContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../config';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check if user is already logged in
    const checkAuth = async () => {
      const token = localStorage.getItem('access_token');
      if (token) {
        try {
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          const response = await axios.get(`${API_URL}/accounts/profile/`);
          setUser(response.data);
          setIsAuthenticated(true);
        } catch (error) {
          console.error('Authentication check failed:', error);
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          delete axios.defaults.headers.common['Authorization'];
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  // Register a new user
  const register = async (userData) => {
    setError(null);
    try {
      const response = await axios.post(`${API_URL}/accounts/register/`, userData);
      return response.data;
    } catch (error) {
      setError(error.response?.data || 'Registration failed');
      throw error;
    }
  };

  // Request OTP
  const requestOTP = async (phoneNumber) => {
    setError(null);
    try {
      const response = await axios.post(`${API_URL}/accounts/request-otp/`, { phone_number: phoneNumber });
      return response.data;
    } catch (error) {
      setError(error.response?.data || 'Failed to send OTP');
      throw error;
    }
  };

  // Verify OTP
  const verifyOTP = async (phoneNumber, otp) => {
    setError(null);
    try {
      const response = await axios.post(`${API_URL}/accounts/verify-otp/`, { 
        phone_number: phoneNumber, 
        otp: otp 
      });

      const { access, refresh, user_type } = response.data;

      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);

      axios.defaults.headers.common['Authorization'] = `Bearer ${access}`;

      // Get user profile
      const profileResponse = await axios.get(`${API_URL}/accounts/profile/`);
      setUser(profileResponse.data);
      setIsAuthenticated(true);

      return { ...response.data, user: profileResponse.data };
    } catch (error) {
      setError(error.response?.data || 'OTP verification failed');
      throw error;
    }
  };

  // Login user
  const login = async (phoneNumber, password) => {
    setError(null);
    try {
      const response = await axios.post(`${API_URL}/accounts/login/`, {
        phone_number: phoneNumber,
        password: password
      });

      if (response.data.requires_verification) {
        return response.data;
      }

      const { access, refresh, user } = response.data;

      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);

      axios.defaults.headers.common['Authorization'] = `Bearer ${access}`;

      setUser(user);
      setIsAuthenticated(true);

      return response.data;
    } catch (error) {
      setError(error.response?.data || 'Login failed');
      throw error;
    }
  };

  // Logout user
  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
    setIsAuthenticated(false);
  };

  // Update user profile
  const updateProfile = async (userData) => {
    setError(null);
    try {
      const response = await axios.patch(`${API_URL}/accounts/profile/`, userData);
      setUser(response.data);
      return response.data;
    } catch (error) {
      setError(error.response?.data || 'Failed to update profile');
      throw error;
    }
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    error,
    register,
    requestOTP,
    verifyOTP,
    login,
    logout,
    updateProfile
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};