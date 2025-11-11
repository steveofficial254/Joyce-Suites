import React, { useState } from 'react';
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

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      // ✅ Check response.ok FIRST and RETURN if not OK
      if (!response.ok) {
        setError(data.error || data.message || 'Login failed');
        setLoading(false);
        return; // ✅ STOP HERE - prevents navigation on error
      }

      // ✅ Check if user role is caretaker
      if (data.user.role !== 'caretaker') {
        setError('Caretaker access required. Please use your caretaker credentials.');
        setLoading(false);
        return;
      }

      // ✅ Only execute below if response.ok is true and role is caretaker
      localStorage.setItem('token', data.token);
      localStorage.setItem('userRole', 'caretaker');
      localStorage.setItem('userId', data.user.user_id);

      navigate('/caretaker/dashboard');
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.');
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
          <h2>Caretaker Login</h2>

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
                placeholder="caretaker@joycesuites.com"
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

            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Logging in...' : 'Login as Caretaker'}
            </button>
          </form>
        </div>

        <div className="auth-navigation">
          <button onClick={() => navigate('/login')} className="nav-btn tenant-btn">
            ← Tenant Login
          </button>
          <button onClick={() => navigate('/admin-login')} className="nav-btn admin-btn">
            Admin Login →
          </button>
        </div>
      </div>
    </div>
  );
};

export default CaretakerLogin;