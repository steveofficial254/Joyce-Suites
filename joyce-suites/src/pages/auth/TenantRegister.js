import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TermsAndConditionsModal from './TermsAndConditionsModal';
import './TenantRegister.css';
import logo from '../../assets/image1.png';
import backgroundImage from '../../assets/image21.jpg';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://joyce-suites-xdkp.onrender.com';

const TenantRegister = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [photoPreview, setPhotoPreview] = useState(null);
  const [idPreview, setIdPreview] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [roomData, setRoomData] = useState(null);
  const [loadingRooms, setLoadingRooms] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);

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

  useEffect(() => {
    console.log('Component mounted, fetching rooms...');
    fetchRooms();
  }, []);

  useEffect(() => {
    console.log('Rooms state updated:', rooms.length, 'rooms');
    if (rooms.length > 0) {
      console.log('First room:', rooms[0]);
    }
  }, [rooms]);

  const fetchRooms = async () => {
    setLoadingRooms(true);
    setError('');
    try {
      console.log('Fetching available rooms from public endpoint...');
      
      const response = await fetch(`${API_BASE_URL}/api/caretaker/rooms/public`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Full API response:', data);
      
      // Check the actual response structure
      if (data.success && Array.isArray(data.rooms)) {
        console.log(`Found ${data.rooms.length} rooms`);
        console.log('Sample room:', data.rooms[0]);
        
        // Process rooms to ensure consistent structure
        const processedRooms = data.rooms.map(room => ({
          id: room.id,
          name: room.name,
          room_number: room.name.replace('Room ', ''), // Extract room number from name
          property_type: room.type, // Backend uses 'type' field
          rent_amount: room.rent_amount,
          rent: room.rent_amount, // Add alias for compatibility
          description: room.description,
          status: 'vacant' // Since we're only getting vacant rooms
        }));
        
        console.log('Processed rooms:', processedRooms);
        setRooms(processedRooms);
      } else {
        console.error('Invalid response structure:', data);
        setError('Failed to load rooms: Invalid response format');
        setRooms([]);
      }
    } catch (err) {
      console.error('Error fetching rooms:', err);
      setError('Failed to load available rooms. Please try again later.');
      setRooms([]);
    } finally {
      setLoadingRooms(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name === 'roomNumber' && value) {
      console.log('Room selected:', value);
      
      // Find the selected room
      const selectedRoom = rooms.find(room => {
        const roomNumber = room.room_number || room.name.replace('Room ', '').trim();
        return roomNumber === value.trim();
      });
      
      console.log('Selected room object:', selectedRoom);
      
      if (selectedRoom) {
        // Calculate deposit (7% of rent)
        const rentAmount = selectedRoom.rent_amount || selectedRoom.rent || 0;
        const depositAmount = rentAmount * 0.07;
        
        // Format room type for display
        let roomType = 'Room';
        const propType = selectedRoom.property_type;
        if (propType === 'bedsitter') {
          roomType = 'Bedsitter';
        } else if (propType === 'one_bedroom') {
          roomType = '1-Bedroom';
        } else if (propType === 'two_bedroom') {
          roomType = '2-Bedroom';
        } else if (propType) {
          roomType = propType.replace('_', ' ').toUpperCase();
        }
        
        setRoomData({
          id: selectedRoom.id,
          name: selectedRoom.name,
          type: roomType,
          rent: rentAmount,
          deposit: depositAmount,
          totalAmount: rentAmount + depositAmount,
          property_type: propType,
          // Note: Your current backend endpoint doesn't return paybill/account/landlord
          // You'll need to update the backend or fetch additional data
          paybill: selectedRoom.paybill_number || '222111', // Default fallback
          account: selectedRoom.account_number || 'JOYCE001', // Default fallback
          landlord: selectedRoom.landlord_name || 'Joyce Muthoni' // Default fallback
        });
        
        console.log('Updated room data:', {
          name: selectedRoom.name,
          type: roomType,
          rent: rentAmount,
          deposit: depositAmount
        });
      } else {
        console.log('Room not found for value:', value);
        setRoomData(null);
      }
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5242880) {
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
      if (file.size > 5242880) {
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
    setError('');
    
    // Validate full name
    if (!formData.fullName.trim()) {
      setError('Full name is required');
      return false;
    }
    
    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Valid email address is required');
      return false;
    }
    
    // Validate phone (Kenyan format)
    const phoneRegex = /^(\+254|0)[1-9]\d{8}$/;
    const cleanPhone = formData.phone.replace(/\s/g, '');
    if (!phoneRegex.test(cleanPhone)) {
      setError('Phone number must be in format +254XXXXXXXXX or 07XXXXXXXX');
      return false;
    }
    
    // Validate ID number
    if (!formData.idNumber.trim()) {
      setError('National ID number is required');
      return false;
    }
    
    // Validate room selection
    if (!formData.roomNumber.trim()) {
      setError('Please select a room');
      return false;
    }
    
    // Validate password
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
    
    // Validate file uploads
    if (!formData.photo) {
      setError('Profile photo is required');
      return false;
    }
    if (!formData.idDocument) {
      setError('ID document is required');
      return false;
    }
    
    // Validate terms acceptance
    if (!formData.terms) {
      setError('You must agree to the terms and conditions');
      return false;
    }
    
    return true;
  };

  const handleTermsCheck = (e) => {
    if (e.target.checked && !formData.terms) {
      setShowTermsModal(true);
    }
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
      uploadData.append('phone', formData.phone.replace(/\s/g, ''));
      uploadData.append('id_number', formData.idNumber);
      uploadData.append('room_number', formData.roomNumber);
      uploadData.append('password', formData.password);
      uploadData.append('photo', formData.photo);
      uploadData.append('id_document', formData.idDocument);
      uploadData.append('role', 'tenant');

      console.log('Submitting registration with room data:', roomData);
      
      // If roomData exists, append additional details
      if (roomData) {
        uploadData.append('room_id', roomData.id);
        uploadData.append('room_type', roomData.property_type);
        uploadData.append('monthly_rent', roomData.rent);
        uploadData.append('security_deposit', roomData.deposit);
      }

      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        body: uploadData
      });

      let data = {};
      const contentType = response.headers.get('content-type');
      
      if (contentType && contentType.includes('application/json')) {
        try {
          data = await response.json();
        } catch (parseError) {
          console.error('Failed to parse JSON:', parseError);
          data = { error: 'Invalid response from server' };
        }
      } else {
        const text = await response.text();
        console.error('Non-JSON response:', text);
        data = { error: `Server error: ${response.status} ${response.statusText}` };
      }

      console.log('Registration response:', data);

      if (!response.ok) {
        const message = data.error || data.message || `Registration failed with status ${response.status}`;
        setError(message);
        throw new Error(message);
      }

      if (data.success && data.token) {
        // Store user data in localStorage
        localStorage.setItem('joyce-suites-token', data.token);
        localStorage.setItem('joyce-suites-user', JSON.stringify({
          ...data.user,
          loginTime: new Date().toISOString()
        }));
        localStorage.setItem('userRole', data.user.role);
        
        if (data.lease_created && data.lease_signing_required) {
          setSuccess('Registration successful! Creating your lease...');
          
          setTimeout(() => {
            window.location.href = '/tenant/lease-gate';
          }, 2000);
        } else if (data.lease_created) {
          setSuccess('Registration successful! Lease created. Redirecting to dashboard...');
          setTimeout(() => {
            window.location.href = '/tenant/dashboard';
          }, 2000);
        } else {
          setSuccess('Registration successful! Redirecting to dashboard...');
          setTimeout(() => {
            window.location.href = '/tenant/dashboard';
          }, 2000);
        }
      } else {
        setError(data.error || 'Registration failed');
      }
    } catch (err) {
      console.error('Registration error:', err);
      if (!error) {
        setError('Registration failed. Please check your connection and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="tenant-register-container" style={{ backgroundImage: `url(${backgroundImage})` }}>
      <div className="register-overlay"></div>
      <div className="register-content">

        <div className="register-header">
          <img src={logo} alt="Joyce Suits Logo" className="register-logo" />
          <h1>Joyce Suits Apartments</h1>
          <p>Tenant Registration</p>
        </div>

        <div className="register-form-container">
          <form onSubmit={handleSubmit} className="register-form">
            {error && <div className="alert alert-error">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}

            <div className="upload-section">
              <div className="upload-field">
                <label htmlFor="photoUpload" className="upload-label">Profile Photo *</label>
                <div className="photo-upload-box">
                  {photoPreview ? (
                    <div className="photo-preview-container">
                      <img src={photoPreview} alt="Preview" className="photo-preview" />
                    </div>
                  ) : (
                    <div className="upload-placeholder">
                      <span className="upload-icon">📷</span>
                      <p>Click to upload photo</p>
                      <small>Max 5MB (JPG, PNG)</small>
                    </div>
                  )}
                  <input
                    id="photoUpload"
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="file-input"
                    required
                  />
                </div>
              </div>

              <div className="upload-field">
                <label htmlFor="idUpload" className="upload-label">ID Document *</label>
                <div className="id-upload-box">
                  {idPreview ? (
                    <div className="id-preview-container">
                      <img src={idPreview} alt="ID Preview" className="id-preview" />
                    </div>
                  ) : (
                    <div className="upload-placeholder">
                      <span className="upload-icon">📄</span>
                      <p>Click to upload ID</p>
                      <small>Max 5MB (JPG, PNG, PDF)</small>
                    </div>
                  )}
                  <input
                    id="idUpload"
                    type="file"
                    accept="image/*,.pdf"
                    onChange={handleIdUpload}
                    className="file-input"
                    required
                  />
                </div>
              </div>
            </div>

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
                  <small className="input-hint">Format: +254XXXXXXXXX or 07XXXXXXXX</small>
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
                    placeholder="Enter your national ID"
                    required 
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="roomNumber">Room Number *</label>
                  <select 
                    id="roomNumber" 
                    name="roomNumber" 
                    value={formData.roomNumber} 
                    onChange={handleInputChange}
                    required
                    disabled={loadingRooms}
                  >
                    <option value="">
                      {loadingRooms ? 'Loading available rooms...' : 'Select a room'}
                    </option>
                    {rooms.length > 0 ? (
                      rooms.map(room => {
                        // Use room_number if available, otherwise extract from name
                        const roomNumber = room.room_number || room.name.replace('Room ', '').trim();
                        const roomName = room.name;
                        
                        // Get room type
                        let roomType = 'Room';
                        const propType = room.property_type;
                        if (propType === 'bedsitter') {
                          roomType = 'Bedsitter';
                        } else if (propType === 'one_bedroom') {
                          roomType = '1-Bedroom';
                        } else if (propType === 'two_bedroom') {
                          roomType = '2-Bedroom';
                        } else if (propType) {
                          roomType = propType.replace('_', ' ').toUpperCase();
                        }
                        
                        // Get rent amount
                        const rentAmount = room.rent_amount || room.rent || 0;
                        
                        return (
                          <option key={room.id} value={roomNumber}>
                            {roomName} - {roomType} - KSh {rentAmount.toLocaleString()}/month
                          </option>
                        );
                      })
                    ) : (
                      <option disabled value="">
                        {loadingRooms ? 'Loading...' : 'No rooms available'}
                      </option>
                    )}
                  </select>
                  {rooms.length === 0 && !loadingRooms && (
                    <small className="error-text">No rooms available for registration. Please contact the caretaker.</small>
                  )}
                  {loadingRooms && (
                    <small className="loading-text">Loading available rooms...</small>
                  )}
                  <div style={{ marginTop: '10px' }}>
                    <button 
                      type="button" 
                      onClick={fetchRooms}
                      style={{ 
                        padding: '5px 10px', 
                        backgroundColor: '#f0f0f0',
                        border: '1px solid #ccc',
                        borderRadius: '4px',
                        fontSize: '12px'
                      }}
                    >
                      Refresh Rooms List
                    </button>
                    {rooms.length > 0 && (
                      <span style={{ marginLeft: '10px', fontSize: '12px', color: 'green' }}>
                        {rooms.length} rooms loaded
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {roomData && (
                <div className="room-summary-card">
                  <h4>Selected Room Details</h4>
                  <div className="room-details">
                    <div className="room-detail-row">
                      <span>Room Number:</span>
                      <strong>{roomData.name}</strong>
                    </div>
                    <div className="room-detail-row">
                      <span>Room Type:</span>
                      <strong>{roomData.type}</strong>
                    </div>
                    <div className="room-detail-row">
                      <span>Monthly Rent:</span>
                      <strong className="rent-amount">KSh {roomData.rent?.toLocaleString() || '0'}</strong>
                    </div>
                    <div className="room-detail-row">
                      <span>Security Deposit (7%):</span>
                      <strong className="deposit-amount">KSh {Math.round(roomData.deposit || 0).toLocaleString()}</strong>
                    </div>
                    <div className="room-detail-row">
                      <span>Total Initial Payment:</span>
                      <strong className="total-amount">KSh {Math.round((roomData.rent + roomData.deposit) || 0).toLocaleString()}</strong>
                    </div>
                    {roomData.paybill && (
                      <div className="room-detail-row">
                        <span>Paybill Number:</span>
                        <strong>{roomData.paybill}</strong>
                      </div>
                    )}
                    {roomData.account && (
                      <div className="room-detail-row">
                        <span>Account Number:</span>
                        <strong>{roomData.account}</strong>
                      </div>
                    )}
                    {roomData.landlord && (
                      <div className="room-detail-row">
                        <span>Landlord:</span>
                        <strong>{roomData.landlord}</strong>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

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
                  <small className="input-hint">
                    Must contain at least 8 characters, 1 uppercase letter, and 1 digit
                  </small>
                </div>
                <div className="form-group">
                  <label htmlFor="confirmPassword">Confirm Password *</label>
                  <input 
                    type="password" 
                    id="confirmPassword" 
                    name="confirmPassword" 
                    value={formData.confirmPassword} 
                    onChange={handleInputChange} 
                    placeholder="Confirm your password"
                    required 
                  />
                </div>
              </div>
            </div>

            <div className="form-group terms-group">
              <input 
                type="checkbox" 
                id="terms" 
                name="terms" 
                checked={formData.terms} 
                onChange={(e) => {
                  handleTermsCheck(e);
                  if (!e.target.checked) {
                    setFormData(prev => ({ ...prev, terms: false }));
                  }
                }}
                required 
              />
              <label htmlFor="terms">
                I agree to the <button type="button" onClick={() => setShowTermsModal(true)} className="terms-link">Terms and Conditions</button> and Privacy Policy
              </label>
            </div>

            <div className="button-group">
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? (
                  <>
                    <span className="spinner"></span>
                    Registering...
                  </>
                ) : (
                  'Register as Tenant'
                )}
              </button>
              <button type="button" className="btn btn-secondary" onClick={() => navigate('/')}>
                Cancel
              </button>
            </div>

            <div className="auth-links">
              <p>Already have an account? <a href="/login">Login here</a></p>
              <p>Are you a caretaker? <a href="/caretaker-login">Caretaker login</a></p>
            </div>
          </form>
        </div>
      </div>

      {showTermsModal && (
        <TermsAndConditionsModal 
          roomData={roomData}
          onClose={() => setShowTermsModal(false)}
          onAccept={() => {
            setShowTermsModal(false);
            setFormData(prev => ({ ...prev, terms: true }));
          }}
          onDecline={() => {
            setShowTermsModal(false);
            setFormData(prev => ({ ...prev, terms: false }));
          }}
        />
      )}
    </div>
  );
};

export default TenantRegister;