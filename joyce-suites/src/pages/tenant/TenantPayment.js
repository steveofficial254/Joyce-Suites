// ============================================
// TENANT PAYMENTS COMPONENT
// ============================================

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './TenantPayment.css';
import logo from '../../assets/image1.png';

const TenantPayments = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [payments, setPayments] = useState([]);
  const [summary, setSummary] = useState({});
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchPayments(currentPage, statusFilter);
  }, [statusFilter, currentPage]);

  const fetchPayments = async (page = 1, status = 'all') => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      let url = `/api/tenant/payments?page=${page}&per_page=10`;
      if (status !== 'all') {
        url += `&status=${status}`;
      }

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to load payments');
      }

      setPayments(data.payments || []);
      setSummary(data.summary || {});
      setError('');
    } catch (err) {
      console.error('Error fetching payments:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePayNow = (payment) => {
    setSelectedPayment(payment);
    setShowPaymentModal(true);
  };

  const handleMpesaPayment = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/tenant/payments/mpesa', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          amount: selectedPayment.amount,
          phone: '+254712345678', // Get from user input
          payment_month: selectedPayment.month
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'M-Pesa payment failed');
      }

      alert('M-Pesa STK push sent to your phone. Complete the transaction.');
      setShowPaymentModal(false);
      setSelectedPayment(null);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem('token');
      await fetch('/api/tenant/logout', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      localStorage.clear();
      navigate('/login');
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      'paid': 'status-paid',
      'pending': 'status-pending',
      'overdue': 'status-overdue'
    };
    return statusMap[status?.toLowerCase()] || 'status-pending';
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Loading Payments...</p>
      </div>
    );
  }

  return (
    <div className="tenant-dashboard">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <img src={logo} alt="Logo" className="sidebar-logo" />
          <h2>Joyce Suits</h2>
        </div>

        <nav className="sidebar-nav">
          <a href="/tenant/dashboard" className="nav-item">
            <span className="nav-icon"></span>
            Dashboard
          </a>
          <a href="/tenant/payments" className="nav-item active">
            <span className="nav-icon"></span>
            Payments
          </a>
          <a href="/tenant/profile" className="nav-item">
            <span className="nav-icon"></span>
            Profile
          </a>
          <a href="/tenant/maintenance" className="nav-item">
            <span className="nav-icon">🔧</span>
            Maintenance
          </a>
          <a href="/tenant/lease" className="nav-item">
            <span className="nav-icon">📄</span>
            My Lease
          </a>
        </nav>

        <div className="sidebar-footer">
          <button onClick={handleLogout} className="logout-btn">
            <span className="nav-icon">🚪</span>
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        {/* Topbar */}
        <header className="topbar">
          <div className="topbar-left">
            <h1>Payments</h1>
            <p className="breadcrumb">Home / Payments</p>
          </div>
          <div className="topbar-right">
            <button className="btn btn-primary" onClick={() => setShowPaymentModal(true)}>
              💳 Make Payment
            </button>
          </div>
        </header>

        {error && <div className="alert alert-error">{error}</div>}

        {/* Payment Summary */}
        <div className="payment-stats">
          <div className="stat-item">
            <span className="stat-label">Total Paid</span>
            <span className="stat-value">
              KSh {(summary.total_paid || 0).toLocaleString()}
            </span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Pending Amount</span>
            <span className="stat-value pending">
              KSh {(summary.total_pending || 0).toLocaleString()}
            </span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Total Transactions</span>
            <span className="stat-value">
              {summary.total_transactions || 0}
            </span>
          </div>
        </div>

        {/* Payments Content */}
        <div className="payments-content">
          {/* Filters */}
          <div className="filters-section">
            <h3>Payment History</h3>
            <div className="filter-buttons">
              <button 
                className={`filter-btn ${statusFilter === 'all' ? 'active' : ''}`}
                onClick={() => { setStatusFilter('all'); setCurrentPage(1); }}
              >
                All
              </button>
              <button 
                className={`filter-btn ${statusFilter === 'paid' ? 'active' : ''}`}
                onClick={() => { setStatusFilter('paid'); setCurrentPage(1); }}
              >
                Paid
              </button>
              <button 
                className={`filter-btn ${statusFilter === 'pending' ? 'active' : ''}`}
                onClick={() => { setStatusFilter('pending'); setCurrentPage(1); }}
              >
                Pending
              </button>
              <button 
                className={`filter-btn ${statusFilter === 'overdue' ? 'active' : ''}`}
                onClick={() => { setStatusFilter('overdue'); setCurrentPage(1); }}
              >
                Overdue
              </button>
            </div>
          </div>

          {/* Payments Table */}
          <div className="table-container">
            <table className="payments-table">
              <thead>
                <tr>
                  <th>Month</th>
                  <th>Amount</th>
                  <th>Due Date</th>
                  <th>Status</th>
                  <th>Payment Method</th>
                  <th>Reference</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {payments.length > 0 ? (
                  payments.map((payment) => (
                    <tr key={payment.payment_id}>
                      <td>{payment.month}</td>
                      <td className="amount">KSh {payment.amount.toLocaleString()}</td>
                      <td>{new Date(payment.due_date).toLocaleDateString('en-GB')}</td>
                      <td>
                        <span className={`status-badge ${getStatusBadge(payment.status)}`}>
                          {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                        </span>
                      </td>
                      <td>{payment.payment_method || '-'}</td>
                      <td className="reference">{payment.transaction_ref || '-'}</td>
                      <td className="actions">
                        {payment.status === 'pending' || payment.status === 'overdue' ? (
                          <button 
                            className="action-btn pay"
                            onClick={() => handlePayNow(payment)}
                          >
                            💳 Pay
                          </button>
                        ) : (
                          <button className="action-btn view" disabled>
                            ✓ Paid
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="no-data">
                      No payments found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Payment Modal */}
        {showPaymentModal && (
          <div className="modal-overlay" onClick={() => setShowPaymentModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <button className="modal-close" onClick={() => setShowPaymentModal(false)}>
                ×
              </button>
              <h2>Make Payment</h2>
              
              {selectedPayment && (
                <div className="payment-details">
                  <p><strong>Month:</strong> {selectedPayment.month}</p>
                  <p><strong>Amount:</strong> KSh {selectedPayment.amount.toLocaleString()}</p>
                  <p><strong>Due Date:</strong> {new Date(selectedPayment.due_date).toLocaleDateString()}</p>
                </div>
              )}

              <div className="payment-options">
                <div className="payment-option">
                  <h3>📱 M-Pesa Paybill</h3>
                  <div className="payment-details">
                    <p><strong>Phone:</strong> 0758 999322</p>
                    <p><strong>Account:</strong> JOYCE MUTHONI</p>
                  </div>
                  <button className="btn btn-primary" onClick={handleMpesaPayment}>
                    Pay via M-Pesa
                  </button>
                </div>

                <div className="payment-option">
                  <h3>🏦 Bank Transfer</h3>
                  <div className="payment-details">
                    <p><strong>Bank:</strong> Equity Bank</p>
                    <p><strong>Account:</strong> 0123456789</p>
                  </div>
                  <button className="btn btn-secondary">
                    Copy Details
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <footer className="dashboard-footer">
          <div className="footer-content">
            <div className="footer-section">
              <h4>Joyce Suits Apartments</h4>
              <p>Your home, our care</p>
            </div>
            <div className="footer-section">
              <h4>Contact</h4>
              <p>Phone: 0758 999322</p>
              <p>Email: joycesuites@gmail.com</p>
            </div>
            <div className="footer-section">
              <h4>Quick Links</h4>
              <a href="/tenant/dashboard">Dashboard</a>
              <a href="/tenant/maintenance">Maintenance</a>
              <a href="/tenant/profile">Profile</a>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2024 Joyce Suits Apartments. All rights reserved.</p>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default TenantPayments;