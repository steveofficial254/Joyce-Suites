import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';
import logo from '../../assets/image1.png';
import backgroundImage from '../../assets/image21.jpg';

const AdminLogin = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    email: 'admin@joycesuites.com',
    password: 'Admin@123456'
  });

  
  useEffect(() => {
    const token = localStorage.getItem('joyce-suites-token');
    const userRole = localStorage.getItem('userRole');
    
    if (token && userRole === 'admin') {
      
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

  const clearStoredAuth = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('joyce-suites-token');
    localStorage.removeItem('joyce-suites-user');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userId');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userFullName');
  };

  const getErrorMessage = (err, status = null, responseData = null) => {
    
    if (err?.message?.includes('Failed to fetch')) {
      return 'Network error: Unable to reach the server. Please check your internet connection.';
    }

    if (err instanceof TypeError) {
      return 'Connection failed. Please check your internet and try again.';
    }

    if (err instanceof SyntaxError) {
      return 'Server returned invalid data. Please try again.';
    }

    
    if (status === 401) {
      return 'Invalid email or password. Please try again.';
    }

    if (status === 403) {
      return 'Access denied. This portal is for administrators only.';
    }

    if (status === 400) {
      return responseData?.error || 'Invalid login credentials.';
    }

    if (status && status >= 500) {
      return 'Server error. Please try again later.';
    }

    
    if (responseData?.error) {
      return responseData.error;
    }

    if (responseData?.message) {
      return responseData.message;
    }

    
    return 'Login failed. Please try again.';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      
      clearStoredAuth();

      if (!formData.email || !formData.password) {
        setError('Email and password are required');
        setLoading(false);
        return;
      }

      const email = formData.email.trim().toLowerCase();
      

      
      const API_BASE_URL = 'https://joyce-suites-xdkp.onrender.com';
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email,
          password: formData.password
        })
      });

      const contentType = response.headers.get('content-type');
      
      if (!contentType || !contentType.includes('application/json')) {
        console.error('❌ Invalid response format from server');
        setError('Server error: Invalid response format.');
        setLoading(false);
        return;
      }

      const data = await response.json();
      

      if (!response.ok) {
        console.error('❌ Login failed with status:', response.status);
        clearStoredAuth();
        const errorMsg = getErrorMessage(null, response.status, data);
        setError(errorMsg);
        setLoading(false);
        return;
      }

      if (!data.success) {
        console.error('❌ Response marked as not successful');
        clearStoredAuth();
        const errorMsg = getErrorMessage(null, null, data);
        setError(errorMsg);
        setLoading(false);
        return;
      }

      
      if (!data.user || !data.user.role) {
        console.error('❌ Invalid response structure');
        clearStoredAuth();
        setError('Invalid response from server');
        setLoading(false);
        return;
      }

      
      if (data.user.role !== 'admin') {
        console.error('❌ User is not an admin, role is:', data.user.role);
        clearStoredAuth();
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

      
      const savedToken = localStorage.getItem('joyce-suites-token');
      

      
      
      navigate('/admin/dashboard', { replace: true });

    } catch (err) {
      console.error('❌ Login error:', err);
      clearStoredAuth();
      
      const errorMsg = getErrorMessage(err);
      setError(errorMsg);
      setLoading(false);
    }
  };

  
  const fillDefaultCredentials = () => {
    const defaultEmail = process.env.REACT_APP_DEFAULT_ADMIN_EMAIL;
    const defaultPassword = process.env.REACT_APP_DEFAULT_ADMIN_PASSWORD;

    if (defaultEmail && defaultPassword) {
      setFormData({
        email: defaultEmail,
        password: defaultPassword
      });
      setError('');
    } else {
      setError('Default credentials not configured');
    }
  };

  return (
    <div className="login-container" style={{ backgroundImage: `url(${backgroundImage})` }}>
      <div className="login-overlay"></div>
      
      <div className="login-content">
        <div className="login-card">
          <img src={logo} alt="Joyce Suites Logo" className="login-logo" />
          <h1>Joyce Suites Apartments</h1>
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
                aria-label="Close error message"
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
                placeholder="admin@joycesuites.com"
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

            {process.env.NODE_ENV === 'development' &&
              process.env.REACT_APP_DEFAULT_ADMIN_EMAIL && (
                <button
                  type="button"
                  onClick={fillDefaultCredentials}
                  className="btn btn-secondary"
                  style={{ marginBottom: '10px', width: '100%' }}
                  disabled={loading}
                >
                  Use Default Credentials
                </button>
              )}

            <button 
              type="submit" 
              className="btn btn-primary" 
              disabled={loading}
            >
              {loading ? 'Verifying...' : 'Login to Admin Portal'}
            </button>
          </form>

          {process.env.NODE_ENV === 'development' &&
            process.env.REACT_APP_DEFAULT_ADMIN_EMAIL && (
              <div
                className="login-info"
                style={{
                  marginTop: '20px',
                  padding: '12px',
                  backgroundColor: '#f0f9ff',
                  borderRadius: '6px',
                  fontSize: '13px',
                  color: '#0369a1'
                }}
              >
                <strong>🔑 Development Mode:</strong>
                <br />
                Default credentials available via button above
              </div>
            )}

          {process.env.NODE_ENV === 'development' && (
            <div
              className="login-info"
              style={{
                marginTop: '15px',
                padding: '10px',
                backgroundColor: '#fff3cd',
                borderRadius: '6px',
                fontSize: '12px',
                color: '#856404',
                border: '1px solid #ffeaa7'
              }}
            >
              <strong>⚠️ Default Credentials:</strong>
              <br />
              Email: admin@joycesuites.com
              <br />
              Password: Admin@123456
            </div>
          )}
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