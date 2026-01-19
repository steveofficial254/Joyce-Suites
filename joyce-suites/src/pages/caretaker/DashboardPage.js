import React from 'react';
import { TrendingUp, AlertCircle, Users, Home } from 'lucide-react';

const DashboardPage = ({ data, loading }) => {
  if (loading || !data) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <>
      <h2 className="page-title">Dashboard Overview</h2>
      
      {}
      <div className="stats-grid">
        <div className="stat-card stat-card-primary">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <p className="stat-label">Total Tenants</p>
            <h3 className="stat-value">{data.total_tenants}</h3>
          </div>
        </div>

        <div className="stat-card stat-card-success">
          <div className="stat-icon">🏠</div>
          <div className="stat-content">
            <p className="stat-label">Occupied Rooms</p>
            <h3 className="stat-value">{data.occupied_rooms}</h3>
          </div>
        </div>

        <div className="stat-card stat-card-warning">
          <div className="stat-icon">🔓</div>
          <div className="stat-content">
            <p className="stat-label">Available Rooms</p>
            <h3 className="stat-value">{data.available_rooms}</h3>
          </div>
        </div>

        <div className="stat-card stat-card-danger">
          <div className="stat-icon">⚠️</div>
          <div className="stat-content">
            <p className="stat-label">Arrears</p>
            <h3 className="stat-value">{data.tenants_with_arrears}</h3>
          </div>
        </div>
      </div>

      {}
      <div className="section">
        <h3 className="section-title">Maintenance Overview</h3>
        <div className="summary-grid">
          <div className="summary-card">
            <span className="summary-label">Total Requests</span>
            <span className="summary-value">
              {data.total_maintenance_requests}
            </span>
          </div>
          <div className="summary-card warning">
            <span className="summary-label">Pending</span>
            <span className="summary-value">
              {data.pending_requests}
            </span>
          </div>
          <div className="summary-card info">
            <span className="summary-label">In Progress</span>
            <span className="summary-value">
              {data.in_progress_requests}
            </span>
          </div>
          <div className="summary-card success">
            <span className="summary-label">Completed</span>
            <span className="summary-value">
              {data.completed_requests}
            </span>
          </div>
        </div>
      </div>

      {}
      <div className="section info-section">
        <h3 className="section-title">Quick Actions</h3>
        <div className="guidelines-list">
          <div className="guideline-item">
            <span className="guideline-number">🔧</span>
            <div className="guideline-text">
              <h5>Urgent Maintenance ({data.quick_actions.urgent_maintenance.length})</h5>
              <p>Check urgent maintenance requests that need immediate attention</p>
            </div>
          </div>
          <div className="guideline-item">
            <span className="guideline-number">💰</span>
            <div className="guideline-text">
              <h5>Payment Follow-ups ({data.quick_actions.urgent_payments.length})</h5>
              <p>Follow up with tenants who have outstanding balances</p>
            </div>
          </div>
          <div className="guideline-item">
            <span className="guideline-number">🏠</span>
            <div className="guideline-text">
              <h5>Room Management</h5>
              <p>Monitor available and occupied rooms</p>
            </div>
          </div>
          <div className="guideline-item">
            <span className="guideline-number">📢</span>
            <div className="guideline-text">
              <h5>Send Notifications</h5>
              <p>Communicate with tenants about important updates</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default DashboardPage;