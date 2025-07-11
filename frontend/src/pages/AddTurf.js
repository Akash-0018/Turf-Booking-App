// frontend/src/pages/AddTurf.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { turfAPI } from '../services/api';
import { FaMapMarkerAlt, FaRupeeSign, FaImage, FaUpload } from 'react-icons/fa';
import '../styles/AddTurf.css';

const AddTurfSchema = Yup.object().shape({
  name: Yup.string().required('Turf name is required'),
  description: Yup.string(),
  location: Yup.string().required('Location is required'),
  map_coordinates: Yup.string(),
  weekday_price: Yup.number()
    .positive('Price must be positive')
    .required('Weekday price is required'),
  weekend_price: Yup.number()
    .positive('Price must be positive')
    .required('Weekend price is required'),
});

const AddTurf = () => {
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [primaryImagePreview, setPrimaryImagePreview] = useState(null);
  const [additionalImagePreviews, setAdditionalImagePreviews] = useState([]);

  const handlePrimaryImageChange = (event, setFieldValue) => {
    const file = event.currentTarget.files[0];
    if (file) {
      setFieldValue('primary_image', file);
      const reader = new FileReader();
      reader.onload = () => {
        setPrimaryImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAdditionalImagesChange = (event, setFieldValue) => {
    const files = Array.from(event.currentTarget.files);
    if (files.length > 0) {
      setFieldValue('images', files);

      const previews = [];
      files.forEach(file => {
        const reader = new FileReader();
        reader.onload = () => {
          previews.push(reader.result);
          if (previews.length === files.length) {
            setAdditionalImagePreviews(previews);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      setError(null);

      // Create FormData object
      const formData = new FormData();
      formData.append('name', values.name);
      formData.append('description', values.description || '');
      formData.append('location', values.location);
      formData.append('map_coordinates', values.map_coordinates || '');
      formData.append('weekday_price', values.weekday_price);
      formData.append('weekend_price', values.weekend_price);
      formData.append('primary_image', values.primary_image);

      if (values.images) {
        values.images.forEach(image => {
          formData.append('images', image);
        });
      }

      const response = await turfAPI.createTurf(formData);

      navigate('/owner/dashboard', { 
        state: { success: 'Turf added successfully!' } 
      });
    } catch (error) {
      setError(error.response?.data || 'Failed to add turf. Please try again.');
      console.error('Error adding turf:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="add-turf-container">
      <h1>Add New Turf</h1>

      {error && <div className="error-message">{error}</div>}

      <Formik
        initialValues={{
          name: '',
          description: '',
          location: '',
          map_coordinates: '',
          weekday_price: '',
          weekend_price: '',
          primary_image: null,
          images: []
        }}
        validationSchema={AddTurfSchema}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting, setFieldValue, values }) => (
          <Form className="add-turf-form">
            <div className="form-group">
              <label htmlFor="name">Turf Name</label>
              <Field 
                type="text" 
                name="name" 
                placeholder="Enter turf name"
                className="form-control"
              />
              <ErrorMessage name="name" component="div" className="error" />
            </div>

            <div className="form-group">
              <label htmlFor="description">Description</label>
              <Field 
                as="textarea" 
                name="description" 
                placeholder="Describe your turf"
                className="form-control"
                rows="4"
              />
              <ErrorMessage name="description" component="div" className="error" />
            </div>

            <div className="form-group">
              <label htmlFor="location">
                <FaMapMarkerAlt /> Location
              </label>
              <Field 
                type="text" 
                name="location" 
                placeholder="Enter address or Google Maps link"
                className="form-control"
              />
              <ErrorMessage name="location" component="div" className="error" />
            </div>

            <div className="form-group">
              <label htmlFor="map_coordinates">Map Coordinates (optional)</label>
              <Field 
                type="text" 
                name="map_coordinates" 
                placeholder="e.g. 12.9716,77.5946"
                className="form-control"
              />
              <ErrorMessage name="map_coordinates" component="div" className="error" />
            </div>

            <div className="price-fields">
              <div className="form-group">
                <label htmlFor="weekday_price">
                  <FaRupeeSign /> Weekday Price (per hour)
                </label>
                <Field 
                  type="number" 
                  name="weekday_price" 
                  placeholder="e.g. 500"
                  className="form-control"
                />
                <ErrorMessage name="weekday_price" component="div" className="error" />
              </div>

              <div className="form-group">
                <label htmlFor="weekend_price">
                  <FaRupeeSign /> Weekend Price (per hour)
                </label>
                <Field 
                  type="number" 
                  name="weekend_price" 
                  placeholder="e.g. 800"
                  className="form-control"
                />
                <ErrorMessage name="weekend_price" component="div" className="error" />
              </div>
            </div>

            <div className="image-upload-section">
              <h3>Upload Images</h3>

              <div className="form-group primary-image">
                <label>
                  <FaImage /> Primary Image
                </label>
                <div className="image-upload-container">
                  <input
                    type="file"
                    id="primary_image"
                    name="primary_image"
                    accept="image/*"
                    onChange={(event) => handlePrimaryImageChange(event, setFieldValue)}
                  />
                  <label htmlFor="primary_image" className="upload-btn">
                    <FaUpload /> Choose Image
                  </label>
                  {primaryImagePreview && (
                    <div className="image-preview">
                      <img src={primaryImagePreview} alt="Primary" />
                    </div>
                  )}
                </div>
                {!values.primary_image && (
                  <div className="error">Primary image is required</div>
                )}
              </div>

              <div className="form-group additional-images">
                <label>
                  <FaImage /> Additional Images (optional)
                </label>
                <div className="image-upload-container">
                  <input
                    type="file"
                    id="additional_images"
                    name="additional_images"
                    accept="image/*"
                    multiple
                    onChange={(event) => handleAdditionalImagesChange(event, setFieldValue)}
                  />
                  <label htmlFor="additional_images" className="upload-btn">
                    <FaUpload /> Choose Images
                  </label>
                </div>
                {additionalImagePreviews.length > 0 && (
                  <div className="additional-previews">
                    {additionalImagePreviews.map((preview, index) => (
                      <div key={index} className="image-preview">
                        <img src={preview} alt={`Additional ${index + 1}`} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="form-actions">
              <button 
                type="button" 
                className="cancel-btn"
                onClick={() => navigate('/owner/dashboard')}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="submit-btn" 
                disabled={isSubmitting || !values.primary_image}
              >
                {isSubmitting ? 'Adding Turf...' : 'Add Turf'}
              </button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default AddTurf;