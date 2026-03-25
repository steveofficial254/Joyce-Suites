import React from 'react';
import { useAuth } from '../../context/AuthContext';
import './Topbar.css';

function Topbar() {
  const { user } = useAuth();

  return (
    <div className="topbar">
      <div className="topbar-left">
        <h1>Welcome back, {user?.name}!</h1>
        <p>Here's what's happening today.</p>
      </div>
      
      <div className="topbar-right">
        <div className="user-info">
          <img src={user?.avatar} alt={user?.name} className="user-avatar" />
          <span className="user-name">{user?.name}</span>
          <span className="user-role">{user?.role}</span>
        </div>
      </div>
    </div>
  );
}

export default Topbar;