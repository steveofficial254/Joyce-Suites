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
      reader.onloadend = () => setPhotoPreview(reader.result);
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
      reader.onloadend = () => setIdPreview(reader.result);
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

    // Kenyan phone number validation
    const phoneRegex = /^(\+254|0)[1-9]\d{8}$/;
    if (!formData.phone || !phoneRegex.test(formData.phone.replace(/\s/g, ''))) {
      setError('Phone number must be in format +254XXXXXXXXX or 07XXXXXXXX');
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

    // Password validation - must have uppercase, digit, and 8+ characters
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters');
      return false;
    }
    if (!/[A-Z]/.test(formData.password)) {
      setError('Password must contain at least one uppercase letter');
      return false;
    }
    if (!/\d/.test(formData.password)) {
      setError('Password must contain at least one digit');
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

    if (!validateForm()) return;

    setLoading(true);

    try {
      const uploadData = new FormData();
      uploadData.append('full_name', formData.fullName);
      uploadData.append('email', formData.email);
      uploadData.append('phone', formData.phone);
      uploadData.append('idNumber', formData.idNumber);
      uploadData.append('roomNumber', formData.roomNumber);
      uploadData.append('password', formData.password);
      uploadData.append('photo', formData.photo);
      uploadData.append('idDocument', formData.idDocument);
      uploadData.append('role', 'tenant');

      const response = await fetch('/api/auth/register', {
        method: 'POST',
        body: uploadData
        // Don't set Content-Type header - browser will set it with boundary for FormData
      });

      // Handle response safely - check if response has content
      let data = {};
      const contentType = response.headers.get('content-type');
      
      if (contentType && contentType.includes('application/json')) {
        try {
          data = await response.json();
        } catch (parseError) {
          console.error('Failed to parse JSON:', parseError);
          data = { message: 'Invalid response from server' };
        }
      } else if (!response.ok) {
        // If not ok and not JSON, create error from status
        data = { message: `Server error: ${response.status} ${response.statusText}` };
      }

      if (!response.ok) {
        const message = data.message || data.error || `Registration failed with status ${response.status}`;
        if (message.toLowerCase().includes('email')) {
          setError('Email already exists');
        } else {
          setError(message);
        }
        throw new Error(message);
      }

      // Store authentication data on success with correct storage keys
      if (data.token) {
        localStorage.setItem('joyce-suites-token', data.token);
        localStorage.setItem('joyce-suites-user', JSON.stringify({
          ...data.user,
          loginTime: new Date().toISOString()
        }));
        localStorage.setItem('userRole', data.user.role);
      }

      setSuccess('Registration successful! Redirecting to dashboard...');
      // Add a small delay to ensure localStorage is saved before navigation
      setTimeout(() => {
        console.log('Navigating to dashboard with token:', data.token);
        // Force a hard refresh to reload AuthContext from localStorage
        window.location.href = '/tenant/dashboard';
      }, 500);
    } catch (err) {
      console.error('Registration error:', err);
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

        {/* Form Section */}
        <div className="register-form-container">
          <form onSubmit={handleSubmit} className="register-form">
            {error && <div className="alert alert-error">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}

            {/* File Upload Section */}
            <div className="upload-section">
              <div className="upload-field">
                <label htmlFor="photoUpload" className="upload-label">Profile Photo *</label>
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
                    id="photoUpload"
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="file-input"
                  />
                </div>
              </div>

              <div className="upload-field">
                <label htmlFor="idUpload" className="upload-label">ID Document *</label>
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
                    id="idUpload"
                    type="file"
                    accept="image/*,.pdf"
                    onChange={handleIdUpload}
                    className="file-input"
                  />
                </div>
              </div>
            </div>

            {/* Personal Info */}
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
                    placeholder="example@email.com" 
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
                    placeholder="+254712345678 or 0712345678" 
                    required 
                  />
                  <small style={{ color: '#666', fontSize: '12px' }}>Format: +254XXXXXXXXX or 07XXXXXXXX</small>
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
                    placeholder="Min 8 characters" 
                    required 
                  />
                  <small style={{ color: '#666', fontSize: '12px' }}>Must contain at least 8 characters, 1 uppercase letter, and 1 digit</small>
                </div>
                <div className="form-group">
                  <label htmlFor="confirmPassword">Confirm Password *</label>
                  <input 
                    type="password" 
                    id="confirmPassword" 
                    name="confirmPassword" 
                    value={formData.confirmPassword} 
                    onChange={handleInputChange} 
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
              <label htmlFor="terms">I agree to the Terms and Conditions and Privacy Policy</label>
            </div>

            <div className="button-group">
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Registering...' : 'Register as Tenant'}
              </button>
            </div>

            <div className="auth-links">
              <p>Already have an account? <a href="/login">Login here</a></p>
            </div>
          </form>
        </div>

        {/* Navigation */}
        <div className="auth-navigation">
          <div className="nav-group">
            <button onClick={() => navigate('/caretaker-login')} className="nav-btn caretaker-btn">Caretaker Login →</button>
            <button onClick={() => navigate('/admin-login')} className="nav-btn admin-btn">Admin Login →</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TenantRegister;