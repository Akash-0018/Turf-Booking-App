// frontend/src/components/booking/BookingForm.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import { bookingAPI } from '../../services/api';
import { FaCalendarAlt, FaClock, FaRupeeSign, FaTimes } from 'react-icons/fa';
import 'react-datepicker/dist/react-datepicker.css';
import '../../styles/BookingForm.css';

const BookingForm = ({ turf, onClose }) => {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [hours, setHours] = useState(1);
  const [price, setPrice] = useState(0);
  const [convenienceFee, setConvenienceFee] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [bookedSlots, setBookedSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Format date for API
  const formatDate = (date) => {
    return date.toISOString().split('T')[0];
  };

  // Check availability when date changes
  useEffect(() => {
    const checkAvailability = async () => {
      try {
        setLoading(true);
        const response = await bookingAPI.checkAvailability({
          turf_id: turf.id,
          date: formatDate(selectedDate)
        });

        setBookedSlots(response.data.booked_slots || []);

        // Determine if it's a weekday or weekend
        const isWeekend = selectedDate.getDay() === 0 || selectedDate.getDay() === 6;
        const hourlyPrice = isWeekend ? turf.weekend_price : turf.weekday_price;

        // Update price calculation
        setPrice(hourlyPrice * hours);
        setConvenienceFee(18.63 * hours);
        setTotalAmount((hourlyPrice * hours) + (18.63 * hours));
      } catch (error) {
        setError('Failed to check availability. Please try again.');
        console.error('Error checking availability:', error);
      } finally {
        setLoading(false);
      }
    };

    if (selectedDate) {
      checkAvailability();
    }
  }, [selectedDate, turf.id, turf.weekend_price, turf.weekday_price, hours]);

  // Generate time slots (30-minute intervals)
  useEffect(() => {
    const generateTimeSlots = () => {
      const slots = [];
      for (let hour = 6; hour < 24; hour++) {
        for (let minute of ['00', '30']) {
          const time = `${hour.toString().padStart(2, '0')}:${minute}`;
          slots.push(time);
        }
      }
      return slots;
    };

    const allSlots = generateTimeSlots();

    // Filter out booked slots
    const available = allSlots.filter(slot => {
      return !bookedSlots.some(bookedSlot => {
        const slotTime = new Date(`2000-01-01T${slot}:00`);
        const startTime = new Date(`2000-01-01T${bookedSlot.start_time}:00`);
        const endTime = new Date(`2000-01-01T${bookedSlot.end_time}:00`);
        return slotTime >= startTime && slotTime < endTime;
      });
    });

    setAvailableSlots(available);
  }, [bookedSlots]);

  // Update end time and hours when start time changes
  useEffect(() => {
    if (startTime) {
      // Calculate end time based on hours
      const startDate = new Date(`2000-01-01T${startTime}:00`);
      const endDate = new Date(startDate.getTime() + hours * 60 * 60 * 1000);
      const newEndTime = `${endDate.getHours().toString().padStart(2, '0')}:${endDate.getMinutes().toString().padStart(2, '0')}`;
      setEndTime(newEndTime);
    }
  }, [startTime, hours]);

  // Update price calculations when hours change
  useEffect(() => {
    if (hours > 0) {
      // Determine if it's a weekday or weekend
      const isWeekend = selectedDate.getDay() === 0 || selectedDate.getDay() === 6;
      const hourlyPrice = isWeekend ? turf.weekend_price : turf.weekday_price;

      setPrice(hourlyPrice * hours);
      setConvenienceFee(18.63 * hours);
      setTotalAmount((hourlyPrice * hours) + (18.63 * hours));
    }
  }, [hours, selectedDate, turf.weekend_price, turf.weekday_price]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!startTime) {
      setError('Please select a start time');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const bookingData = {
        turf: turf.id,
        date: formatDate(selectedDate),
        start_time: startTime,
        end_time: endTime,
        hours: hours
      };

      const response = await bookingAPI.createBooking(bookingData);

      setSuccess('Booking successful! You will receive a confirmation message shortly.');

      // Reset form
      setTimeout(() => {
        onClose();
        navigate('/dashboard');
      }, 3000);
    } catch (error) {
      setError(error.response?.data?.detail || 'Booking failed. Please try again.');
      console.error('Error creating booking:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="booking-form-overlay">
      <div className="booking-form-container">
        <div className="booking-form-header">
          <h2>Book a Slot</h2>
          <button className="close-btn" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <form onSubmit={handleSubmit} className="booking-form">
          <div className="form-group">
            <label>
              <FaCalendarAlt /> Select Date
            </label>
            <DatePicker
              selected={selectedDate}
              onChange={date => setSelectedDate(date)}
              minDate={new Date()}
              dateFormat="MMMM d, yyyy"
              className="date-picker"
            />
          </div>

          <div className="form-group">
            <label>
              <FaClock /> Start Time
            </label>
            <select
              value={startTime}
              onChange={e => setStartTime(e.target.value)}
              required
            >
              <option value="">Select start time</option>
              {availableSlots.map(slot => (
                <option key={slot} value={slot}>
                  {slot}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>
              <FaClock /> Duration (hours)
            </label>
            <select
              value={hours}
              onChange={e => setHours(parseInt(e.target.value))}
              required
            >
              {[1, 2, 3, 4].map(h => (
                <option key={h} value={h}>
                  {h} {h === 1 ? 'hour' : 'hours'}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>
              <FaClock /> End Time
            </label>
            <input
              type="text"
              value={endTime}
              readOnly
              className="end-time"
            />
          </div>

          <div className="booking-summary">
            <h3>Booking Summary</h3>

            <div className="summary-item">
              <span>Turf Price:</span>
              <span><FaRupeeSign /> {price.toFixed(2)}</span>
            </div>

            <div className="summary-item">
              <span>Convenience Fee:</span>
              <span><FaRupeeSign /> {convenienceFee.toFixed(2)}</span>
            </div>

            <div className="summary-item total">
              <span>Total Amount:</span>
              <span><FaRupeeSign /> {totalAmount.toFixed(2)}</span>
            </div>
          </div>

          <button
            type="submit"
            className="submit-booking"
            disabled={loading}
          >
            {loading ? 'Processing...' : 'Confirm Booking'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default BookingForm;