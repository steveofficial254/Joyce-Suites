import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Menu, X, Bell, LogOut, ChevronDown, AlertCircle, Search, Filter, 
  Mail, Home, Send, Eye, CheckCircle, Clock, DollarSign, Building, 
  User, Users, Wrench, RefreshCw, Calendar, AlertTriangle, Check,
  MessageSquare, TrendingUp, Plus, Download
} from 'lucide-react';

const API_BASE_URL = 'http://localhost:5000';

// ==================== MAIN CARETAKER DASHBOARD COMPONENT ====================
const CaretakerDashboard = () => {
  const navigate = useNavigate();
  const [activePage, setActivePage] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  // State for all data
  const [dashboardData, setDashboardData] = useState(null);
  const [maintenanceRequests, setMaintenanceRequests] = useState([]);
  const [pendingPayments, setPendingPayments] = useState([]);
  const [availableRooms, setAvailableRooms] = useState([]);
  const [occupiedRooms, setOccupiedRooms] = useState([]);
  const [allRooms, setAllRooms] = useState([]);
  const [tenants, setTenants] = useState([]);

  // Modal states
  const [selectedMaintenance, setSelectedMaintenance] = useState(null);
  const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [showRoomDetailsModal, setShowRoomDetailsModal] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);

  const token = localStorage.getItem('joyce-suites-token');
  const userRole = localStorage.getItem('joyce-suites-role');
  const userName = localStorage.getItem('joyce-suites-user-name') || 'Caretaker';

  // Enhanced API call helper
  const apiCall = useCallback(async (endpoint, options = {}) => {
    try {
      console.log('Making API call to:', `${API_BASE_URL}${endpoint}`);
      
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          ...options.headers,
        },
      });

      console.log('Response status:', response.status);

      if (response.status === 401 || response.status === 403) {
        console.error('Unauthorized - redirecting to login');
        localStorage.clear();
        navigate('/caretaker-login', { replace: true });
        return null;
      }

      const data = await response.json();
      console.log('Response data:', data);

      if (!response.ok) {
        throw new Error(data.error || data.message || `HTTP ${response.status}`);
      }

      return data;
    } catch (err) {
      console.error('API call error:', err);
      setError(err.message);
      throw err;
    }
  }, [token, navigate]);

  // Fetch functions - Updated to match your backend routes
  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiCall('/api/caretaker/dashboard');
      if (data && data.success) {
        setDashboardData(data.dashboard);
      }
    } catch (err) {
      console.error('Failed to fetch dashboard:', err);
    } finally {
      setLoading(false);
    }
  }, [apiCall]);

  const fetchMaintenance = useCallback(async () => {
    try {
      const data = await apiCall('/api/caretaker/maintenance?page=1&per_page=100');
      if (data && data.success) {
        setMaintenanceRequests(data.requests || []);
      }
    } catch (err) {
      console.error('Failed to fetch maintenance:', err);
    }
  }, [apiCall]);

  const fetchPendingPayments = useCallback(async () => {
    try {
      const data = await apiCall('/api/caretaker/payments/pending');
      if (data && data.success) {
        setPendingPayments(data.tenants_with_arrears || []);
      }
    } catch (err) {
      console.error('Failed to fetch pending payments:', err);
    }
  }, [apiCall]);

  const fetchAvailableRooms = useCallback(async () => {
    try {
      const data = await apiCall('/api/caretaker/rooms/available');
      if (data && data.success) {
        setAvailableRooms(data.available_rooms || []);
      }
    } catch (err) {
      console.error('Failed to fetch available rooms:', err);
    }
  }, [apiCall]);

  const fetchOccupiedRooms = useCallback(async () => {
    try {
      const data = await apiCall('/api/caretaker/rooms/occupied');
      if (data && data.success) {
        setOccupiedRooms(data.occupied_rooms || []);
      }
    } catch (err) {
      console.error('Failed to fetch occupied rooms:', err);
      // Mock data for testing
      const mockOccupied = [
        {
          id: 1,
          name: 'Room 22',
          type: 'Bedsitter',
          rent_amount: 5250,
          tenant_name: 'John Doe',
          tenant_phone: '0712345678'
        },
        {
          id: 2,
          name: 'Room 15',
          type: 'One Bedroom',
          rent_amount: 7500,
          tenant_name: 'Jane Smith',
          tenant_phone: '0723456789'
        }
      ];
      setOccupiedRooms(mockOccupied);
    }
  }, [apiCall]);

  const fetchAllRooms = useCallback(async () => {
    try {
      const data = await apiCall('/api/caretaker/rooms/all');
      if (data && data.success) {
        setAllRooms(data.rooms || []);
      }
    } catch (err) {
      console.error('Failed to fetch all rooms:', err);
    }
  }, [apiCall]);

  const fetchTenants = useCallback(async () => {
    try {
      const data = await apiCall('/api/admin/tenants?page=1&per_page=100');
      if (data && data.success) {
        setTenants(data.tenants || []);
      }
    } catch (err) {
      console.error('Failed to fetch tenants:', err);
    }
  }, [apiCall]);

  // CRUD operations
  const handleUpdateMaintenance = useCallback(async (requestId, updateData) => {
    try {
      const data = await apiCall(`/api/caretaker/maintenance/${requestId}`, {
        method: 'PUT',
        body: JSON.stringify(updateData)
      });
      
      if (data && data.success) {
        setSuccessMessage('Maintenance request updated successfully');
        await fetchMaintenance();
        await fetchDashboard();
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (err) {
      console.error('Failed to update maintenance:', err);
    }
  }, [apiCall, fetchMaintenance, fetchDashboard]);

  const handleSendNotification = useCallback(async (notificationData) => {
    try {
      setLoading(true);
      const data = await apiCall('/api/caretaker/notifications/send', {
        method: 'POST',
        body: JSON.stringify(notificationData)
      });
      
      if (data && data.success) {
        setSuccessMessage('Notification sent successfully');
        setShowNotificationModal(false);
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [apiCall]);

  const handleLogout = useCallback(async () => {
    try {
      await fetch(`${API_BASE_URL}/api/auth/logout`, {
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
      navigate('/caretaker-login', { replace: true });
    }
  }, [token, navigate]);

  // Verify authentication on mount
  useEffect(() => {
    if (!token) {
      console.error('No token found - redirecting to login');
      navigate('/caretaker-login', { replace: true });
      return;
    }

    if (userRole !== 'caretaker' && userRole !== 'admin') {
      console.error('Invalid role - redirecting to login');
      navigate('/caretaker-login', { replace: true });
      return;
    }
  }, [token, userRole, navigate]);

  // Fetch data when page changes
  useEffect(() => {
    if (!token || (userRole !== 'caretaker' && userRole !== 'admin')) {
      return;
    }

    const fetchPageData = async () => {
      console.log('Fetching data for page:', activePage);
      setLoading(true);
      try {
        switch (activePage) {
          case 'dashboard':
            await Promise.all([
              fetchDashboard(),
              fetchMaintenance(),
              fetchPendingPayments(),
              fetchAvailableRooms(),
              fetchOccupiedRooms()
            ]);
            break;
          case 'maintenance':
            await fetchMaintenance();
            break;
          case 'payments':
            await fetchPendingPayments();
            await fetchTenants();
            break;
          case 'rooms':
            await Promise.all([
              fetchAvailableRooms(),
              fetchOccupiedRooms(),
              fetchAllRooms()
            ]);
            break;
          case 'notifications':
            await fetchTenants();
            break;
          default:
            break;
        }
      } finally {
        setLoading(false);
      }
    };

    fetchPageData();
  }, [activePage, token, userRole, fetchDashboard, fetchMaintenance, fetchPendingPayments, fetchAvailableRooms, fetchOccupiedRooms, fetchAllRooms, fetchTenants]);

  // Add media query for mobile sidebar
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 768) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Initial check
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Render Page Content
  const renderContent = () => {
    switch (activePage) {
      case 'dashboard':
        return (
          <DashboardPage 
            data={dashboardData}
            maintenanceRequests={maintenanceRequests}
            pendingPayments={pendingPayments}
            availableRooms={availableRooms}
            occupiedRooms={occupiedRooms}
            loading={loading}
            onViewMaintenance={(req) => {
              setSelectedMaintenance(req);
              setShowMaintenanceModal(true);
            }}
          />
        );
      case 'maintenance':
        return (
          <MaintenancePage 
            requests={maintenanceRequests}
            loading={loading}
            onUpdateStatus={handleUpdateMaintenance}
            onViewDetails={(req) => {
              setSelectedMaintenance(req);
              setShowMaintenanceModal(true);
            }}
          />
        );
      case 'payments':
        return (
          <PaymentsPage 
            payments={pendingPayments}
            loading={loading}
            onSendNotification={() => setShowNotificationModal(true)}
          />
        );
      case 'rooms':
        return (
          <RoomsPage 
            availableRooms={availableRooms}
            occupiedRooms={occupiedRooms}
            allRooms={allRooms}
            loading={loading}
            onViewRoomDetails={(room) => {
              setSelectedRoom(room);
              setShowRoomDetailsModal(true);
            }}
          />
        );
      case 'notifications':
        return (
          <NotificationsPage
            tenants={tenants}
            onSendNotification={() => setShowNotificationModal(true)}
          />
        );
      default:
        return null;
    }
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'maintenance', label: 'Maintenance', icon: Wrench },
    { id: 'payments', label: 'Payments', icon: DollarSign },
    { id: 'rooms', label: 'Rooms', icon: Building },
    { id: 'notifications', label: 'Notifications', icon: Bell }
  ];

  return (
    <div style={styles.container}>
      <style>
        {`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          @media (max-width: 768px) {
            .menu-btn { display: flex !important; }
            .main-content { margin-left: 0 !important; }
          }
        `}
      </style>
      
      <aside style={{...styles.sidebar, ...(sidebarOpen ? {} : styles.sidebarHidden)}}>
        <div style={styles.sidebarHeader}>
          <div>
            <h2 style={styles.sidebarTitle}>Joyce Suites</h2>
            <p style={styles.sidebarSubtitle}>Caretaker Dashboard</p>
          </div>
          <button style={styles.closeBtn} onClick={() => setSidebarOpen(false)}>
            <X size={24} />
          </button>
        </div>

        <nav style={styles.nav}>
          {navItems.map(item => (
            <button
              key={item.id}
              style={{
                ...styles.navItem,
                ...(activePage === item.id ? styles.navItemActive : {})
              }}
              onClick={() => {
                setActivePage(item.id);
                if (window.innerWidth <= 768) {
                  setSidebarOpen(false);
                }
              }}
            >
              <item.icon size={18} />
              <span style={styles.navLabel}>{item.label}</span>
            </button>
          ))}
        </nav>

        <div style={styles.userInfo}>
          <div style={styles.userAvatar}>
            <User size={20} />
          </div>
          <div style={styles.userDetails}>
            <strong>{userName}</strong>
            <small>Caretaker</small>
          </div>
        </div>

        <button style={styles.logoutBtn} onClick={handleLogout}>
          <LogOut size={18} /> Logout
        </button>
      </aside>

      <main style={{...styles.main, marginLeft: sidebarOpen ? '260px' : '0'}} className="main-content">
        <header style={styles.header}>
          <div style={styles.headerLeft}>
            <button className="menu-btn" style={styles.menuBtn} onClick={() => setSidebarOpen(true)}>
              <Menu size={24} />
            </button>
            <button style={styles.homeBtn} onClick={() => setActivePage('dashboard')}>
              <Home size={20} />
            </button>
            <h1 style={styles.headerTitle}>Caretaker Dashboard</h1>
          </div>
          <div style={styles.headerRight}>
            <button style={styles.refreshBtn} onClick={() => {
              if (activePage === 'dashboard') {
                fetchDashboard();
                fetchMaintenance();
              }
            }}>
              <RefreshCw size={20} />
            </button>
            <div style={styles.notificationBadge}>
              <Bell size={20} />
              {dashboardData?.pending_maintenance > 0 && (
                <span style={styles.badgeCount}>{dashboardData.pending_maintenance}</span>
              )}
            </div>
            <div style={styles.userMenu}>
              <button 
                style={styles.userMenuBtn}
                onClick={() => setUserMenuOpen(!userMenuOpen)}
              >
                <div style={styles.userAvatar}>{userName.charAt(0)}</div>
                <span style={styles.userName}>{userName}</span>
                <ChevronDown size={16} />
              </button>
              {userMenuOpen && (
                <div style={styles.userDropdown}>
                  <div style={styles.dropdownItem}>
                    <strong>{userName}</strong><br />
                    <small>Caretaker</small>
                  </div>
                  <button 
                    style={styles.dropdownBtn}
                    onClick={handleLogout}
                  >
                    <LogOut size={14} /> Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {error && (
          <div style={styles.errorBanner}>
            <AlertCircle size={16} />
            <span>{error}</span>
            <button style={styles.closeBannerBtn} onClick={() => setError('')}>×</button>
          </div>
        )}

        {successMessage && (
          <div style={styles.successBanner}>
            <CheckCircle size={16} />
            <span>{successMessage}</span>
            <button style={styles.closeBannerBtn} onClick={() => setSuccessMessage('')}>×</button>
          </div>
        )}

        <section style={styles.content}>
          {renderContent()}
        </section>
      </main>

      {showMaintenanceModal && selectedMaintenance && (
        <MaintenanceDetailsModal
          request={selectedMaintenance}
          onClose={() => {
            setShowMaintenanceModal(false);
            setSelectedMaintenance(null);
          }}
          onUpdateStatus={handleUpdateMaintenance}
        />
      )}

      {showNotificationModal && (
        <SendNotificationModal
          tenants={tenants}
          onClose={() => setShowNotificationModal(false)}
          onSubmit={handleSendNotification}
          loading={loading}
        />
      )}

      {showRoomDetailsModal && selectedRoom && (
        <RoomDetailsModal
          room={selectedRoom}
          onClose={() => {
            setShowRoomDetailsModal(false);
            setSelectedRoom(null);
          }}
        />
      )}

      {sidebarOpen && window.innerWidth <= 768 && (
        <div style={styles.overlay} onClick={() => setSidebarOpen(false)} />
      )}
    </div>
  );
};

// ==================== DASHBOARD PAGE ====================
const DashboardPage = ({ data, maintenanceRequests, pendingPayments, availableRooms, occupiedRooms, loading, onViewMaintenance }) => {
  if (loading || !data) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  const recentRequests = maintenanceRequests.slice(0, 5);

  return (
    <>
      <div style={styles.pageHeader}>
        <h2 style={styles.pageTitle}>Dashboard Overview</h2>
        <div style={styles.actionButtons}>
          <button style={styles.btnSecondary} onClick={() => window.print()}>
            <Download size={16} /> Export Report
          </button>
          <button style={styles.btnPrimary} onClick={() => window.location.reload()}>
            <RefreshCw size={16} /> Refresh
          </button>
        </div>
      </div>
      
      <div style={styles.gridContainer}>
        <OverviewCard 
          title="Pending Maintenance" 
          value={data.pending_maintenance || 0} 
          icon={AlertCircle}
          color="#f59e0b"
        />
        <OverviewCard 
          title="In Progress" 
          value={data.in_progress_maintenance || 0} 
          icon={Clock}
          color="#3b82f6"
        />
        <OverviewCard 
          title="Completed Today" 
          value={data.completed_today || 0} 
          icon={CheckCircle}
          color="#10b981"
        />
        <OverviewCard 
          title="Occupied Units" 
          value={data.occupied_properties || 0} 
          icon={Users}
          color="#8b5cf6"
        />
        <OverviewCard 
          title="Vacant Units" 
          value={data.vacant_properties || 0} 
          icon={Building}
          color="#06b6d4"
        />
        <OverviewCard 
          title="Tenants in Arrears" 
          value={pendingPayments.length || 0} 
          icon={DollarSign}
          color="#ef4444"
        />
      </div>

      <div style={styles.dashboardGrid}>
        {/* Left column */}
        <div style={styles.dashboardColumn}>
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>
              <TrendingUp size={18} /> Recent Maintenance Requests
            </h3>
            <div style={styles.tableWrapper}>
              <table style={styles.table}>
                <thead style={styles.tableHeader}>
                  <tr>
                    <th style={styles.th}>Title</th>
                    <th style={styles.th}>Priority</th>
                    <th style={styles.th}>Status</th>
                    <th style={styles.th}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {recentRequests.length > 0 ? (
                    recentRequests.map(req => (
                      <tr key={req.id} style={styles.tableRow}>
                        <td style={styles.td}>{req.title}</td>
                        <td style={styles.td}>
                          <span style={{
                            ...styles.statusBadge,
                            backgroundColor: req.priority === 'urgent' ? '#fee2e2' : '#dbeafe',
                            color: req.priority === 'urgent' ? '#991b1b' : '#1e40af'
                          }}>
                            {req.priority}
                          </span>
                        </td>
                        <td style={styles.td}>
                          <span style={{
                            ...styles.statusBadge,
                            backgroundColor: req.status === 'pending' ? '#fef3c7' : '#dcfce7',
                            color: req.status === 'pending' ? '#92400e' : '#166534'
                          }}>
                            {req.status}
                          </span>
                        </td>
                        <td style={styles.td}>
                          <button 
                            style={styles.btnSmallPrimary}
                            onClick={() => onViewMaintenance(req)}
                          >
                            <Eye size={14} />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" style={{...styles.td, textAlign: 'center'}}>
                        No recent maintenance requests
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right column */}
        <div style={styles.dashboardColumn}>
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>
              <Building size={18} /> Property Summary
            </h3>
            <div style={styles.summaryGrid}>
              <SummaryCard 
                label="Occupancy Rate" 
                value={`${Math.round((data.occupied_properties / (data.occupied_properties + data.vacant_properties)) * 100)}%`}
                color="#3b82f6"
              />
              <SummaryCard 
                label="Total Units" 
                value={data.occupied_properties + data.vacant_properties}
                color="#10b981"
              />
              <SummaryCard 
                label="Maintenance Rate" 
                value={`${Math.round((data.pending_maintenance / (data.occupied_properties + data.vacant_properties)) * 100)}%`}
                color="#f59e0b"
              />
              <SummaryCard 
                label="Completion Rate" 
                value={`${data.occupied_properties > 0 ? Math.round((data.completed_today / data.occupied_properties) * 100) : 0}%`}
                color="#8b5cf6"
              />
            </div>
          </div>

          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>
              <DollarSign size={18} /> Quick Stats
            </h3>
            <div style={styles.quickStats}>
              <div style={styles.quickStat}>
                <span style={styles.quickStatLabel}>Total Outstanding</span>
                <span style={styles.quickStatValue}>
                  KSh {pendingPayments.reduce((sum, p) => sum + (p.rent_amount || 0), 0).toLocaleString()}
                </span>
              </div>
              <div style={styles.quickStat}>
                <span style={styles.quickStatLabel}>Avg. Rent per Unit</span>
                <span style={styles.quickStatValue}>KSh 5,250</span>
              </div>
              <div style={styles.quickStat}>
                <span style={styles.quickStatLabel}>Maintenance Efficiency</span>
                <span style={styles.quickStatValue}>
                  {data.occupied_properties > 0 ? Math.round((data.completed_today / data.pending_maintenance) * 100) : 0}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

// ==================== MAINTENANCE PAGE ====================
const MaintenancePage = ({ requests, loading, onUpdateStatus, onViewDetails }) => {
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p>Loading maintenance requests...</p>
      </div>
    );
  }

  const filtered = requests.filter(r => {
    const statusMatch = filterStatus === 'all' || r.status === filterStatus;
    const priorityMatch = filterPriority === 'all' || r.priority === filterPriority;
    const searchMatch = 
      (r.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.description || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    return statusMatch && priorityMatch && searchMatch;
  });

  const priorityColor = (priority) => {
    switch(priority) {
      case 'urgent': return '#ef4444';
      case 'high': return '#f59e0b';
      case 'normal': return '#3b82f6';
      case 'low': return '#6b7280';
      default: return '#6b7280';
    }
  };

  const statusColor = (status) => {
    switch(status) {
      case 'completed': return { bg: '#dcfce7', color: '#166534' };
      case 'in_progress': return { bg: '#dbeafe', color: '#1e40af' };
      case 'pending': return { bg: '#fef3c7', color: '#92400e' };
      case 'cancelled': return { bg: '#fee2e2', color: '#991b1b' };
      default: return { bg: '#f3f4f6', color: '#4b5563' };
    }
  };

  return (
    <>
      <div style={styles.pageHeaderControls}>
        <h2 style={styles.pageTitle}>Maintenance Requests ({filtered.length})</h2>
        <div style={{display: 'flex', gap: '12px'}}>
          <div style={styles.filterSection}>
            <label style={styles.filterLabel}>Status:</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              style={styles.filterSelect}
            >
              <option value="all">All</option>
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <div style={styles.filterSection}>
            <label style={styles.filterLabel}>Priority:</label>
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              style={styles.filterSelect}
            >
              <option value="all">All</option>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="normal">Normal</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>
      </div>

      <div style={styles.searchFilterSection}>
        <div style={styles.searchBox}>
          <Search size={16} />
          <input
            type="text"
            placeholder="Search maintenance requests..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={styles.searchInput}
          />
        </div>
      </div>

      <div style={styles.section}>
        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead style={styles.tableHeader}>
              <tr>
                <th style={styles.th}>ID</th>
                <th style={styles.th}>Title</th>
                <th style={styles.th}>Property</th>
                <th style={styles.th}>Priority</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Created</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length > 0 ? (
                filtered.map(req => {
                  const colors = statusColor(req.status);
                  return (
                    <tr key={req.id} style={styles.tableRow}>
                      <td style={styles.td}>#{req.id}</td>
                      <td style={styles.td}>{req.title}</td>
                      <td style={styles.td}>{req.property_name || 'N/A'}</td>
                      <td style={styles.td}>
                        <span style={{
                          ...styles.statusBadge,
                          backgroundColor: priorityColor(req.priority) + '20',
                          color: priorityColor(req.priority)
                        }}>
                          {req.priority}
                        </span>
                      </td>
                      <td style={styles.td}>
                        <span style={{
                          ...styles.statusBadge,
                          backgroundColor: colors.bg,
                          color: colors.color
                        }}>
                          {req.status}
                        </span>
                      </td>
                      <td style={styles.td}>
                        {req.created_at ? new Date(req.created_at).toLocaleDateString() : 'N/A'}
                      </td>
                      <td style={styles.td}>
                        <div style={styles.actionButtons}>
                          <button 
                            style={styles.btnSmallPrimary}
                            onClick={() => onViewDetails(req)}
                            title="View Details"
                          >
                            <Eye size={14} />
                          </button>
                          {req.status === 'pending' && (
                            <button 
                              style={styles.btnSmallSuccess}
                              onClick={() => onUpdateStatus(req.id, { status: 'in_progress' })}
                              title="Start Work"
                            >
                              <Check size={14} />
                            </button>
                          )}
                          {req.status === 'in_progress' && (
                            <button 
                              style={styles.btnSmallSuccess}
                              onClick={() => onUpdateStatus(req.id, { status: 'completed' })}
                              title="Mark Complete"
                            >
                              <CheckCircle size={14} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="7" style={{...styles.td, textAlign: 'center', padding: '40px'}}>
                    <div style={{padding: '40px 20px', textAlign: 'center'}}>
                      <Wrench size={48} color="#9ca3af" />
                      <p style={{marginTop: '16px', color: '#6b7280'}}>
                        No maintenance requests found
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

// ==================== PAYMENTS PAGE ====================
const PaymentsPage = ({ payments, loading, onSendNotification }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('balance');
  const [order, setOrder] = useState('desc');
  
  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p>Loading payment data...</p>
      </div>
    );
  }

  const sorted = [...payments].sort((a, b) => {
    let aVal, bVal;
    
    switch (sortBy) {
      case 'balance':
        aVal = a.rent_amount || 0;
        bVal = b.rent_amount || 0;
        break;
      case 'name':
        aVal = a.tenant_name?.toLowerCase() || '';
        bVal = b.tenant_name?.toLowerCase() || '';
        break;
      case 'room':
        aVal = a.room_number || '';
        bVal = b.room_number || '';
        break;
      default:
        aVal = a.rent_amount || 0;
        bVal = b.rent_amount || 0;
    }

    return order === 'desc' ? (typeof bVal === 'string' ? bVal.localeCompare(aVal) : bVal - aVal) : (typeof aVal === 'string' ? aVal.localeCompare(bVal) : aVal - bVal);
  });

  const filtered = sorted.filter(tenant => {
    const matchSearch = tenant.tenant_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tenant.room_number?.toString().includes(searchTerm);
    return matchSearch;
  });

  const totalOutstanding = payments.reduce((sum, t) => sum + (t.rent_amount || 0), 0);

  return (
    <>
      <div style={styles.pageHeader}>
        <h2 style={styles.pageTitle}>Pending Payments</h2>
        <button style={styles.btnPrimary} onClick={onSendNotification}>
          <Send size={16} /> Send Reminder
        </button>
      </div>

      <div style={styles.gridContainer}>
        <OverviewCard 
          title="Total Outstanding" 
          value={"KSh " + totalOutstanding.toLocaleString()} 
          icon={DollarSign}
          color="#ef4444"
        />
        <OverviewCard 
          title="Tenants in Arrears" 
          value={payments.length} 
          icon={Users}
          color="#f59e0b"
        />
        <OverviewCard 
          title="Average Per Tenant" 
          value={"KSh " + (payments.length > 0 ? Math.round(totalOutstanding / payments.length).toLocaleString() : 0)} 
          icon={TrendingUp}
          color="#3b82f6"
        />
        <OverviewCard 
          title="Collections Rate" 
          value={payments.length > 0 ? Math.round((payments.filter(p => p.rent_amount <= 0).length / payments.length) * 100) + "%" : "100%"} 
          icon={CheckCircle}
          color="#10b981"
        />
      </div>

      <div style={styles.searchFilterSection}>
        <div style={styles.searchBox}>
          <Search size={16} />
          <input
            type="text"
            placeholder="Search by name or room..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={styles.searchInput}
          />
        </div>
        <div style={styles.filterSection}>
          <label style={styles.filterLabel}>Sort by:</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={styles.filterSelect}
          >
            <option value="balance">Balance</option>
            <option value="name">Name</option>
            <option value="room">Room</option>
          </select>
        </div>
        <div style={styles.filterSection}>
          <label style={styles.filterLabel}>Order:</label>
          <select
            value={order}
            onChange={(e) => setOrder(e.target.value)}
            style={styles.filterSelect}
          >
            <option value="desc">Highest First</option>
            <option value="asc">Lowest First</option>
          </select>
        </div>
      </div>

      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>Tenants with Outstanding Balances ({filtered.length})</h3>
        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead style={styles.tableHeader}>
              <tr>
                <th style={styles.th}>Tenant Name</th>
                <th style={styles.th}>Room</th>
                <th style={styles.th}>Outstanding Balance</th>
                <th style={styles.th}>Pending Payments</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length > 0 ? (
                filtered.map(tenant => (
                  <tr key={tenant.tenant_id} style={styles.tableRow}>
                    <td style={styles.td}>{tenant.tenant_name}</td>
                    <td style={styles.td}>Room {tenant.room_number || 'N/A'}</td>
                    <td style={styles.td}>
                      <span style={{color: '#ef4444', fontWeight: '600'}}>
                        KSh {tenant.rent_amount?.toLocaleString() || 0}
                      </span>
                    </td>
                    <td style={styles.td}>{tenant.pending_payments || 0}</td>
                    <td style={styles.td}>
                      <div style={styles.actionButtons}>
                        <button 
                          style={styles.btnSmallPrimary}
                          onClick={() => onSendNotification({ tenant_id: tenant.tenant_id })}
                          title="Send Reminder"
                        >
                          <Send size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" style={{...styles.td, textAlign: 'center', padding: '40px'}}>
                    <div style={{padding: '40px 20px', textAlign: 'center'}}>
                      <DollarSign size={48} color="#9ca3af" />
                      <p style={{marginTop: '16px', color: '#6b7280'}}>
                        No tenants with outstanding payments found
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

// ==================== ROOMS PAGE ====================
const RoomsPage = ({ availableRooms, occupiedRooms, allRooms, loading, onViewRoomDetails }) => {
  const [showTab, setShowTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  const rooms = showTab === 'available' ? availableRooms : 
                showTab === 'occupied' ? occupiedRooms : 
                allRooms;

  const filtered = rooms.filter(room => {
    const typeMatch = filterType === 'all' || room.type === filterType;
    const searchMatch = 
      room.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      room.type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (room.tenant_name || '').toLowerCase().includes(searchTerm.toLowerCase());
    return typeMatch && searchMatch;
  });

  const occupancyRate = occupiedRooms.length > 0 ? 
    Math.round((occupiedRooms.length / (occupiedRooms.length + availableRooms.length)) * 100) : 0;

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p>Loading room data...</p>
      </div>
    );
  }

  return (
    <>
      <div style={styles.pageHeader}>
        <h2 style={styles.pageTitle}>Room Management</h2>
        <div style={styles.actionButtons}>
          <button style={styles.btnSecondary} onClick={() => window.print()}>
            <Download size={16} /> Export List
          </button>
        </div>
      </div>

      <div style={styles.gridContainer}>
        <OverviewCard 
          title="Occupied Rooms" 
          value={occupiedRooms.length} 
          icon={Users}
          color="#10b981"
        />
        <OverviewCard 
          title="Available Rooms" 
          value={availableRooms.length} 
          icon={Building}
          color="#f59e0b"
        />
        <OverviewCard 
          title="Occupancy Rate" 
          value={occupancyRate + "%"} 
          icon={TrendingUp}
          color="#3b82f6"
        />
        <OverviewCard 
          title="Total Units" 
          value={occupiedRooms.length + availableRooms.length} 
          icon={Home}
          color="#8b5cf6"
        />
      </div>

      <div style={styles.tabsSection}>
        <button
          style={{...styles.tabBtn, ...(showTab === 'all' ? styles.tabBtnActive : {})}}
          onClick={() => setShowTab('all')}
        >
          All Rooms ({allRooms.length})
        </button>
        <button
          style={{...styles.tabBtn, ...(showTab === 'occupied' ? styles.tabBtnActive : {})}}
          onClick={() => setShowTab('occupied')}
        >
          Occupied ({occupiedRooms.length})
        </button>
        <button
          style={{...styles.tabBtn, ...(showTab === 'available' ? styles.tabBtnActive : {})}}
          onClick={() => setShowTab('available')}
        >
          Available ({availableRooms.length})
        </button>
      </div>

      <div style={styles.searchFilterSection}>
        <div style={styles.searchBox}>
          <Search size={16} />
          <input
            type="text"
            placeholder="Search rooms..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={styles.searchInput}
          />
        </div>
        <div style={styles.filterSection}>
          <label style={styles.filterLabel}>Type:</label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              style={styles.filterSelect}
            >
              <option value="all">All Types</option>
              <option value="apartment">Apartment</option>
              <option value="studio">Studio</option>
              <option value="bedsitter">Bedsitter</option>
              <option value="one_bedroom">One Bedroom</option>
            </select>
          </div>
        </div>

        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>
            {showTab === 'all' ? 'All Rooms' : 
             showTab === 'occupied' ? 'Occupied Rooms' : 'Available Rooms'} 
            ({filtered.length})
          </h3>
          
          {filtered.length === 0 ? (
            <div style={{padding: '40px 20px', textAlign: 'center'}}>
              <Building size={48} color="#9ca3af" />
              <p style={{marginTop: '16px', color: '#6b7280'}}>
                No rooms found
              </p>
            </div>
          ) : (
            <div style={styles.roomsGrid}>
              {filtered.map(room => (
                <div key={room.id} style={styles.roomCard}>
                  <div style={styles.roomHeader}>
                    <Building size={20} />
                    <span style={styles.roomName}>{room.name}</span>
                    <span style={styles.roomTypeBadge}>
                      {room.type}
                    </span>
                  </div>
                  <div style={styles.roomDetails}>
                    <div style={styles.roomDetail}>
                      <span style={styles.detailLabel}>Monthly Rent:</span>
                      <span style={styles.detailValue}>
                        KSh {room.rent_amount?.toLocaleString() || '0'}
                      </span>
                    </div>
                    <div style={styles.roomDetail}>
                      <span style={styles.detailLabel}>Deposit:</span>
                      <span style={styles.detailValue}>
                        KSh {((room.rent_amount * 1.07) || 0).toLocaleString()}
                      </span>
                    </div>
                    <div style={styles.roomDetail}>
                      <span style={styles.detailLabel}>Status:</span>
                      <span style={{
                        ...styles.statusBadge,
                        backgroundColor: room.status === 'vacant' ? '#dcfce7' : '#dbeafe',
                        color: room.status === 'vacant' ? '#166534' : '#1e40af'
                      }}>
                        {room.status}
                      </span>
                    </div>
                  </div>
                  {room.tenant_name && (
                    <div style={styles.roomTenant}>
                      <span style={styles.detailLabel}>Tenant:</span>
                      <span style={styles.detailValue}>{room.tenant_name}</span>
                    </div>
                  )}
                  <div style={styles.roomActions}>
                    <button 
                      style={styles.btnSmallPrimary}
                      onClick={() => onViewRoomDetails(room)}
                    >
                      <Eye size={14} /> Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </>
    );
  };

  // ==================== NOTIFICATIONS PAGE ====================
  const NotificationsPage = ({ tenants, onSendNotification }) => {
    const [selectedTenant, setSelectedTenant] = useState('');
    const [title, setTitle] = useState('');
    const [message, setMessage] = useState('');
    const [notificationType, setNotificationType] = useState('general');

    const handleSend = () => {
      if (!selectedTenant || !title || !message) {
        alert('Please fill in all required fields');
        return;
      }

      onSendNotification({
        tenant_id: parseInt(selectedTenant),
        title,
        message,
        type: notificationType
      });

      // Reset form
      setSelectedTenant('');
      setTitle('');
      setMessage('');
      setNotificationType('general');
    };

    return (
      <>
        <div style={styles.pageHeader}>
          <h2 style={styles.pageTitle}>Notifications</h2>
        </div>

        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Send Notification</h3>
          <p style={{color: '#6b7280', marginBottom: '20px'}}>
            Send notifications to specific tenants or all tenants.
          </p>
          
          <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px', marginBottom: '24px'}}>
            <div style={styles.infoCard}>
              <Users size={32} color="#3b82f6" />
              <h4>Total Tenants</h4>
              <p style={{fontSize: '24px', fontWeight: '600', margin: '8px 0'}}>{tenants.length}</p>
            </div>
            <div style={styles.infoCard}>
              <Bell size={32} color="#10b981" />
              <h4>Active Tenants</h4>
              <p style={{fontSize: '24px', fontWeight: '600', margin: '8px 0'}}>
                {tenants.filter(t => t.is_active).length}
              </p>
            </div>
          </div>

          <div style={styles.formSection}>
            <div style={styles.formGroup}>
              <label style={styles.formLabel}>Select Tenant *</label>
              <select 
                value={selectedTenant}
                onChange={(e) => setSelectedTenant(e.target.value)}
                style={styles.formSelect}
              >
                <option value="">Choose a tenant...</option>
                {tenants.filter(t => t.is_active).map(tenant => (
                  <option key={tenant.id} value={tenant.id}>
                    {tenant.name} - Room {tenant.room_number || 'N/A'}
                  </option>
                ))}
              </select>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.formLabel}>Notification Type *</label>
              <select 
                value={notificationType}
                onChange={(e) => setNotificationType(e.target.value)}
                style={styles.formSelect}
              >
                <option value="general">General Notice</option>
                <option value="maintenance">Maintenance Update</option>
                <option value="payment">Payment Reminder</option>
                <option value="urgent">Urgent Alert</option>
              </select>
            </div>
            
            <div style={styles.formGroup}>
              <label style={styles.formLabel}>Title *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Rent Payment Reminder"
                style={styles.formInput}
              />
            </div>
            
            <div style={styles.formGroup}>
              <label style={styles.formLabel}>Message *</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Enter your notification message..."
                rows="5"
                style={{...styles.formInput, resize: 'vertical'}}
              />
            </div>

            <button 
              style={styles.btnPrimary} 
              onClick={handleSend}
              disabled={!selectedTenant || !title || !message}
            >
              <Send size={16} /> Send Notification
            </button>
          </div>
        </div>
      </>
    );
  };

  // ==================== MODAL COMPONENTS ====================

  const MaintenanceDetailsModal = ({ request, onClose, onUpdateStatus }) => {
    const [status, setStatus] = useState(request.status);
    const [priority, setPriority] = useState(request.priority);
    const [saving, setSaving] = useState(false);

    const handleSave = async () => {
      setSaving(true);
      try {
        await onUpdateStatus(request.id, { status, priority });
        onClose();
      } catch (err) {
        console.error('Failed to update:', err);
      } finally {
        setSaving(false);
      }
    };

    return (
      <div style={styles.modalOverlay} onClick={onClose}>
        <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
          <div style={styles.modalHeader}>
            <h3>Maintenance Request Details</h3>
            <button style={styles.modalClose} onClick={onClose}>×</button>
          </div>

          <div style={styles.modalBody}>
            <div style={styles.detailsGrid}>
              <div style={styles.detailItem}>
                <label style={styles.detailLabel}>Request ID</label>
                <p style={styles.detailValue}>#{request.id}</p>
              </div>
              <div style={styles.detailItem}>
                <label style={styles.detailLabel}>Property</label>
                <p style={styles.detailValue}>{request.property_name || 'N/A'}</p>
              </div>
              <div style={styles.detailItem}>
                <label style={styles.detailLabel}>Reported By</label>
                <p style={styles.detailValue}>{request.reported_by || 'Unknown'}</p>
              </div>
              <div style={styles.detailItem}>
                <label style={styles.detailLabel}>Created</label>
                <p style={styles.detailValue}>
                  {request.created_at ? new Date(request.created_at).toLocaleDateString() : 'N/A'}
                </p>
              </div>
            </div>

            <div style={{marginTop: '20px'}}>
              <label style={styles.detailLabel}>Title</label>
              <p style={{...styles.detailValue, fontSize: '16px', fontWeight: '600', margin: '8px 0'}}>
                {request.title}
              </p>
            </div>

            <div style={{marginTop: '16px'}}>
              <label style={styles.detailLabel}>Description</label>
              <p style={{...styles.detailValue, lineHeight: '1.6', margin: '8px 0'}}>
                {request.description}
              </p>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.formLabel}>Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                style={styles.formSelect}
              >
                <option value="low">Low</option>
                <option value="normal">Normal</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.formLabel}>Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                style={styles.formSelect}
              >
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          <div style={styles.modalFooter}>
            <button style={styles.btnSecondary} onClick={onClose}>
              Cancel
            </button>
            <button 
              style={styles.btnPrimary} 
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  const SendNotificationModal = ({ tenants, onClose, onSubmit, loading }) => {
    const [formData, setFormData] = useState({
      tenant_id: '',
      title: '',
      message: '',
      type: 'general'
    });
    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
      setFormData({
        ...formData,
        [e.target.name]: e.target.value
      });
      if (errors[e.target.name]) {
        setErrors({...errors, [e.target.name]: ''});
      }
    };

    const handleSubmit = (e) => {
      e.preventDefault();
      const newErrors = {};
      if (!formData.tenant_id) newErrors.tenant_id = 'Please select a tenant';
      if (!formData.title.trim()) newErrors.title = 'Title is required';
      if (!formData.message.trim()) newErrors.message = 'Message is required';

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        return;
      }

      onSubmit(formData);
    };

    return (
      <div style={styles.modalOverlay} onClick={onClose}>
        <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
          <div style={styles.modalHeader}>
            <h3>Send Notification</h3>
            <button style={styles.modalClose} onClick={onClose}>×</button>
          </div>

          <form onSubmit={handleSubmit}>
            <div style={styles.modalBody}>
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Select Tenant *</label>
                <select 
                  name="tenant_id"
                  value={formData.tenant_id}
                  onChange={handleChange}
                  style={{...styles.formSelect, ...(errors.tenant_id ? styles.inputError : {})}}
                >
                  <option value="">Choose a tenant...</option>
                  {tenants.filter(t => t.is_active).map(tenant => (
                    <option key={tenant.id} value={tenant.id}>
                      {tenant.name} - Room {tenant.room_number || 'N/A'}
                    </option>
                  ))}
                </select>
                {errors.tenant_id && <span style={styles.errorText}>{errors.tenant_id}</span>}
              </div>

              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Notification Type *</label>
                <select 
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  style={styles.formSelect}
                >
                  <option value="general">General</option>
                  <option value="urgent">Urgent</option>
                  <option value="payment">Payment Reminder</option>
                  <option value="maintenance">Maintenance</option>
                </select>
              </div>
              
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Title *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g., Rent Payment Reminder"
                  style={{...styles.formInput, ...(errors.title ? styles.inputError : {})}}
                />
                {errors.title && <span style={styles.errorText}>{errors.title}</span>}
              </div>
              
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Message *</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Enter your notification message..."
                  rows="5"
                  style={{...styles.formInput, ...(errors.message ? styles.inputError : {}), resize: 'vertical'}}
                />
                {errors.message && <span style={styles.errorText}>{errors.message}</span>}
              </div>
            </div>
            
            <div style={styles.modalFooter}>
              <button type="button" style={styles.btnSecondary} onClick={onClose}>
                Cancel
              </button>
              <button type="submit" style={styles.btnPrimary} disabled={loading}>
                {loading ? 'Sending...' : 'Send Notification'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const RoomDetailsModal = ({ room, onClose }) => {
    return (
      <div style={styles.modalOverlay} onClick={onClose}>
        <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
          <div style={styles.modalHeader}>
            <h3>Room Details</h3>
            <button style={styles.modalClose} onClick={onClose}>×</button>
          </div>

          <div style={styles.modalBody}>
            <div style={styles.detailsGrid}>
              <div style={styles.detailItem}>
                <label style={styles.detailLabel}>Room Name</label>
                <p style={styles.detailValue}>{room.name}</p>
              </div>
              <div style={styles.detailItem}>
                <label style={styles.detailLabel}>Type</label>
                <p style={styles.detailValue}>{room.type}</p>
              </div>
              <div style={styles.detailItem}>
                <label style={styles.detailLabel}>Status</label>
                <p style={styles.detailValue}>
                  <span style={{
                    ...styles.statusBadge,
                    backgroundColor: room.status === 'vacant' ? '#dcfce7' : '#dbeafe',
                    color: room.status === 'vacant' ? '#166534' : '#1e40af'
                  }}>
                    {room.status}
                  </span>
                </p>
              </div>
              <div style={styles.detailItem}>
                <label style={styles.detailLabel}>Monthly Rent</label>
                <p style={styles.detailValue}>KSh {room.rent_amount?.toLocaleString() || 0}</p>
              </div>
              {room.tenant_name && (
                <>
                  <div style={styles.detailItem}>
                    <label style={styles.detailLabel}>Tenant</label>
                    <p style={styles.detailValue}>{room.tenant_name}</p>
                  </div>
                  {room.tenant_phone && (
                    <div style={styles.detailItem}>
                      <label style={styles.detailLabel}>Tenant Phone</label>
                      <p style={styles.detailValue}>{room.tenant_phone}</p>
                    </div>
                  )}
                </>
              )}
            </div>

            {room.description && (
              <div style={{marginTop: '16px'}}>
                <label style={styles.detailLabel}>Description</label>
                <p style={{...styles.detailValue, lineHeight: '1.6', margin: '8px 0'}}>
                  {room.description}
                </p>
              </div>
            )}
          </div>

          <div style={styles.modalFooter}>
            <button style={styles.btnSecondary} onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      </div>
    );
  };

  // ==================== HELPER COMPONENTS ====================
  const OverviewCard = ({ title, value, icon: Icon, color, subtitle }) => (
    <div style={styles.overviewCard}>
      <div style={{...styles.cardIcon, backgroundColor: color + '20', color: color}}>
        <Icon size={24} />
      </div>
      <div style={styles.cardContent}>
        <h3 style={styles.cardTitle}>{title}</h3>
        <p style={styles.cardValue}>{value}</p>
        {subtitle && <p style={styles.cardSubtitle}>{subtitle}</p>}
      </div>
    </div>
  );

  const SummaryCard = ({ label, value, color = '#6b7280' }) => (
    <div style={styles.summaryCard}>
      <span style={styles.summaryLabel}>{label}</span>
      <span style={{...styles.summaryValue, color: color}}>{value}</span>
    </div>
  );

  // ==================== SHARED STYLES ====================
  const styles = {
    container: {
      display: 'flex',
      height: '100vh',
      backgroundColor: '#f9fafb',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      overflow: 'hidden'
    },
    sidebar: {
      width: '260px',
      backgroundColor: '#1f2937',
      color: 'white',
      display: 'flex',
      flexDirection: 'column',
      transition: 'transform 0.3s',
      position: 'fixed',
      height: '100vh',
      zIndex: 100,
      boxShadow: '2px 0 10px rgba(0,0,0,0.1)'
    },
    sidebarHidden: {
      transform: 'translateX(-100%)'
    },
    sidebarHeader: {
      padding: '20px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderBottom: '1px solid #374151'
    },
    sidebarTitle: {
      margin: 0,
      fontSize: '20px',
      fontWeight: '600',
      color: '#fbbf24'
    },
    sidebarSubtitle: {
      fontSize: '12px',
      color: '#9ca3af',
      marginTop: '2px'
    },
    closeBtn: {
      background: 'none',
      border: 'none',
      color: 'white',
      cursor: 'pointer',
      padding: '4px',
      display: 'flex',
      alignItems: 'center'
    },
    nav: {
      flex: 1,
      padding: '20px 0',
      overflowY: 'auto'
    },
    navItem: {
      width: '100%',
      padding: '12px 20px',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      background: 'none',
      border: 'none',
      color: '#d1d5db',
      cursor: 'pointer',
      fontSize: '14px',
      transition: 'all 0.2s',
      textAlign: 'left'
    },
    navItemActive: {
      backgroundColor: '#374151',
      color: 'white',
      borderLeft: '3px solid #3b82f6'
    },
    navLabel: {
      flex: 1
    },
    userInfo: {
      padding: '16px 20px',
      borderTop: '1px solid #374151',
      display: 'flex',
      alignItems: 'center',
      gap: '12px'
    },
    userAvatar: {
      width: '36px',
      height: '36px',
      borderRadius: '50%',
      backgroundColor: '#3b82f6',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: '600',
      color: 'white'
    },
    userDetails: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      gap: '2px'
    },
    logoutBtn: {
      margin: '20px',
      padding: '12px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
      background: '#ef4444',
      border: 'none',
      borderRadius: '6px',
      color: 'white',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '500',
      transition: 'all 0.2s'
    },
    main: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      overflow: 'auto',
      transition: 'margin-left 0.3s'
    },
    header: {
      height: '64px',
      backgroundColor: 'white',
      borderBottom: '1px solid #e5e7eb',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 24px',
      position: 'sticky',
      top: 0,
      zIndex: 10,
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
    },
    headerLeft: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px'
    },
    menuBtn: {
      display: 'none',
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      padding: '8px'
    },
    homeBtn: {
      background: 'none',
      border: '1px solid #e5e7eb',
      borderRadius: '6px',
      cursor: 'pointer',
      padding: '8px',
      display: 'flex',
      alignItems: 'center',
      transition: 'all 0.2s'
    },
    headerTitle: {
      margin: 0,
      fontSize: '18px',
      fontWeight: '600',
      color: '#111827'
    },
    headerRight: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px'
    },
    refreshBtn: {
      background: 'none',
      border: '1px solid #e5e7eb',
      borderRadius: '6px',
      cursor: 'pointer',
      padding: '8px',
      display: 'flex',
      alignItems: 'center',
      transition: 'all 0.2s'
    },
    notificationBadge: {
      position: 'relative',
      padding: '8px',
      cursor: 'pointer'
    },
    badgeCount: {
      position: 'absolute',
      top: '-2px',
      right: '-2px',
      backgroundColor: '#ef4444',
      color: 'white',
      borderRadius: '50%',
      width: '18px',
      height: '18px',
      fontSize: '10px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    userMenu: {
      position: 'relative'
    },
    userMenuBtn: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      background: 'none',
      border: '1px solid #e5e7eb',
      borderRadius: '6px',
      padding: '8px 12px',
      cursor: 'pointer',
      transition: 'all 0.2s'
    },
    userName: {
      fontSize: '14px',
      fontWeight: '500'
    },
    userDropdown: {
      position: 'absolute',
      top: '100%',
      right: 0,
      marginTop: '4px',
      backgroundColor: 'white',
      border: '1px solid #e5e7eb',
      borderRadius: '6px',
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
      minWidth: '200px',
      zIndex: 1000
    },
    dropdownItem: {
      padding: '12px 16px',
      fontSize: '14px',
      color: '#374151',
      borderBottom: '1px solid #e5e7eb'
    },
    dropdownBtn: {
      width: '100%',
      padding: '12px 16px',
      textAlign: 'left',
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      fontSize: '14px',
      color: '#374151',
      transition: 'all 0.2s'
    },
    errorBanner: {
      backgroundColor: '#fee2e2',
      color: '#991b1b',
      padding: '12px 24px',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      fontSize: '14px',
      borderBottom: '1px solid #fecaca'
    },
    successBanner: {
      backgroundColor: '#dcfce7',
      color: '#166534',
      padding: '12px 24px',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      fontSize: '14px',
      borderBottom: '1px solid #bbf7d0'
    },
    closeBannerBtn: {
      marginLeft: 'auto',
      background: 'none',
      border: 'none',
      fontSize: '20px',
      cursor: 'pointer',
      padding: '0 8px',
      color: 'inherit'
    },
    content: {
      flex: 1,
      padding: '24px',
      overflowY: 'auto'
    },
    overlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      zIndex: 99
    },
    loadingContainer: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '60px 20px',
      color: '#6b7280',
      minHeight: '400px'
    },
    spinner: {
      width: '40px',
      height: '40px',
      border: '4px solid #e5e7eb',
      borderTopColor: '#3b82f6',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite',
      marginBottom: '16px'
    },
    pageHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '24px',
      flexWrap: 'wrap',
      gap: '16px'
    },
    pageHeaderControls: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '24px',
      flexWrap: 'wrap',
      gap: '16px'
    },
    pageTitle: {
      margin: 0,
      fontSize: '24px',
      fontWeight: '600',
      color: '#111827'
    },
    actionButtons: {
      display: 'flex',
      gap: '12px',
      alignItems: 'center'
    },
    btnPrimary: {
      padding: '10px 16px',
      backgroundColor: '#3b82f6',
      color: 'white',
      border: 'none',
      borderRadius: '6px',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '500',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      transition: 'all 0.2s',
      '&:hover': {
        backgroundColor: '#2563eb'
      }
    },
    btnSecondary: {
      padding: '10px 16px',
      backgroundColor: 'white',
      color: '#374151',
      border: '1px solid #d1d5db',
      borderRadius: '6px',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '500',
      transition: 'all 0.2s',
      '&:hover': {
        backgroundColor: '#f9fafb'
      }
    },
    btnSmallPrimary: {
      padding: '6px 12px',
      backgroundColor: '#3b82f6',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      transition: 'all 0.2s',
      '&:hover': {
        backgroundColor: '#2563eb'
      }
    },
    btnSmallSuccess: {
      padding: '6px 12px',
      backgroundColor: '#10b981',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      transition: 'all 0.2s',
      '&:hover': {
        backgroundColor: '#059669'
      }
    },
    gridContainer: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
      gap: '20px',
      marginBottom: '32px'
    },
    overviewCard: {
      backgroundColor: 'white',
      borderRadius: '8px',
      padding: '20px',
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      border: '1px solid #e5e7eb',
      transition: 'all 0.2s',
      '&:hover': {
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
      }
    },
    cardIcon: {
      width: '48px',
      height: '48px',
      borderRadius: '8px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    cardContent: {
      flex: 1
    },
    cardTitle: {
      margin: '0 0 4px 0',
      fontSize: '14px',
      color: '#6b7280',
      fontWeight: '500'
    },
    cardValue: {
      margin: '0 0 4px 0',
      fontSize: '24px',
      fontWeight: '600',
      color: '#111827'
    },
    dashboardGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
      gap: '24px',
      marginBottom: '32px'
    },
    dashboardColumn: {
      display: 'flex',
      flexDirection: 'column',
      gap: '24px'
    },
    section: {
      backgroundColor: 'white',
      borderRadius: '8px',
      padding: '24px',
      marginBottom: '24px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      border: '1px solid #e5e7eb'
    },
    sectionTitle: {
      margin: '0 0 20px 0',
      fontSize: '18px',
      fontWeight: '600',
      color: '#111827',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },
    summaryGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '16px'
    },
    summaryCard: {
      padding: '16px',
      backgroundColor: '#f9fafb',
      borderRadius: '6px',
      border: '1px solid #e5e7eb',
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
      transition: 'all 0.2s',
      '&:hover': {
        backgroundColor: '#f3f4f6'
      }
    },
    summaryLabel: {
      fontSize: '14px',
      color: '#6b7280',
      fontWeight: '500'
    },
    summaryValue: {
      fontSize: '24px',
      fontWeight: '600'
    },
    quickStats: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
      gap: '16px'
    },
    quickStat: {
      display: 'flex',
      flexDirection: 'column',
      gap: '4px'
    },
    quickStatLabel: {
      fontSize: '14px',
      color: '#6b7280'
    },
    quickStatValue: {
      fontSize: '20px',
      fontWeight: '600',
      color: '#111827'
    },
    searchFilterSection: {
      display: 'flex',
      gap: '12px',
      alignItems: 'center',
      marginBottom: '24px',
      flexWrap: 'wrap'
    },
    searchBox: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '8px 12px',
      border: '1px solid #d1d5db',
      borderRadius: '6px',
      backgroundColor: 'white',
      transition: 'all 0.2s',
      flex: 1,
      minWidth: '200px',
      '&:focus-within': {
        borderColor: '#3b82f6',
        boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)'
      }
    },
    searchInput: {
      border: 'none',
      outline: 'none',
      fontSize: '14px',
      width: '100%',
      backgroundColor: 'transparent'
    },
    filterSection: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },
    filterLabel: {
      display: 'flex',
      alignItems: 'center',
      gap: '4px',
      fontSize: '14px',
      color: '#6b7280',
      whiteSpace: 'nowrap'
    },
    filterSelect: {
      padding: '8px 12px',
      border: '1px solid #d1d5db',
      borderRadius: '6px',
      fontSize: '14px',
      backgroundColor: 'white',
      cursor: 'pointer',
      transition: 'all 0.2s',
      minWidth: '150px',
      '&:focus': {
        borderColor: '#3b82f6',
        boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)'
      }
    },
    tableWrapper: {
      overflowX: 'auto',
      borderRadius: '8px',
      border: '1px solid #e5e7eb'
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse',
      fontSize: '14px',
      minWidth: '600px'
    },
    tableHeader: {
      backgroundColor: '#f9fafb',
      borderBottom: '2px solid #e5e7eb'
    },
    th: {
      padding: '12px 16px',
      textAlign: 'left',
      fontWeight: '600',
      color: '#374151',
      borderRight: '1px solid #e5e7eb',
      '&:last-child': {
        borderRight: 'none'
      }
    },
    tableRow: {
      borderBottom: '1px solid #e5e7eb',
      transition: 'all 0.2s',
      '&:hover': {
        backgroundColor: '#f9fafb'
      }
    },
    td: {
      padding: '12px 16px',
      color: '#6b7280',
      borderRight: '1px solid #e5e7eb',
      '&:last-child': {
        borderRight: 'none'
      }
    },
    statusBadge: {
      display: 'inline-block',
      padding: '4px 12px',
      borderRadius: '12px',
      fontSize: '12px',
      fontWeight: '500',
      whiteSpace: 'nowrap'
    },
    tabsSection: {
      display: 'flex',
      gap: '4px',
      marginBottom: '24px',
      borderBottom: '1px solid #e5e7eb'
    },
    tabBtn: {
      padding: '12px 20px',
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '500',
      color: '#6b7280',
      borderBottom: '2px solid transparent',
      transition: 'all 0.2s',
      '&:hover': {
        color: '#374151'
      }
    },
    tabBtnActive: {
      color: '#3b82f6',
      borderBottomColor: '#3b82f6'
    },
    roomsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
      gap: '16px'
    },
    roomCard: {
      border: '1px solid #e5e7eb',
      borderRadius: '8px',
      padding: '16px',
      backgroundColor: 'white',
      transition: 'all 0.2s',
      '&:hover': {
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
      }
    },
    roomHeader: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      marginBottom: '12px',
      paddingBottom: '12px',
      borderBottom: '1px solid #e5e7eb'
    },
    roomName: {
      flex: 1,
      fontWeight: '600',
      color: '#111827'
    },
    roomTypeBadge: {
      padding: '4px 8px',
      backgroundColor: '#dbeafe',
      color: '#1e40af',
      borderRadius: '4px',
      fontSize: '12px',
      fontWeight: '500'
    },
    roomDetails: {
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
      marginBottom: '12px'
    },
    roomDetail: {
      display: 'flex',
      justifyContent: 'space-between',
      fontSize: '14px'
    },
    roomTenant: {
      paddingTop: '12px',
      borderTop: '1px solid #e5e7eb',
      marginBottom: '12px'
    },
    roomActions: {
      display: 'flex',
      justifyContent: 'flex-end'
    },
    detailLabel: {
      color: '#6b7280',
      fontSize: '14px',
      fontWeight: '500',
      marginBottom: '4px'
    },
    detailValue: {
      color: '#111827',
      fontSize: '14px',
      margin: 0
    },
    infoCard: {
      padding: '24px',
      backgroundColor: '#f9fafb',
      borderRadius: '8px',
      border: '1px solid #e5e7eb',
      textAlign: 'center',
      transition: 'all 0.2s',
      '&:hover': {
        backgroundColor: '#f3f4f6'
      }
    },
    formSection: {
      backgroundColor: '#f9fafb',
      padding: '24px',
      borderRadius: '8px',
      border: '1px solid #e5e7eb'
    },
    formGroup: {
      marginBottom: '16px'
    },
    formLabel: {
      display: 'block',
      marginBottom: '6px',
      fontSize: '14px',
      fontWeight: '500',
      color: '#374151'
    },
    formInput: {
      width: '100%',
      padding: '10px 12px',
      border: '1px solid #d1d5db',
      borderRadius: '6px',
      fontSize: '14px',
      boxSizing: 'border-box',
      transition: 'all 0.2s',
      '&:focus': {
        borderColor: '#3b82f6',
        boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)',
        outline: 'none'
      }
    },
    formSelect: {
      width: '100%',
      padding: '10px 12px',
      border: '1px solid #d1d5db',
      borderRadius: '6px',
      fontSize: '14px',
      backgroundColor: 'white',
      boxSizing: 'border-box',
      cursor: 'pointer',
      transition: 'all 0.2s',
      '&:focus': {
        borderColor: '#3b82f6',
        boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)',
        outline: 'none'
      }
    },
    inputError: {
      borderColor: '#ef4444',
      '&:focus': {
        borderColor: '#ef4444',
        boxShadow: '0 0 0 3px rgba(239, 68, 68, 0.1)'
      }
    },
    errorText: {
      fontSize: '12px',
      color: '#ef4444',
      marginTop: '4px',
      display: 'block'
    },
    modalOverlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px',
      backdropFilter: 'blur(4px)'
    },
    modalContent: {
      backgroundColor: 'white',
      borderRadius: '12px',
      maxWidth: '600px',
      width: '100%',
      maxHeight: '90vh',
      display: 'flex',
      flexDirection: 'column',
      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      overflow: 'hidden'
    },
    modalHeader: {
      padding: '20px 24px',
      borderBottom: '1px solid #e5e7eb',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: '#f9fafb'
    },
    modalClose: {
      background: 'none',
      border: 'none',
      fontSize: '28px',
      cursor: 'pointer',
      color: '#6b7280',
      padding: '0',
      lineHeight: 1,
      transition: 'all 0.2s',
      '&:hover': {
        color: '#374151'
      }
    },
    modalBody: {
      padding: '24px',
      overflowY: 'auto',
      flex: 1
    },
    modalFooter: {
      padding: '16px 24px',
      borderTop: '1px solid #e5e7eb',
      display: 'flex',
      gap: '12px',
      justifyContent: 'flex-end',
      backgroundColor: '#f9fafb'
    },
    detailsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '16px'
    },
    detailItem: {
      display: 'flex',
      flexDirection: 'column',
      gap: '4px'
    }
  };

  export default CaretakerDashboard;