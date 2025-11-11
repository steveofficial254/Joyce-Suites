import React, { useState } from 'react';
import { AlertCircle, Search, Filter, Mail } from 'lucide-react';

const PaymentsPage = ({ tenants, loading, onRefresh }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('balance');
  const [order, setOrder] = useState('desc');
  const [selectedTenant, setSelectedTenant] = useState(null);

  const sorted = [...tenants].sort((a, b) => {
    let aVal, bVal;
    
    switch (sortBy) {
      case 'balance':
        aVal = a.outstanding_balance;
        bVal = b.outstanding_balance;
        break;
      case 'months_overdue':
        aVal = a.months_overdue;
        bVal = b.months_overdue;
        break;
      case 'due_date':
        aVal = new Date(a.due_date);
        bVal = new Date(b.due_date);
        break;
      default:
        aVal = a.outstanding_balance;
        bVal = b.outstanding_balance;
    }

    return order === 'desc' ? bVal - aVal : aVal - bVal;
  });

  const filtered = sorted.filter(tenant => {
    const matchSearch =
      tenant.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tenant.room_number.includes(searchTerm) ||
      tenant.email.toLowerCase().includes(searchTerm.toLowerCase());

    return matchSearch;
  });

  const totalOutstanding = tenants.reduce((sum, t) => sum + t.outstanding_balance, 0);
  const averageOverdue = tenants.length > 0
    ? (tenants.reduce((sum, t) => sum + t.months_overdue, 0) / tenants.length).toFixed(1)
    : 0;

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading payment data...</p>
      </div>
    );
  }

  return (
    <>
      <div className="page-header">
        <h2 className="page-title">Pending Payments</h2>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon-bg warning">
            💰
          </div>
          <div className="stat-content">
            <span className="stat-label">Total Outstanding</span>
            <span className="stat-value">
              KSh {totalOutstanding.toLocaleString()}
            </span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-bg danger">
            <AlertCircle size={24} />
          </div>
          <div className="stat-content">
            <span className="stat-label">Average Overdue</span>
            <span className="stat-value">{averageOverdue} months</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-bg info">
            📊
          </div>
          <div className="stat-content">
            <span className="stat-label">Tenants in Arrears</span>
            <span className="stat-value">{tenants.length}</span>
          </div>
        </div>
      </div>

      <div className="search-filter-section">
        <div className="search-box">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search by name, room, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filter-group">
          <Filter size={18} />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="filter-select"
          >
            <option value="balance">Sort by Balance</option>
            <option value="months_overdue">Sort by Months Overdue</option>
            <option value="due_date">Sort by Due Date</option>
          </select>
        </div>

        <div className="filter-group">
          <select
            value={order}
            onChange={(e) => setOrder(e.target.value)}
            className="filter-select"
          >
            <option value="desc">Highest First</option>
            <option value="asc">Lowest First</option>
          </select>
        </div>
      </div>

      <div className="section">
        <h3 className="section-title">Tenants with Outstanding Balances ({filtered.length})</h3>

        {filtered.length === 0 ? (
          <div className="empty-state">
            <AlertCircle size={48} className="empty-icon" />
            <p>No tenants with outstanding payments found</p>
          </div>
        ) : (
          <div className="payments-list">
            {filtered.map(tenant => (
              <div key={tenant.tenant_id} className="payment-item">
                <div className="payment-item-header">
                  <div className="payment-tenant-info">
                    <h4 className="payment-tenant-name">{tenant.full_name}</h4>
                    <p className="payment-tenant-email">{tenant.email}</p>
                  </div>
                  <div className="payment-amount-highlight">
                    <span className="amount-label">Outstanding</span>
                    <span className="amount-value">
                      KSh {tenant.outstanding_balance.toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="payment-item-body">
                  <div className="payment-grid">
                    <div className="payment-field">
                      <span className="field-label">Room</span>
                      <span className="field-value">#{tenant.room_number}</span>
                    </div>

                    <div className="payment-field">
                      <span className="field-label">Monthly Rent</span>
                      <span className="field-value">
                        KSh {tenant.monthly_rent.toLocaleString()}
                      </span>
                    </div>

                    <div className="payment-field">
                      <span className="field-label">Months Overdue</span>
                      <span className="field-value overdue">
                        {tenant.months_overdue}
                      </span>
                    </div>

                    <div className="payment-field">
                      <span className="field-label">Last Payment</span>
                      <span className="field-value">
                        {new Date(tenant.last_payment_date).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="payment-field">
                      <span className="field-label">Due Date</span>
                      <span className="field-value">
                        {new Date(tenant.due_date).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="payment-field">
                      <span className="field-label">Phone</span>
                      <span className="field-value">{tenant.phone}</span>
                    </div>
                  </div>
                </div>

                <div className="payment-item-actions">
                  <button
                    className="btn btn-sm btn-primary"
                    onClick={() => setSelectedTenant(tenant)}
                  >
                    <Mail size={14} /> Send Reminder
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedTenant && (
        <div className="modal-overlay" onClick={() => setSelectedTenant(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 className="modal-title">Send Payment Reminder</h3>
            <div className="modal-body">
              <p><strong>Tenant:</strong> {selectedTenant.full_name}</p>
              <p><strong>Room:</strong> {selectedTenant.room_number}</p>
              <p><strong>Outstanding:</strong> KSh {selectedTenant.outstanding_balance.toLocaleString()}</p>
              <p><strong>Email:</strong> {selectedTenant.email}</p>
              <p><strong>Phone:</strong> {selectedTenant.phone}</p>
            </div>
            <div className="modal-actions">
              <button className="btn btn-success">Send Reminder</button>
              <button
                className="btn btn-secondary"
                onClick={() => setSelectedTenant(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PaymentsPage;