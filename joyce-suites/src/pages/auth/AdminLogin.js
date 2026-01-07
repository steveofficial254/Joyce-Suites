
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';
import logo from '../../assets/image1.png';
import backgroundImage from '../../assets/image21.jpg';
import config from '../../config';

const AdminLogin = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    email: 'admin@joycesuites.com',
    password: 'Admin@123456'
  });

  // Check if already logged in
  useEffect(() => {
    const token = localStorage.getItem('joyce-suites-token');
    const userRole = localStorage.getItem('userRole');
    
    if (token && userRole === 'admin') {
      console.log('✅ User already logged in as admin');
      navigate('/admin/dashboard', { replace: true });
    }
  }, [navigate]);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      console.log('🧹 Clearing old tokens...');
      localStorage.removeItem('token');
      localStorage.removeItem('joyce-suites-token');
      localStorage.removeItem('joyce-suites-user');

      if (!formData.email || !formData.password) {
        setError('Email and password are required');
        setLoading(false);
        return;
      }

      console.log('📡 Attempting admin login with email:', formData.email);

      const response = await fetch(`${config.apibaseurl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email.trim().toLowerCase(),
          password: formData.password
        })
      });

      const contentType = response.headers.get('content-type');
      
      if (!contentType || !contentType.includes('application/json')) {
        console.error('❌ Invalid response format from server');
        setError('Server error: Invalid response format. Ensure Flask is running on port 5000.');
        setLoading(false);
        return;
      }

      const data = await response.json();
      console.log('📨 Login response:', data);

      if (!response.ok) {
        console.error('❌ Login failed with status:', response.status);
        localStorage.removeItem('joyce-suites-token');
        localStorage.removeItem('joyce-suites-user');
        setError(data.error || data.message || 'Login failed');
        setLoading(false);
        return;
      }

      if (!data.success) {
        console.error('❌ Response marked as not successful');
        localStorage.removeItem('joyce-suites-token');
        localStorage.removeItem('joyce-suites-user');
        setError(data.error || 'Login failed');
        setLoading(false);
        return;
      }

      // Validate response
      if (!data.user || !data.user.role) {
        console.error('❌ Invalid response structure');
        localStorage.removeItem('joyce-suites-token');
        localStorage.removeItem('joyce-suites-user');
        setError('Invalid response from server');
        setLoading(false);
        return;
      }

      // Check if user is admin
      if (data.user.role !== 'admin') {
        console.error('❌ User is not an admin, role is:', data.user.role);
        localStorage.removeItem('joyce-suites-token');
        localStorage.removeItem('joyce-suites-user');
        setError('Admin access required. Please use your admin credentials.');
        setLoading(false);
        return;
      }

      if (!data.token) {
        console.error('❌ No token in response');
        setError('Authentication token not received');
        setLoading(false);
        return;
      }

      // ✅ Store authentication data with CORRECT key
      console.log('💾 Saving admin token and user data...');
      localStorage.setItem('joyce-suites-token', data.token);
      localStorage.setItem('userRole', data.user.role);
      localStorage.setItem('userId', data.user.user_id);
      localStorage.setItem('userEmail', data.user.email);
      localStorage.setItem('userFullName', data.user.full_name);

      const userData = {
        id: data.user.user_id,
        user_id: data.user.user_id,
        email: data.user.email,
        full_name: data.user.full_name,
        role: data.user.role,
        loginTime: new Date().toISOString()
      };

      localStorage.setItem('joyce-suites-user', JSON.stringify(userData));

      // Verify token was saved
      const savedToken = localStorage.getItem('joyce-suites-token');
      console.log('🔍 Verification - Token in storage:', savedToken ? '✅ YES' : '❌ NO');

      console.log('✅ Admin login successful, redirecting to dashboard...');
      
      navigate('/admin/dashboard', { replace: true });

    } catch (err) {
      console.error('❌ Login error:', err);
      localStorage.removeItem('joyce-suites-token');
      localStorage.removeItem('joyce-suites-user');
      
      if (err.message.includes('Failed to fetch')) {
        setError('Cannot connect to server. Please ensure Flask is running on port 5000.');
      } else {
        setError('Connection error. Please check your internet and try again.');
      }
      setLoading(false);
    }
  };

  return (
    <div className="login-container" style={{ backgroundImage: `url(${backgroundImage})` }}>
      <div className="login-overlay"></div>
      
      <div className="login-content">
        <div className="login-card">
          <img src={logo} alt="Joyce Suits Logo" className="login-logo" />
          <h1>Joyce Suits Apartments</h1>
          <h2>Admin Portal</h2>

          {error && (
            <div className="alert alert-error">
              <span>{error}</span>
              <button 
                onClick={() => setError('')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'inherit',
                  fontSize: '20px',
                  cursor: 'pointer',
                  marginLeft: '10px'
                }}
              >
                ×
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email">Admin Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Enter your email"
                required
                disabled={loading}
                autoComplete="email"
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Admin Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Enter your password"
                required
                disabled={loading}
                autoComplete="current-password"
              />
            </div>

            <button 
              type="submit" 
              className="btn btn-primary" 
              disabled={loading}
            >
              {loading ? 'Verifying...' : 'Login to Admin Portal'}
            </button>
          </form>

          <div className="login-info" style={{
            marginTop: '20px',
            padding: '12px',
            backgroundColor: '#f0f9ff',
            borderRadius: '6px',
            fontSize: '13px',
            color: '#0369a1'
          }}>
            <strong></strong><br />
            Email:<br />
            Password: 
          </div>
        </div>

        <div className="auth-navigation">
          <button 
            onClick={() => navigate('/login')} 
            className="nav-btn tenant-btn"
            disabled={loading}
          >
            ← Tenant Login
          </button>
          <button 
            onClick={() => navigate('/caretaker-login')} 
            className="nav-btn caretaker-btn"
            disabled={loading}
          >
            Caretaker Login →
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;