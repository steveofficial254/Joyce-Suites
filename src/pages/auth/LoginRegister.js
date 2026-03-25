import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import './LoginRegister.css';

const LoginRegister = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'tenant',
    unitNumber: ''
  });
  const { login, signup, loading, error, clearError } = useAuth();

  useEffect(() => {
    clearError();
  }, [isLogin, clearError]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (isLogin) {
      await login(formData.email, formData.password);
    } else {
      await signup(formData);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleDemoLogin = async (role) => {
    const demoUsers = {
      tenant: { email: 'tenant@example.com', password: 'password' },
      caretaker: { email: 'caretaker@example.com', password: 'password' },
      admin: { email: 'admin@example.com', password: 'password' }
    };
    
    
    setFormData(prev => ({
      ...prev,
      email: demoUsers[role].email,
      password: demoUsers[role].password
    }));

    
    try {
      await login(demoUsers[role].email, demoUsers[role].password);
    } catch (error) {
      
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-form">
        <h2>{isLogin ? 'Login' : 'Register'}</h2>
        
        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <>
              <input
                type="text"
                name="name"
                placeholder="Full Name"
                value={formData.name}
                onChange={handleChange}
                required
              />
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                required
              >
                <option value="tenant">Tenant</option>
                <option value="caretaker">Caretaker</option>
                <option value="admin">Admin</option>
              </select>
              {formData.role === 'tenant' && (
                <input
                  type="text"
                  name="unitNumber"
                  placeholder="Unit Number"
                  value={formData.unitNumber}
                  onChange={handleChange}
                  required
                />
              )}
            </>
          )}
          
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
          />
          
          <button type="submit" disabled={loading}>
            {loading ? 'Loading...' : (isLogin ? 'Login' : 'Register')}
          </button>
        </form>

        {}
        <div className="demo-buttons">
          <h4>Demo Logins:</h4>
          <button 
            type="button" 
            onClick={() => handleDemoLogin('tenant')}
            className="demo-btn tenant"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login as Tenant'}
          </button>
          <button 
            type="button" 
            onClick={() => handleDemoLogin('caretaker')}
            className="demo-btn caretaker"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login as Caretaker'}
          </button>
          <button 
            type="button" 
            onClick={() => handleDemoLogin('admin')}
            className="demo-btn admin"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login as Admin'}
          </button>
        </div>

        <p>
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button 
            type="button" 
            onClick={() => setIsLogin(!isLogin)}
            className="link-button"
          >
            {isLogin ? 'Register' : 'Login'}
          </button>
        </p>
      </div>
    </div>
  );
};

export default LoginRegister;