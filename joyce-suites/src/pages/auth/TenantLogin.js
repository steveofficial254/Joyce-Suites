import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';
import logo from '../../assets/image1.png';
import backgroundImage from '../../assets/image21.jpg';
import config from '../../config';

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

    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userId');
    localStorage.removeItem('joyce-suites-token');
    localStorage.removeItem('joyce-suites-user');

    setError('');
    setLoading(true);

    try {
      const response = await fetch(`${config.apiBaseUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      let data;
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.indexOf("application/json") !== -1) {
        data = await response.json();
      } else {
        const text = await response.text();
        console.error('❌ Non-JSON response received:', text);
        setError(`Server error (${response.status}). Please try again later.`);
        setLoading(false);
        return;
      }

      if (!response.ok) {
        console.error('❌ Login failed with status:', response.status);
        setError(data.error || data.message || 'Login failed');
        setLoading(false);
        return;
      }

      if (data.user.role !== 'tenant') {
        setError('Tenant access required. Please use your tenant credentials.');
        setLoading(false);
        return;
      }

      if (!data.token) {
        setError('No authentication token received');
        setLoading(false);
        return;
      }

      localStorage.setItem('joyce-suites-token', data.token);
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

      if (data.lease_signing_required) {
        navigate('/tenant/lease-gate');
      } else {
        navigate('/tenant/dashboard');
      }
    } catch (err) {
      console.error('❌ Login error:', err);
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
    </div >
  );
};

export default TenantLogin;