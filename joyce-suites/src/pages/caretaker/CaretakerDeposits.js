import React, { useState, useEffect } from 'react';
import { Search, Filter, DollarSign, Calendar, User, AlertCircle, CheckCircle, Clock, X, Plus, Eye, Edit, Trash2 } from 'lucide-react';
import apiService from '../../services/api';
import config from '../../config';
import './CaretakerDeposits.css';

const fetchWithAuth = async (url, options = {}) => {
  const token = localStorage.getItem('joyce-suites-token');
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    },
    ...options,
  };

  return fetch(url, defaultOptions);
};

const CaretakerDeposits = () => {
  const [depositRecords, setDepositRecords] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [createForm, setCreateForm] = useState({
    tenant_id: '',
    property_id: '',
    lease_id: '',
    amount_required: ''
  });
  const [paymentForm, setPaymentForm] = useState({
    amount_paid: '',
    payment_method: 'cash',
    payment_reference: '',
    notes: ''
  });
  const [filters, setFilters] = useState({
    status: '',
    tenant_id: '',
    search: ''
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchDepositRecords();
    fetchTenants();
  }, [filters, currentPage]);

  const fetchDepositRecords = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      if (filters.status) params.append('status', filters.status);
      if (filters.tenant_id) params.append('tenant_id', filters.tenant_id);
      params.append('page', currentPage);

      const response = await fetchWithAuth(`${config.apiBaseUrl}/api/rent-deposit/deposit/records?${params}`);
      
      if (response.ok) {
        const data = await response.json();
        setDepositRecords(data.records || []);
        setTotalPages(data.total_pages || 1);
      } else {
        throw new Error('Failed to fetch deposit records');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchTenants = async () => {
    try {
      const response = await fetchWithAuth(`${config.apiBaseUrl}/api/caretaker/tenants`);
      if (response.ok) {
        const data = await response.json();
        setTenants(data.tenants || []);
      }
    } catch (err) {
      console.error('Error fetching tenants:', err);
    }
  };

  const handleRecordPayment = async () => {
    try {
      const response = await fetchWithAuth(`${config.apiBaseUrl}/api/rent-deposit/deposit/payment`, {
        method: 'POST',
        body: JSON.stringify({
          deposit_id: selectedRecord.id,
          ...paymentForm
        })
      });

      if (response.ok) {
        setSuccess('Payment recorded successfully');
        setShowPaymentModal(false);
        setSelectedRecord(null);
        setPaymentForm({
          amount_paid: '',
          payment_method: 'Cash',
          payment_reference: '',
          notes: ''
        });
        fetchDepositRecords();
      } else {
        setError('Failed to record payment');
      }
    } catch (err) {
      setError('Error recording payment');
    }
  };

  const handleCreateDeposit = async () => {
    try {
      const response = await fetchWithAuth(`${config.apiBaseUrl}/api/rent-deposit/deposit/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(createForm)
      });

      if (response.ok) {
        setSuccess('Deposit record created successfully');
        setShowCreateModal(false);
        setCreateForm({ tenant_id: '', property_id: '', lease_id: '', amount_required: '' });
        fetchDepositRecords();
      } else {
        const error = await response.json();
        setError(error.error || 'Failed to create deposit record');
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleMarkPayment = async () => {
    try {
      const response = await fetchWithAuth(`${config.apiBaseUrl}/api/rent-deposit/deposit/mark-payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deposit_id: selectedRecord.id,
          ...paymentForm
        })
      });

      if (response.ok) {
        setSuccess('Payment marked successfully');
        setShowPaymentModal(false);
        setPaymentForm({ amount_paid: '', payment_method: 'cash', payment_reference: '', notes: '' });
        setSelectedRecord(null);
        fetchDepositRecords();
      } else {
        const error = await response.json();
        setError(error.error || 'Failed to mark payment');
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid': return '#10b981';
      case 'unpaid': return '#ef4444';
      case 'partially_paid': return '#f59e0b';
      case 'refunded': return '#6366f1';
      default: return '#6b7280';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'paid': return <CheckCircle size={16} color="#10b981" />;
      case 'unpaid': return <AlertCircle size={16} color="#ef4444" />;
      case 'partially_paid': return <Clock size={16} color="#f59e0b" />;
      case 'refunded': return <DollarSign size={16} color="#6366f1" />;
      default: return <Clock size={16} color="#6b7280" />;
    }
  };

  const filteredRecords = depositRecords.filter(record => {
    const matchesSearch = !filters.search || 
      record.tenant_name?.toLowerCase().includes(filters.search.toLowerCase()) ||
      record.property_name?.toLowerCase().includes(filters.search.toLowerCase());
    return matchesSearch;
  });

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading deposit records...</p>
      </div>
    );
  }

  return (
    <div className="caretaker-deposits">
      <div className="page-header">
        <h2>Deposit Management</h2>
        <button 
          className="btn-primary"
          onClick={() => setShowCreateModal(true)}
        >
          <Plus size={18} />
          Create Deposit Record
        </button>
      </div>

      {error && (
        <div className="alert alert-error">
          <AlertCircle size={18} />
          {error}
          <button onClick={() => setError('')} className="alert-close">
            <X size={16} />
          </button>
        </div>
      )}

      {success && (
        <div className="alert alert-success">
          <CheckCircle size={18} />
          {success}
          <button onClick={() => setSuccess('')} className="alert-close">
            <X size={16} />
          </button>
        </div>
      )}

      {/* Summary Cards */}
      <div className="summary-cards">
        <div className="summary-card">
          <h3>Total Records</h3>
          <p className="summary-value">{depositRecords.length}</p>
        </div>
        <div className="summary-card">
          <h3>Paid</h3>
          <p className="summary-value paid">
            {depositRecords.filter(r => r.status === 'paid').length}
          </p>
        </div>
        <div className="summary-card">
          <h3>Unpaid</h3>
          <p className="summary-value unpaid">
            {depositRecords.filter(r => r.status === 'unpaid').length}
          </p>
        </div>
        <div className="summary-card">
          <h3>Total Amount</h3>
          <p className="summary-value">
            KSh {depositRecords.reduce((sum, r) => sum + (parseFloat(r.amount_required) || 0), 0).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <div className="filters">
          <div className="search-box">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search by tenant or property..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            />
          </div>
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          >
            <option value="">All Statuses</option>
            <option value="paid">Paid</option>
            <option value="unpaid">Unpaid</option>
            <option value="partially_paid">Partially Paid</option>
            <option value="refunded">Refunded</option>
          </select>
          <select
            value={filters.tenant_id}
            onChange={(e) => setFilters({ ...filters, tenant_id: e.target.value })}
          >
            <option value="">All Tenants</option>
            {tenants.map(tenant => (
              <option key={tenant.id} value={tenant.id}>
                {tenant.full_name || tenant.name}
              </option>
            ))}
          </select>
          <button className="filter-btn" onClick={fetchDepositRecords}>
            <Filter size={16} />
            Apply Filters
          </button>
        </div>
      </div>

      {/* Records Table */}
      <div className="records-table">
        {filteredRecords.length === 0 ? (
          <div className="empty-state">
            <DollarSign size={48} />
            <h3>No deposit records found</h3>
            <p>Try adjusting your filters or create a new deposit record</p>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Tenant</th>
                  <th>Property</th>
                  <th>Amount Required</th>
                  <th>Amount Paid</th>
                  <th>Balance</th>
                  <th>Due Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.map((record) => (
                  <tr key={record.id}>
                    <td>
                      <div className="tenant-cell">
                        <User size={16} />
                        <div>
                          <div className="tenant-name">{record.tenant_name}</div>
                          <div className="tenant-id">ID: {record.tenant_id}</div>
                        </div>
                      </div>
                    </td>
                    <td>{record.property_name || `Property ${record.property_id}`}</td>
                    <td className="amount">KSh {parseFloat(record.amount_required || 0).toLocaleString()}</td>
                    <td className="amount">KSh {parseFloat(record.amount_paid || 0).toLocaleString()}</td>
                    <td className={`amount ${parseFloat(record.balance || 0) > 0 ? 'unpaid' : 'paid'}`}>
                      KSh {parseFloat(record.balance || 0).toLocaleString()}
                    </td>
                    <td>{record.due_date ? new Date(record.due_date).toLocaleDateString() : 'N/A'}</td>
                    <td>
                      <div className="status-badge">
                        {getStatusIcon(record.status)}
                        <span className="status-text">{record.status.replace('_', ' ')}</span>
                      </div>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="btn-icon"
                          onClick={() => {
                            setSelectedRecord(record);
                            setShowPaymentModal(true);
                          }}
                          title="View Details"
                        >
                          <Eye size={16} />
                        </button>
                        {record.status !== 'paid' && (
                          <button
                            className="btn-icon btn-primary"
                            onClick={() => {
                              setSelectedRecord(record);
                              setPaymentForm({
                                ...paymentForm,
                                amount_paid: record.balance.toString()
                              });
                              setShowPaymentModal(true);
                            }}
                            title="Record Payment"
                          >
                            <DollarSign size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(currentPage - 1)}
            className="btn-secondary"
          >
            Previous
          </button>
          <span className="page-info">
            Page {currentPage} of {totalPages}
          </span>
          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(currentPage + 1)}
            className="btn-secondary"
          >
            Next
          </button>
        </div>
      )}

      {/* Create Deposit Modal */}
      {showCreateModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Create Deposit Record</h3>
              <button onClick={() => setShowCreateModal(false)} className="close-btn">
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <form onSubmit={(e) => { e.preventDefault(); handleCreateDeposit(); }}>
                <div className="form-group">
                  <label>Tenant *</label>
                  <select
                    value={createForm.tenant_id}
                    onChange={(e) => setCreateForm({ ...createForm, tenant_id: e.target.value })}
                    required
                  >
                    <option value="">Select Tenant</option>
                    {tenants.map(tenant => (
                      <option key={tenant.id} value={tenant.id}>
                        {tenant.full_name || tenant.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Property *</label>
                  <select
                    value={createForm.property_id}
                    onChange={(e) => setCreateForm({ ...createForm, property_id: e.target.value })}
                    required
                  >
                    <option value="">Select Property</option>
                    <option value="1">Property 1</option>
                    <option value="2">Property 2</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Lease ID *</label>
                  <input
                    type="number"
                    value={createForm.lease_id}
                    onChange={(e) => setCreateForm({ ...createForm, lease_id: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Amount Required (KSh) *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={createForm.amount_required}
                    onChange={(e) => setCreateForm({ ...createForm, amount_required: e.target.value })}
                    required
                  />
                </div>
                <div className="modal-actions">
                  <button type="submit" className="btn-primary">Create Record</button>
                  <button type="button" onClick={() => setShowCreateModal(false)} className="btn-secondary">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && selectedRecord && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Record Payment</h3>
              <button onClick={() => setShowPaymentModal(false)} className="close-btn">
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <div className="record-info">
                <h4>Deposit Information</h4>
                <div className="info-grid">
                  <div>
                    <label>Tenant:</label>
                    <span>{selectedRecord.tenant_name}</span>
                  </div>
                  <div>
                    <label>Property:</label>
                    <span>{selectedRecord.property_name}</span>
                  </div>
                  <div>
                    <label>Amount Required:</label>
                    <span>KSh {parseFloat(selectedRecord.amount_required || 0).toLocaleString()}</span>
                  </div>
                  <div>
                    <label>Balance:</label>
                    <span className={parseFloat(selectedRecord.balance || 0) > 0 ? 'unpaid' : 'paid'}>
                      KSh {parseFloat(selectedRecord.balance || 0).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
              <form onSubmit={(e) => { e.preventDefault(); handleRecordPayment(); }}>
                <div className="form-group">
                  <label>Amount Paid (KSh) *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={paymentForm.amount_paid}
                    onChange={(e) => setPaymentForm({ ...paymentForm, amount_paid: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Payment Method *</label>
                  <select
                    value={paymentForm.payment_method}
                    onChange={(e) => setPaymentForm({ ...paymentForm, payment_method: e.target.value })}
                    required
                  >
                    <option value="Cash">Cash</option>
                    <option value="M-Pesa">M-Pesa</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Cheque">Cheque</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Payment Reference</label>
                  <input
                    type="text"
                    value={paymentForm.payment_reference}
                    onChange={(e) => setPaymentForm({ ...paymentForm, payment_reference: e.target.value })}
                    placeholder="Transaction ID, Cheque number, etc."
                  />
                </div>
                <div className="form-group">
                  <label>Notes</label>
                  <textarea
                    value={paymentForm.notes}
                    onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })}
                    rows="3"
                    placeholder="Additional payment notes..."
                  />
                </div>
                <div className="modal-actions">
                  <button type="submit" className="btn-primary">Record Payment</button>
                  <button type="button" onClick={() => setShowPaymentModal(false)} className="btn-secondary">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CaretakerDeposits;
