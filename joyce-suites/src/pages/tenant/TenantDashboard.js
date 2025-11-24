import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SignatureCanvas from 'react-signature-canvas';
import './TenantDashboard.css';
import logo from '../../assets/image1.png';
import config from '../../config';

import apartment1 from '../../assets/image12.jpg';
import apartment2 from '../../assets/image21.jpg';
import apartment3 from '../../assets/image22.jpg';
import apartment4 from '../../assets/image10.jpg';
import apartment5 from '../../assets/image8.jpg';
import apartment6 from '../../assets/image9.jpg';

const TenantDashboard = () => {
  const navigate = useNavigate();
  const signatureRef = useRef(null);
  
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [profileData, setProfileData] = useState(null);
  const [paymentsData, setPaymentsData] = useState([]);
  const [vacateNotices, setVacateNotices] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Modal states
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);
  const [showVacateModal, setShowVacateModal] = useState(false);
  const [showLeaseModal, setShowLeaseModal] = useState(false);
  
  // Lease signing states
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [signatureEmpty, setSignatureEmpty] = useState(true);
  const [leaseData, setLeaseData] = useState(null);
  
  // Form states
  const [mpesaPhone, setMpesaPhone] = useState('');
  const [paymentAmount, setPaymentAmount] = useState('');
  const [maintenanceForm, setMaintenanceForm] = useState({
    title: '',
    description: '',
    priority: 'normal',
    file: null
  });
  const [vacateForm, setVacateForm] = useState({
    vacate_date: '',
    reason: ''
  });

  const apartmentImages = [apartment1, apartment2, apartment3, apartment4, apartment5, apartment6];

  const currentDate = new Date();
  const formattedDate = currentDate.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  useEffect(() => {
    fetchAllData();
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % apartmentImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('joyce-suites-token');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  };

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('joyce-suites-token');
      
      if (!token) {
        navigate('/login');
        return;
      }

      const dashRes = await fetch(`${config.apiBaseUrl}${config.endpoints.tenant.dashboard}`, {
        headers: getAuthHeaders()
      });
      
      if (dashRes.ok) {
        const dashData = await dashRes.json();
        setDashboardData(dashData.dashboard);
      }

      const profileRes = await fetch(`${config.apiBaseUrl}${config.endpoints.auth.profile}`, {
        headers: getAuthHeaders()
      });
      
      if (profileRes.ok) {
        const profData = await profileRes.json();
        setProfileData(profData.user);
      }

      const paymentsRes = await fetch(`${config.apiBaseUrl}${config.endpoints.tenant.payments}`, {
        headers: getAuthHeaders()
      });
      
      if (paymentsRes.ok) {
        const paysData = await paymentsRes.json();
        setPaymentsData(paysData.payments || []);
      }

      const vacateRes = await fetch(`${config.apiBaseUrl}${config.endpoints.tenant.vacateNotices}`, {
        headers: getAuthHeaders()
      });
      
      if (vacateRes.ok) {
        const vacateData = await vacateRes.json();
        setVacateNotices(vacateData.notices || []);
      }

      setError('');
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem('joyce-suites-token');
      await fetch(`${config.apiBaseUrl}${config.endpoints.auth.logout}`, {
        method: 'POST',
        headers: getAuthHeaders()
      });
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      localStorage.clear();
      navigate('/login');
    }
  };

  // Lease signing handlers
  const handleOpenLeaseModal = () => {
    setLeaseData({
      tenant: {
        fullName: profileData?.full_name,
        idNumber: profileData?.id_number,
        phone: profileData?.phone,
        email: profileData?.email,
        roomNumber: dashboardData?.unit_number
      },
      unit: {
        rent_amount: dashboardData?.rent_amount,
        property_name: dashboardData?.property_name
      },
      landlord: {
        name: 'JOYCE MUTHONI MATHEA',
        phone: '0758 999322',
        email: 'joycesuites@gmail.com'
      }
    });
    setShowLeaseModal(true);
  };

  const handleClearSignature = () => {
    signatureRef.current?.clear();
    setSignatureEmpty(true);
  };

  const handleSignatureEnd = () => {
    setSignatureEmpty(signatureRef.current?.isEmpty() || true);
  };

  const handleSubmitLease = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!termsAccepted) {
      setError('Please accept the terms and conditions');
      return;
    }

    if (signatureEmpty) {
      setError('Please provide your signature');
      return;
    }

    setLoading(true);

    try {
      const signatureDataUrl = signatureRef.current?.toDataURL();
      const token = localStorage.getItem('joyce-suites-token');

      const leaseSubmission = {
        signature: signatureDataUrl,
        signed_at: new Date().toISOString(),
        terms_accepted: true
      };

      const response = await fetch(`${config.apiBaseUrl}${config.endpoints.tenant.leaseSgn}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(leaseSubmission)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || 'Failed to submit lease agreement');
      }

      setSuccess('Lease agreement signed successfully!');
      setTermsAccepted(false);
      handleClearSignature();
      
      setTimeout(() => {
        setSuccess('');
        setShowLeaseModal(false);
        fetchAllData();
      }, 2000);
    } catch (err) {
      setError(err.message || 'Failed to sign lease. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInitiateMpesa = async (e) => {
    e.preventDefault();
    
    if (!mpesaPhone || !paymentAmount) {
      setError('Please enter phone number and amount');
      return;
    }

    if (parseFloat(paymentAmount) <= 0) {
      setError('Amount must be greater than 0');
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('joyce-suites-token');
      
      const response = await fetch(`${config.apiBaseUrl}/api/payments/initiate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          phone_number: mpesaPhone,
          amount: parseFloat(paymentAmount),
          room_number: dashboardData?.unit_number,
          lease_id: 1
        })
      });

      const data = await response.json();

      if (response.ok) {
        alert('STK Push sent! Check your M-Pesa prompt.');
        setShowPaymentModal(false);
        setMpesaPhone('');
        setPaymentAmount('');
        setTimeout(() => fetchAllData(), 5000);
      } else {
        setError(data.error || 'Payment initiation failed');
      }
    } catch (err) {
      setError('Error initiating payment: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitMaintenance = async (e) => {
    e.preventDefault();

    if (!maintenanceForm.title || !maintenanceForm.description) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('joyce-suites-token');
      
      const formData = new FormData();
      formData.append('title', maintenanceForm.title);
      formData.append('description', maintenanceForm.description);
      formData.append('priority', maintenanceForm.priority);
      if (maintenanceForm.file) {
        formData.append('file', maintenanceForm.file);
      }

      const response = await fetch(`${config.apiBaseUrl}${config.endpoints.tenant.requests}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();

      if (response.ok) {
        alert('Maintenance request submitted successfully');
        setShowMaintenanceModal(false);
        setMaintenanceForm({ title: '', description: '', priority: 'normal', file: null });
        setError('');
        fetchAllData();
      } else {
        setError(data.error || 'Failed to submit request');
      }
    } catch (err) {
      setError('Error submitting request: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitVacateNotice = async (e) => {
    e.preventDefault();

    if (!vacateForm.vacate_date) {
      setError('Please select a vacate date');
      return;
    }

    const vacateDate = new Date(vacateForm.vacate_date);
    const today = new Date();
    const thirtyDaysFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);

    if (vacateDate < thirtyDaysFromNow) {
      setError('Vacate date must be at least 30 days from today');
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('joyce-suites-token');
      
      const response = await fetch(`${config.apiBaseUrl}${config.endpoints.tenant.submitVacateNotice}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          intended_move_date: vacateForm.vacate_date,
          reason: vacateForm.reason
        })
      });

      const data = await response.json();

      if (response.ok) {
        alert('Vacate notice submitted successfully');
        setShowVacateModal(false);
        setVacateForm({ vacate_date: '', reason: '' });
        setError('');
        fetchAllData();
      } else {
        setError(data.error || 'Failed to submit vacate notice');
      }
    } catch (err) {
      setError('Error submitting vacate notice: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleMaintenanceFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.size > 5242880) {
      setError('File size must be less than 5MB');
      return;
    }
    setMaintenanceForm({ ...maintenanceForm, file });
  };

  const handleCancelVacateNotice = async (noticeId) => {
    if (!window.confirm('Are you sure you want to cancel this vacate notice?')) {
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('joyce-suites-token');
      
      const response = await fetch(`${config.apiBaseUrl}${config.endpoints.tenant.cancelVacateNotice.replace(':notice_id', noticeId)}`, {
        method: 'POST',
        headers: getAuthHeaders()
      });

      if (response.ok) {
        alert('Vacate notice cancelled successfully');
        fetchAllData();
      } else {
        setError('Failed to cancel vacate notice');
      }
    } catch (err) {
      setError('Error cancelling notice: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !dashboardData) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Loading Dashboard...</p>
      </div>
    );
  }

  if (error && !dashboardData) {
    return (
      <div className="error-screen">
        <div className="error-message">
          <h2>Error</h2>
          <p>{error}</p>
          <button onClick={() => navigate('/login')} className="btn btn-primary">
            Return to Login
          </button>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="error-screen">
        <div className="error-message">
          <h2>No Dashboard Data</h2>
          <p>Unable to load your dashboard. Please try again.</p>
          <button onClick={fetchAllData} className="btn btn-primary">
            Retry
          </button>
        </div>
      </div>
    );
  }

  const minVacateDate = new Date();
  minVacateDate.setDate(minVacateDate.getDate() + 30);
  const minVacateDateString = minVacateDate.toISOString().split('T')[0];

  return (
    <div className="tenant-dashboard">
      <aside className="sidebar">
        <div className="sidebar-header">
          <img src={logo} alt="Logo" className="sidebar-logo" />
          <h2>Joyce Suits</h2>
        </div>

        <nav className="sidebar-nav">
          <button 
            className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            <span className="nav-icon">D</span>
            Dashboard
          </button>
          <button 
            className={`nav-item ${activeTab === 'payments' ? 'active' : ''}`}
            onClick={() => setActiveTab('payments')}
          >
            <span className="nav-icon">P</span>
            Payments
          </button>
          <button 
            className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            <span className="nav-icon">U</span>
            Profile
          </button>
          <button 
            className={`nav-item ${activeTab === 'lease' ? 'active' : ''}`}
            onClick={() => setActiveTab('lease')}
          >
            <span className="nav-icon">L</span>
            Lease
          </button>
          <button 
            className={`nav-item ${activeTab === 'vacate' ? 'active' : ''}`}
            onClick={() => setActiveTab('vacate')}
          >
            <span className="nav-icon">V</span>
            Vacate
          </button>
        </nav>

        <div className="sidebar-footer">
          <button onClick={handleLogout} className="logout-btn">
            <span className="nav-icon">X</span>
            Logout
          </button>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div className="topbar-left">
            <h1>Joyce Suits Apartments</h1>
            <p className="breadcrumb">Welcome, {dashboardData.tenant_name}!</p>
          </div>

          <div className="topbar-right">
            <div className="user-avatar">
              <div className="avatar-placeholder">
                {dashboardData.tenant_name?.charAt(0)?.toUpperCase() || 'T'}
              </div>
            </div>
          </div>
        </header>

        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        {activeTab === 'dashboard' && (
          <div className="content">
            <div className="stats-grid">
              <div className="stat-card primary">
                <div className="stat-icon">R</div>
                <div className="stat-content">
                  <h3>Room Details</h3>
                  <p className="stat-value">Room {dashboardData.unit_number}</p>
                  <p className="stat-label">Monthly: KSh {(dashboardData.rent_amount || 0).toLocaleString()}</p>
                </div>
              </div>

              <div className="stat-card warning">
                <div className="stat-icon">B</div>
                <div className="stat-content">
                  <h3>Outstanding Balance</h3>
                  <p className="stat-value">KSh {(dashboardData.outstanding_balance || 0).toLocaleString()}</p>
                  <p className="stat-label">Balance due</p>
                </div>
              </div>

              <div className="stat-card success">
                <div className="stat-icon">L</div>
                <div className="stat-content">
                  <h3>Lease Status</h3>
                  <p className="stat-value">{dashboardData.lease_status || 'Active'}</p>
                  <p className="stat-label">{dashboardData.property_name}</p>
                </div>
              </div>

              <div className="stat-card info">
                <div className="stat-icon">M</div>
                <div className="stat-content">
                  <h3>Maintenance</h3>
                  <p className="stat-value">{dashboardData.active_maintenance_requests || 0}</p>
                  <p className="stat-label">Pending requests</p>
                </div>
              </div>
            </div>

            <div className="quick-actions">
              <h3>Quick Actions</h3>
              <div className="action-buttons">
                <button className="action-btn" onClick={() => setShowPaymentModal(true)}>
                  <span className="action-icon">Pay</span>
                  <span>Make Payment</span>
                </button>
                <button className="action-btn" onClick={() => setShowMaintenanceModal(true)}>
                  <span className="action-icon">Fix</span>
                  <span>Request Maintenance</span>
                </button>
                <button className="action-btn" onClick={() => setActiveTab('lease')}>
                  <span className="action-icon">Doc</span>
                  <span>View Lease</span>
                </button>
                <button className="action-btn" onClick={() => setActiveTab('profile')}>
                  <span className="action-icon">Acc</span>
                  <span>Update Profile</span>
                </button>
              </div>
            </div>

            <div className="gallery-section">
              <h3>Apartment Gallery</h3>
              <div className="gallery-container">
                <div className="gallery-main">
                  <img 
                    src={apartmentImages[currentImageIndex]} 
                    alt="Apartment" 
                    className="gallery-image"
                  />
                  <div className="gallery-controls">
                    <button 
                      className="gallery-btn prev"
                      onClick={() => setCurrentImageIndex((prev) => 
                        prev === 0 ? apartmentImages.length - 1 : prev - 1
                      )}
                    >
                      Previous
                    </button>
                    <button 
                      className="gallery-btn next"
                      onClick={() => setCurrentImageIndex((prev) => 
                        (prev + 1) % apartmentImages.length
                      )}
                    >
                      Next
                    </button>
                  </div>
                  <div className="gallery-indicators">
                    {apartmentImages.map((_, index) => (
                      <span 
                        key={index}
                        className={`indicator ${index === currentImageIndex ? 'active' : ''}`}
                        onClick={() => setCurrentImageIndex(index)}
                      ></span>
                    ))}
                  </div>
                </div>
                <div className="gallery-thumbnails">
                  {apartmentImages.map((img, index) => (
                    <img 
                      key={index}
                      src={img} 
                      alt={`Apartment ${index + 1}`}
                      className={`thumbnail ${index === currentImageIndex ? 'active' : ''}`}
                      onClick={() => setCurrentImageIndex(index)}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'payments' && (
          <div className="content">
            <div className="card">
              <h3>Payment History</h3>
              <div className="table-container">
                <table className="payments-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Amount</th>
                      <th>Status</th>
                      <th>Transaction ID</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paymentsData.length > 0 ? (
                      paymentsData.map((payment) => (
                        <tr key={payment.id}>
                          <td>{payment.created_at ? new Date(payment.created_at).toLocaleDateString() : 'N/A'}</td>
                          <td>KSh {(payment.amount || 0).toLocaleString()}</td>
                          <td><span className={`status-badge ${payment.status}`}>{payment.status}</span></td>
                          <td>{payment.transaction_id || 'Pending'}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" style={{ textAlign: 'center', padding: '20px' }}>
                          No payments found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              <button className="btn btn-primary" onClick={() => setShowPaymentModal(true)}>
                Make Payment
              </button>
            </div>
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="content">
            <div className="card profile-card">
              <h3>Profile Information</h3>
              <div className="profile-info">
                <div className="info-item">
                  <label>Full Name</label>
                  <p>{profileData?.full_name || 'N/A'}</p>
                </div>
                <div className="info-item">
                  <label>Email</label>
                  <p>{profileData?.email || 'N/A'}</p>
                </div>
                <div className="info-item">
                  <label>Phone</label>
                  <p>{profileData?.phone || 'N/A'}</p>
                </div>
                <div className="info-item">
                  <label>ID Number</label>
                  <p>{profileData?.id_number || 'N/A'}</p>
                </div>
                <div className="info-item">
                  <label>Room Number</label>
                  <p>{dashboardData.unit_number || 'N/A'}</p>
                </div>
                <div className="info-item">
                  <label>Lease Status</label>
                  <p>{dashboardData.lease_status || 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'lease' && (
          <div className="content">
            <div className="card">
              <h3>Lease Information</h3>
              {dashboardData ? (
                <div className="lease-info">
                  <div className="lease-detail-row">
                    <span className="lease-label">Room Number:</span>
                    <span className="lease-value">{dashboardData.unit_number}</span>
                  </div>
                  <div className="lease-detail-row">
                    <span className="lease-label">Status:</span>
                    <span className="lease-value">{dashboardData.lease_status || 'Active'}</span>
                  </div>
                  <div className="lease-detail-row">
                    <span className="lease-label">Property:</span>
                    <span className="lease-value">{dashboardData.property_name || 'N/A'}</span>
                  </div>
                  <div className="lease-detail-row">
                    <span className="lease-label">Monthly Rent:</span>
                    <span className="lease-value">KSh {(dashboardData.rent_amount || 0).toLocaleString()}</span>
                  </div>
                  <div className="lease-detail-row">
                    <span className="lease-label">Outstanding Balance:</span>
                    <span className="lease-value">KSh {(dashboardData.outstanding_balance || 0).toLocaleString()}</span>
                  </div>
                </div>
              ) : (
                <p>No lease information available</p>
              )}
              <button onClick={handleOpenLeaseModal} className="btn btn-primary" style={{ marginTop: '16px' }}>
                Sign Lease Agreement
              </button>
            </div>
          </div>
        )}

        {activeTab === 'vacate' && (
          <div className="content">
            <div className="vacate-container">
              <div className="vacate-header">
                <h3>Vacate Notices</h3>
                <button onClick={() => setShowVacateModal(true)} className="btn btn-primary">
                  Submit Vacate Notice
                </button>
              </div>

              {vacateNotices.length > 0 ? (
                <div className="vacate-list">
                  {vacateNotices.map(notice => (
                    <div key={notice.id} className="vacate-card">
                      <div className="vacate-header-row">
                        <h4>Room {notice.lease?.room_number}</h4>
                        <span className={`status-badge ${notice.status}`}>{notice.status}</span>
                      </div>
                      <div className="vacate-details">
                        <div className="detail-item">
                          <label>Intended Move Date</label>
                          <p>{new Date(notice.intended_move_date).toLocaleDateString()}</p>
                        </div>
                        <div className="detail-item">
                          <label>Notice Submitted</label>
                          <p>{new Date(notice.notice_date).toLocaleDateString()}</p>
                        </div>
                        <div className="detail-item">
                          <label>Days Until Move</label>
                          <p>{notice.days_until_move}</p>
                        </div>
                      </div>
                      {notice.reason && (
                        <div className="vacate-reason">
                          <label>Reason</label>
                          <p>{notice.reason}</p>
                        </div>
                      )}
                      {notice.admin_notes && (
                        <div className="admin-notes">
                          <label>Admin Notes</label>
                          <p>{notice.admin_notes}</p>
                        </div>
                      )}
                      {notice.status === 'pending' && (
                        <button 
                          onClick={() => handleCancelVacateNotice(notice.id)}
                          className="btn btn-secondary"
                          style={{ marginTop: '12px' }}
                        >
                          Cancel Notice
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <p>No vacate notices submitted yet</p>
                </div>
              )}
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
              <p>Copyright 2024 Joyce Suits Apartments. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </main>

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="modal-overlay" onClick={() => setShowPaymentModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowPaymentModal(false)}>x</button>
            <h2>Make Payment via M-Pesa</h2>
            <div>
              <div className="form-group">
                <label>Phone Number *</label>
                <input 
                  type="tel"
                  placeholder="254712345678 or 0712345678"
                  value={mpesaPhone}
                  onChange={(e) => setMpesaPhone(e.target.value)}
                  required
                />
                <small>Format: 254712345678 or 0712345678</small>
              </div>
              <div className="form-group">
                <label>Amount (KSh) *</label>
                <input 
                  type="number" 
                  placeholder="e.g., 5500"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  required
                  min="1"
                />
              </div>
              <div className="form-group">
                <button onClick={handleInitiateMpesa} className="btn btn-primary" disabled={loading}>
                  {loading ? 'Processing...' : 'Send STK Push'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Maintenance Modal */}
      {showMaintenanceModal && (
        <div className="modal-overlay" onClick={() => setShowMaintenanceModal(false)}>
          <div className="modal modal-large" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowMaintenanceModal(false)}>x</button>
            <h2>Request Maintenance or Enquiry</h2>
            <div>
              <div className="form-group">
                <label>Title/Subject *</label>
                <input 
                  type="text" 
                  placeholder="e.g., Broken Door Lock"
                  value={maintenanceForm.title}
                  onChange={(e) => setMaintenanceForm({ ...maintenanceForm, title: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Description *</label>
                <textarea 
                  placeholder="Describe the issue or inquiry in detail..."
                  value={maintenanceForm.description}
                  onChange={(e) => setMaintenanceForm({ ...maintenanceForm, description: e.target.value })}
                  rows="5"
                  required
                ></textarea>
              </div>
              <div className="form-group">
                <label>Priority</label>
                <select 
                  value={maintenanceForm.priority}
                  onChange={(e) => setMaintenanceForm({ ...maintenanceForm, priority: e.target.value })}
                >
                  <option value="low">Low</option>
                  <option value="normal">Normal</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
              <div className="form-group">
                <label>Attach File (Optional)</label>
                <input 
                  type="file" 
                  onChange={handleMaintenanceFileChange}
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                />
                <small>Max 5MB. Accepted: PDF, Images, Documents</small>
              </div>
              <div className="form-group form-actions">
                <button onClick={() => setShowMaintenanceModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button onClick={handleSubmitMaintenance} className="btn btn-primary" disabled={loading}>
                  {loading ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Vacate Notice Modal */}
      {showVacateModal && (
        <div className="modal-overlay" onClick={() => setShowVacateModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowVacateModal(false)}>x</button>
            <h2>Submit Vacate Notice</h2>
            <div>
              <div className="form-group">
                <label>Intended Move Date *</label>
                <p style={{ fontSize: '0.85rem', color: '#6B7280', marginBottom: '8px' }}>
                  Minimum 30 days from today
                </p>
                <input 
                  type="date" 
                  value={vacateForm.vacate_date}
                  onChange={(e) => setVacateForm({ ...vacateForm, vacate_date: e.target.value })}
                  min={minVacateDateString}
                  required
                />
              </div>
              <div className="form-group">
                <label>Reason for Moving (Optional)</label>
                <textarea 
                  placeholder="Tell us why you are moving"
                  value={vacateForm.reason}
                  onChange={(e) => setVacateForm({ ...vacateForm, reason: e.target.value })}
                  rows="4"
                ></textarea>
              </div>
              <div style={{ padding: '12px', background: '#FEF3C7', borderRadius: '6px', marginBottom: '20px' }}>
                <p style={{ margin: 0, fontSize: '0.9rem', color: '#92400E' }}>
                  By submitting this notice, you are formally notifying your landlord of your intention to vacate. This is a binding commitment.
                </p>
              </div>
              <div className="form-group form-actions">
                <button onClick={() => setShowVacateModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button onClick={handleSubmitVacateNotice} className="btn btn-primary" disabled={loading}>
                  {loading ? 'Submitting...' : 'Submit Notice'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Lease Signing Modal */}
      {showLeaseModal && leaseData && (
        <div className="modal-overlay" onClick={() => setShowLeaseModal(false)}>
          <div className="modal modal-lease" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowLeaseModal(false)}>x</button>
            
            <div style={{ maxHeight: '80vh', overflowY: 'auto' }}>
              <div className="lease-document-modal">
                <div style={{ textAlign: 'center', marginBottom: '32px', borderBottom: '2px solid #E5E7EB', paddingBottom: '24px' }}>
                  <h1 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#7D1F3F', marginBottom: '8px' }}>Joyce Suits Apartments</h1>
                  <h2 style={{ fontSize: '1.2rem', color: '#6B7280', fontWeight: '600' }}>House Lease Agreement</h2>
                </div>

                <div style={{ marginBottom: '24px', lineHeight: '1.8' }}>
                  <p>This Lease Agreement is made and entered into on this <strong>{formattedDate}</strong>, by and between:</p>
                </div>

                <div style={{ marginBottom: '24px' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '12px', color: '#7D1F3F' }}>LANDLORD:</h3>
                  <div style={{ background: '#F9FAFB', padding: '16px', borderRadius: '8px', borderLeft: '3px solid #7D1F3F' }}>
                    <p style={{ margin: '8px 0' }}><strong>Joyce Suites</strong> ({leaseData.landlord.name})</p>
                    <p style={{ margin: '8px 0' }}>Phone: {leaseData.landlord.phone}</p>
                    <p style={{ margin: '8px 0' }}>Email: {leaseData.landlord.email}</p>
                  </div>
                </div>

                <div style={{ marginBottom: '24px' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '12px', color: '#7D1F3F' }}>TENANT:</h3>
                  <div style={{ background: '#F9FAFB', padding: '16px', borderRadius: '8px', borderLeft: '3px solid #7D1F3F' }}>
                    <p style={{ margin: '8px 0' }}><strong>Name:</strong> {leaseData.tenant.fullName}</p>
                    <p style={{ margin: '8px 0' }}><strong>ID No.:</strong> {leaseData.tenant.idNumber}</p>
                    <p style={{ margin: '8px 0' }}><strong>Phone:</strong> {leaseData.tenant.phone}</p>
                    <p style={{ margin: '8px 0' }}><strong>Email:</strong> {leaseData.tenant.email}</p>
                  </div>
                </div>

                <div style={{ marginBottom: '24px' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '12px', color: '#7D1F3F' }}>PROPERTY ADDRESS:</h3>
                  <div style={{ background: '#F9FAFB', padding: '16px', borderRadius: '8px', borderLeft: '3px solid #7D1F3F' }}>
                    <p style={{ margin: '8px 0' }}>Joyce Suites, Room: <strong>Room {leaseData.tenant.roomNumber}</strong></p>
                  </div>
                </div>

                <div style={{ marginBottom: '24px' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '12px', color: '#7D1F3F' }}>KEY TERMS:</h3>
                  <div style={{ background: '#F9FAFB', padding: '16px', borderRadius: '8px', borderLeft: '3px solid #7D1F3F' }}>
                    <p style={{ margin: '8px 0' }}><strong>Monthly Rent:</strong> KSh {(leaseData.unit.rent_amount || 0).toLocaleString()}/=</p>
                    <p style={{ margin: '8px 0' }}><strong>Payment Due:</strong> 5th day of each month</p>
                    <p style={{ margin: '8px 0' }}><strong>Lease Term:</strong> Month-to-month (30-day notice to terminate)</p>
                    <p style={{ margin: '8px 0' }}><strong>Security Deposit:</strong> One month's rent</p>
                  </div>
                </div>

                <div style={{ marginBottom: '24px' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '12px', color: '#7D1F3F' }}>TERMS & CONDITIONS:</h3>
                  <ul style={{ marginLeft: '24px', lineHeight: '1.8' }}>
                    <li>Tenant shall maintain premises in clean and habitable condition</li>
                    <li>Any damage beyond normal wear and tear is Tenant's responsibility</li>
                    <li>Noise restrictions: 10 PM - 8 AM (quiet hours)</li>
                    <li>Tenant must provide 30 days' notice to vacate</li>
                    <li>Unpaid rent and damages will be deducted from security deposit</li>
                    <li>Governed by the laws of Kenya</li>
                  </ul>
                </div>
              </div>

              <div style={{ borderTop: '2px solid #E5E7EB', paddingTop: '24px' }}>
                {error && <div className="alert alert-error" style={{ marginBottom: '16px' }}>{error}</div>}
                {success && <div className="alert alert-success" style={{ marginBottom: '16px' }}>{success}</div>}

                <div style={{ marginBottom: '24px' }}>
                  <label style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', cursor: 'pointer', fontSize: '0.95rem', lineHeight: '1.6' }}>
                    <input
                      type="checkbox"
                      checked={termsAccepted}
                      onChange={(e) => setTermsAccepted(e.target.checked)}
                      style={{ marginTop: '4px', cursor: 'pointer', width: '18px', height: '18px' }}
                    />
                    <span>I have read, understood, and agree to all the terms and conditions stated in this lease agreement. I confirm that all information provided is accurate and true.</span>
                  </label>
                </div>

                <div style={{ marginBottom: '24px' }}>
                  <label style={{ display: 'block', fontWeight: '700', marginBottom: '12px' }}>
                    Tenant's Signature *
                    <span style={{ display: 'block', fontSize: '0.85rem', color: '#6B7280', fontWeight: '400', marginTop: '4px' }}>
                      (Draw your signature in the box below)
                    </span>
                  </label>
                  
                  <div style={{ border: '2px solid #E5E7EB', borderRadius: '8px', overflow: 'hidden', marginBottom: '16px', background: 'white' }}>
                    <SignatureCanvas
                      ref={signatureRef}
                      onEnd={handleSignatureEnd}
                      canvasProps={{
                        width: 500,
                        height: 150,
                        style: { display: 'block', width: '100%' }
                      }}
                    />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <button
                      type="button"
                      onClick={handleClearSignature}
                      className="btn btn-secondary"
                    >
                      Clear Signature
                    </button>
                    <span style={{ color: '#6B7280', fontSize: '0.9rem' }}>
                      Date: {formattedDate}
                    </span>
                  </div>
                </div>

                <div>
                  <button
                    onClick={handleSubmitLease}
                    className="btn btn-primary"
                    style={{ width: '100%', padding: '16px', fontSize: '1rem' }}
                    disabled={loading || !termsAccepted || signatureEmpty}
                  >
                    {loading ? 'Submitting...' : 'Sign & Submit Lease Agreement'}
                  </button>
                  <p style={{ fontSize: '0.85rem', color: '#6B7280', marginTop: '12px', fontStyle: 'italic' }}>
                    By clicking submit, you are electronically signing this lease agreement and agreeing to be legally bound by its terms.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TenantDashboard;