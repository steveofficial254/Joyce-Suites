import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, X, Bell, LogOut } from 'lucide-react';
import DashboardPage from './DashboardPage';
import MaintenancePage from './MaintenancePage';
import PaymentsPage from './PaymentsPage';
import RoomsPage from './RoomsPage';
import NotificationsPage from './NotificationsPage';
import './CaretakerDashboard.css';

const CaretakerDashboard = () => {
  const navigate = useNavigate();
  const [activePage, setActivePage] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // State for all data
  const [dashboardData, setDashboardData] = useState(null);
  const [maintenanceRequests, setMaintenanceRequests] = useState([]);
  const [payments, setPayments] = useState([]);
  const [availableRooms, setAvailableRooms] = useState([]);
  const [occupiedRooms, setOccupiedRooms] = useState([]);

  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('userRole');

  // API call helper
  const apiCall = async (endpoint, options = {}) => {
    try {
      const response = await fetch(`/api/caretaker${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          ...options.headers,
        },
      });

      if (response.status === 401) {
        localStorage.clear();
        navigate('/login');
        return null;
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      return await response.json();
    } catch (err) {
      setError(err.message);
      console.error('API Error:', err);
      throw err;
    }
  };

  // Fetch dashboard data
  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const data = await apiCall('/dashboard');
      if (data && data.dashboard) {
        setDashboardData(data.dashboard);
      }
    } catch (err) {
      console.error('Failed to fetch dashboard');
    } finally {
      setLoading(false);
    }
  };

  // Fetch maintenance requests
  const fetchMaintenance = async (filters = {}) => {
    setLoading(true);
    try {
      const query = new URLSearchParams(filters).toString();
      const data = await apiCall(`/maintenance?${query}`);
      if (data && data.maintenance_requests) {
        setMaintenanceRequests(data.maintenance_requests);
      }
    } catch (err) {
      console.error('Failed to fetch maintenance requests');
    } finally {
      setLoading(false);
    }
  };

  // Update maintenance status
  const updateMaintenanceStatus = async (reqId, updates) => {
    try {
      const data = await apiCall(`/maintenance/update/${reqId}`, {
        method: 'POST',
        body: JSON.stringify(updates),
      });
      if (data && data.maintenance_request) {
        setMaintenanceRequests(prev =>
          prev.map(m => m.request_id === reqId ? data.maintenance_request : m)
        );
        return data;
      }
    } catch (err) {
      console.error('Failed to update maintenance request');
      throw err;
    }
  };

  // Fetch pending payments
  const fetchPendingPayments = async (filters = {}) => {
    setLoading(true);
    try {
      const query = new URLSearchParams(filters).toString();
      const data = await apiCall(`/payments/pending?${query}`);
      if (data && data.pending_payments && data.pending_payments.tenants) {
        setPayments(data.pending_payments.tenants);
      }
    } catch (err) {
      console.error('Failed to fetch pending payments');
    } finally {
      setLoading(false);
    }
  };

  // Fetch available rooms
  const fetchAvailableRooms = async (filters = {}) => {
    setLoading(true);
    try {
      const query = new URLSearchParams(filters).toString();
      const data = await apiCall(`/rooms/available?${query}`);
      if (data && data.available_rooms) {
        setAvailableRooms(data.available_rooms);
      }
    } catch (err) {
      console.error('Failed to fetch available rooms');
    } finally {
      setLoading(false);
    }
  };

  // Fetch occupied rooms
  const fetchOccupiedRooms = async (filters = {}) => {
    setLoading(true);
    try {
      const query = new URLSearchParams(filters).toString();
      const data = await apiCall(`/rooms/occupied?${query}`);
      if (data && data.occupied_rooms) {
        setOccupiedRooms(data.occupied_rooms);
      }
    } catch (err) {
      console.error('Failed to fetch occupied rooms');
    } finally {
      setLoading(false);
    }
  };

  // Send notification
  const sendNotification = async (notificationData) => {
    try {
      const data = await apiCall('/tenant/notify', {
        method: 'POST',
        body: JSON.stringify(notificationData),
      });
      return data;
    } catch (err) {
      console.error('Failed to send notification');
      throw err;
    }
  };

  // Fetch data on page change
  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }

    // Verify user is caretaker or admin
    if (userRole !== 'caretaker' && userRole !== 'admin') {
      navigate('/login');
      return;
    }

    const fetchPageData = async () => {
      switch (activePage) {
        case 'dashboard':
          await fetchDashboard();
          break;
        case 'maintenance':
          await fetchMaintenance();
          break;
        case 'payments':
          await fetchPendingPayments();
          break;
        case 'rooms':
          await Promise.all([fetchAvailableRooms(), fetchOccupiedRooms()]);
          break;
        case 'notifications':
          // Notifications page doesn't need initial data fetch
          break;
        default:
          break;
      }
    };

    fetchPageData();
  }, [activePage, token, userRole, navigate]);

  // Handle Logout
  const handleLogout = async () => {
    try {
      await fetch('/api/caretaker/logout', {
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

  // Render Page Content
  const renderContent = () => {
    switch (activePage) {
      case 'dashboard':
        return <DashboardPage data={dashboardData} loading={loading} />;
      case 'maintenance':
        return (
          <MaintenancePage 
            requests={maintenanceRequests} 
            loading={loading}
            onUpdateStatus={updateMaintenanceStatus}
          />
        );
      case 'payments':
        return (
          <PaymentsPage 
            tenants={payments} 
            loading={loading}
            onRefresh={fetchPendingPayments}
          />
        );
      case 'rooms':
        return (
          <RoomsPage 
            availableRooms={availableRooms}
            occupiedRooms={occupiedRooms}
            loading={loading}
          />
        );
      case 'notifications':
        return (
          <NotificationsPage 
            onSendNotification={sendNotification}
            loading={loading}
          />
        );
      default:
        return <DashboardPage data={dashboardData} loading={loading} />;
    }
  };

  return (
    <div className="caretaker-dashboard-container">
      {/* Sidebar */}
      <aside className={`caretaker-sidebar ${sidebarOpen ? '' : 'hidden'}`}>
        <div className="sidebar-header">
          <h2 className="sidebar-title">Joyce Suits</h2>
          <button 
            className="sidebar-close-btn"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sidebar"
          >
            <X size={24} />
          </button>
        </div>

        <nav className="sidebar-nav">
          {[
            { id: 'dashboard', label: '📊 Dashboard' },
            { id: 'maintenance', label: '🔧 Maintenance' },
            { id: 'payments', label: '💳 Payments' },
            { id: 'rooms', label: '🏠 Rooms' },
            { id: 'notifications', label: '🔔 Notifications' }
          ].map(item => (
            <button
              key={item.id}
              className={`nav-item ${activePage === item.id ? 'active' : ''}`}
              onClick={() => {
                setActivePage(item.id);
                setSidebarOpen(false);
                setError(null);
              }}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <button className="sidebar-logout-btn" onClick={handleLogout}>
          <LogOut size={18} /> Logout
        </button>
      </aside>

      {/* Main Content */}
      <main className="caretaker-main-content">
        {/* Header */}
        <header className="caretaker-header">
          <button 
            className="menu-toggle-btn"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open sidebar"
          >
            <Menu size={24} />
          </button>
          <h1 className="header-title">Caretaker – Joyce Suits Apartments</h1>
          <div className="header-right">
            <button className="notification-btn" aria-label="Notifications">
              <Bell size={20} />
              {dashboardData?.pending_notifications > 0 && (
                <span className="notification-badge">
                  {dashboardData.pending_notifications}
                </span>
              )}
            </button>
          </div>
        </header>

        {/* Error Message */}
        {error && (
          <div className="error-banner">
            <span>{error}</span>
            <button onClick={() => setError(null)}>×</button>
          </div>
        )}

        {/* Content Area */}
        <section className="caretaker-content-area">
          {renderContent()}
        </section>
      </main>

      {/* Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="caretaker-sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
          role="presentation"
        />
      )}
    </div>
  );
};

export default CaretakerDashboard;