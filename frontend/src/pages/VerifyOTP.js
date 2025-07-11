// frontend/src/pages/VerifyOTP.js
import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '../contexts/AuthContext';
import '../styles/Auth.css';

const OTPSchema = Yup.object().shape({
  otp: Yup.string()
    .matches(/^\d{6}$/, 'OTP must be 6 digits')
    .required('OTP is required')
});

const VerifyOTP = () => {
  const { verifyOTP, requestOTP } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { phone_number, message } = location.state || {};
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(message || null);
  const [resendDisabled, setResendDisabled] = useState(false);
  const [countdown, setCountdown] = useState(0);

  if (!phone_number) {
    navigate('/login');
    return null;
  }

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      const response = await verifyOTP(phone_number, values.otp);

      // Redirect based on user type
      if (response.user.user_type === 'owner') {
        navigate('/owner/dashboard');
      } else if (response.user.user_type === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/');
      }
    } catch (error) {
      setError(error.response?.data?.error || 'OTP verification failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResendOTP = async () => {
    try {
      await requestOTP(phone_number);
      setSuccess('OTP has been resent to your phone number.');
      setError(null);

      // Disable resend button for 30 seconds
      setResendDisabled(true);
      setCountdown(30);

      const timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            setResendDisabled(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to resend OTP. Please try again.');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Verify OTP</h2>

        {success && <div className="success-message">{success}</div>}
        {error && <div className="error-message">{error}</div>}

        <p className="otp-info">
          A 6-digit OTP has been sent to your phone number: <strong>{phone_number}</strong>
        </p>

        <Formik
          initialValues={{
            otp: ''
          }}
          validationSchema={OTPSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting }) => (
            <Form className="auth-form">
              <div className="form-group">
                <label htmlFor="otp">Enter OTP</label>
                <Field 
                  type="text" 
                  name="otp" 
                  placeholder="Enter 6-digit OTP"
                  className="form-control"
                />
                <ErrorMessage name="otp" component="div" className="error" />
              </div>

              <button 
                type="submit" 
                className="auth-button" 
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Verifying...' : 'Verify OTP'}
              </button>

              <div className="resend-otp">
                <button 
                  type="button"
                  className="resend-button"
                  onClick={handleResendOTP}
                  disabled={resendDisabled}
                >
                  {resendDisabled 
                    ? `Resend OTP (${countdown}s)` 
                    : 'Resend OTP'}
                </button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default VerifyOTP;