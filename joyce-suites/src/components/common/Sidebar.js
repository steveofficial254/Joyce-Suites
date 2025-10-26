import React from 'react';
import { useAuth } from '../../context/AuthContext';
import './Sidebar.css';

function Sidebar() {
  const { user, logout } = useAuth();

  const tenantMenu = [
    { path: '/tenant/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/tenant/contract', label: 'My Contract', icon: '📝' },
    { path: '/tenant/payments', label: 'Payments', icon: '💳' },
    { path: '/tenant/profile', label: 'Profile', icon: '👤' }
  ];

  const caretakerMenu = [
    { path: '/caretaker/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/caretaker/tenants', label: 'Tenants', icon: '👥' },
    { path: '/caretaker/payments', label: 'Payment Verification', icon: '✅' },
    { path: '/caretaker/comments', label: 'Comments', icon: '💬' }
  ];

  const adminMenu = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/admin/tenants', label: 'Tenant Management', icon: '👥' },
    { path: '/admin/units', label: 'Unit Management', icon: '🏢' },
    { path: '/admin/payments', label: 'Financial Reports', icon: '💰' },
    { path: '/admin/reports', label: 'Reports', icon: '📈' }
  ];

  const menuItems = user?.role === 'admin' ? adminMenu : 
                   user?.role === 'caretaker' ? caretakerMenu : tenantMenu;

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h2>Joyce Suites</h2>
        <p>{user?.role?.toUpperCase()}</p>
      </div>
      
      <nav className="sidebar-nav">
        {menuItems.map(item => (
          <a 
            key={item.path} 
            href={item.path}
            className="nav-item"
            onClick={(e) => {
              e.preventDefault();
              window.location.href = item.path;
            }}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
          </a>
        ))}
      </nav>
      
      <div className="sidebar-footer">
        <button onClick={logout} className="logout-btn">
          🚪 Logout
        </button>
      </div>
    </div>
  );
}

export default Sidebar;