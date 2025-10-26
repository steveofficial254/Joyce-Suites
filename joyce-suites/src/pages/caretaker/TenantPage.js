import React, { useState } from 'react';
import { Eye, MessageSquare, Search, Filter } from 'lucide-react';

const TenantsPage = ({ tenants }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');

  // Filter tenants based on search and status
  const filtered = tenants.filter(tenant => {
    const matchSearch = 
      tenant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tenant.room.includes(searchTerm);
    const matchStatus = filterStatus === 'All' || tenant.status === filterStatus;
    return matchSearch && matchStatus;
  });

  return (
    <>
      <h2 className="page-title">Tenants Management</h2>

      {/* Search and Filter Section */}
      <div className="search-filter-section">
        <div className="search-box">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search by name or room number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filter-group">
          <Filter size={18} />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="filter-select"
          >
            <option value="All">All Status</option>
            <option value="Paid">Paid</option>
            <option value="Pending">Pending</option>
            <option value="Overdue">Overdue</option>
          </select>
        </div>
      </div>

      {/* Tenants Table */}
      <div className="section">
        <h3 className="section-title">All Tenants ({filtered.length})</h3>
        
        {filtered.length === 0 ? (
          <div className="empty-state">
            <p>No tenants found matching your criteria</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="data-table">
              <thead className="table-header">
                <tr>
                  <th>Tenant Name</th>
                  <th>Room Number</th>
                  <th>Unit Type</th>
                  <th>Monthly Rent</th>
                  <th>Payment Status</th>
                  <th>Outstanding Balance</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(tenant => (
                  <tr key={tenant.id} className="table-row">
                    <td>
                      <span className="tenant-name">{tenant.name}</span>
                    </td>
                    <td>
                      <span className="room-badge">#{tenant.room}</span>
                    </td>
                    <td>{tenant.type}</td>
                    <td>
                      <span className="rent-amount">KSh {tenant.rent.toLocaleString()}</span>
                    </td>
                    <td>
                      <span className={`status-badge status-${tenant.status.toLowerCase()}`}>
                        {tenant.status}
                      </span>
                    </td>
                    <td>
                      <span 
                        className="balance-amount"
                        style={{ 
                          color: tenant.balance > 0 ? '#991b1b' : '#047857',
                          fontWeight: '700'
                        }}
                      >
                        KSh {tenant.balance.toLocaleString()}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button 
                          className="btn btn-sm btn-primary"
                          title="View Payment Details"
                        >
                          <Eye size={14} /> View
                        </button>
                        <button 
                          className="btn btn-sm btn-secondary"
                          title="Add Comment"
                        >
                          <MessageSquare size={14} /> Comment
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Tenant Stats Card */}
      <div className="tenant-stats">
        <h3 className="section-title">Quick Stats</h3>
        <div className="stats-mini-grid">
          <div className="mini-stat">
            <span className="mini-stat-label">Total Tenants</span>
            <span className="mini-stat-value">{tenants.length}</span>
          </div>
          <div className="mini-stat">
            <span className="mini-stat-label">Single Units</span>
            <span className="mini-stat-value">
              {tenants.filter(t => t.type === 'Single').length}
            </span>
          </div>
          <div className="mini-stat">
            <span className="mini-stat-label">Double Units</span>
            <span className="mini-stat-value">
              {tenants.filter(t => t.type === 'Double').length}
            </span>
          </div>
          <div className="mini-stat">
            <span className="mini-stat-label">Active Payment</span>
            <span className="mini-stat-value">
              {tenants.filter(t => t.status === 'Paid').length}
            </span>
          </div>
        </div>
      </div>
    </>
  );
};

export default TenantsPage;