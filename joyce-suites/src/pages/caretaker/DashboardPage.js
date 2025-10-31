import React from 'react';
import { Eye, MessageSquare } from 'lucide-react';

const DashboardPage = ({ stats, tenants }) => {
  return (
    <>
      <h2 className="page-title">Dashboard Overview</h2>
      
      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card stat-card-primary">
          <div className="stat-icon"></div>
          <div className="stat-content">
            <p className="stat-label">Total Tenants</p>
            <h3 className="stat-value">{stats.totalTenants}</h3>
          </div>
        </div>

        <div className="stat-card stat-card-success">
          <div className="stat-icon">✓</div>
          <div className="stat-content">
            <p className="stat-label">Paid This Month</p>
            <h3 className="stat-value">{stats.paidThisMonth}</h3>
          </div>
        </div>

        <div className="stat-card stat-card-warning">
          <div className="stat-icon"></div>
          <div className="stat-content">
            <p className="stat-label">Pending Payments</p>
            <h3 className="stat-value">{stats.pendingPayments}</h3>
          </div>
        </div>

        <div className="stat-card stat-card-danger">
          <div className="stat-icon"></div>
          <div className="stat-content">
            <p className="stat-label">Overdue Accounts</p>
            <h3 className="stat-value">{stats.overdueAccounts}</h3>
          </div>
        </div>
      </div>

      {/* Recent Activity Section */}
      <div className="section">
        <h3 className="section-title">Recent Tenant Activity</h3>
        <table className="data-table">
          <thead className="table-header">
            <tr>
              <th>Tenant Name</th>
              <th>Room</th>
              <th>Type</th>
              <th>Rent</th>
              <th>Status</th>
              <th>Balance</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {tenants.slice(0, 5).map(tenant => (
              <tr key={tenant.id} className="table-row">
                <td>{tenant.name}</td>
                <td>#{tenant.room}</td>
                <td>{tenant.type}</td>
                <td>KSh {tenant.rent.toLocaleString()}</td>
                <td>
                  <span className={`status-badge status-${tenant.status.toLowerCase()}`}>
                    {tenant.status}
                  </span>
                </td>
                <td style={{ 
                  color: tenant.balance > 0 ? '#991b1b' : '#047857', 
                  fontWeight: '600' 
                }}>
                  KSh {tenant.balance.toLocaleString()}
                </td>
                <td>
                  <div className="action-buttons">
                    <button className="btn btn-sm btn-primary" title="View Payment">
                      <Eye size={14} />
                    </button>
                    <button className="btn btn-sm btn-secondary" title="Add Comment">
                      <MessageSquare size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Quick Stats Summary */}
      <div className="summary-section">
        <h3 className="section-title">Payment Summary</h3>
        <div className="summary-grid">
          <div className="summary-card">
            <span className="summary-label">Collected</span>
            <span className="summary-value">
              KSh {(stats.paidThisMonth * 15000).toLocaleString()}
            </span>
          </div>
          <div className="summary-card warning">
            <span className="summary-label">Pending</span>
            <span className="summary-value">
              KSh {(stats.pendingPayments * 20000).toLocaleString()}
            </span>
          </div>
          <div className="summary-card danger">
            <span className="summary-label">Overdue</span>
            <span className="summary-value">
              KSh {(stats.overdueAccounts * 15000).toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </>
  );
};

export default DashboardPage;