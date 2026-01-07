import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';
import logo from '../../assets/image1.png';
import backgroundImage from '../../assets/image21.jpg';

const CaretakerLogin = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  // Check if already logged in as caretaker or admin
  useEffect(() => {
    const token = localStorage.getItem('joyce-suites-token');
    const userRole = localStorage.getItem('userRole');
    
    if (token && (userRole === 'caretaker' || userRole === 'admin')) {
      console.log(`✅ User already logged in as ${userRole}`);
      navigate('/caretaker/dashboard', { replace: true });
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
    const keysToRemove = [
      'token',
      'joyce-suites-token',
      'joyce-suites-user',
      'userRole',
      'userId',
      'userEmail',
      'userFullName'
    ];
    keysToRemove.forEach(key => localStorage.removeItem(key));
  };

  const storeAuthData = (user, token) => {
    const userData = {
      id: user.user_id,
      user_id: user.user_id,
      email: user.email,
      full_name: user.full_name,
      role: user.role,
      phone_number: user.phone || user.phone_number,
      loginTime: new Date().toISOString()
    };

    localStorage.setItem('joyce-suites-token', token);
    localStorage.setItem('userRole', user.role);
    localStorage.setItem('userId', user.user_id);
    localStorage.setItem('userEmail', user.email);
    localStorage.setItem('userFullName', user.full_name);
    localStorage.setItem('joyce-suites-user', JSON.stringify(userData));

    console.log('💾 Auth data saved successfully');
  };

  const getErrorMessage = (err, status = null, responseData = null) => {
    // Network/connectivity errors
    if (err?.message?.includes('Failed to fetch')) {
      return 'Network error: Unable to reach the server. Please check your internet connection.';
    }

    if (err instanceof TypeError) {
      return 'Connection failed. Please check your internet and try again.';
    }

    if (err instanceof SyntaxError) {
      return 'Server returned invalid data. Please try again.';
    }

    // HTTP status-based errors
    if (status === 401) {
      return 'Invalid email or password. Please try again.';
    }

    if (status === 403) {
      return 'Access denied. This portal is for caretakers only.';
    }

    if (status === 400) {
      return responseData?.error || 'Invalid login credentials.';
    }

    if (status && status >= 500) {
      return 'Server error. Please try again later.';
    }

    // API response errors
    if (responseData?.error) {
      return responseData.error;
    }

    if (responseData?.message) {
      return responseData.message;
    }

    // Generic fallback
    return 'Login failed. Please try again.';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      console.log('🧹 Clearing old tokens...');
      clearStoredAuth();

      // Validate form inputs
      if (!formData.email || !formData.password) {
        setError('Email and password are required');
        setLoading(false);
        return;
      }

      const email = formData.email.trim().toLowerCase();
      console.log('📡 Attempting caretaker login with email:', email);

      // Build login URL - no config needed
      const API_BASE_URL = 'https://joyce-suites-xdkp.onrender.com';
      const loginUrl = `${API_BASE_URL}/api/auth/login`;
      console.log('🔗 Login URL:', loginUrl);

      const response = await fetch(loginUrl, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: email,
          password: formData.password
        })
      });

      // Check response content type
      const contentType = response.headers.get('content-type');
      if (!contentType?.includes('application/json')) {
        console.error('❌ Invalid response format from server');
        setError('Server returned invalid data format. Please try again.');
        setLoading(false);
        return;
      }

      const data = await response.json();
      console.log('📨 Login response status:', response.status);

      // Handle non-200 responses
      if (!response.ok) {
        console.error('❌ Login failed with status:', response.status);
        clearStoredAuth();
        const errorMsg = getErrorMessage(null, response.status, data);
        setError(errorMsg);
        setLoading(false);
        return;
      }

      // Validate success flag
      if (!data.success) {
        console.error('❌ Response marked as not successful');
        clearStoredAuth();
        const errorMsg = getErrorMessage(null, null, data);
        setError(errorMsg);
        setLoading(false);
        return;
      }

      // Validate user data structure
      if (!data.user || !data.user.role) {
        console.error('❌ Invalid response structure');
        clearStoredAuth();
        setError('Invalid server response. Please try again.');
        setLoading(false);
        return;
      }

      // Validate user role
      const validRoles = ['caretaker', 'admin'];
      if (!validRoles.includes(data.user.role)) {
        console.error('❌ User role not authorized:', data.user.role);
        clearStoredAuth();
        setError('Access denied. This portal is for caretakers only.');
        setLoading(false);
        return;
      }

      // Validate authentication token
      if (!data.token) {
        console.error('❌ No token in response');
        clearStoredAuth();
        setError('Authentication failed. Please try again.');
        setLoading(false);
        return;
      }

      // Store authentication data
      console.log('💾 Saving caretaker token and user data...');
      storeAuthData(data.user, data.token);

      // Verify token was saved
      const savedToken = localStorage.getItem('joyce-suites-token');
      console.log('🔍 Verification - Token in storage:', savedToken ? '✅ YES' : '❌ NO');

      console.log(`✅ ${data.user.role} login successful, redirecting to dashboard...`);
      navigate('/caretaker/dashboard', { replace: true });

    } catch (err) {
      console.error('❌ Login error:', err);
      clearStoredAuth();
      
      const errorMsg = getErrorMessage(err);
      setError(errorMsg);
      setLoading(false);
    }
  };

  // Helper to fill default credentials (development only)
  const fillDefaultCredentials = () => {
    const defaultEmail = process.env.REACT_APP_DEFAULT_CARETAKER_EMAIL;
    const defaultPassword = process.env.REACT_APP_DEFAULT_CARETAKER_PASSWORD;

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
          <h2>Caretaker Portal</h2>

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
              <label htmlFor="email">Caretaker Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="caretaker@joycesuites.com"
                required
                autoComplete="email"
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Caretaker Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Enter your password"
                required
                autoComplete="current-password"
                disabled={loading}
              />
            </div>

            {process.env.NODE_ENV === 'development' &&
              process.env.REACT_APP_DEFAULT_CARETAKER_EMAIL && (
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
              {loading ? 'Verifying...' : 'Login to Caretaker Portal'}
            </button>
          </form>

          {process.env.NODE_ENV === 'development' &&
            process.env.REACT_APP_DEFAULT_CARETAKER_EMAIL && (
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
            onClick={() => navigate('/admin-login')}
            className="nav-btn admin-btn"
            disabled={loading}
          >
            Admin Login →
          </button>
        </div>
      </div>
    </div>
  );
};

export default CaretakerLogin;