import React, { useState, useEffect } from 'react';
import {
  Menu, LogOut, X, Bell, Eye, Edit, Trash2, Filter, Search,
  Download, Mail, Phone, FileText, ArrowLeft, User, Send,
  Check, AlertCircle, Home, Plus, Calendar, DollarSign,
  Building, Users, CreditCard, Key, CheckCircle, Clock, UserPlus,
  RefreshCw, XCircle, Wrench, AlertTriangle, UserX, MessageSquare,
  TrendingUp, PieChart, FileSpreadsheet, DoorOpen, List
} from 'lucide-react'

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://joyce-suites-xdkp.onrender.com';

const CaretakerDashboard = () => {
  const [activePage, setActivePage] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // State for all data
  const [overview, setOverview] = useState(null);
  const [maintenanceRequests, setMaintenanceRequests] = useState([]);
  const [availableRooms, setAvailableRooms] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [notifications, setNotifications] = useState([]);

  // Modal states
  const [selectedMaintenanceRequest, setSelectedMaintenanceRequest] = useState(null);
  const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);
  const [showCreateMaintenanceModal, setShowCreateMaintenanceModal] = useState(false);
  const [showSendNotificationModal, setShowSendNotificationModal] = useState(false);

  const getToken = () => {
  return localStorage.getItem('token') || localStorage.getItem('joyce-suites-token');
};


  useEffect(() => {
  const currentToken = getToken();
  console.log('Token check:', currentToken ? 'Token found' : 'No token found');
  console.log('API Base URL:', API_BASE_URL);
}, []);

  // Enhanced API call helper with better error handling
  const apiCall = async (endpoint, options = {}) => {
  const token = getToken();
  
  if (!token) {
    console.error('No token available');
    localStorage.clear();
    window.location.href = '/caretaker-login';
    return null;
  }

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
      console.error('Unauthorized - clearing token and redirecting');
      localStorage.clear();
      window.location.href = '/caretaker-login';
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
    // Don't set error here to avoid redirect loops
    throw err;
  }
};

  // Fetch functions
  const fetchOverview = async () => {
    setLoading(true);
    try {
      const data = await apiCall('/api/caretaker/overview');
      if (data && data.success) {
        setOverview(data.overview);
      }
    } catch (err) {
      console.error('Failed to fetch overview:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMaintenanceRequests = async () => {
    try {
      const data = await apiCall('/api/caretaker/maintenance?page=1&per_page=100');
      if (data && data.success) {
        setMaintenanceRequests(data.requests || []);
      }
    } catch (err) {
      console.error('Failed to fetch maintenance requests:', err);
    }
  };

  const fetchAvailableRooms = async () => {
    try {
      const data = await apiCall('/api/caretaker/rooms/available');
      if (data && data.success) {
        setAvailableRooms(data.available_rooms || []);
      }
    } catch (err) {
      console.error('Failed to fetch rooms:', err);
    }
  };

  const fetchTenants = async () => {
    try {
      const data = await apiCall('/api/caretaker/tenants?page=1&per_page=100');
      if (data && data.success) {
        setTenants(data.tenants || []);
      }
    } catch (err) {
      console.error('Failed to fetch tenants:', err);
    }
  };

  const handleUpdateMaintenanceStatus = async (requestId, newStatus) => {
    try {
      const data = await apiCall(`/api/caretaker/maintenance/${requestId}`, {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus })
      });

      if (data && data.success) {
        setSuccessMessage('Maintenance request updated');
        await fetchMaintenanceRequests();
        await fetchOverview();
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (err) {
      console.error('Failed to update maintenance:', err);
    }
  };

  const handleCreateMaintenance = async (maintenanceData) => {
    try {
      setLoading(true);
      const data = await apiCall('/api/caretaker/maintenance/create', {
        method: 'POST',
        body: JSON.stringify(maintenanceData)
      });

      if (data && data.success) {
        setSuccessMessage('Maintenance request created successfully');
        await fetchMaintenanceRequests();
        await fetchOverview();
        setShowCreateMaintenanceModal(false);
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSendNotification = async (notificationData) => {
    try {
      setLoading(true);
      const data = await apiCall('/api/caretaker/notifications/send', {
        method: 'POST',
        body: JSON.stringify(notificationData)
      });

      if (data && data.success) {
        setSuccessMessage('Notification sent successfully');
        setShowSendNotificationModal(false);
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (pageId) => {
    setActivePage(pageId);
    setSidebarOpen(false);
  };

  const handleLogout = async () => {
  try {
    const token = getToken();
    if (token) {
      await fetch(`${API_BASE_URL}/api/auth/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
    }
  } catch (err) {
    console.error('Logout error:', err);
  } finally {
    localStorage.clear();
    window.location.href = '/caretaker-login';
  }
};

  useEffect(() => {
  const token = getToken();
  if (!token) {
    console.error('No token found - redirecting to login');
    window.location.href = '/caretaker-login';
    return;
  }

  const fetchPageData = async () => {
    console.log('Fetching data for page:', activePage);
    setLoading(true);
    setError('');
    
    try {
      switch (activePage) {
        case 'dashboard':
          // Fetch data in parallel but handle each independently
          await Promise.all([
            fetchOverview().catch(err => console.error('Overview fetch failed:', err)),
            fetchMaintenanceRequests().catch(err => console.error('Maintenance fetch failed:', err)),
            fetchAvailableRooms().catch(err => console.error('Rooms fetch failed:', err)),
            fetchTenants().catch(err => console.error('Tenants fetch failed:', err))
          ]);
          break;
        case 'maintenance':
          await fetchMaintenanceRequests();
          break;
        case 'properties':
          await fetchAvailableRooms();
          break;
        case 'notifications':
          await fetchTenants();
          break;
        default:
          break;
      }
    } catch (err) {
      console.error('Page data fetch error:', err);
      // Don't redirect on page data fetch errors
    } finally {
      setLoading(false);
    }
  };
    fetchPageData();
  }, [activePage]);

  const renderContent = () => {
    switch (activePage) {
      case 'dashboard':
        return (
          <DashboardPage
            overview={overview}
            maintenanceRequests={maintenanceRequests}
            availableRooms={availableRooms}
            loading={loading}
            onUpdateStatus={handleUpdateMaintenanceStatus}
            onViewDetails={(request) => {
              setSelectedMaintenanceRequest(request);
              setShowMaintenanceModal(true);
            }}
            onCreateMaintenance={() => setShowCreateMaintenanceModal(true)}
          />
        );
      case 'maintenance':
        return (
          <MaintenancePage
            requests={maintenanceRequests}
            loading={loading}
            onUpdateStatus={handleUpdateMaintenanceStatus}
            onViewDetails={(request) => {
              setSelectedMaintenanceRequest(request);
              setShowMaintenanceModal(true);
            }}
            onCreateMaintenance={() => setShowCreateMaintenanceModal(true)}
          />
        );
      case 'properties':
        return <PropertiesPage availableRooms={availableRooms} loading={loading} />;
      case 'notifications':
        return (
          <NotificationsPage
            tenants={tenants}
            onSendNotification={() => setShowSendNotificationModal(true)}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div style={styles.container}>
      <aside style={{ ...styles.sidebar, ...(sidebarOpen ? {} : styles.sidebarHidden) }}>
        <div style={styles.sidebarHeader}>
          <h2 style={styles.sidebarTitle}>Joyce Suites</h2>
          <button style={styles.closeBtn} onClick={() => setSidebarOpen(false)}>
            <X size={24} />
          </button>
        </div>

        <nav style={styles.nav}>
          {[
            { id: 'dashboard', label: 'Dashboard', icon: Home },
            { id: 'maintenance', label: 'Maintenance', icon: Wrench },
            { id: 'properties', label: 'Properties', icon: Building },
            { id: 'notifications', label: 'Notifications', icon: Bell }
          ].map(item => (
            <button
              key={item.id}
              style={{
                ...styles.navItem,
                ...(activePage === item.id ? styles.navItemActive : {})
              }}
              onClick={() => handlePageChange(item.id)}
            >
              <item.icon size={18} />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div style={styles.userInfo}>
          <div style={styles.userAvatar}>
            <User size={20} />
          </div>
          <div style={styles.userDetails}>
            <strong>Caretaker</strong>
            <small>Joyce Suites</small>
          </div>
        </div>

        <button style={styles.logoutBtn} onClick={handleLogout}>
          <LogOut size={18} /> Logout
        </button>
      </aside>

      <main style={styles.main}>
        <header style={styles.header}>
          <div style={styles.headerLeft}>
            <button style={styles.menuBtn} onClick={() => setSidebarOpen(true)}>
              <Menu size={24} />
            </button>
            <button style={styles.homeBtn} onClick={() => handlePageChange('dashboard')}>
              <Home size={20} />
            </button>
            <h1 style={styles.headerTitle}>Caretaker Dashboard</h1>
          </div>
          <div style={styles.headerRight}>
            <button style={styles.refreshBtn} onClick={() => {
              if (activePage === 'dashboard') {
                fetchOverview();
                fetchMaintenanceRequests();
              }
            }}>
              <RefreshCw size={20} />
            </button>
            <div style={styles.notificationBadge}>
              <Bell size={20} />
              {overview?.pending_maintenance > 0 && (
                <span style={styles.badgeCount}>{overview.pending_maintenance}</span>
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

      {showMaintenanceModal && selectedMaintenanceRequest && (
        <MaintenanceDetailsModal
          request={selectedMaintenanceRequest}
          onClose={() => {
            setShowMaintenanceModal(false);
            setSelectedMaintenanceRequest(null);
          }}
          onUpdateStatus={handleUpdateMaintenanceStatus}
        />
      )}

      {showCreateMaintenanceModal && (
        <CreateMaintenanceModal
          rooms={availableRooms}
          onClose={() => setShowCreateMaintenanceModal(false)}
          onSubmit={handleCreateMaintenance}
          loading={loading}
        />
      )}

      {showSendNotificationModal && (
        <SendNotificationModal
          tenants={tenants}
          onClose={() => setShowSendNotificationModal(false)}
          onSubmit={handleSendNotification}
          loading={loading}
        />
      )}

      {sidebarOpen && (
        <div style={styles.overlay} onClick={() => setSidebarOpen(false)} />
      )}
    </div>
  );
};

// ==================== DASHBOARD PAGE ====================
const DashboardPage = ({
  overview,
  maintenanceRequests,
  availableRooms,
  loading,
  onUpdateStatus,
  onViewDetails,
  onCreateMaintenance
}) => {
  const [filterStatus, setFilterStatus] = useState('all');

  if (loading || !overview) {
    return (
      <div style={styles.loadingContainer}>
        {loading ? (
          <>
            <div style={styles.spinner}></div>
            <p>Loading dashboard...</p>
          </>
        ) : (
          <div style={{ textAlign: 'center' }}>
            <AlertCircle size={48} color="#ef4444" />
            <p style={{ marginTop: '16px', color: '#ef4444', fontWeight: '500' }}>
              Failed to load dashboard data
            </p>
            <button
              style={{ ...styles.btnPrimary, marginTop: '16px' }}
              onClick={() => window.location.reload()}
            >
              <RefreshCw size={16} /> Retry
            </button>
          </div>
        )}
      </div>
    );
  }

  const filteredMaintenance = maintenanceRequests.filter(function(r) {
    return filterStatus === 'all' || r.status === filterStatus;
  });

  const pendingCount = maintenanceRequests.filter(r => r.status === 'pending').length;
  const completedCount = maintenanceRequests.filter(r => r.status === 'completed').length;

  return (
    <>
      <div style={styles.pageHeader}>
        <h2 style={styles.pageTitle}>Caretaker Overview</h2>
        <button style={styles.btnPrimary} onClick={onCreateMaintenance}>
          <Plus size={16} /> Create Maintenance Request
        </button>
      </div>

      <div style={styles.gridContainer}>
        <OverviewCard
          title="Pending Maintenance"
          value={overview.pending_maintenance || 0}
          icon={AlertTriangle}
          color="#f59e0b"
        />
        <OverviewCard
          title="Completed This Month"
          value={completedCount}
          icon={CheckCircle}
          color="#10b981"
        />
        <OverviewCard
          title="Available Rooms"
          value={availableRooms.length}
          icon={Building}
          color="#3b82f6"
        />
        <OverviewCard
          title="Total Requests"
          value={maintenanceRequests.length}
          icon={Wrench}
          color="#8b5cf6"
        />
      </div>

      <div style={styles.section}>
        <div style={styles.sectionHeaderControls}>
          <h3 style={styles.sectionTitle}>
            <Wrench size={18} /> Recent Maintenance Requests ({filteredMaintenance.length})
          </h3>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            style={styles.filterSelect}
          >
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead style={styles.tableHeader}>
              <tr>
                <th style={styles.th}>ID</th>
                <th style={styles.th}>Title</th>
                <th style={styles.th}>Property</th>
                <th style={styles.th}>Priority</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredMaintenance.length > 0 ? (
                filteredMaintenance.slice(0, 5).map(function(req) {
                  return (
                    <tr key={req.id} style={styles.tableRow}>
                      <td style={styles.td}>#{req.id}</td>
                      <td style={styles.td}>{req.title}</td>
                      <td style={styles.td}>{req.property_name || 'N/A'}</td>
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
                          backgroundColor: req.status === 'completed' ? '#dcfce7' : '#fef3c7',
                          color: req.status === 'completed' ? '#166534' : '#92400e'
                        }}>
                          {req.status}
                        </span>
                      </td>
                      <td style={styles.td}>
                        <button
                          style={styles.btnSmallPrimary}
                          onClick={() => onViewDetails(req)}
                          title="View Details"
                        >
                          <Eye size={14} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="6" style={{ ...styles.td, textAlign: 'center', padding: '40px' }}>
                    No maintenance requests found
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

// ==================== MAINTENANCE PAGE ====================
const MaintenancePage = ({ requests, loading, onUpdateStatus, onViewDetails, onCreateMaintenance }) => {
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p>Loading maintenance requests...</p>
      </div>
    );
  }

  const filtered = requests.filter(function(r) {
    const statusMatch = filterStatus === 'all' || r.status === filterStatus;
    const priorityMatch = filterPriority === 'all' || r.priority === filterPriority;
    return statusMatch && priorityMatch;
  });

  return (
    <>
      <div style={styles.pageHeader}>
        <h2 style={styles.pageTitle}>Maintenance Requests ({filtered.length})</h2>
        <button style={styles.btnPrimary} onClick={onCreateMaintenance}>
          <Plus size={16} /> Create Request
        </button>
      </div>

      <div style={styles.filterBar}>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          style={styles.filterSelect}
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>

        <select
          value={filterPriority}
          onChange={(e) => setFilterPriority(e.target.value)}
          style={styles.filterSelect}
        >
          <option value="all">All Priority</option>
          <option value="urgent">Urgent</option>
          <option value="high">High</option>
          <option value="normal">Normal</option>
          <option value="low">Low</option>
        </select>
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
                filtered.map(function(req) {
                  return (
                    <tr key={req.id} style={styles.tableRow}>
                      <td style={styles.td}>#{req.id}</td>
                      <td style={styles.td}>{req.title}</td>
                      <td style={styles.td}>{req.property_name || 'N/A'}</td>
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
                          backgroundColor: req.status === 'completed' ? '#dcfce7' : '#fef3c7',
                          color: req.status === 'completed' ? '#166534' : '#92400e'
                        }}>
                          {req.status}
                        </span>
                      </td>
                      <td style={styles.td}>
                        {req.created_at ? new Date(req.created_at).toLocaleDateString() : 'N/A'}
                      </td>
                      <td style={styles.td}>
                        <button
                          style={styles.btnSmallPrimary}
                          onClick={() => onViewDetails(req)}
                        >
                          <Eye size={14} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="7" style={{ ...styles.td, textAlign: 'center', padding: '40px' }}>
                    No maintenance requests found
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

// ==================== PROPERTIES PAGE ====================
const PropertiesPage = ({ availableRooms, loading }) => {
  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p>Loading properties...</p>
      </div>
    );
  }

  return (
    <>
      <h2 style={styles.pageTitle}>Available Rooms ({availableRooms.length})</h2>

      <div style={styles.section}>
        {availableRooms.length === 0 ? (
          <div style={styles.emptyState}>
            <Building size={48} />
            <p>No available rooms found</p>
          </div>
        ) : (
          <div style={styles.roomsGrid}>
            {availableRooms.map(function(room) {
              return (
                <div key={room.id} style={styles.roomCard}>
                  <div style={styles.roomHeader}>
                    <Building size={20} />
                    <span style={styles.roomName}>{room.name}</span>
                  </div>
                  <div style={styles.roomDetails}>
                    <div style={styles.roomDetail}>
                      <span>Type:</span>
                      <span>{room.property_type}</span>
                    </div>
                    <div style={styles.roomDetail}>
                      <span>Rent:</span>
                      <span>{"KSh " + (room.rent_amount ? room.rent_amount.toLocaleString() : '0')}</span>
                    </div>
                    <div style={styles.roomDetail}>
                      <span>Status:</span>
                      <span style={{ ...styles.statusBadge, backgroundColor: '#dcfce7', color: '#166534' }}>
                        Vacant
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
};

// ==================== NOTIFICATIONS PAGE ====================
const NotificationsPage = ({ tenants, onSendNotification }) => {
  const activeTenantsCount = tenants.filter(t => t.is_active).length;

  return (
    <>
      <div style={styles.pageHeader}>
        <h2 style={styles.pageTitle}>Send Notifications</h2>
        <button style={styles.btnPrimary} onClick={onSendNotification}>
          <Send size={16} /> Send Notification
        </button>
      </div>

      <div style={styles.section}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
          <div style={styles.infoCard}>
            <Users size={32} color="#3b82f6" />
            <h4>Total Tenants</h4>
            <p style={{ fontSize: '24px', fontWeight: '600', margin: '8px 0' }}>{tenants.length}</p>
          </div>
          <div style={styles.infoCard}>
            <Bell size={32} color="#10b981" />
            <h4>Active Recipients</h4>
            <p style={{ fontSize: '24px', fontWeight: '600', margin: '8px 0' }}>
              {activeTenantsCount}
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

// ==================== MODALS ====================
const MaintenanceDetailsModal = ({ request, onClose, onUpdateStatus }) => {
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
              <label style={styles.detailLabel}>Priority</label>
              <span style={{
                ...styles.statusBadge,
                backgroundColor: request.priority === 'urgent' ? '#fee2e2' : '#dbeafe',
                color: request.priority === 'urgent' ? '#991b1b' : '#1e40af'
              }}>
                {request.priority}
              </span>
            </div>
            <div style={styles.detailItem}>
              <label style={styles.detailLabel}>Status</label>
              <span style={{
                ...styles.statusBadge,
                backgroundColor: request.status === 'completed' ? '#dcfce7' : '#fef3c7',
                color: request.status === 'completed' ? '#166534' : '#92400e'
              }}>
                {request.status}
              </span>
            </div>
          </div>

          <div style={{ marginTop: '20px' }}>
            <label style={styles.detailLabel}>Title</label>
            <p style={{ ...styles.detailValue, fontSize: '16px', fontWeight: '600', margin: '8px 0' }}>
              {request.title}
            </p>
          </div>

          <div style={{ marginTop: '16px' }}>
            <label style={styles.detailLabel}>Description</label>
            <p style={{ ...styles.detailValue, lineHeight: '1.6', margin: '8px 0' }}>
              {request.description}
            </p>
          </div>
        </div>

        <div style={styles.modalFooter}>
          {request.status === 'pending' && (
            <button
              style={styles.btnPrimary}
              onClick={() => {
                onUpdateStatus(request.id, 'in_progress');
                onClose();
              }}
            >
              Start Work
            </button>
          )}
          {request.status === 'in_progress' && (
            <button
              style={styles.btnPrimary}
              onClick={() => {
                onUpdateStatus(request.id, 'completed');
                onClose();
              }}
            >
              Mark Complete
            </button>
          )}
          <button style={styles.btnSecondary} onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

const CreateMaintenanceModal = ({ rooms, onClose, onSubmit, loading }) => {
  const [formData, setFormData] = useState({
    property_id: '',
    title: '',
    description: '',
    priority: 'normal'
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!formData.property_id) newErrors.property_id = 'Please select a room';
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';

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
          <h3>Create Maintenance Request</h3>
          <button style={styles.modalClose} onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={styles.modalBody}>
            <div style={styles.formGroup}>
              <label style={styles.formLabel}>Select Room *</label>
              <select
                name="property_id"
                value={formData.property_id}
                onChange={handleChange}
                style={{ ...styles.formSelect, ...(errors.property_id ? styles.inputError : {}) }}
              >
                <option value="">Choose a room...</option>
                {rooms.map(room => (
                  <option key={room.id} value={room.id}>
                    {room.name}
                  </option>
                ))}
              </select>
              {errors.property_id && <span style={styles.errorText}>{errors.property_id}</span>}
            </div>

            <div style={styles.formGroup}>
              <label style={styles.formLabel}>Priority *</label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                style={styles.formSelect}
              >
                <option value="low">Low</option>
                <option value="normal">Normal</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.formLabel}>Title *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g., Broken window in Room 12"
                style={{ ...styles.formInput, ...(errors.title ? styles.inputError : {}) }}
              />
              {errors.title && <span style={styles.errorText}>{errors.title}</span>}
            </div>

            <div style={styles.formGroup}>
              <label style={styles.formLabel}>Description *</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Provide details about the maintenance issue..."
                rows="5"
                style={{ ...styles.formInput, ...(errors.description ? styles.inputError : {}), resize: 'vertical' }}
              />
              {errors.description && <span style={styles.errorText}>{errors.description}</span>}
            </div>
          </div>

          <div style={styles.modalFooter}>
            <button type="button" style={styles.btnSecondary} onClick={onClose}>
              Cancel
            </button>
            <button type="submit" style={styles.btnPrimary} disabled={loading}>
              {loading ? 'Creating...' : 'Create Request'}
            </button>
          </div>
        </form>
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
      setErrors({ ...errors, [e.target.name]: '' });
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
                style={{ ...styles.formSelect, ...(errors.tenant_id ? styles.inputError : {}) }}
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
                placeholder="Notification title..."
                style={{ ...styles.formInput, ...(errors.title ? styles.inputError : {}) }}
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
                style={{ ...styles.formInput, ...(errors.message ? styles.inputError : {}), resize: 'vertical' }}
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

// ==================== HELPER COMPONENTS ====================
const OverviewCard = ({ title, value, icon: Icon, color }) => (
  <div style={styles.overviewCard}>
    <div style={{ ...styles.cardIcon, backgroundColor: color + '20', color: color }}>
      <Icon size={24} />
    </div>
    <div style={styles.cardContent}>
      <h3 style={styles.cardTitle}>{title}</h3>
      <p style={styles.cardValue}>{value}</p>
    </div>
  </div>
);

// ==================== STYLES ====================
const styles = {
  container: {
    display: 'flex',
    height: '100vh',
    backgroundColor: '#f9fafb',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
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
  closeBtn: {
    background: 'transparent',
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
    background: 'transparent',
    border: 'none',
    borderTop: '1px solid transparent',
    borderRight: '1px solid transparent',
    borderBottom: '1px solid transparent',
    borderLeft: '3px solid transparent',
    color: '#d1d5db',
    cursor: 'pointer',
    fontSize: '14px',
    transition: 'all 0.2s',
    textAlign: 'left'
  },
  navItemActive: {
    backgroundColor: '#374151',
    color: 'white',
    borderLeft: '3px solid #3b82f6',
    borderTop: '1px solid #374151',
    borderRight: '1px solid #374151',
    borderBottom: '1px solid #374151'
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
    justifyContent: 'center'
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
    backgroundColor: '#ef4444',
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
    marginLeft: '260px',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'auto'
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
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    padding: '8px'
  },
  homeBtn: {
    background: 'transparent',
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
    background: 'transparent',
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
    background: 'transparent',
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
  pageHeader: {
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
  filterBar: {
    display: 'flex',
    gap: '12px',
    marginBottom: '24px',
    flexWrap: 'wrap'
  },
  filterSelect: {
    padding: '8px 12px',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    fontSize: '14px',
    backgroundColor: 'white',
    cursor: 'pointer',
    transition: 'all 0.2s'
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
    transition: 'all 0.2s'
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
    margin: 0,
    fontSize: '24px',
    fontWeight: '600',
    color: '#111827'
  },
  section: {
    backgroundColor: 'white',
    borderRadius: '8px',
    padding: '24px',
    marginBottom: '24px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    border: '1px solid #e5e7eb'
  },
  sectionHeaderControls: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    flexWrap: 'wrap',
    gap: '16px'
  },
  sectionTitle: {
    margin: '0 0 0 0',
    fontSize: '18px',
    fontWeight: '600',
    color: '#111827',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
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
    minWidth: '800px'
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
    borderRight: '1px solid #e5e7eb'
  },
  tableRow: {
    borderBottom: '1px solid #e5e7eb',
    transition: 'all 0.2s'
  },
  td: {
    padding: '12px 16px',
    color: '#6b7280',
    borderRight: '1px solid #e5e7eb'
  },
  statusBadge: {
    display: 'inline-block',
    padding: '4px 12px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '500',
    whiteSpace: 'nowrap'
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
    transition: 'all 0.2s'
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
    transition: 'all 0.2s'
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
    transition: 'all 0.2s'
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
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '60px 20px',
    color: '#9ca3af',
    textAlign: 'center'
  },
  roomsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '16px'
  },
  roomCard: {
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    padding: '16px',
    backgroundColor: 'white',
    transition: 'all 0.2s'
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
  roomDetails: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  roomDetail: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '14px'
  },
  infoCard: {
    padding: '24px',
    backgroundColor: '#f9fafb',
    borderRadius: '8px',
    border: '1px solid #e5e7eb',
    textAlign: 'center',
    transition: 'all 0.2s'
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
    backdropFilter: 'blur(4px)',
    overflowY: 'auto'
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: '12px',
    maxWidth: '600px',
    width: '100%',
    minHeight: 'auto',
    maxHeight: 'calc(100vh - 40px)',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
    overflow: 'visible',
    margin: 'auto'
  },
  modalHeader: {
    padding: '20px 24px',
    borderBottom: '1px solid #e5e7eb',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    flexShrink: 0
  },
  modalClose: {
    background: 'transparent',
    border: 'none',
    fontSize: '28px',
    cursor: 'pointer',
    color: '#6b7280',
    padding: '0',
    lineHeight: 1,
    transition: 'all 0.2s',
    width: '32px',
    height: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  modalBody: {
    padding: '24px',
    overflowY: 'auto',
    overflowX: 'hidden',
    flex: 1,
    minHeight: 0
  },
  modalFooter: {
    padding: '16px 24px',
    borderTop: '1px solid #e5e7eb',
    display: 'flex',
    gap: '12px',
    justifyContent: 'flex-end',
    backgroundColor: '#f9fafb',
    flexShrink: 0,
    flexWrap: 'wrap'
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
    transition: 'all 0.2s'
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
    transition: 'all 0.2s'
  },
  inputError: {
    borderColor: '#ef4444'
  },
  errorText: {
    fontSize: '12px',
    color: '#ef4444',
    marginTop: '4px',
    display: 'block'
  },
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 99,
    display: 'none'
  }
};

// Add animation for spinner
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `;
  document.head.appendChild(style);
}

export default CaretakerDashboard;