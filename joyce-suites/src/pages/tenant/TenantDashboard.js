import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './TenantDashboard.css';
import logo from '../../assets/image1.png';

// Import apartment images
import apartment1 from '../../assets/image12.jpg';
import apartment2 from '../../assets/image21.jpg';
import apartment3 from '../../assets/image22.jpg';
import apartment4 from '../../assets/image10.jpg';
import apartment5 from '../../assets/image8.jpg';
import apartment6 from '../../assets/image9.jpg';

const TenantDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [notifications, setNotifications] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [error, setError] = useState('');

  const apartmentImages = [
    apartment1, apartment2, apartment3, 
    apartment4, apartment5, apartment6
  ];

  useEffect(() => {
    fetchDashboardData();
    
    // Auto-slide apartment images
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % apartmentImages.length);
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await fetch('/api/tenant/dashboard', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to load dashboard');
      }

      setDashboardData(data.dashboard);
      setNotifications(data.dashboard.notifications.unread_count);
      setError('');
    } catch (err) {
      console.error('Error fetching dashboard:', err);
      setError(err.message);
      // Set timeout to redirect to login after 3 seconds
      setTimeout(() => {
        if (err.message.includes('Unauthorized') || err.message.includes('Token')) {
          localStorage.clear();
          navigate('/login');
        }
      }, 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem('token');
      await fetch('/api/tenant/logout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      localStorage.clear();
      navigate('/login');
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

  if (error) {
    return (
      <div className="error-screen">
        <div className="error-message">
          <h2>⚠️ Error</h2>
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
          <button onClick={fetchDashboardData} className="btn btn-primary">
            Retry
          </button>
        </div>
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
            <span className="nav-icon"></span>
            Dashboard
          </a>
          <a href="/tenant/payments" className="nav-item">
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
                    <p>Unread: {notifications}</p>
                    <span className="notification-time">Total: {dashboardData.notifications.total_notifications}</span>
                  </div>
                </div>
              )}
            </div>

            <button className="icon-btn settings-btn" onClick={() => navigate('/tenant/profile')}>
              ⚙️
            </button>

            <div className="user-avatar">
              <div className="avatar-placeholder">
                {dashboardData.welcome.charAt(12) || 'U'}
              </div>
            </div>
          </div>
        </header>

        {/* Welcome Section */}
        <div className="welcome-section">
          <h2>{dashboardData.welcome} </h2>
          <p>Here's what's happening with your apartment today.</p>
        </div>

        {/* Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card primary">
            <div className="stat-icon"></div>
            <div className="stat-content">
              <h3>Room Details</h3>
              <p className="stat-value">Room {dashboardData.room_info.room_number}</p>
              <p className="stat-label">Monthly: KSh {dashboardData.room_info.monthly_rent.toLocaleString()}</p>
            </div>
          </div>

          <div className="stat-card warning">
            <div className="stat-icon"></div>
            <div className="stat-content">
              <h3>Pending Amount</h3>
              <p className="stat-value">KSh {dashboardData.payment_summary.pending_amount.toLocaleString()}</p>
              <p className="stat-label">{dashboardData.payment_summary.overdue_payments} overdue</p>
            </div>
          </div>

          <div className="stat-card success">
            <div className="stat-icon"></div>
            <div className="stat-content">
              <h3>Total Paid</h3>
              <p className="stat-value">KSh {dashboardData.payment_summary.total_paid.toLocaleString()}</p>
              <p className="stat-label">Year to date</p>
            </div>
          </div>

          <div className="stat-card info">
            <div className="stat-icon"></div>
            <div className="stat-content">
              <h3>Maintenance</h3>
              <p className="stat-value">{dashboardData.maintenance_summary.pending_requests}</p>
              <p className="stat-label">Pending requests</p>
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
              <span className="action-icon"></span>
              <span>Request Maintenance</span>
            </button>
            <button className="action-btn" onClick={() => navigate('/tenant/lease')}>
              <span className="action-icon">📄</span>
              <span>View Lease</span>
            </button>
            <button className="action-btn" onClick={() => navigate('/tenant/profile')}>
              <span className="action-icon"></span>
              <span>Update Profile</span>
            </button>
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