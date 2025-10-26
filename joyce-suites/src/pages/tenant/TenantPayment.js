import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './TenantPayment.css';
import logo from '../../assets/image1.png';

const TenantPayments = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [payments, setPayments] = useState([]);
  const [balance, setBalance] = useState(0);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);

  useEffect(() => {
    fetchPayments();
  }, [filter]);

  const fetchPayments = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/tenant/payments?filter=${filter}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setPayments(data.payments);
        setBalance(data.balance);
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error('Error fetching payments:', error);
      // Mock data for demo
      setPayments([
        {
          id: 1,
          date: '2024-10-01',
          amount: 5500,
          accountNumber: '0758999322',
          reference: 'MPESA-REF-12345',
          status: 'Completed',
          balance: 0,
          method: 'M-Pesa'
        },
        {
          id: 2,
          date: '2024-09-01',
          amount: 5500,
          accountNumber: '0758999322',
          reference: 'MPESA-REF-12344',
          status: 'Completed',
          balance: 0,
          method: 'M-Pesa'
        },
        {
          id: 3,
          date: '2024-08-01',
          amount: 5500,
          accountNumber: '0123456789',
          reference: 'BANK-TRF-67890',
          status: 'Completed',
          balance: 0,
          method: 'Bank Transfer'
        },
        {
          id: 4,
          date: '2024-11-05',
          amount: 5500,
          accountNumber: 'Pending',
          reference: 'Pending',
          status: 'Pending',
          balance: 5500,
          method: 'Pending'
        }
      ]);
      setBalance(5500);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredPayments = () => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    switch(filter) {
      case 'thisMonth':
        return payments.filter(p => {
          const date = new Date(p.date);
          return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
        });
      case 'lastMonth':
        return payments.filter(p => {
          const date = new Date(p.date);
          const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
          const year = currentMonth === 0 ? currentYear - 1 : currentYear;
          return date.getMonth() === lastMonth && date.getFullYear() === year;
        });
      default:
        return payments;
    }
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      'Completed': 'status-completed',
      'Pending': 'status-pending',
      'Failed': 'status-failed',
      'Processing': 'status-processing'
    };
    return statusClasses[status] || 'status-pending';
  };

  const handlePayNow = () => {
    setShowPaymentModal(true);
  };

  const handleDownloadReceipt = (payment) => {
    // Generate PDF receipt
    console.log('Downloading receipt for:', payment);
    alert(`Downloading receipt for payment #${payment.id}`);
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const filteredPayments = getFilteredPayments();

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
            <span className="nav-icon"></span>
            Maintenance
          </a>
          <a href="/tenant/lease" className="nav-item">
            <span className="nav-icon"></span>
            My Lease
          </a>
        </nav>

        <div className="sidebar-footer">
          <button onClick={handleLogout} className="logout-btn">
            <span className="nav-icon"></span>
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
            <button className="btn btn-primary" onClick={handlePayNow}>
               Pay Rent Now
            </button>
          </div>
        </header>

        {/* Balance Summary */}
        <div className="balance-section">
          <div className="balance-card">
            <div className="balance-info">
              <h3>Current Balance</h3>
              <p className={`balance-amount ${balance === 0 ? 'paid' : 'due'}`}>
                KSh {balance.toLocaleString()}
              </p>
              <span className="balance-status">
                {balance === 0 ? '✓ All payments up to date' : '⚠ Payment due'}
              </span>
            </div>
            {balance > 0 && (
              <button className="btn btn-warning" onClick={handlePayNow}>
                Pay KSh {balance.toLocaleString()}
              </button>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="payments-content">
          <div className="filters-section">
            <h3>Payment History</h3>
            <div className="filter-buttons">
              <button 
                className={`filter-btn ${filter === 'thisMonth' ? 'active' : ''}`}
                onClick={() => setFilter('thisMonth')}
              >
                This Month
              </button>
              <button 
                className={`filter-btn ${filter === 'lastMonth' ? 'active' : ''}`}
                onClick={() => setFilter('lastMonth')}
              >
                Last Month
              </button>
              <button 
                className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
                onClick={() => setFilter('all')}
              >
                All
              </button>
            </div>
          </div>

          {/* Payments Table */}
          <div className="table-container">
            <table className="payments-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Amount</th>
                  <th>Account Number</th>
                  <th>Reference</th>
                  <th>Status</th>
                  <th>Balance</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPayments.length > 0 ? (
                  filteredPayments.map((payment) => (
                    <tr key={payment.id}>
                      <td>{new Date(payment.date).toLocaleDateString('en-GB')}</td>
                      <td className="amount">KSh {payment.amount.toLocaleString()}</td>
                      <td>{payment.accountNumber}</td>
                      <td className="reference">{payment.reference}</td>
                      <td>
                        <span className={`status-badge ${getStatusBadge(payment.status)}`}>
                          {payment.status}
                        </span>
                      </td>
                      <td className={payment.balance === 0 ? 'balance-clear' : 'balance-due'}>
                        KSh {payment.balance.toLocaleString()}
                      </td>
                      <td className="actions">
                        {payment.status === 'Completed' ? (
                          <button 
                            className="action-btn download"
                            onClick={() => handleDownloadReceipt(payment)}
                            title="Download Receipt"
                          >
                             Receipt
                          </button>
                        ) : payment.status === 'Pending' ? (
                          <button 
                            className="action-btn pay"
                            onClick={handlePayNow}
                            title="Pay Now"
                          >
                             Pay Now
                          </button>
                        ) : (
                          <button className="action-btn view" title="View Details">
                            👁️ View
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="no-data">
                      No payments found for the selected period
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Payment Stats */}
          <div className="payment-stats">
            <div className="stat-item">
              <span className="stat-label">Total Paid</span>
              <span className="stat-value">
                KSh {payments
                  .filter(p => p.status === 'Completed')
                  .reduce((sum, p) => sum + p.amount, 0)
                  .toLocaleString()}
              </span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Payments Made</span>
              <span className="stat-value">
                {payments.filter(p => p.status === 'Completed').length}
              </span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Pending</span>
              <span className="stat-value pending">
                {payments.filter(p => p.status === 'Pending').length}
              </span>
            </div>
          </div>
        </div>

        {/* Payment Modal */}
        {showPaymentModal && (
          <div className="modal-overlay" onClick={() => setShowPaymentModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <button className="modal-close" onClick={() => setShowPaymentModal(false)}>
                ×
              </button>
              <h2>Payment Instructions</h2>
              
              <div className="payment-options">
                <div className="payment-option">
                  <h3>📱 M-Pesa Paybill</h3>
                  <div className="payment-details">
                    <p><strong>Phone Number:</strong> 0758 999322</p>
                    <p><strong>Amount:</strong> KSh {balance.toLocaleString()}</p>
                    <p><strong>Account Name:</strong> JOYCE MUTHONI</p>
                  </div>
                </div>

                <div className="payment-option">
                  <h3>🏦 Bank Transfer</h3>
                  <div className="payment-details">
                    <p><strong>Bank:</strong> Equity Bank</p>
                    <p><strong>Account Number:</strong> 0123456789</p>
                    <p><strong>Account Name:</strong> Joyce Muthoni Mathea</p>
                    <p><strong>Amount:</strong> KSh {balance.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              <div className="upload-proof">
                <h4>Upload Payment Proof</h4>
                <input type="file" accept="image/*,.pdf" className="file-input" />
                <button className="btn btn-primary">Submit Payment Proof</button>
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