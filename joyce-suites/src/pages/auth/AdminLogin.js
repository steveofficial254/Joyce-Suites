import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Login.css';
import logo from '../../assets/image1.png';
import backgroundImage from '../../assets/image21.jpg';
import { ArrowLeft, ArrowRight, Key, X, AlertCircle } from 'lucide-react';


const AdminLogin = () => {
  const navigate = useNavigate();
  const { login, loading: authLoading, error: authError, clearError, user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });


  useEffect(() => {
    if (user && user.role === 'admin') {
      navigate('/admin/dashboard', { replace: true });
    }
  }, [user, navigate]);

  useEffect(() => {
    if (authError) {
      setError(authError);
    }
  }, [authError]);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (error) {
      setError('');
      clearError();
    }
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
      if (!formData.email || !formData.password) {
        setError('Email and password are required');
        setLoading(false);
        return;
      }

      const email = formData.email.trim().toLowerCase();

      const result = await login(email, formData.password);

      if (result.success) {
        if (result.user.role !== 'admin') {
          setError('Admin access required. Please use your admin credentials.');
          setLoading(false);
          return;
        }


      } else {
        setError(result.error || 'Login failed');
      }
    } catch (err) {
      setError('Login failed. Please try again.');
    } finally {
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
            <div className="error-banner">
              <AlertCircle size={16} />
              <span>{error}</span>
              <button onClick={() => setError('')} className="close-error">
                <X size={18} />
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
              disabled={loading || authLoading}
            >
              {(loading || authLoading) ? 'Verifying...' : 'Login to Admin Portal'}
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
                <div className="dev-mode-badge" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Key size={16} />
                  <strong>Development Mode:</strong>
                  <span>Admin access enabled</span>
                </div>
              </div>
            )}

        </div>

        <div className="auth-navigation">
          <button
            onClick={() => navigate('/login')}
            className="btn-link"
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
            disabled={loading || authLoading}
          >
            <ArrowLeft size={16} /> Tenant Login
          </button>
          <button
            onClick={() => navigate('/caretaker-login')}
            className="btn-link"
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
            disabled={loading || authLoading}
          >
            Caretaker Login <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;