// frontend/src/pages/Register.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '../contexts/AuthContext';
import '../styles/Auth.css';

const RegisterSchema = Yup.object().shape({
  phone_number: Yup.string()
    .matches(/^\d{10}$/, 'Phone number must be 10 digits')
    .required('Phone number is required'),
  password: Yup.string()
    .min(8, 'Password must be at least 8 characters')
    .required('Password is required'),
  password2: Yup.string()
    .oneOf([Yup.ref('password'), null], 'Passwords must match')
    .required('Confirm password is required'),
  first_name: Yup.string().required('First name is required'),
  last_name: Yup.string().required('Last name is required'),
  user_type: Yup.string().required('User type is required')
});

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState(null);

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      const response = await register(values);
      navigate('/verify-otp', { 
        state: { 
          phone_number: values.phone_number,
          message: 'Registration successful! Please verify your phone number with the OTP sent.'
        } 
      });
    } catch (error) {
      setError(error.response?.data || 'Registration failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Register</h2>

        {error && <div className="error-message">{error}</div>}

        <Formik
          initialValues={{
            phone_number: '',
            password: '',
            password2: '',
            first_name: '',
            last_name: '',
            user_type: 'customer'
          }}
          validationSchema={RegisterSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting, values }) => (
            <Form className="auth-form">
              <div className="form-group">
                <label htmlFor="phone_number">Phone Number</label>
                <Field 
                  type="text" 
                  name="phone_number" 
                  placeholder="Enter 10-digit phone number"
                  className="form-control"
                />
                <ErrorMessage name="phone_number" component="div" className="error" />
              </div>

              <div className="form-group">
                <label htmlFor="first_name">First Name</label>
                <Field 
                  type="text" 
                  name="first_name" 
                  placeholder="Enter your first name"
                  className="form-control"
                />
                <ErrorMessage name="first_name" component="div" className="error" />
              </div>

              <div className="form-group">
                <label htmlFor="last_name">Last Name</label>
                <Field 
                  type="text" 
                  name="last_name" 
                  placeholder="Enter your last name"
                  className="form-control"
                />
                <ErrorMessage name="last_name" component="div" className="error" />
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

              <div className="form-group">
                <label htmlFor="password2">Confirm Password</label>
                <Field 
                  type="password" 
                  name="password2" 
                  placeholder="Confirm your password"
                  className="form-control"
                />
                <ErrorMessage name="password2" component="div" className="error" />
              </div>

              <div className="form-group">
                <label htmlFor="user_type">Register as</label>
                <Field as="select" name="user_type" className="form-control">
                  <option value="customer">Customer</option>
                  <option value="owner">Turf Owner</option>
                </Field>
                <ErrorMessage name="user_type" component="div" className="error" />
              </div>

              <button 
                type="submit" 
                className="auth-button" 
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Registering...' : 'Register'}
              </button>

              <div className="auth-links">
                <p>
                  Already have an account? <a href="/login">Login</a>
                </p>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default Register;