import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './TenantRegister.css';
import logo from '../../assets/image1.png';
import backgroundImage from '../../assets/image21.jpg';

const TenantRegister = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [photoPreview, setPhotoPreview] = useState(null);
  const [idPreview, setIdPreview] = useState(null);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    idNumber: '',
    roomNumber: '',
    password: '',
    confirmPassword: '',
    photo: null,
    idDocument: null,
    terms: false
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5242880) { // 5MB
        setError('Photo must be less than 5MB');
        return;
      }
      setFormData(prev => ({ ...prev, photo: file }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleIdUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5242880) { // 5MB
        setError('ID document must be less than 5MB');
        return;
      }
      setFormData(prev => ({ ...prev, idDocument: file }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setIdPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = () => {
    if (!formData.fullName.trim()) {
      setError('Full name is required');
      return false;
    }
    if (!formData.email.includes('@')) {
      setError('Valid email is required');
      return false;
    }
    if (!formData.phone || formData.phone.length < 10) {
      setError('Valid phone number is required');
      return false;
    }
    if (!formData.idNumber.trim()) {
      setError('ID number is required');
      return false;
    }
    if (!formData.roomNumber.trim()) {
      setError('Room number is required');
      return false;
    }
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    if (!formData.photo) {
      setError('Photo is required');
      return false;
    }
    if (!formData.idDocument) {
      setError('ID document is required');
      return false;
    }
    if (!formData.terms) {
      setError('You must agree to the terms and conditions');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Create FormData for file upload
      const uploadData = new FormData();
      uploadData.append('fullName', formData.fullName);
      uploadData.append('email', formData.email);
      uploadData.append('phone', formData.phone);
      uploadData.append('idNumber', formData.idNumber);
      uploadData.append('roomNumber', formData.roomNumber);
      uploadData.append('password', formData.password);
      uploadData.append('photo', formData.photo);
      uploadData.append('idDocument', formData.idDocument);
      uploadData.append('role', 'tenant');

      // Send to backend
      const response = await fetch('/api/auth/register-tenant', {
        method: 'POST',
        body: uploadData
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      // Save tenant data for lease signing
      localStorage.setItem('tenantData', JSON.stringify({
        ...formData,
        id: data.tenantId,
        unitData: data.unitData
      }));

      setSuccess('Registration successful! Redirecting to sign lease agreement...');
      setTimeout(() => {
        navigate('/lease-agreement');
      }, 2000);
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="tenant-register-container" style={{ backgroundImage: `url(${backgroundImage})` }}>
      <div className="register-overlay"></div>
      
      <div className="register-content">
        {/* Logo Section */}
        <div className="register-header">
          <img src={logo} alt="Joyce Suits Logo" className="register-logo" />
          <h1>Joyce Suits Apartments</h1>
          <p>Tenant Registration</p>
        </div>

        {/* Main Form */}
        <div className="register-form-container">
          <form onSubmit={handleSubmit} className="register-form">
            {/* Error Message */}
            {error && <div className="alert alert-error">{error}</div>}
            
            {/* Success Message */}
            {success && <div className="alert alert-success">{success}</div>}

            {/* Photo and ID Upload Section */}
            <div className="upload-section">
              <div className="upload-field">
                <label className="upload-label">Profile Photo *</label>
                <div className="photo-upload-box">
                  {photoPreview ? (
                    <img src={photoPreview} alt="Preview" className="photo-preview" />
                  ) : (
                    <div className="upload-placeholder">
                      <span>📷</span>
                      <p>Click to upload photo</p>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="file-input"
                  />
                </div>
              </div>

              <div className="upload-field">
                <label className="upload-label">ID Document *</label>
                <div className="id-upload-box">
                  {idPreview ? (
                    <img src={idPreview} alt="ID Preview" className="id-preview" />
                  ) : (
                    <div className="upload-placeholder">
                      <span>📄</span>
                      <p>Click to upload ID</p>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={handleIdUpload}
                    className="file-input"
                  />
                </div>
              </div>
            </div>

            {/* Personal Information Section */}
            <div className="form-section">
              <h3>Personal Information</h3>
              <div className="form-group">
                <label htmlFor="fullName">Full Name *</label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  placeholder="Enter your full name"
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="email">Email Address *</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="your.email@example.com"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="phone">Phone Number *</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="+254 712 345 678"
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="idNumber">ID Number *</label>
                  <input
                    type="text"
                    id="idNumber"
                    name="idNumber"
                    value={formData.idNumber}
                    onChange={handleInputChange}
                    placeholder="National ID or Passport"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="roomNumber">Room Number *</label>
                  <input
                    type="text"
                    id="roomNumber"
                    name="roomNumber"
                    value={formData.roomNumber}
                    onChange={handleInputChange}
                    placeholder="e.g., 12 or 18"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Security Section */}
            <div className="form-section">
              <h3>Security</h3>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="password">Password *</label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Minimum 8 characters"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="confirmPassword">Confirm Password *</label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    placeholder="Re-enter password"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Terms and Conditions */}
            <div className="form-group terms-group">
              <input
                type="checkbox"
                id="terms"
                name="terms"
                checked={formData.terms}
                onChange={handleInputChange}
                required
              />
              <label htmlFor="terms">
                I agree to the Terms and Conditions and Privacy Policy
              </label>
            </div>

            {/* Action Buttons */}
            <div className="button-group">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? 'Registering...' : 'Register as Tenant'}
              </button>
            </div>

            {/* Auth Links */}
            <div className="auth-links">
              <p>Already have an account? <a href="/login">Login here</a></p>
            </div>
          </form>
        </div>

        {/* Bottom Navigation */}
        <div className="auth-navigation">
          <div className="nav-group">
            <button
              onClick={() => navigate('/caretaker-login')}
              className="nav-btn caretaker-btn"
            >
              Caretaker Login →
            </button>
            <button
              onClick={() => navigate('/admin-login')}
              className="nav-btn admin-btn"
            >
              Admin Login →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TenantRegister;