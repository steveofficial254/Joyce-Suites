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

  // 🧹 Clear previous login data
  localStorage.removeItem('token');
  localStorage.removeItem('userRole');
  localStorage.removeItem('userId');

  setError('');
  setLoading(true);

  try {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 1200));

    // 💡 Fake validation (optional)
    if (formData.email === '' || formData.password === '') {
      throw new Error('Please enter both email and password');
    }

    // 💡 Mock successful login response
    const fakeResponse = {
      token: 'mocked-jwt-token-123456',
      userId: Math.floor(Math.random() * 1000),
      leaseSigned: true, // toggle this to test redirect flow
    };

    // ✅ Store in localStorage
    localStorage.setItem('token', fakeResponse.token);
    localStorage.setItem('userRole', 'tenant');
    localStorage.setItem('userId', fakeResponse.userId);

    // 🧭 Redirect mock
    if (fakeResponse.leaseSigned) {
      navigate('/tenant/dashboard');
    } else {
      navigate('/lease-agreement');
    }

    console.log('Mock login success:', fakeResponse);
  } catch (err) {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userId');
    setError(err.message || 'Mock login failed');
  } finally {
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
  );
};

export default TenantLogin;
