import React from 'react';
import { useAuth } from '../../context/AuthContext';
import './Sidebar.css';
import {
  LayoutDashboard, FileText, CreditCard, User,
  Users, CheckCircle, MessageSquare, Building,
  DollarSign, TrendingUp, LogOut
} from 'lucide-react';


function Sidebar() {
  const { user, logout } = useAuth();

  const tenantMenu = [
    { path: '/tenant/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/tenant/contract', label: 'My Contract', icon: FileText },
    { path: '/tenant/payments', label: 'Payments', icon: CreditCard },
    { path: '/tenant/profile', label: 'Profile', icon: User }
  ];

  const caretakerMenu = [
    { path: '/caretaker/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/caretaker/tenants', label: 'Tenants', icon: Users },
    { path: '/caretaker/payments', label: 'Payment Verification', icon: CheckCircle },
    { path: '/caretaker/comments', label: 'Comments', icon: MessageSquare }
  ];

  const adminMenu = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/admin/tenants', label: 'Tenant Management', icon: Users },
    { path: '/admin/units', label: 'Unit Management', icon: Building },
    { path: '/admin/payments', label: 'Financial Reports', icon: DollarSign },
    { path: '/admin/reports', label: 'Reports', icon: TrendingUp }
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
            <span className="nav-icon"><item.icon size={18} /></span>
            <span className="nav-label">{item.label}</span>
          </a>
        ))}
      </nav>

      <div className="sidebar-footer">
        <button onClick={logout} className="logout-btn" style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
          <LogOut size={18} /> Logout
        </button>
      </div>
    </div>
  );
}

export default Sidebar;