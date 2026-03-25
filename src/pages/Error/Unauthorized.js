import React from 'react';
import { useNavigate } from 'react-router-dom';

const Unauthorized = () => {
  const navigate = useNavigate();
  
  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      minHeight: '100vh',
      padding: '20px',
      textAlign: 'center'
    }}>
      <h1 style={{ fontSize: '4rem', color: '#7D1F3F' }}>403</h1>
      <h2>Unauthorized Access</h2>
      <p>You don't have permission to access this page.</p>
      <button 
        onClick={() => navigate('/login')}
        style={{
          marginTop: '20px',
          padding: '12px 24px',
          background: '#7D1F3F',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer'
        }}
      >
        Go to Login
      </button>
    </div>
  );
};

export default Unauthorized;