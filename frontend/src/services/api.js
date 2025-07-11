// frontend/src/services/api.js
import axios from 'axios';
import { API_URL } from '../config';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
});

// Add a request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add a response interceptor to refresh token
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If error is 401 and not a retry
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (!refreshToken) {
          throw new Error('No refresh token');
        }

        const response = await axios.post(`${API_URL}/accounts/token/refresh/`, {
          refresh: refreshToken
        });

        const { access } = response.data;
        localStorage.setItem('access_token', access);

        // Update auth header
        originalRequest.headers.Authorization = `Bearer ${access}`;
        return api(originalRequest);
      } catch (refreshError) {
        // If refresh fails, logout
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Turf API
const turfAPI = {
  getAllTurfs: () => api.get('/turfs/'),
  getTurfById: (id) => api.get(`/turfs/${id}/`),
  createTurf: (data) => api.post('/turfs/', data, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  }),
  updateTurf: (id, data) => api.put(`/turfs/${id}/`, data, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  }),
  uploadTurfImages: (id, formData) => api.post(`/turfs/${id}/upload_images/`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  }),
  deleteTurf: (id) => api.delete(`/turfs/${id}/`)
};

// Booking API
const bookingAPI = {
  getAllBookings: () => api.get('/bookings/'),
  getBookingById: (id) => api.get(`/bookings/${id}/`),
  createBooking: (data) => api.post('/bookings/', data),
  updateBooking: (id, data) => api.put(`/bookings/${id}/`, data),
  deleteBooking: (id) => api.delete(`/bookings/${id}/`),
  getMyBookings: () => api.get('/bookings/my_bookings/'),
  getTurfBookings: (turfId) => api.get(`/bookings/turf_bookings/?turf_id=${turfId}`),
  checkAvailability: (data) => api.post('/bookings/check_availability/', data)
};

// Notification API
const notificationAPI = {
  getNotifications: () => api.get('/notifications/')
};

export {
  api,
  turfAPI,
  bookingAPI,
  notificationAPI
};