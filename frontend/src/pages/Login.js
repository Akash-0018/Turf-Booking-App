// frontend/src/pages/Login.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '../contexts/AuthContext';
import '../styles/Auth.css';

const LoginSchema = Yup.object().shape({
  phone_number: Yup.string()
    .matches(/^\d{10}$/, 'Phone number must be 10 digits')
    .required('Phone number is required'),
  password: Yup.string()
    .required('Password is required')
});

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState(null);

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      const response = await login(values.phone_number, values.password);

      if (response.requires_verification) {
        navigate('/verify-otp', { 
          state: { 
            phone_number: values.phone_number,
            message: 'Please verify your phone number with the OTP sent.'
          } 
        });
      } else {
        // Redirect based on user type
        if (response.user.user_type === 'owner') {
          navigate('/owner/dashboard');
        } else if (response.user.user_type === 'admin') {
          navigate('/admin/dashboard');
        } else {
          navigate('/');
        }
      }
    } catch (error) {
      setError(error.response?.data?.error || 'Login failed. Please check your credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Login</h2>

        {error && <div className="error-message">{error}</div>}

        <Formik
          initialValues={{
            phone_number: '',
            password: ''
          }}
          validationSchema={LoginSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting }) => (
            <Form className="auth-form">
              <div className="form-group">
                <label htmlFor="phone_number">Phone Number</label>
                <Field 
                  type="text" 
                  name="phone_number" 
                  placeholder="Enter your phone number"
                  className="form-control"
                />
                <ErrorMessage name="phone_number" component="div" className="error" />
              </div>

              <div className="form-group">
                <label htmlFor="password">Password</label>
                <Field 
                  type="password" 
                  name="password" 
                  placeholder="Enter your password"
                  className="form-control"
                />
                <ErrorMessage name="password" component="div" className="error" />
              </div>

              <button 
                type="submit" 
                className="auth-button" 
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Logging in...' : 'Login'}
              </button>

              <div className="auth-links">
                <p>
                  Don't have an account? <a href="/register">Register</a>
                </p>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default Login;