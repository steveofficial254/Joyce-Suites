import React, { useState } from 'react';
import { Filter, Search, DollarSign, AlertCircle } from 'lucide-react';

const BalancesPage = ({ tenants }) => {
  const [filterStatus, setFilterStatus] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNote, setSelectedNote] = useState('');

  // Filter tenants based on search and status
  const filtered = tenants.filter(tenant => {
    const matchSearch = 
      tenant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tenant.room.includes(searchTerm);
    const matchStatus = filterStatus === 'All' || tenant.status === filterStatus;
    return matchSearch && matchStatus;
  });

  // Calculate total balances
  const totalBalance = filtered.reduce((sum, t) => sum + t.balance, 0);
  const overdueTenants = filtered.filter(t => t.status === 'Overdue').length;
  const pendingAmount = filtered
    .filter(t => t.status === 'Pending')
    .reduce((sum, t) => sum + t.balance, 0);

  return (
    <>
      <h2 className="page-title">Rent Balances Overview</h2>

      {/* Balance Summary Cards */}
      <div className="balance-summary-grid">
        <div className="balance-card total">
          <DollarSign size={24} className="card-icon" />
          <div className="card-content">
            <span className="card-label">Total Outstanding</span>
            <span className="card-value">KSh {totalBalance.toLocaleString()}</span>
          </div>
        </div>

        <div className="balance-card pending">
          <AlertCircle size={24} className="card-icon" />
          <div className="card-content">
            <span className="card-label">Pending Amount</span>
            <span className="card-value">KSh {pendingAmount.toLocaleString()}</span>
          </div>
        </div>

        <div className="balance-card overdue">
          <AlertCircle size={24} className="card-icon" />
          <div className="card-content">
            <span className="card-label">Overdue Tenants</span>
            <span className="card-value">{overdueTenants}</span>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="search-filter-section">
        <div className="search-box">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search by tenant name or room..."
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

      {/* Balances Table */}
      <div className="section">
        <h3 className="section-title">Tenant Balances ({filtered.length})</h3>
        
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
                  <th>Room</th>
                  <th>Monthly Rent</th>
                  <th>Payment Status</th>
                  <th>Current Balance</th>
                  <th>Days Outstanding</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(tenant => {
                  const daysOutstanding = Math.floor(Math.random() * 90) + 1;
                  return (
                    <tr key={tenant.id} className="table-row">
                      <td>
                        <span className="tenant-name">{tenant.name}</span>
                      </td>
                      <td>
                        <span className="room-badge">#{tenant.room}</span>
                      </td>
                      <td>KSh {tenant.rent.toLocaleString()}</td>
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
                            fontWeight: '700',
                            fontSize: '15px'
                          }}
                        >
                          KSh {tenant.balance.toLocaleString()}
                        </span>
                      </td>
                      <td>
                        <span className={`days-badge ${tenant.balance > 0 ? 'overdue' : 'current'}`}>
                          {tenant.balance > 0 ? `${daysOutstanding} days` : 'Current'}
                        </span>
                      </td>
                      <td>
                        <button className="btn btn-sm btn-primary" title="Add Note">
                          + Add Note
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Manual Adjustment Section */}
      <div className="section">
        <h3 className="section-title">Add Manual Adjustment</h3>
        <div className="adjustment-form">
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Select Tenant *</label>
              <select className="form-input">
                <option value="">-- Choose a tenant --</option>
                {tenants.map(t => (
                  <option key={t.id} value={t.id}>
                    {t.name} (Room #{t.room})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Adjustment Type *</label>
              <select className="form-input">
                <option value="deduction">Deduction (-))</option>
                <option value="addition">Addition (+)</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Amount (KSh) *</label>
              <input 
                type="number" 
                placeholder="Enter amount"
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Reason *</label>
              <input 
                type="text" 
                placeholder="Reason for adjustment"
                className="form-input"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Notes</label>
            <textarea 
              placeholder="Add any additional notes..."
              className="form-textarea"
              rows="3"
              value={selectedNote}
              onChange={(e) => setSelectedNote(e.target.value)}
            />
          </div>

          <button className="btn btn-primary" style={{ width: '100%', marginTop: '12px' }}>
            Save Adjustment
          </button>
        </div>
      </div>

      {/* Balance Collection Tips */}
      <div className="section info-section">
        <h3 className="section-title">Balance Management Tips</h3>
        <div className="tips-grid">
          <div className="tip-card">
            <span className="tip-icon"></span>
            <h5>Follow-up Communication</h5>
            <p>Contact tenants with pending or overdue balances within 5 days of due date</p>
          </div>
          <div className="tip-card">
            <span className="tip-icon"></span>
            <h5>Keep Records</h5>
            <p>Document all adjustments with reasons for future reference and audits</p>
          </div>
          <div className="tip-card">
            <span className="tip-icon"></span>
            <h5>Monitor Trends</h5>
            <p>Track patterns in late payments to identify problematic tenants early</p>
          </div>
          <div className="tip-card">
            <span className="tip-icon"></span>
            <h5>Verify Updates</h5>
            <p>Always confirm adjustments in the system to maintain accurate records</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default BalancesPage;