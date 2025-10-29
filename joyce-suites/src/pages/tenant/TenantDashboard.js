import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './TenantDashboard.css';
import logo from '../../assets/image1.png';
import TenantPayment from './TenantPayment';
import TenantProfile from './TenantProfile';


// Import apartment images (image4 to image22)
import apartment1 from '../../assets/image12.jpg';
import apartment2 from '../../assets/image21.jpg';
import apartment3 from '../../assets/image22.jpg';
import apartment4 from '../../assets/image10.jpg';
import apartment5 from '../../assets/image8.jpg';
import apartment6 from '../../assets/image9.jpg';

const TenantDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [tenantData, setTenantData] = useState(null);
  const [notifications, setNotifications] = useState(3);
  const [showNotifications, setShowNotifications] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const apartmentImages = [
    apartment1, apartment2, apartment3, 
    apartment4, apartment5, apartment6
  ];

  useEffect(() => {
    fetchTenantData();
    
    // Auto-slide apartment images
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % apartmentImages.length);
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);

  const fetchTenantData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/tenant/dashboard', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setTenantData(data);
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error('Error fetching tenant data:', error);
      // Mock data for demo
      setTenantData({
        fullName: 'John Doe',
        email: 'john.doe@example.com',
        roomNumber: '12',
        roomType: 'Bedsitter',
        monthlyRent: 5500,
        rentDue: 5500,
        dueDate: '2024-11-05',
        depositStatus: 'Paid',
        depositAmount: 5900,
        balance: 0,
        photo: null,
        paymentAccount: getPaymentAccount('12')
      });
    } finally {
      setLoading(false);
    }
  };

  const getPaymentAccount = (roomNumber) => {
    const room = parseInt(roomNumber);
    // Rooms 1-10 pay to Joyce Muthoni, 11-26 pay to Lawrence Mathea
    if (room >= 1 && room <= 10) {
      return {
        name: 'JOYCE MUTHONI',
        mpesa: '0758 999322',
        bank: 'Equity Bank',
        accountNumber: '0123456789',
        accountName: 'Joyce Muthoni Mathea'
      };
    } else {
      return {
        name: 'LAWRENCE MATHEA',
        mpesa: '0712 345678',
        bank: 'KCB Bank',
        accountNumber: '9876543210',
        accountName: 'Lawrence Mathea'
      };
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const getStatusColor = (status) => {
    switch(status.toLowerCase()) {
      case 'paid': return '#4CAF50';
      case 'pending': return '#FF9800';
      case 'overdue': return '#E53935';
      default: return '#757575';
    }
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Loading Dashboard...</p>
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
          <a href="/tenant/dashboard" className="nav-item active">
            <span className="nav-icon">📊</span>
            Dashboard
          </a>
          <a href="/tenant/payments" className="nav-item">
            <span className="nav-icon">💳</span>
            Payments
          </a>
          <a href="/tenant/profile" className="nav-item">
            <span className="nav-icon">👤</span>
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
            <h1>Dashboard</h1>
            <p className="breadcrumb">Home / Dashboard</p>
          </div>

          <div className="topbar-right">
            <div className="notification-container">
              <button 
                className="icon-btn notification-btn"
                onClick={() => setShowNotifications(!showNotifications)}
              >
                🔔
                {notifications > 0 && (
                  <span className="notification-badge">{notifications}</span>
                )}
              </button>
              
              {showNotifications && (
                <div className="notifications-dropdown">
                  <h3>Notifications</h3>
                  <div className="notification-item">
                    <p>Rent due on November 5th</p>
                    <span className="notification-time">2 days ago</span>
                  </div>
                  <div className="notification-item">
                    <p>Maintenance request completed</p>
                    <span className="notification-time">1 week ago</span>
                  </div>
                  <div className="notification-item">
                    <p>Welcome to Joyce Suits!</p>
                    <span className="notification-time">2 weeks ago</span>
                  </div>
                </div>
              )}
            </div>

            <button className="icon-btn settings-btn" onClick={() => navigate('/tenant/profile')}>
              ⚙️
            </button>

            <div className="user-avatar">
              {tenantData.photo ? (
                <img src={tenantData.photo} alt="Avatar" />
              ) : (
                <div className="avatar-placeholder">
                  {tenantData.fullName.charAt(0)}
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Welcome Section */}
        <div className="welcome-section">
          <h2>Welcome back, {tenantData.fullName}! 👋</h2>
          <p>Here's what's happening with your apartment today.</p>
        </div>

        {/* Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card primary">
            <div className="stat-icon">🏠</div>
            <div className="stat-content">
              <h3>Room Details</h3>
              <p className="stat-value">Room {tenantData.roomNumber}</p>
              <p className="stat-label">{tenantData.roomType}</p>
            </div>
          </div>

          <div className="stat-card warning">
            <div className="stat-icon">💰</div>
            <div className="stat-content">
              <h3>Rent Due</h3>
              <p className="stat-value">KSh {tenantData.rentDue.toLocaleString()}</p>
              <p className="stat-label">Due: {new Date(tenantData.dueDate).toLocaleDateString()}</p>
            </div>
          </div>

          <div className="stat-card success">
            <div className="stat-icon">✅</div>
            <div className="stat-content">
              <h3>Deposit Status</h3>
              <p className="stat-value">{tenantData.depositStatus}</p>
              <p className="stat-label">KSh {tenantData.depositAmount.toLocaleString()}</p>
            </div>
          </div>

          <div className="stat-card info">
            <div className="stat-icon">📊</div>
            <div className="stat-content">
              <h3>Current Balance</h3>
              <p className="stat-value" style={{ color: tenantData.balance === 0 ? '#4CAF50' : '#E53935' }}>
                KSh {tenantData.balance.toLocaleString()}
              </p>
              <p className="stat-label">{tenantData.balance === 0 ? 'All Clear!' : 'Outstanding'}</p>
            </div>
          </div>
        </div>

        {/* Payment Account Section */}
        <div className="payment-accounts-section">
          <h3>Payment Information - Room {tenantData.roomNumber}</h3>
          <div className="payment-cards">
            <div className="payment-card mpesa">
              <div className="payment-header">
                <span className="payment-icon">📱</span>
                <h4>M-Pesa Paybill</h4>
              </div>
              <div className="payment-details">
                <div className="payment-item">
                  <span className="label">Account Name:</span>
                  <span className="value">{tenantData.paymentAccount.name}</span>
                </div>
                <div className="payment-item">
                  <span className="label">Phone Number:</span>
                  <span className="value">{tenantData.paymentAccount.mpesa}</span>
                </div>
                <div className="payment-item">
                  <span className="label">Amount:</span>
                  <span className="value amount">KSh {tenantData.monthlyRent.toLocaleString()}</span>
                </div>
              </div>
              <button className="btn btn-primary" onClick={() => navigate('/tenant/payments')}>
                Pay via M-Pesa
              </button>
            </div>

            <div className="payment-card bank">
              <div className="payment-header">
                <span className="payment-icon">🏦</span>
                <h4>Bank Transfer</h4>
              </div>
              <div className="payment-details">
                <div className="payment-item">
                  <span className="label">Bank:</span>
                  <span className="value">{tenantData.paymentAccount.bank}</span>
                </div>
                <div className="payment-item">
                  <span className="label">Account Number:</span>
                  <span className="value">{tenantData.paymentAccount.accountNumber}</span>
                </div>
                <div className="payment-item">
                  <span className="label">Account Name:</span>
                  <span className="value">{tenantData.paymentAccount.accountName}</span>
                </div>
              </div>
              <button className="btn btn-secondary" onClick={() => navigate('/tenant/payments')}>
                View Payment History
              </button>
            </div>
          </div>
        </div>

        {/* Apartment Gallery */}
        <div className="apartment-gallery">
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
                  ‹
                </button>
                <button 
                  className="gallery-btn next"
                  onClick={() => setCurrentImageIndex((prev) => 
                    (prev + 1) % apartmentImages.length
                  )}
                >
                  ›
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

        {/* Quick Actions */}
        <div className="quick-actions">
          <h3>Quick Actions</h3>
          <div className="action-buttons">
            <button className="action-btn" onClick={() => navigate('/tenant/payments')}>
              <span className="action-icon">💳</span>
              <span>Make Payment</span>
            </button>
            <button className="action-btn" onClick={() => navigate('/tenant/maintenance')}>
              <span className="action-icon">🔧</span>
              <span>Request Maintenance</span>
            </button>
            <button className="action-btn" onClick={() => navigate('/tenant/lease')}>
              <span className="action-icon">📄</span>
              <span>View Lease</span>
            </button>
            <button className="action-btn" onClick={() => navigate('/tenant/profile')}>
              <span className="action-icon">👤</span>
              <span>Update Profile</span>
            </button>
          </div>
        </div>

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
              <a href="/tenant/payments">Payments</a>
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

export default TenantDashboard;