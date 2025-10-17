import React from 'react';
import { useAuth } from '../../context/AuthContext';
import './TenantDashboard.css';

function TenantDashboard() {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  // Sample data - replace with actual data from your backend
  const tenantData = {
    unitNumber: user?.unitNumber || 'A-101',
    rentDue: '$1,200',
    dueDate: '15th December 2024',
    paymentStatus: 'Paid',
    maintenanceRequests: 2,
    announcements: [
      'Water shutdown on Dec 20th, 2-4 PM',
      'Annual building maintenance scheduled for January'
    ]
  };

  return (
    <div className="tenant-dashboard">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-content">
          <h1>Welcome back, {user?.name || 'Tenant'}!</h1>
          <div className="user-info">
            <span>Unit {tenantData.unitNumber}</span>
            <button onClick={handleLogout} className="logout-btn">
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="dashboard-container">
        {/* Main Content Grid */}
        <div className="dashboard-grid">
          
          {/* Rent Information Card */}
          <div className="dashboard-card rent-card">
            <h2>Rent Information</h2>
            <div className="card-content">
              <div className="info-item">
                <label>Monthly Rent:</label>
                <span className="amount">{tenantData.rentDue}</span>
              </div>
              <div className="info-item">
                <label>Due Date:</label>
                <span>{tenantData.dueDate}</span>
              </div>
              <div className="info-item">
                <label>Status:</label>
                <span className={`status ${tenantData.paymentStatus.toLowerCase()}`}>
                  {tenantData.paymentStatus}
                </span>
              </div>
              <button className="action-btn primary">
                Pay Rent
              </button>
            </div>
          </div>

          {/* Maintenance Card */}
          <div className="dashboard-card maintenance-card">
            <h2>Maintenance</h2>
            <div className="card-content">
              <div className="info-item">
                <label>Open Requests:</label>
                <span className="count">{tenantData.maintenanceRequests}</span>
              </div>
              <div className="action-buttons">
                <button className="action-btn secondary">
                  New Request
                </button>
                <button className="action-btn outline">
                  View Requests
                </button>
              </div>
            </div>
          </div>

          {/* Announcements Card */}
          <div className="dashboard-card announcements-card">
            <h2>Building Announcements</h2>
            <div className="card-content">
              {tenantData.announcements.length > 0 ? (
                <ul className="announcements-list">
                  {tenantData.announcements.map((announcement, index) => (
                    <li key={index} className="announcement-item">
                      {announcement}
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No announcements at this time.</p>
              )}
            </div>
          </div>

          {/* Quick Actions Card */}
          <div className="dashboard-card actions-card">
            <h2>Quick Actions</h2>
            <div className="card-content">
              <div className="action-grid">
                <button className="quick-action">
                  <span className="icon">📝</span>
                  <span>Submit Form</span>
                </button>
                <button className="quick-action">
                  <span className="icon">📞</span>
                  <span>Contact Caretaker</span>
                </button>
                <button className="quick-action">
                  <span className="icon">🏢</span>
                  <span>Building Info</span>
                </button>
                <button className="quick-action">
                  <span className="icon">⚙️</span>
                  <span>Settings</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TenantDashboard;