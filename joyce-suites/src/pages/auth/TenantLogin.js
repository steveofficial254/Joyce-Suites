import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';
import logo from '../../assets/image1.png';
import backgroundImage from '../../assets/image21.jpg';

const TenantLogin = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 🧹 Always clear any previous tokens before login attempt
    console.log('🧹 Clearing old tokens...');
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userId');
    localStorage.removeItem('joyce-suites-token');
    localStorage.removeItem('joyce-suites-user');

    setError('');
    setLoading(true);

    try {
      console.log('📡 Attempting login with email:', formData.email);
      
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      console.log('📨 Login response:', data);

      if (!response.ok) {
        // 🚨 Ensure full cleanup on bad response
        console.error('❌ Login failed with status:', response.status);
        localStorage.removeItem('joyce-suites-token');
        localStorage.removeItem('joyce-suites-user');

        setError(data.error || data.message || 'Login failed');
        setLoading(false);
        return;
      }

      // ✅ Check if user role is tenant
      if (data.user.role !== 'tenant') {
        console.error('❌ User is not a tenant, role is:', data.user.role);
        localStorage.removeItem('joyce-suites-token');
        localStorage.removeItem('joyce-suites-user');

        setError('Tenant access required. Please use your tenant credentials.');
        setLoading(false);
        return;
      }

      // ✅ Successful login - SAVE WITH CORRECT KEY
      console.log('✅ Login successful, saving token...');
      
      if (!data.token) {
        console.error('❌ No token in response');
        setError('No authentication token received');
        setLoading(false);
        return;
      }

      // Save token with CORRECT key name
      localStorage.setItem('joyce-suites-token', data.token);
      console.log('💾 Token saved as "joyce-suites-token"');

      // Save user data
      const userData = {
        user_id: data.user.user_id,
        email: data.user.email,
        full_name: data.user.full_name,
        role: data.user.role,
        phone_number: data.user.phone || data.user.phone_number,
        loginTime: new Date().toISOString()
      };
      localStorage.setItem('joyce-suites-user', JSON.stringify(userData));
      localStorage.setItem('userRole', 'tenant');
      localStorage.setItem('userId', data.user.user_id);

      // ✅ CHECK FOR LEASE SIGNING REQUIRED
      console.log('📋 Checking lease signing status:', {
        lease_signing_required: data.lease_signing_required,
        unsigned_lease_id: data.unsigned_lease_id
      });

      // Verify token was saved
      const savedToken = localStorage.getItem('joyce-suites-token');
      console.log('🔍 Verification - Token in storage:', savedToken ? '✅ YES' : '❌ NO');

      // Redirect based on lease signing status
      if (data.lease_signing_required) {
        console.log('🚀 Redirecting to lease gate (lease needs signing)...');
        navigate('/tenant/lease-gate');
      } else {
        console.log('🚀 Redirecting to tenant dashboard...');
        navigate('/tenant/dashboard');
      }

    } catch (err) {
      console.error('❌ Login error:', err);
      
      // 🚨 Network or unexpected error — always clear again
      localStorage.removeItem('joyce-suites-token');
      localStorage.removeItem('joyce-suites-user');

      setError(err.message || 'Network error. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div
      className="login-container"
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      <div className="login-overlay"></div>

      <div className="login-content">
        <div className="login-card">
          <img src={logo} alt="Joyce Suits Logo" className="login-logo" />
          <h1>Joyce Suits Apartments</h1>
          <h2>Tenant Login</h2>

          {error && <div className="alert alert-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="your.email@example.com"
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Enter your password"
                required
                disabled={loading}
              />
            </div>

            <div className="form-actions">
              <a href="/forgot-password" className="forgot-link">
                Forgot Password?
              </a>
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <div className="auth-links">
            <p>
              Don't have an account?{' '}
              <a href="/register-tenant">Register here</a>
            </p>
          </div>
        </div>

        <div className="auth-navigation">
          <button
            onClick={() => navigate('/caretaker-login')}
            className="nav-btn caretaker-btn"
            disabled={loading}
          >
            Caretaker Login →
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

export default TenantLogin;