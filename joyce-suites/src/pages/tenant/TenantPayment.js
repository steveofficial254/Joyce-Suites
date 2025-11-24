import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom'; // Import Link
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
  const [mpesaPhone, setMpesaPhone] = useState('');
  
  // State to hold actual tenant lease information
  const [tenantInfo, setTenantInfo] = useState({ leaseId: null, roomNumber: null });

  // 1. Initial Data Fetch (Payments & Summary)
  useEffect(() => {
    fetchPayments(currentPage, statusFilter);
  }, [statusFilter, currentPage]);

  // 2. Fetch Tenant Lease Info on Component Mount
  useEffect(() => {
    fetchTenantLeaseInfo();
  }, []); // Run once on mount

  const fetchTenantLeaseInfo = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        // Will be redirected by fetchPayments or a higher-level component
        return; 
      }
      
      // Assumes this endpoint returns the active lease ID and room number
      const response = await fetch('/api/tenant/lease/active', { 
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      
      if (!response.ok || !data.lease_id || !data.room_number) {
        console.warn('Could not load active lease information. Payment initiation will be disabled.');
        // Do not throw error here, just prevent setting info
        return; 
      }
      
      setTenantInfo({ 
          leaseId: data.lease_id, 
          roomNumber: data.room_number 
      });
      
    } catch (err) {
      console.error('Error fetching tenant lease info:', err);
      // Set an error state if critical info fetch fails
      setError('Failed to load critical tenant data. Cannot initiate payments.');
    }
  };


  const fetchPayments = async (page = 1, status = 'all') => {
    setLoading(true);
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
    if (!tenantInfo.leaseId || !tenantInfo.roomNumber) {
        setError('Cannot initiate payment. Active lease information is missing.');
        return;
    }
    
    setSelectedPayment(payment);
    setShowPaymentModal(true);
    setMpesaPhone('');
  };

  const handleMpesaPayment = async () => {
    if (!selectedPayment || !mpesaPhone) {
      setError('Please select a payment and enter your M-Pesa phone number.');
      return;
    }

    if (!tenantInfo.leaseId || !tenantInfo.roomNumber) {
        setError('System error: Lease information is missing. Cannot proceed with payment.');
        return;
    }

    setError('');
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch('/api/payments/initiate', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          amount: selectedPayment.amount,
          phone_number: mpesaPhone,
          // Using fetched state values instead of dummy data
          lease_id: tenantInfo.leaseId, 
          room_number: tenantInfo.roomNumber
        })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'M-Pesa payment failed to initiate STK push.');
      }

      alert('M-Pesa STK push initiated successfully! Check your phone for the prompt.');
      setShowPaymentModal(false);
      setSelectedPayment(null);
      setMpesaPhone('');
      fetchPayments(currentPage, statusFilter);
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
      'successful': 'status-paid',
      'pending': 'status-pending',
      'overdue': 'status-overdue',
      'failed': 'status-failed'
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
      <aside className="sidebar">
        <div className="sidebar-header">
          <img src={logo} alt="Logo" className="sidebar-logo" />
          <h2>Joyce Suits</h2>
        </div>

        <nav className="sidebar-nav">
          {/* FIX: Use Link component for internal navigation */}
          <Link to="/tenant/dashboard" className="nav-item">
            <span className="nav-icon">📊</span>
            Dashboard
          </Link>
          <Link to="/tenant/payments" className="nav-item active">
            <span className="nav-icon">💵</span>
            Payments
          </Link>
          <Link to="/tenant/profile" className="nav-item">
            <span className="nav-icon">👤</span>
            Profile
          </Link>
          <Link to="/tenant/maintenance" className="nav-item">
            <span className="nav-icon">🔧</span>
            Maintenance
          </Link>
          <Link to="/tenant/lease" className="nav-item">
            <span className="nav-icon">📄</span>
            My Lease
          </Link>
        </nav>

        <div className="sidebar-footer">
          <button onClick={handleLogout} className="logout-btn">
            <span className="nav-icon">🚪</span>
            Logout
          </button>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div className="topbar-left">
            <h1>Payments</h1>
            <p className="breadcrumb">Home / Payments</p>
          </div>
          <div className="topbar-right">
            <button 
              className="btn btn-primary" 
              onClick={() => {
                const payable = payments.find(p => p.status === 'pending' || p.status === 'overdue');
                handlePayNow(payable || { amount: summary.total_pending, month: 'Current', due_date: new Date().toISOString() });
              }}
              // Disable button if lease info is missing
              disabled={!tenantInfo.leaseId || !tenantInfo.roomNumber} 
            >
              💳 Make Payment
            </button>
          </div>
        </header>

        {error && <div className="alert alert-error">{error}</div>}

        <div className="payment-stats">
          <div className="stat-item">
            <span className="stat-label">Total Paid</span>
            <span className="stat-value paid">
              KSh {(summary.total_paid || 0).toLocaleString()}
            </span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Pending Amount</span>
            <span className="stat-value overdue">
              KSh {(summary.total_pending || 0).toLocaleString()}
            </span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Total Transactions</span>
            <span className="stat-value total">
              {summary.total_transactions || 0}
            </span>
          </div>
        </div>

        <div className="payments-content">
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
                      <td>{payment.payment_method || (payment.transaction_ref ? 'M-Pesa' : '-')}</td>
                      <td className="reference">{payment.transaction_ref || '-'}</td>
                      <td className="actions">
                        {payment.status === 'pending' || payment.status === 'overdue' ? (
                          <button 
                            className="action-btn pay"
                            onClick={() => handlePayNow(payment)}
                            // Disable individual pay buttons if info is missing
                            disabled={!tenantInfo.leaseId || !tenantInfo.roomNumber}
                          >
                            Pay
                          </button>
                        ) : (
                          <button className="action-btn view" disabled>
                            Paid
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
                <div className="payment-details-summary">
                  <p><strong>Month:</strong> {selectedPayment.month || 'N/A'}</p>
                  <p><strong>Amount:</strong> <span className="modal-amount">KSh {selectedPayment.amount.toLocaleString()}</span></p>
                  {/* Displaying fetched/real values */}
                  <p><strong>Lease:</strong> Lease ID {tenantInfo.leaseId || 'N/A'} (Room {tenantInfo.roomNumber || 'N/A'})</p>
                </div>
              )}

              {error && <div className="alert alert-error">{error}</div>}

              <div className="payment-options">
                <div className="payment-option mpesa">
                  <h3>M-Pesa STK Push</h3>
                  <p className="help-text">We will send an STK push prompt to this number.</p>

                  <div className="form-group">
                    <label htmlFor="mpesa-phone">M-Pesa Phone (e.g., 2547XXXXXXXX):</label>
                    <input 
                      id="mpesa-phone"
                      type="tel" 
                      value={mpesaPhone}
                      onChange={(e) => setMpesaPhone(e.target.value)}
                      placeholder="2547..."
                      required
                    />
                  </div>
                  <button 
                    className="btn btn-primary" 
                    onClick={handleMpesaPayment}
                    // Disable button if lease info is missing or phone number is empty
                    disabled={!tenantInfo.leaseId || !tenantInfo.roomNumber || !mpesaPhone} 
                  >
                    Initiate STK Push
                  </button>
                </div>

                <div className="payment-option bank">
                  <h3>Bank Transfer Details</h3>
                  <div className="payment-details">
                    <p><strong>Bank:</strong> Equity Bank</p>
                    <p><strong>Account Name:</strong> JOYCE SUITS LTD</p>
                    <p><strong>Account No:</strong> 0123456789</p>
                  </div>
                  <button className="btn btn-secondary" 
					onClick={() => navigator.clipboard.writeText('0123456789').then(() => alert('Account number copied!'))}>
                    Copy Account No.
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

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
              {/* FIX: Use Link component for internal navigation */}
              <Link to="/tenant/dashboard">Dashboard</Link>
              <Link to="/tenant/maintenance">Maintenance</Link>
              <Link to="/tenant/profile">Profile</Link>
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