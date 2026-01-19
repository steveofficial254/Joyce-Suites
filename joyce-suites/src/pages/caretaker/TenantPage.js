import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './TenantProfile.css';
import logo from '../../assets/image1.png';

const TenantProfile = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState(false);

  const [profileData, setProfileData] = useState({
    user_id: '',
    full_name: '',
    email: '',
    phone: '',
    id_number: '',
    room_number: '',
    floor: '',
    occupation: '',
    emergency_contact: '',
    emergency_phone: ''
  });

  const [formData, setFormData] = useState({...profileData});

  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    fetchProfile();
  }, [token, navigate]);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/tenant/profile', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.clear();
          navigate('/login');
          return;
        }
        throw new Error('Failed to load profile');
      }

      const data = await response.json();
      if (data.profile) {
        setProfileData(data.profile);
        setFormData(data.profile);
        setError('');
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError(err.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setUpdating(true);

    try {
      const response = await fetch('/api/tenant/profile/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          phone: formData.phone,
          occupation: formData.occupation,
          emergency_contact: formData.emergency_contact,
          emergency_phone: formData.emergency_phone
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      const data = await response.json();
      if (data.profile) {
        setProfileData(data.profile);
        setFormData(data.profile);
        setSuccess('Profile updated successfully!');
        setEditing(false);
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setUpdating(false);
    }
  };

  const handleCancelEdit = () => {
    setFormData({...profileData});
    setEditing(false);
    setError('');
  };

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/tenant/logout', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      localStorage.clear();
      navigate('/login');
    }
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Loading Profile...</p>
      </div>
    );
  }

  return (
    <div className="tenant-dashboard">
      {}
      <aside className="sidebar">
        <div className="sidebar-header">
          <img src={logo} alt="Logo" className="sidebar-logo" />
          <h2>Joyce Suits</h2>
        </div>

        <nav className="sidebar-nav">
          <a href="/tenant/dashboard" className="nav-item">
            <span className="nav-icon">📊</span>
            Dashboard
          </a>
          <a href="/tenant/payments" className="nav-item">
            <span className="nav-icon">💳</span>
            Payments
          </a>
          <a href="/tenant/profile" className="nav-item active">
            <span className="nav-icon">👤</span>
            Profile
          </a>
          <a href="/tenant/maintenance" className="nav-item">
            <span className="nav-icon">🔧</span>
            Maintenance
          </a>
          <a href="/tenant/lease" className="nav-item">
            <span className="nav-icon">📄</span>
            My Lease
          </a>
        </nav>

        <div className="sidebar-footer">
          <button onClick={handleLogout} className="logout-btn">
            <span className="nav-icon">🚪</span>
            Logout
          </button>
        </div>
      </aside>

      {}
      <main className="main-content">
        {}
        <header className="topbar">
          <div className="topbar-left">
            <h1>Profile</h1>
            <p className="breadcrumb">Home / Profile</p>
          </div>
        </header>

        {}
        {success && (
          <div className="alert alert-success">
            <span>{success}</span>
            <button onClick={() => setSuccess('')} className="alert-close">×</button>
          </div>
        )}
        {error && (
          <div className="alert alert-error">
            <span>{error}</span>
            <button onClick={() => setError('')} className="alert-close">×</button>
          </div>
        )}

        {}
        <div className="profile-content">
          <div className="profile-card">
            <div className="profile-header">
              <div className="profile-avatar-large">
                <div className="avatar-placeholder-large">
                  {profileData.full_name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
              </div>
              <div className="profile-info-header">
                <h2>{profileData.full_name || 'User'}</h2>
                {profileData.room_number && (
                  <p className="room-badge">
                    Room {profileData.room_number} {profileData.floor && `- Floor ${profileData.floor}`}
                  </p>
                )}
              </div>
            </div>

            {!editing ? (
              <div className="profile-details">
                <div className="detail-row">
                  <div className="detail-item">
                    <span className="detail-label">Email</span>
                    <span className="detail-value">{profileData.email || 'N/A'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Phone</span>
                    <span className="detail-value">{profileData.phone || 'N/A'}</span>
                  </div>
                </div>

                <div className="detail-row">
                  <div className="detail-item">
                    <span className="detail-label">ID Number</span>
                    <span className="detail-value">{profileData.id_number || 'N/A'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Occupation</span>
                    <span className="detail-value">{profileData.occupation || 'Not specified'}</span>
                  </div>
                </div>

                <div className="detail-row">
                  <div className="detail-item">
                    <span className="detail-label">Emergency Contact</span>
                    <span className="detail-value">{profileData.emergency_contact || 'Not specified'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Emergency Phone</span>
                    <span className="detail-value">{profileData.emergency_phone || 'Not specified'}</span>
                  </div>
                </div>

                <div className="profile-actions">
                  <button 
                    className="btn btn-primary"
                    onClick={() => setEditing(true)}
                  >
                    Edit Profile
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleUpdateProfile} className="profile-edit-form">
                <div className="form-section">
                  <h3>Edit Your Information</h3>
                  
                  <div className="form-group">
                    <label htmlFor="phone">Phone Number *</label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone || ''}
                      onChange={handleInputChange}
                      placeholder="e.g., 0701234567"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="occupation">Occupation</label>
                    <input
                      type="text"
                      id="occupation"
                      name="occupation"
                      value={formData.occupation || ''}
                      onChange={handleInputChange}
                      placeholder="e.g., Software Engineer"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="emergency_contact">Emergency Contact Name</label>
                    <input
                      type="text"
                      id="emergency_contact"
                      name="emergency_contact"
                      value={formData.emergency_contact || ''}
                      onChange={handleInputChange}
                      placeholder="e.g., John Doe"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="emergency_phone">Emergency Contact Phone</label>
                    <input
                      type="tel"
                      id="emergency_phone"
                      name="emergency_phone"
                      value={formData.emergency_phone || ''}
                      onChange={handleInputChange}
                      placeholder="e.g., 0712345678"
                    />
                  </div>

                  <div className="form-actions">
                    <button 
                      type="submit" 
                      className="btn btn-primary" 
                      disabled={updating}
                    >
                      {updating ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button 
                      type="button" 
                      className="btn btn-secondary"
                      onClick={handleCancelEdit}
                      disabled={updating}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </form>
            )}

            {}
            <div className="read-only-info">
              <p>
                <strong>Note:</strong> Email, ID Number, and Room information cannot be changed. 
                Contact management if you need to update these details.
              </p>
            </div>
          </div>
        </div>

        {}
        <footer className="dashboard-footer">
          <div className="footer-content">
            <div className="footer-section">
              <h4>Joyce Suits Apartments</h4>
              <p>Your home, our care</p>
            </div>
            <div className="footer-section">
              <h4>Contact</h4>
              <p>Phone: 0758 999322</p>
              <p>Email: joycesuites@gmail.com</p>
            </div>
            <div className="footer-section">
              <h4>Quick Links</h4>
              <a href="/tenant/dashboard">Dashboard</a>
              <a href="/tenant/payments">Payments</a>
              <a href="/tenant/maintenance">Maintenance</a>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2024 Joyce Suits Apartments. All rights reserved.</p>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default TenantProfile;