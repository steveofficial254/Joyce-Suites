import React, { useState, useEffect } from 'react';
import {
  Menu, LogOut, X, Bell, Eye, Edit, Trash2, Filter, Search,
  Download, Mail, Phone, FileText, ArrowLeft, User, Send,
  Check, AlertCircle, Home, Plus, Calendar, DollarSign,
  Building, Users, CreditCard, Key, CheckCircle, Clock, UserPlus,
  RefreshCw, XCircle, Wrench, AlertTriangle, UserX, MessageSquare,
  TrendingUp, PieChart, FileSpreadsheet, DoorOpen, List, CreditCard as PaymentIcon,
  FileCheck, AlertOctagon, Home as RoomIcon, CalendarDays, UserCheck,
  Receipt, FileWarning, ShieldCheck, ShieldX, CalendarCheck, CalendarX,
  BedDouble, Bath, Square, Layers, MapPin, Droplet
} from 'lucide-react';

import CaretakerWaterBill from './CaretakerWaterBill';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://joyce-suites-xdkp.onrender.com';

const CaretakerDashboard = () => {
  const [activePage, setActivePage] = useState('dashboard');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) setSidebarOpen(true);
      else setSidebarOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');


  const [overview, setOverview] = useState(null);
  const [maintenanceRequests, setMaintenanceRequests] = useState([]);
  const [availableRooms, setAvailableRooms] = useState([]);
  const [occupiedRooms, setOccupiedRooms] = useState([]);
  const [allRooms, setAllRooms] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [pendingPayments, setPendingPayments] = useState([]);
  const [allTenantsPaymentStatus, setAllTenantsPaymentStatus] = useState([]);
  const [vacateNotices, setVacateNotices] = useState([]);


  const [selectedMaintenanceRequest, setSelectedMaintenanceRequest] = useState(null);
  const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);
  const [showCreateMaintenanceModal, setShowCreateMaintenanceModal] = useState(false);
  const [showSendNotificationModal, setShowSendNotificationModal] = useState(false);
  const [showMarkPaymentModal, setShowMarkPaymentModal] = useState(false);
  const [selectedTenantForPayment, setSelectedTenantForPayment] = useState(null);
  const [showVacateNoticeModal, setShowVacateNoticeModal] = useState(false);
  const [selectedVacateNotice, setSelectedVacateNotice] = useState(null);
  const [showCreateVacateNoticeModal, setShowCreateVacateNoticeModal] = useState(false);
  const [selectedLeaseForVacate, setSelectedLeaseForVacate] = useState(null);

  const [showPropertyDetailsModal, setShowPropertyDetailsModal] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [showTenantDetailsModal, setShowTenantDetailsModal] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState(null);

  const getToken = () => {
    return localStorage.getItem('token') || localStorage.getItem('joyce-suites-token');
  };


  const apiCall = async (endpoint, options = {}) => {
    const token = getToken();

    if (!token) {
      console.error('No token available');
      localStorage.clear();
      window.location.href = '/caretaker-login';
      return null;
    }

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          ...options.headers,
        },
      });

      if (response.status === 401 || response.status === 403) {
        localStorage.clear();
        window.location.href = '/caretaker-login';
        return null;
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || `HTTP ${response.status}`);
      }

      return data;
    } catch (err) {
      console.error('API call error:', err);
      throw err;
    }
  };


  const fetchOverview = async () => {
    try {
      const data = await apiCall('/api/caretaker/overview');
      if (data && data.success) {
        setOverview(data.overview);
      }
    } catch (err) {
      console.error('Failed to fetch overview:', err);
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
      console.error('Failed to fetch available rooms:', err);
    }
  };

  const fetchOccupiedRooms = async () => {
    try {
      const data = await apiCall('/api/caretaker/rooms/occupied');
      if (data && data.success) {
        setOccupiedRooms(data.occupied_rooms || []);
      }
    } catch (err) {
      console.error('Failed to fetch occupied rooms:', err);
    }
  };

  const fetchAllRooms = async () => {
    try {
      const data = await apiCall('/api/caretaker/rooms/all');
      if (data && data.success) {
        setAllRooms(data.rooms || []);
      }
    } catch (err) {
      console.error('Failed to fetch all rooms:', err);
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

  const fetchPendingPayments = async () => {
    try {
      const data = await apiCall('/api/caretaker/payments/pending');
      if (data && data.success) {
        setPendingPayments(data.tenants_with_arrears || []);
      }
    } catch (err) {
      console.error('Failed to fetch pending payments:', err);
    }
  };

  const fetchAllTenantsPaymentStatus = async () => {
    try {
      const data = await apiCall('/api/caretaker/payments/all-tenants');
      if (data && data.success) {
        setAllTenantsPaymentStatus(data.tenants || []);
      }
    } catch (err) {
      console.error('Failed to fetch payment status:', err);
    }
  };

  const fetchVacateNotices = async () => {
    try {
      const data = await apiCall('/api/caretaker/vacate-notices?per_page=100');
      if (data && data.success) {
        setVacateNotices(data.notices || []);
      }
    } catch (err) {
      console.error('Failed to fetch vacate notices:', err);
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

  const fetchNotifications = async () => {
    try {
      const data = await apiCall('/api/auth/notifications');
      if (data && data.success) {
        setNotifications(data.notifications || []);
      }
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    }
  };

  const handleMarkNotificationRead = async (id) => {
    try {
      await apiCall(`/api/auth/notifications/${id}/read`, { method: 'PUT' });
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, is_read: true } : n)
      );
    } catch (err) {
      console.error('Failed to mark notification read:', err);
    }
  };

  const handleMarkPayment = async (paymentData) => {
    try {
      setLoading(true);
      const data = await apiCall('/api/caretaker/payments/mark', {
        method: 'POST',
        body: JSON.stringify(paymentData)
      });

      if (data && data.success) {
        setSuccessMessage(`Payment marked as ${paymentData.status}`);
        await fetchAllTenantsPaymentStatus();
        await fetchPendingPayments();
        setShowMarkPaymentModal(false);
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateVacateNotice = async (noticeData) => {
    try {
      setLoading(true);
      const data = await apiCall('/api/caretaker/vacate-notices', {
        method: 'POST',
        body: JSON.stringify(noticeData)
      });

      if (data && data.success) {
        setSuccessMessage('Vacate notice created successfully');
        await fetchVacateNotices();
        await fetchAllTenantsPaymentStatus();
        setShowCreateVacateNoticeModal(false);
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateVacateNoticeStatus = async (noticeId, action, notes = '') => {
    try {
      let endpoint = '';
      let method = 'POST';

      switch (action) {
        case 'approve':
          endpoint = `/api/caretaker/vacate-notices/${noticeId}/approve`;
          break;
        case 'reject':
          endpoint = `/api/caretaker/vacate-notices/${noticeId}/reject`;
          break;
        case 'complete':
          endpoint = `/api/caretaker/vacate-notices/${noticeId}/complete`;
          break;
        default:
          return;
      }

      const data = await apiCall(endpoint, {
        method,
        body: JSON.stringify(notes ? { admin_notes: notes } : {})
      });

      if (data && data.success) {
        setSuccessMessage(`Vacate notice ${action}d successfully`);
        await fetchVacateNotices();
        setShowVacateNoticeModal(false);
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteVacateNotice = async (noticeId) => {
    if (!window.confirm('Are you sure you want to delete this vacate notice?')) return;

    try {
      const data = await apiCall(`/api/caretaker/vacate-notices/${noticeId}`, {
        method: 'DELETE'
      });

      if (data && data.success) {
        setSuccessMessage('Vacate notice deleted successfully');
        await fetchVacateNotices();
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (err) {
      setError(err.message);
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
      window.location.href = '/caretaker-login';
      return;
    }

    const fetchPageData = async () => {
      setLoading(true);
      setError('');

      try {
        switch (activePage) {
          case 'dashboard':
            await Promise.all([
              fetchOverview().catch(err => console.error('Overview fetch failed:', err)),
              fetchMaintenanceRequests().catch(err => console.error('Maintenance fetch failed:', err)),
              fetchAvailableRooms().catch(err => console.error('Rooms fetch failed:', err)),
              fetchTenants().catch(err => console.error('Tenants fetch failed:', err)),
              fetchPendingPayments().catch(err => console.error('Payments fetch failed:', err)),
              fetchVacateNotices().catch(err => console.error('Vacate notices fetch failed:', err)),
              fetchNotifications().catch(err => console.error('Notifications fetch failed:', err))
            ]);
            break;
          case 'maintenance':
            await fetchMaintenanceRequests();
            break;
          case 'properties':
            await Promise.all([
              fetchAvailableRooms(),
              fetchOccupiedRooms(),
              fetchAllRooms()
            ]);
            break;
          case 'tenants':
            await Promise.all([
              fetchTenants(),
              fetchAllTenantsPaymentStatus()
            ]);
            break;
          case 'payments':
            await Promise.all([
              fetchPendingPayments(),
              fetchAllTenantsPaymentStatus()
            ]);
            break;
          case 'vacate':
            await fetchVacateNotices();
            break;
          case 'notifications':
          case 'inquiries':
            await fetchNotifications();
            break;
          default:
            break;
        }
      } catch (err) {
        console.error('Page data fetch error:', err);
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
            pendingPayments={pendingPayments}
            vacateNotices={vacateNotices}
            loading={loading}
            onUpdateStatus={handleUpdateMaintenanceStatus}
            onViewDetails={(request) => {
              setSelectedMaintenanceRequest(request);
              setShowMaintenanceModal(true);
            }}
            onCreateMaintenance={() => setShowCreateMaintenanceModal(true)}
            onViewAllMaintenance={() => handlePageChange('maintenance')}
            onMarkPayment={(tenant) => {
              setSelectedTenantForPayment(tenant);
              setShowMarkPaymentModal(true);
            }}
            onViewVacateNotice={(notice) => {
              setSelectedVacateNotice(notice);
              setShowVacateNoticeModal(true);
            }}
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
        return (
          <PropertiesPage
            availableRooms={availableRooms}
            occupiedRooms={occupiedRooms}
            allRooms={allRooms}
            loading={loading}
            onViewDetails={(property) => {
              setSelectedProperty(property);
              setShowPropertyDetailsModal(true);
            }}
          />
        );
      case 'tenants':
        return (
          <TenantsPage
            tenants={tenants}
            paymentStatus={allTenantsPaymentStatus}
            loading={loading}
            onMarkPayment={(tenant) => {
              setSelectedTenantForPayment(tenant);
              setShowMarkPaymentModal(true);
            }}
            onSendNotification={() => setShowSendNotificationModal(true)}
            onViewDetails={(tenant) => {
              setSelectedTenant(tenant);
              setShowTenantDetailsModal(true);
            }}
            onCreateVacateNotice={(leaseId) => {
              const tenant = tenants.find(t => t.id === leaseId);
              if (tenant) {
                setSelectedLeaseForVacate({
                  lease_id: leaseId,
                  tenant_name: tenant.name,
                  room_number: tenant.room_number
                });
                setShowCreateVacateNoticeModal(true);
              }
            }}
          />
        );
      case 'payments':
        return (
          <PaymentsPage
            pendingPayments={pendingPayments}
            allPayments={allTenantsPaymentStatus}
            loading={loading}
            onMarkPayment={(tenant) => {
              setSelectedTenantForPayment(tenant);
              setShowMarkPaymentModal(true);
            }}
          />
        );
      case 'vacate':
        return (
          <VacatePage
            notices={vacateNotices}
            loading={loading}
            onViewDetails={(notice) => {
              setSelectedVacateNotice(notice);
              setShowVacateNoticeModal(true);
            }}
            onUpdateStatus={handleUpdateVacateNoticeStatus}
            onDelete={handleDeleteVacateNotice}
            onCreateNotice={() => setShowCreateVacateNoticeModal(true)}
          />
        );
      case 'notifications':
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-6">Inquiries & Notifications</h2>
            {loading && !notifications.length ? (
              <div style={{ textAlign: 'center', padding: '2rem' }}>Loading notifications...</div>
            ) : notifications.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: '#6b7280', backgroundColor: 'white', borderRadius: '0.5rem' }}>
                <MessageSquare size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
                <p>No new notifications.</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gap: '1rem' }}>
                {notifications.map(note => (
                  <div
                    key={note.id}
                    style={{
                      backgroundColor: note.is_read ? 'white' : '#f0f9ff',
                      borderLeft: `4px solid ${note.is_read ? '#e5e7eb' : '#3b82f6'}`,
                      padding: '1.5rem',
                      borderRadius: '0.5rem',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <div>
                        <h3 style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{note.title}</h3>
                        <span style={{ fontSize: '0.85rem', color: '#6b7280' }}>
                          {new Date(note.created_at).toLocaleString()}
                        </span>
                      </div>
                      {!note.is_read && (
                        <button
                          onClick={() => handleMarkNotificationRead(note.id)}
                          style={{
                            fontSize: '0.75rem',
                            padding: '0.25rem 0.75rem',
                            borderRadius: '9999px',
                            backgroundColor: '#dbeafe',
                            color: '#1e40af',
                            border: 'none',
                            cursor: 'pointer'
                          }}
                        >
                          Mark as Read
                        </button>
                      )}
                    </div>
                    <div style={{ whiteSpace: 'pre-wrap', color: '#374151' }}>
                      {note.message}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      case 'inquiries':
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-6">Inquiries & Booking Requests</h2>
            {loading && !notifications.length ? (
              <div style={styles.loadingContainer}>
                <div style={styles.spinner}></div>
                <p>Loading messages...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div style={styles.emptyState}>
                <MessageSquare size={48} />
                <p>No new messages or booking requests.</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gap: '16px' }}>
                {notifications.map(note => {
                  const isBooking = note.subject?.includes('BOOKING') || note.title?.includes('BOOKING') || note.message?.includes('BOOKING REQUEST');
                  return (
                    <div
                      key={note.id}
                      style={{
                        ...styles.inquiryCard,
                        borderLeft: note.is_read ? '1px solid #e5e7eb' : (isBooking ? '4px solid #16a34a' : '4px solid #3b82f6')
                      }}
                    >
                      <div style={styles.inquiryHeader}>
                        <div style={styles.senderInfo}>
                          <div style={styles.avatar}>
                            <User size={20} />
                          </div>
                          <div style={styles.msgMeta}>
                            <span style={styles.senderName}>{note.title || 'New Inquiry'}</span>
                            <span style={styles.msgTime}>
                              {new Date(note.created_at).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                            </span>
                            {isBooking && (
                              <span style={{
                                ...styles.subjectBadge,
                                backgroundColor: '#dcfce7',
                                color: '#166534'
                              }}>BOOKING REQUEST</span>
                            )}
                          </div>
                        </div>
                        {!note.is_read && (
                          <button
                            onClick={() => handleMarkNotificationRead(note.id)}
                            style={styles.btnSmallPrimary}
                          >
                            Mark as Read
                          </button>
                        )}
                      </div>
                      <div style={styles.msgPreview}>
                        {note.message}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      case 'water-bill':
        return <CaretakerWaterBill />;
      default:
        return null;
    }
  };

  return (
    <div style={styles.container}>
      <aside style={{
        ...styles.sidebar,
        ...(isMobile ? { display: 'none' } : (sidebarOpen ? {} : styles.sidebarHidden))
      }}>
        <div style={styles.sidebarHeader}>
          <h2 style={styles.sidebarTitle}>Joyce Suites</h2>
          {isMobile && (
            <button style={styles.closeBtn} onClick={() => setSidebarOpen(false)}>
              <X size={24} />
            </button>
          )}
        </div>

        <nav style={styles.nav}>
          {[
            { id: 'dashboard', label: 'Dashboard', icon: Home },
            { id: 'maintenance', label: 'Maintenance', icon: Wrench },
            { id: 'properties', label: 'Properties', icon: Building },
            { id: 'tenants', label: 'Tenants', icon: Users },
            { id: 'payments', label: 'Payments', icon: PaymentIcon },
            { id: 'water-bill', label: 'Water Bills', icon: Droplet },
            { id: 'vacate', label: 'Vacate Notices', icon: DoorOpen },
            { id: 'inquiries', label: 'Inquiries', icon: MessageSquare },
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

        <div style={{ ...styles.logoutBtnWrapper, ...(sidebarOpen && styles.logoutBtnWrapperVisible), flexDirection: 'column', gap: '8px' }}>
          <button
            style={{ ...styles.logoutBtn, backgroundColor: 'transparent', color: '#64748b', border: '1px solid #e2e8f0' }}
            onClick={() => window.location.href = '/'}
          >
            <Home size={18} /> <span style={{ display: sidebarOpen ? 'inline' : 'none' }}>Main Menu</span>
          </button>
          <button style={styles.logoutBtn} onClick={handleLogout}>
            <LogOut size={18} /> <span style={{ display: sidebarOpen ? 'inline' : 'none' }}>Logout</span>
          </button>
        </div>
      </aside>

      <main style={{
        ...styles.main,
        marginLeft: isMobile ? 0 : (sidebarOpen ? '260px' : 0),
        width: isMobile ? '100%' : (sidebarOpen ? 'calc(100% - 260px)' : '100%')
      }}>
        <header style={styles.header}>
          <div style={styles.headerLeft}>
            {!isMobile && (
              <button style={styles.menuBtn} onClick={() => setSidebarOpen(true)}>
                <Menu size={24} />
              </button>
            )}
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

        {isMobile && (
          <div style={styles.mobileTopNav}>
            {[
              { id: 'dashboard', label: 'Dashboard', icon: Home },
              { id: 'maintenance', label: 'Requests', icon: Wrench },
              { id: 'properties', label: 'Rooms', icon: Building },
              { id: 'tenants', label: 'Tenants', icon: Users },
              { id: 'payments', label: 'Payments', icon: PaymentIcon },
              { id: 'water-bill', label: 'Water', icon: Droplet },
              { id: 'vacate', label: 'Vacate', icon: DoorOpen },
              { id: 'inquiries', label: 'Messages', icon: MessageSquare },
            ].map(item => (
              <button
                key={item.id}
                style={{
                  ...styles.mobileNavItem,
                  ...(activePage === item.id ? styles.mobileNavActive : {})
                }}
                onClick={() => handlePageChange(item.id)}
              >
                <item.icon size={16} />
                <span>{item.label}</span>
              </button>
            ))}
            <button
              style={{ ...styles.mobileNavItem, backgroundColor: '#ef4444', color: 'white' }}
              onClick={handleLogout}
            >
              <LogOut size={16} />
              <span>Logout</span>
            </button>
          </div>
        )}

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

      { }
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

      {showMarkPaymentModal && selectedTenantForPayment && (
        <MarkPaymentModal
          tenant={selectedTenantForPayment}
          onClose={() => {
            setShowMarkPaymentModal(false);
            setSelectedTenantForPayment(null);
          }}
          onSubmit={handleMarkPayment}
          loading={loading}
        />
      )}

      {showVacateNoticeModal && selectedVacateNotice && (
        <VacateNoticeDetailsModal
          notice={selectedVacateNotice}
          onClose={() => {
            setShowVacateNoticeModal(false);
            setSelectedVacateNotice(null);
          }}
          onUpdateStatus={handleUpdateVacateNoticeStatus}
          onDelete={handleDeleteVacateNotice}
        />
      )}

      {showCreateVacateNoticeModal && (
        <CreateVacateNoticeModal
          leases={

            occupiedRooms.length > 0 ? occupiedRooms.map(room => ({
              lease_id: room.lease_id,
              tenant_name: room.tenant_name,
              room_number: room.name
            })) : []
          }
          initialData={selectedLeaseForVacate}
          onClose={() => {
            setShowCreateVacateNoticeModal(false);
            setSelectedLeaseForVacate(null);
          }}
          onSubmit={handleCreateVacateNotice}
          loading={loading}
        />
      )}

      {showPropertyDetailsModal && selectedProperty && (
        <PropertyDetailsModal
          property={selectedProperty}
          onClose={() => {
            setShowPropertyDetailsModal(false);
            setSelectedProperty(null);
          }}
        />
      )}

      {showTenantDetailsModal && selectedTenant && (
        <TenantDetailsModal
          tenant={selectedTenant}
          onClose={() => {
            setShowTenantDetailsModal(false);
            setSelectedTenant(null);
          }}
        />
      )}

      {sidebarOpen && (
        <div style={styles.overlay} onClick={() => setSidebarOpen(false)} />
      )}
    </div>
  );
};


const DashboardPage = ({
  overview,
  maintenanceRequests,
  availableRooms,
  pendingPayments,
  vacateNotices,
  loading,
  onUpdateStatus,
  onViewDetails,
  onCreateMaintenance,
  onMarkPayment,
  onViewVacateNotice,
  onViewAllMaintenance
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

  const filteredMaintenance = maintenanceRequests.filter(function (r) {
    return filterStatus === 'all' || r.status === filterStatus;
  });

  const pendingNotices = vacateNotices.filter(n => n.status === 'pending').length;
  const completedToday = maintenanceRequests.filter(r =>
    r.status === 'completed' &&
    new Date(r.updated_at).toDateString() === new Date().toDateString()
  ).length;

  return (
    <>
      <div style={styles.pageHeader}>
        <h2 style={styles.pageTitle}>Caretaker Overview</h2>
        <div style={styles.headerActions}>
          <button style={styles.btnSecondary} onClick={onCreateMaintenance}>
            <Plus size={16} /> Maintenance
          </button>
          <button style={styles.btnPrimary} onClick={() => window.location.reload()}>
            <RefreshCw size={16} /> Refresh
          </button>
        </div>
      </div>

      <div style={styles.gridContainer}>
        <OverviewCard
          title="Pending Maintenance"
          value={overview.pending_maintenance || 0}
          icon={AlertTriangle}
          color="#f59e0b"
        />
        <OverviewCard
          title="Completed Today"
          value={completedToday}
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
          title="Pending Payments"
          value={pendingPayments.length}
          icon={DollarSign}
          color="#ef4444"
        />
        <OverviewCard
          title="Total Tenants"
          value={overview.occupied_properties || 0}
          icon={Users}
          color="#8b5cf6"
        />
        <OverviewCard
          title="Vacate Notices"
          value={pendingNotices}
          icon={DoorOpen}
          color="#f97316"
        />
      </div>

      <div style={styles.columnsContainer}>
        <div style={styles.column}>
          <div style={styles.section}>
            <div style={styles.sectionHeader}>
              <h3 style={styles.sectionTitle}>
                <Wrench size={18} /> Recent Maintenance ({filteredMaintenance.length})
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
                    <th style={styles.th}>Priority</th>
                    <th style={styles.th}>Status</th>
                    <th style={styles.th}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMaintenance.length > 0 ? (
                    filteredMaintenance.slice(0, 5).map(function (req) {
                      return (
                        <tr key={req.id} style={styles.tableRow}>
                          <td style={styles.td}>#{req.id}</td>
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
                      <td colSpan="5" style={{ ...styles.td, textAlign: 'center', padding: '20px' }}>
                        No maintenance requests
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div style={styles.sectionFooter}>
              <button
                style={styles.btnText}
                onClick={onViewAllMaintenance || (() => { })}
              >
                View All <ArrowLeft size={14} style={{ transform: 'rotate(180deg)' }} />
              </button>
            </div>
          </div>
        </div>

        <div style={styles.column}>
          <div style={styles.section}>
            <div style={styles.sectionHeader}>
              <h3 style={styles.sectionTitle}>
                <DollarSign size={18} /> Pending Payments ({pendingPayments.length})
              </h3>
            </div>
            <div style={styles.tableWrapper}>
              <table style={styles.table}>
                <thead style={styles.tableHeader}>
                  <tr>
                    <th style={styles.th}>Tenant</th>
                    <th style={styles.th}>Room</th>
                    <th style={styles.th}>Pending</th>
                    <th style={styles.th}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingPayments.length > 0 ? (
                    pendingPayments.slice(0, 5).map(function (tenant) {
                      return (
                        <tr key={tenant.tenant_id} style={styles.tableRow}>
                          <td style={styles.td}>{tenant.tenant_name}</td>
                          <td style={styles.td}>{tenant.room_number || 'N/A'}</td>
                          <td style={styles.td}>
                            <span style={styles.badgeWarning}>
                              {tenant.pending_payments} payments
                            </span>
                          </td>
                          <td style={styles.td}>
                            <button
                              style={styles.btnSmallPrimary}
                              onClick={() => onMarkPayment(tenant)}
                              title="Mark Payment"
                            >
                              <Check size={14} />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="4" style={{ ...styles.td, textAlign: 'center', padding: '20px' }}>
                        No pending payments
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div style={styles.section}>
            <div style={styles.sectionHeader}>
              <h3 style={styles.sectionTitle}>
                <DoorOpen size={18} /> Recent Vacate Notices
              </h3>
            </div>
            <div style={styles.tableWrapper}>
              <table style={styles.table}>
                <thead style={styles.tableHeader}>
                  <tr>
                    <th style={styles.th}>Tenant</th>
                    <th style={styles.th}>Room</th>
                    <th style={styles.th}>Status</th>
                    <th style={styles.th}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {vacateNotices.length > 0 ? (
                    vacateNotices.slice(0, 5).map(function (notice) {
                      return (
                        <tr key={notice.id} style={styles.tableRow}>
                          <td style={styles.td}>{notice.tenant_name}</td>
                          <td style={styles.td}>{notice.room_number || 'N/A'}</td>
                          <td style={styles.td}>
                            <span style={{
                              ...styles.statusBadge,
                              backgroundColor:
                                notice.status === 'approved' ? '#dcfce7' :
                                  notice.status === 'rejected' ? '#fee2e2' :
                                    notice.status === 'completed' ? '#dbeafe' : '#fef3c7',
                              color:
                                notice.status === 'approved' ? '#166534' :
                                  notice.status === 'rejected' ? '#991b1b' :
                                    notice.status === 'completed' ? '#1e40af' : '#92400e'
                            }}>
                              {notice.status}
                            </span>
                          </td>
                          <td style={styles.td}>
                            <button
                              style={styles.btnSmallPrimary}
                              onClick={() => onViewVacateNotice(notice)}
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
                      <td colSpan="4" style={{ ...styles.td, textAlign: 'center', padding: '20px' }}>
                        No vacate notices
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};


const MaintenancePage = ({ requests, loading, onUpdateStatus, onViewDetails, onCreateMaintenance }) => {
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

  const filtered = requests.filter(function (r) {
    const statusMatch = filterStatus === 'all' || r.status === filterStatus;
    const priorityMatch = filterPriority === 'all' || r.priority === filterPriority;
    const searchMatch = !searchTerm ||
      r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.description.toLowerCase().includes(searchTerm.toLowerCase());
    return statusMatch && priorityMatch && searchMatch;
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
                filtered.map(function (req) {
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
                        <div style={styles.actionButtons}>
                          <button
                            style={styles.btnSmallPrimary}
                            onClick={() => onViewDetails(req)}
                            title="View Details"
                          >
                            <Eye size={14} />
                          </button>
                          {req.status !== 'completed' && (
                            <button
                              style={styles.btnSmallSuccess}
                              onClick={() => onUpdateStatus(req.id, 'completed')}
                              title="Mark Complete"
                            >
                              <Check size={14} />
                            </button>
                          )}
                        </div>
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


const PropertiesPage = ({ availableRooms, occupiedRooms, allRooms, loading, onViewDetails }) => {
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p>Loading properties...</p>
      </div>
    );
  }

  const roomsToShow = activeTab === 'available' ? availableRooms :
    activeTab === 'occupied' ? occupiedRooms : allRooms;

  const filteredRooms = roomsToShow.filter(room =>
    !searchTerm ||
    room.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    room.property_type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <div style={styles.pageHeader}>
        <h2 style={styles.pageTitle}>Property Management</h2>
        <div style={styles.tabs}>
          <button
            style={{
              ...styles.tabButton,
              ...(activeTab === 'all' ? styles.tabButtonActive : {})
            }}
            onClick={() => setActiveTab('all')}
          >
            All Rooms ({allRooms.length})
          </button>
          <button
            style={{
              ...styles.tabButton,
              ...(activeTab === 'available' ? styles.tabButtonActive : {})
            }}
            onClick={() => setActiveTab('available')}
          >
            Available ({availableRooms.length})
          </button>
          <button
            style={{
              ...styles.tabButton,
              ...(activeTab === 'occupied' ? styles.tabButtonActive : {})
            }}
            onClick={() => setActiveTab('occupied')}
          >
            Occupied ({occupiedRooms.length})
          </button>
        </div>
      </div>

      <div style={styles.filterBar}>
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
      </div>

      <div style={styles.section}>
        {filteredRooms.length === 0 ? (
          <div style={styles.emptyState}>
            <Building size={48} />
            <p>No rooms found</p>
          </div>
        ) : (
          <div style={styles.roomsGrid}>
            {filteredRooms.map(function (room) {
              return (
                <div key={room.id} style={styles.roomCard}>
                  <div style={styles.roomHeader}>
                    <Building size={20} />
                    <span style={styles.roomName}>{room.name}</span>
                    <span style={{
                      ...styles.roomStatus,
                      backgroundColor: room.status === 'occupied' ? '#dcfce7' : '#dbeafe',
                      color: room.status === 'occupied' ? '#166534' : '#1e40af'
                    }}>
                      {room.status}
                    </span>
                  </div>
                  <div style={styles.roomDetails}>
                    <div style={styles.roomDetail}>
                      <span>Type:</span>
                      <span>{room.property_type === 'bedsitter' ? 'Bedsitter' : 'One Bedroom'}</span>
                    </div>
                    <div style={styles.roomDetail}>
                      <span>Rent:</span>
                      <span style={styles.rentAmount}>
                        KSh {room.rent_amount ? room.rent_amount.toLocaleString() : '0'}
                      </span>
                    </div>
                    {room.tenant_name && (
                      <div style={styles.roomDetail}>
                        <span>Tenant:</span>
                        <span>{room.tenant_name}</span>
                      </div>
                    )}
                    {room.tenant_phone && (
                      <div style={styles.roomDetail}>
                        <span>Phone:</span>
                        <span>{room.tenant_phone}</span>
                      </div>
                    )}
                  </div>
                  <div style={styles.roomFooter}>
                    {room.status === 'occupied' && (
                      <button style={styles.btnSmallSecondary} title={room.tenant_phone || "No phone number"}>
                        <Phone size={14} /> Contact
                      </button>
                    )}
                    <button
                      style={styles.btnSmallPrimary}
                      onClick={() => onViewDetails(room)}
                    >
                      <Eye size={14} /> Details
                    </button>
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


const TenantsPage = ({ tenants, paymentStatus, loading, onMarkPayment, onSendNotification, onCreateVacateNotice, onViewDetails }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('all');

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p>Loading tenants...</p>
      </div>
    );
  }

  const tenantsWithPayment = tenants.map(tenant => {
    const payment = paymentStatus.find(p => p.tenant_id === tenant.id);
    return {
      ...tenant,
      current_month_paid: payment?.current_month_paid || false,
      last_payment_date: payment?.last_payment_date,
      rent_amount: payment?.rent_amount || 0
    };
  });

  const filteredTenants = tenantsWithPayment.filter(tenant => {
    const searchMatch = !searchTerm ||
      tenant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tenant.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tenant.room_number.toLowerCase().includes(searchTerm.toLowerCase());

    const paymentMatch = paymentFilter === 'all' ||
      (paymentFilter === 'paid' && tenant.current_month_paid) ||
      (paymentFilter === 'unpaid' && !tenant.current_month_paid);

    return searchMatch && paymentMatch;
  });

  return (
    <>
      <div style={styles.pageHeader}>
        <h2 style={styles.pageTitle}>Tenants Management ({filteredTenants.length})</h2>
        <div style={styles.headerActions}>
          <button style={styles.btnSecondary} onClick={onSendNotification}>
            <Send size={16} /> Notify
          </button>
          <button style={styles.btnPrimary} onClick={() => window.location.reload()}>
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      <div style={styles.filterBar}>
        <div style={styles.searchBox}>
          <Search size={16} />
          <input
            type="text"
            placeholder="Search tenants..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={styles.searchInput}
          />
        </div>
        <select
          value={paymentFilter}
          onChange={(e) => setPaymentFilter(e.target.value)}
          style={styles.filterSelect}
        >
          <option value="all">All Payment Status</option>
          <option value="paid">Paid This Month</option>
          <option value="unpaid">Unpaid This Month</option>
        </select>
      </div>

      <div style={styles.section}>
        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead style={styles.tableHeader}>
              <tr>
                <th style={styles.th}>Tenant Name</th>
                <th style={styles.th}>Room</th>
                <th style={styles.th}>Contact</th>
                <th style={styles.th}>Rent Amount</th>
                <th style={styles.th}>Payment Status</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTenants.length > 0 ? (
                filteredTenants.map(function (tenant) {
                  return (
                    <tr key={tenant.id} style={styles.tableRow}>
                      <td style={styles.td}>
                        <div style={styles.tenantInfo}>
                          <User size={16} />
                          <span>{tenant.name}</span>
                        </div>
                      </td>
                      <td style={styles.td}>
                        <span style={styles.roomBadge}>{tenant.room_number || 'N/A'}</span>
                      </td>
                      <td style={styles.td}>
                        <div style={styles.contactInfo}>
                          <div>{tenant.phone_number}</div>
                          <small>{tenant.email}</small>
                        </div>
                      </td>
                      <td style={styles.td}>
                        <span style={styles.rentAmount}>
                          KSh {tenant.rent_amount ? tenant.rent_amount.toLocaleString() : '0'}
                        </span>
                      </td>
                      <td style={styles.td}>
                        <span style={{
                          ...styles.statusBadge,
                          backgroundColor: tenant.current_month_paid ? '#dcfce7' : '#fee2e2',
                          color: tenant.current_month_paid ? '#166534' : '#991b1b'
                        }}>
                          {tenant.current_month_paid ? 'Paid' : 'Unpaid'}
                        </span>
                        {tenant.last_payment_date && (
                          <div style={styles.paymentDate}>
                            Last: {new Date(tenant.last_payment_date).toLocaleDateString()}
                          </div>
                        )}
                      </td>
                      <td style={styles.td}>
                        <div style={styles.actionButtons}>
                          <button
                            style={styles.btnSmallPrimary}
                            onClick={() => onMarkPayment(tenant)}
                            title="Mark Payment"
                          >
                            <CreditCard size={14} />
                          </button>
                          <button
                            style={styles.btnSmallPrimary}
                            onClick={() => onViewDetails(tenant)}
                            title="View Details"
                          >
                            <Eye size={14} />
                          </button>
                          <button
                            style={styles.btnSmallSecondary}
                            onClick={() => onCreateVacateNotice(tenant.id)}
                            title="Create Vacate Notice"
                          >
                            <DoorOpen size={14} />
                          </button>
                          <button
                            style={styles.btnSmallSecondary}
                            onClick={() => onSendNotification()}
                            title="Send Notification"
                          >
                            <Send size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="6" style={{ ...styles.td, textAlign: 'center', padding: '40px' }}>
                    No tenants found
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


const PaymentsPage = ({ pendingPayments, allPayments, loading, onMarkPayment }) => {
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p>Loading payments...</p>
      </div>
    );
  }

  const paymentsToShow = activeTab === 'pending' ? pendingPayments : allPayments;

  const filteredPayments = paymentsToShow.filter(payment =>
    !searchTerm ||
    payment.tenant_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    payment.room_number.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPending = pendingPayments.reduce((sum, p) => sum + (p.pending_payments || 0), 0);
  const paidCount = allPayments.filter(p => p.current_month_paid).length;
  const unpaidCount = allPayments.filter(p => !p.current_month_paid).length;

  return (
    <>
      <div style={styles.pageHeader}>
        <h2 style={styles.pageTitle}>Payments Management</h2>
        <div style={styles.tabs}>
          <button
            style={{
              ...styles.tabButton,
              ...(activeTab === 'all' ? styles.tabButtonActive : {})
            }}
            onClick={() => setActiveTab('all')}
          >
            All Payments ({allPayments.length})
          </button>
          <button
            style={{
              ...styles.tabButton,
              ...(activeTab === 'pending' ? styles.tabButtonActive : {})
            }}
            onClick={() => setActiveTab('pending')}
          >
            Pending ({pendingPayments.length})
          </button>
        </div>
      </div>

      <div style={styles.gridContainer}>
        <OverviewCard
          title="Paid This Month"
          value={paidCount}
          icon={CheckCircle}
          color="#10b981"
        />
        <OverviewCard
          title="Unpaid This Month"
          value={unpaidCount}
          icon={AlertCircle}
          color="#ef4444"
        />
        <OverviewCard
          title="Total Pending"
          value={totalPending}
          icon={FileWarning}
          color="#f59e0b"
        />
        <OverviewCard
          title="Total Tenants"
          value={allPayments.length}
          icon={Users}
          color="#3b82f6"
        />
      </div>

      <div style={styles.filterBar}>
        <div style={styles.searchBox}>
          <Search size={16} />
          <input
            type="text"
            placeholder="Search tenants..."
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
                <th style={styles.th}>Tenant Name</th>
                <th style={styles.th}>Room</th>
                <th style={styles.th}>Rent Amount</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Last Payment</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPayments.length > 0 ? (
                filteredPayments.map(function (payment) {
                  return (
                    <tr key={payment.tenant_id || payment.id} style={styles.tableRow}>
                      <td style={styles.td}>{payment.tenant_name}</td>
                      <td style={styles.td}>
                        <span style={styles.roomBadge}>{payment.room_number || 'N/A'}</span>
                      </td>
                      <td style={styles.td}>
                        <span style={styles.rentAmount}>
                          KSh {payment.rent_amount ? payment.rent_amount.toLocaleString() : '0'}
                        </span>
                      </td>
                      <td style={styles.td}>
                        <span style={{
                          ...styles.statusBadge,
                          backgroundColor: payment.current_month_paid ? '#dcfce7' :
                            payment.pending_payments > 0 ? '#fee2e2' : '#fef3c7',
                          color: payment.current_month_paid ? '#166534' :
                            payment.pending_payments > 0 ? '#991b1b' : '#92400e'
                        }}>
                          {payment.current_month_paid ? 'Paid' :
                            payment.pending_payments > 0 ? `Pending (${payment.pending_payments})` : 'Unpaid'}
                        </span>
                      </td>
                      <td style={styles.td}>
                        {payment.last_payment_date ?
                          new Date(payment.last_payment_date).toLocaleDateString() : 'Never'}
                      </td>
                      <td style={styles.td}>
                        <button
                          style={styles.btnSmallPrimary}
                          onClick={() => onMarkPayment(payment)}
                          title="Mark Payment"
                        >
                          <CreditCard size={14} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="6" style={{ ...styles.td, textAlign: 'center', padding: '40px' }}>
                    No payments found
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


const VacatePage = ({ notices, loading, onViewDetails, onUpdateStatus, onDelete, onCreateNotice }) => {
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p>Loading vacate notices...</p>
      </div>
    );
  }

  const filtered = notices.filter(notice => {
    const statusMatch = filterStatus === 'all' || notice.status === filterStatus;
    const searchMatch = !searchTerm ||
      notice.tenant_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notice.property_name.toLowerCase().includes(searchTerm.toLowerCase());
    return statusMatch && searchMatch;
  });

  const summary = {
    pending: notices.filter(n => n.status === 'pending').length,
    approved: notices.filter(n => n.status === 'approved').length,
    rejected: notices.filter(n => n.status === 'rejected').length,
    completed: notices.filter(n => n.status === 'completed').length,
    total: notices.length
  };

  return (
    <>
      <div style={styles.pageHeader}>
        <h2 style={styles.pageTitle}>Vacate Notices Management</h2>
        <button style={styles.btnPrimary} onClick={onCreateNotice}>
          <Plus size={16} /> Create Notice
        </button>
      </div>

      <div style={styles.gridContainer}>
        <OverviewCard
          title="Pending"
          value={summary.pending}
          icon={Clock}
          color="#f59e0b"
        />
        <OverviewCard
          title="Approved"
          value={summary.approved}
          icon={CheckCircle}
          color="#10b981"
        />
        <OverviewCard
          title="Rejected"
          value={summary.rejected}
          icon={XCircle}
          color="#ef4444"
        />
        <OverviewCard
          title="Completed"
          value={summary.completed}
          icon={ShieldCheck}
          color="#3b82f6"
        />
      </div>

      <div style={styles.filterBar}>
        <div style={styles.searchBox}>
          <Search size={16} />
          <input
            type="text"
            placeholder="Search vacate notices..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={styles.searchInput}
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          style={styles.filterSelect}
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      <div style={styles.section}>
        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead style={styles.tableHeader}>
              <tr>
                <th style={styles.th}>Tenant</th>
                <th style={styles.th}>Property</th>
                <th style={styles.th}>Vacate Date</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Created</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length > 0 ? (
                filtered.map(function (notice) {
                  return (
                    <tr key={notice.id} style={styles.tableRow}>
                      <td style={styles.td}>
                        <div style={styles.tenantInfo}>
                          <User size={16} />
                          <span>{notice.tenant_name}</span>
                        </div>
                        {notice.room_number && (
                          <small style={styles.roomNumber}>Room {notice.room_number}</small>
                        )}
                      </td>
                      <td style={styles.td}>{notice.property_name}</td>
                      <td style={styles.td}>
                        {notice.vacate_date ? new Date(notice.vacate_date).toLocaleDateString() : 'N/A'}
                      </td>
                      <td style={styles.td}>
                        <span style={{
                          ...styles.statusBadge,
                          backgroundColor:
                            notice.status === 'approved' ? '#dcfce7' :
                              notice.status === 'rejected' ? '#fee2e2' :
                                notice.status === 'completed' ? '#dbeafe' : '#fef3c7',
                          color:
                            notice.status === 'approved' ? '#166534' :
                              notice.status === 'rejected' ? '#991b1b' :
                                notice.status === 'completed' ? '#1e40af' : '#92400e'
                        }}>
                          {notice.status}
                        </span>
                      </td>
                      <td style={styles.td}>
                        {notice.created_at ? new Date(notice.created_at).toLocaleDateString() : 'N/A'}
                      </td>
                      <td style={styles.td}>
                        <div style={styles.actionButtons}>
                          <button
                            style={styles.btnSmallPrimary}
                            onClick={() => onViewDetails(notice)}
                            title="View Details"
                          >
                            <Eye size={14} />
                          </button>
                          {notice.status === 'pending' && (
                            <>
                              <button
                                style={styles.btnSmallSuccess}
                                onClick={() => onUpdateStatus(notice.id, 'approve')}
                                title="Approve"
                              >
                                <Check size={14} />
                              </button>
                              <button
                                style={styles.btnSmallDanger}
                                onClick={() => onUpdateStatus(notice.id, 'reject')}
                                title="Reject"
                              >
                                <X size={14} />
                              </button>
                            </>
                          )}
                          {notice.status === 'approved' && (
                            <button
                              style={styles.btnSmallSuccess}
                              onClick={() => onUpdateStatus(notice.id, 'complete')}
                              title="Mark Complete"
                            >
                              <ShieldCheck size={14} />
                            </button>
                          )}
                          {notice.status === 'pending' && (
                            <button
                              style={styles.btnSmallDanger}
                              onClick={() => onDelete(notice.id)}
                              title="Delete"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="6" style={{ ...styles.td, textAlign: 'center', padding: '40px' }}>
                    No vacate notices found
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


const TenantDetailsModal = ({ tenant, onClose }) => {
  const [activeTab, setActiveTab] = useState('personal');


  const tenantData = {
    personal: {
      'Full Name': tenant ? tenant.name : 'N/A',
      'Email': tenant ? tenant.email : 'N/A',
      'Phone Number': tenant ? (tenant.phone_number || tenant.phone) : 'N/A',
      'National ID': tenant ? tenant.national_id : 'N/A',
      'Room Number': tenant && tenant.room_number ? "Room " + tenant.room_number : 'N/A',
      'Status': tenant && tenant.is_active ? 'Active' : 'Inactive',
      'Date Joined': tenant && tenant.created_at ? new Date(tenant.created_at).toLocaleDateString() : 'N/A'
    },
    images: {
      photo: tenant ? tenant.photo_path : null,
      id_doc: tenant ? tenant.id_document_path : null
    }
  };

  return (
    <div style={styles.modalOverlay} onClick={onClose}>
      <div style={{ ...styles.modalContent, maxWidth: '800px' }} onClick={(e) => e.stopPropagation()}>
        <div style={styles.modalHeader}>
          <h3>Tenant Details</h3>
          <button style={styles.modalClose} onClick={onClose}>×</button>
        </div>

        <div style={styles.modalTabs}>
          <button
            style={{ ...styles.modalTab, ...(activeTab === 'personal' ? styles.modalTabActive : {}) }}
            onClick={() => setActiveTab('personal')}
          >
            Personal Info
          </button>
        </div>

        <div style={styles.modalBody}>
          {activeTab === 'personal' && (
            <>
              <div style={styles.detailsGrid}>
                {Object.entries(tenantData.personal).map(([key, value]) => (
                  <div key={key} style={styles.detailItem}>
                    <label style={styles.detailLabel}>{key}</label>
                    <p style={styles.detailValue}>{value}</p>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: '24px', borderTop: '1px solid #e5e7eb', paddingTop: '16px' }}>
                <h4 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px' }}>Documents & Photos</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                  {tenantData.images.photo && (
                    <div>
                      <p style={{ fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>Profile Photo</p>
                      <img
                        src={`${API_BASE_URL}/${tenantData.images.photo}`}
                        alt="Tenant Profile"
                        style={styles.imagePreview}
                        onError={(e) => { e.target.src = 'https://via.placeholder.com/200?text=No+Image'; }}
                      />
                    </div>
                  )}
                  { }
                  {tenantData.images.id_doc && (
                    <div>
                      <p style={{ fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>National ID Document</p>
                      <div style={{ ...styles.imagePreview, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f3f4f6' }}>
                        <FileText size={48} color="#9ca3af" />
                        <span style={{ fontSize: '14px', color: '#6b7280', marginLeft: '8px' }}>{tenantData.images.id_doc}</span>
                      </div>
                    </div>
                  )}
                  {(!tenantData.images.photo && !tenantData.images.id_doc) && (
                    <p style={{ color: '#9ca3af', fontStyle: 'italic' }}>No documents uploaded.</p>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        <div style={styles.modalFooter}>
          <button style={styles.btnSecondary} onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
};

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

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, overflow: 'hidden' }}>
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

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, overflow: 'hidden' }}>
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

const MarkPaymentModal = ({ tenant, onClose, onSubmit, loading }) => {
  const [formData, setFormData] = useState({
    tenant_id: tenant.tenant_id || tenant.id || '',
    amount: tenant.rent_amount || 0,
    status: 'paid',
    payment_method: 'cash'
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'amount') {

      const numValue = value === '' ? '' : parseFloat(value);
      setFormData({
        ...formData,
        [name]: numValue
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }

    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};


    if (!formData.tenant_id) {
      newErrors.tenant_id = 'Tenant ID is required';
    }
    if (!formData.amount || formData.amount <= 0) {
      newErrors.amount = 'Amount must be greater than 0';
    }
    if (!formData.status || !['paid', 'unpaid'].includes(formData.status)) {
      newErrors.status = 'Status must be "paid" or "unpaid"';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }


    const submitData = {
      tenant_id: parseInt(formData.tenant_id),
      amount: parseFloat(formData.amount),
      status: formData.status,
      payment_method: formData.payment_method || 'manual'
    };

    onSubmit(submitData);
  };

  return (
    <div style={styles.modalOverlay} onClick={onClose}>
      <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div style={styles.modalHeader}>
          <h3>Record Payment</h3>
          <button style={styles.modalClose} onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, overflow: 'hidden' }}>
          <div style={styles.modalBody}>
            <div style={styles.formGroup}>
              <label style={styles.formLabel}>Tenant Information</label>
              <div style={{
                backgroundColor: '#f9fafb',
                padding: '12px',
                borderRadius: '6px',
                margin: '8px 0'
              }}>
                <p style={{ margin: '0 0 4px 0', fontWeight: '600' }}>
                  {tenant.tenant_name || tenant.name || 'N/A'}
                </p>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '14px',
                  color: '#6b7280'
                }}>
                  <span>Room: {tenant.room_number || 'N/A'}</span>
                  <span>Rent: KSh {tenant.rent_amount ? tenant.rent_amount.toLocaleString() : '0'}</span>
                </div>
              </div>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.formLabel}>Tenant ID *</label>
              <input
                type="text"
                name="tenant_id"
                value={formData.tenant_id}
                onChange={handleChange}
                placeholder="Tenant ID"
                style={{ ...styles.formInput, ...(errors.tenant_id ? styles.inputError : {}) }}
                disabled={!!tenant.tenant_id || !!tenant.id}
              />
              {errors.tenant_id && <span style={styles.errorText}>{errors.tenant_id}</span>}
              <small style={styles.helpText}>
                This should be populated automatically
              </small>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.formLabel}>Payment Status *</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                style={{ ...styles.formSelect, ...(errors.status ? styles.inputError : {}) }}
              >
                <option value="paid">Paid</option>
                <option value="unpaid">Unpaid</option>
              </select>
              {errors.status && <span style={styles.errorText}>{errors.status}</span>}
              <small style={styles.helpText}>
                • Paid: Mark payment as completed<br />
                • Unpaid: Mark payment as not received
              </small>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.formLabel}>Amount (KES) *</label>
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                placeholder="Enter amount"
                min="1"
                step="0.01"
                style={{ ...styles.formInput, ...(errors.amount ? styles.inputError : {}) }}
              />
              {errors.amount && <span style={styles.errorText}>{errors.amount}</span>}
              <small style={styles.helpText}>
                Amount to be recorded
              </small>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.formLabel}>Payment Method</label>
              <select
                name="payment_method"
                value={formData.payment_method}
                onChange={handleChange}
                style={styles.formSelect}
              >
                <option value="cash">Cash</option>
                <option value="manual">Manual</option>
                <option value="mpesa">M-Pesa</option>
                <option value="bank">Bank Transfer</option>
              </select>
              <small style={styles.helpText}>
                How was this payment received?
              </small>
            </div>
          </div>

          <div style={styles.modalFooter}>
            <button type="button" style={styles.btnSecondary} onClick={onClose}>
              Cancel
            </button>
            <button type="submit" style={styles.btnPrimary} disabled={loading}>
              {loading ? (
                <>
                  <div style={{
                    width: '16px',
                    height: '16px',
                    border: '2px solid white',
                    borderTopColor: 'transparent',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite',
                    marginRight: '8px'
                  }}></div>
                  Processing...
                </>
              ) : 'Record Payment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const VacateNoticeDetailsModal = ({ notice, onClose, onUpdateStatus, onDelete }) => {
  const [actionNotes, setActionNotes] = useState('');

  return (
    <div style={styles.modalOverlay} onClick={onClose}>
      <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div style={styles.modalHeader}>
          <h3>Vacate Notice Details</h3>
          <button style={styles.modalClose} onClick={onClose}>×</button>
        </div>

        <div style={styles.modalBody}>
          <div style={styles.detailsGrid}>
            <div style={styles.detailItem}>
              <label style={styles.detailLabel}>Tenant</label>
              <p style={styles.detailValue}>{notice.tenant_name}</p>
            </div>
            <div style={styles.detailItem}>
              <label style={styles.detailLabel}>Room</label>
              <p style={styles.detailValue}>{notice.room_number || 'N/A'}</p>
            </div>
            <div style={styles.detailItem}>
              <label style={styles.detailLabel}>Property</label>
              <p style={styles.detailValue}>{notice.property_name}</p>
            </div>
            <div style={styles.detailItem}>
              <label style={styles.detailLabel}>Status</label>
              <span style={{
                ...styles.statusBadge,
                backgroundColor:
                  notice.status === 'approved' ? '#dcfce7' :
                    notice.status === 'rejected' ? '#fee2e2' :
                      notice.status === 'completed' ? '#dbeafe' : '#fef3c7',
                color:
                  notice.status === 'approved' ? '#166534' :
                    notice.status === 'rejected' ? '#991b1b' :
                      notice.status === 'completed' ? '#1e40af' : '#92400e'
              }}>
                {notice.status}
              </span>
            </div>
          </div>

          <div style={{ marginTop: '20px' }}>
            <label style={styles.detailLabel}>Vacate Date</label>
            <p style={{ ...styles.detailValue, fontSize: '16px', fontWeight: '600', margin: '8px 0' }}>
              {new Date(notice.vacate_date).toLocaleDateString()}
            </p>
          </div>

          <div style={{ marginTop: '16px' }}>
            <label style={styles.detailLabel}>Reason</label>
            <p style={{ ...styles.detailValue, lineHeight: '1.6', margin: '8px 0' }}>
              {notice.reason || 'No reason provided'}
            </p>
          </div>

          {notice.admin_notes && (
            <div style={{ marginTop: '16px' }}>
              <label style={styles.detailLabel}>Admin Notes</label>
              <p style={{ ...styles.detailValue, lineHeight: '1.6', margin: '8px 0' }}>
                {notice.admin_notes}
              </p>
            </div>
          )}

          {notice.status === 'pending' && (
            <div style={{ marginTop: '24px' }}>
              <label style={styles.formLabel}>Action Notes (Optional)</label>
              <textarea
                value={actionNotes}
                onChange={(e) => setActionNotes(e.target.value)}
                placeholder="Add notes for approval/rejection..."
                rows="3"
                style={styles.formInput}
              />
            </div>
          )}
        </div>

        <div style={styles.modalFooter}>
          {notice.status === 'pending' && (
            <>
              <button
                style={styles.btnSuccess}
                onClick={() => {
                  onUpdateStatus(notice.id, 'approve', actionNotes);
                  onClose();
                }}
              >
                Approve
              </button>
              <button
                style={styles.btnDanger}
                onClick={() => {
                  onUpdateStatus(notice.id, 'reject', actionNotes);
                  onClose();
                }}
              >
                Reject
              </button>
              <button
                style={styles.btnSecondary}
                onClick={() => {
                  onDelete(notice.id);
                  onClose();
                }}
              >
                Delete
              </button>
            </>
          )}
          {notice.status === 'approved' && (
            <button
              style={styles.btnSuccess}
              onClick={() => {
                onUpdateStatus(notice.id, 'complete');
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

const CreateVacateNoticeModal = ({ leases, initialData, onClose, onSubmit, loading }) => {
  const [formData, setFormData] = useState({
    lease_id: initialData?.lease_id || '',
    vacate_date: '',
    reason: ''
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
    if (!formData.lease_id) newErrors.lease_id = 'Please select a lease';
    if (!formData.vacate_date) newErrors.vacate_date = 'Vacate date is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSubmit(formData);
  };


  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  return (
    <div style={styles.modalOverlay} onClick={onClose}>
      <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div style={styles.modalHeader}>
          <h3>Create Vacate Notice</h3>
          <button style={styles.modalClose} onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, overflow: 'hidden' }}>
          <div style={styles.modalBody}>
            <div style={styles.formGroup}>
              <label style={styles.formLabel}>Select Tenant/Lease *</label>
              <select
                name="lease_id"
                value={formData.lease_id}
                onChange={handleChange}
                style={{ ...styles.formSelect, ...(errors.lease_id ? styles.inputError : {}) }}
              >
                <option value="">Choose a tenant...</option>
                {leases.map(lease => (
                  <option key={lease.lease_id} value={lease.lease_id}>
                    {lease.tenant_name} - Room {lease.room_number || 'N/A'}
                  </option>
                ))}
              </select>
              {errors.lease_id && <span style={styles.errorText}>{errors.lease_id}</span>}
            </div>

            <div style={styles.formGroup}>
              <label style={styles.formLabel}>Vacate Date *</label>
              <input
                type="date"
                name="vacate_date"
                value={formData.vacate_date}
                onChange={handleChange}
                min={minDate}
                style={{ ...styles.formInput, ...(errors.vacate_date ? styles.inputError : {}) }}
              />
              {errors.vacate_date && <span style={styles.errorText}>{errors.vacate_date}</span>}
            </div>

            <div style={styles.formGroup}>
              <label style={styles.formLabel}>Reason (Optional)</label>
              <textarea
                name="reason"
                value={formData.reason}
                onChange={handleChange}
                placeholder="Enter reason for vacating..."
                rows="4"
                style={styles.formInput}
              />
            </div>
          </div>

          <div style={styles.modalFooter}>
            <button type="button" style={styles.btnSecondary} onClick={onClose}>
              Cancel
            </button>
            <button type="submit" style={styles.btnPrimary} disabled={loading}>
              {loading ? 'Creating...' : 'Create Notice'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};



const PropertyDetailsModal = ({ property, onClose }) => {
  return (
    <div style={styles.modalOverlay} onClick={onClose}>
      <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div style={styles.modalHeader}>
          <h3>Property Details</h3>
          <button style={styles.modalClose} onClick={onClose}>×</button>
        </div>

        <div style={styles.modalBody}>
          <div style={styles.detailsGrid}>
            <div style={styles.detailItem}>
              <label style={styles.detailLabel}>Property Name/Number</label>
              <p style={styles.detailValue}>{property.name}</p>
            </div>
            <div style={styles.detailItem}>
              <label style={styles.detailLabel}>Type</label>
              <p style={styles.detailValue}>{property.property_type === 'bedsitter' ? 'Bedsitter' : 'One Bedroom'}</p>
            </div>
            <div style={styles.detailItem}>
              <label style={styles.detailLabel}>Status</label>
              <span style={{
                ...styles.statusBadge,
                backgroundColor: property.status === 'occupied' ? '#dcfce7' : '#dbeafe',
                color: property.status === 'occupied' ? '#166534' : '#1e40af'
              }}>
                {property.status}
              </span>
            </div>
            <div style={styles.detailItem}>
              <label style={styles.detailLabel}>Rent Amount</label>
              <p style={styles.detailValue}>
                KSh {property.rent_amount ? property.rent_amount.toLocaleString() : '0'}
              </p>
            </div>
          </div>

          <div style={{ marginTop: '20px' }}>
            <label style={styles.detailLabel}>Description</label>
            <p style={{ ...styles.detailValue, lineHeight: '1.6', margin: '8px 0' }}>
              {property.description || 'No description provided.'}
            </p>
          </div>

          {property.status === 'occupied' && (
            <div style={{
              marginTop: '24px',
              backgroundColor: '#f9fafb',
              padding: '16px',
              borderRadius: '8px',
              border: '1px solid #e5e7eb'
            }}>
              <h4 style={{ margin: '0 0 12px 0', fontSize: '15px', fontWeight: '600' }}>Current Tenant</h4>
              <div style={styles.detailsGrid}>
                <div style={styles.detailItem}>
                  <label style={styles.detailLabel}>Name</label>
                  <p style={styles.detailValue}>{property.tenant_name || 'N/A'}</p>
                </div>
                <div style={styles.detailItem}>
                  <label style={styles.detailLabel}>Phone</label>
                  <p style={styles.detailValue}>{property.tenant_phone || 'N/A'}</p>
                </div>
              </div>
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
  logoutBtnWrapper: {
    padding: '1rem',
    borderTop: '1px solid #374151',
    backgroundColor: '#111827',
    display: 'none'
  },
  logoutBtnWrapperVisible: {
    display: 'block'
  },
  logoutBtn: {
    width: '100%',
    padding: '10px',
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
    transition: 'all 0.2s',
    '&:hover': {
      backgroundColor: '#dc2626'
    }
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
    zIndex: 11
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  menuBtn: {
    display: 'flex',
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    padding: '8px',
    marginRight: '8px'
  },
  homeBtn: {
    background: 'transparent',
    border: '1px solid #e5e7eb',
    borderRadius: '6px',
    cursor: 'pointer',
    padding: '8px',
    display: 'flex',
    alignItems: 'center'
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
    alignItems: 'center'
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
    fontSize: '14px'
  },
  successBanner: {
    backgroundColor: '#dcfce7',
    color: '#166534',
    padding: '12px 24px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    fontSize: '14px'
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
  headerActions: {
    display: 'flex',
    gap: '12px'
  },
  tabs: {
    display: 'flex',
    gap: '8px',
    borderBottom: '1px solid #e5e7eb',
    marginBottom: '24px'
  },
  tabButton: {
    padding: '10px 20px',
    background: 'transparent',
    border: 'none',
    borderBottom: '2px solid transparent',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    color: '#6b7280'
  },
  tabButtonActive: {
    color: '#3b82f6',
    borderBottomColor: '#3b82f6'
  },
  filterBar: {
    display: 'flex',
    gap: '12px',
    marginBottom: '24px',
    flexWrap: 'wrap'
  },
  searchBox: {
    flex: 1,
    maxWidth: '400px',
    position: 'relative'
  },
  searchInput: {
    width: '100%',
    padding: '10px 12px 10px 40px',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    fontSize: '14px'
  },
  filterSelect: {
    padding: '10px 12px',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    fontSize: '14px',
    backgroundColor: 'white',
    cursor: 'pointer',
    minWidth: '150px'
  },
  columnsContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
    gap: '24px'
  },
  column: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px'
  },
  gridContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '16px',
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
    border: '1px solid #e5e7eb'
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
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    border: '1px solid #e5e7eb'
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    flexWrap: 'wrap',
    gap: '16px'
  },
  sectionTitle: {
    margin: 0,
    fontSize: '18px',
    fontWeight: '600',
    color: '#111827',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  sectionFooter: {
    marginTop: '16px',
    textAlign: 'right'
  },
  tableWrapper: {
    overflowX: 'auto',
    borderRadius: '8px',
    border: '1px solid #e5e7eb'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '14px'
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
    whiteSpace: 'nowrap'
  },
  tableRow: {
    borderBottom: '1px solid #e5e7eb'
  },
  td: {
    padding: '12px 16px',
    color: '#6b7280',
    verticalAlign: 'top'
  },
  statusBadge: {
    display: 'inline-block',
    padding: '4px 12px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '500'
  },
  badgeWarning: {
    display: 'inline-block',
    padding: '4px 12px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '500',
    backgroundColor: '#fef3c7',
    color: '#92400e'
  },
  btnText: {
    background: 'transparent',
    border: 'none',
    color: '#3b82f6',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    display: 'flex',
    alignItems: 'center',
    gap: '4px'
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
    gap: '8px'
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
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  btnSuccess: {
    padding: '10px 16px',
    backgroundColor: '#10b981',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500'
  },
  btnDanger: {
    padding: '10px 16px',
    backgroundColor: '#ef4444',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500'
  },
  btnSmallPrimary: {
    padding: '6px 12px',
    backgroundColor: '#3b82f6',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center'
  },
  btnSmallSecondary: {
    padding: '6px 12px',
    backgroundColor: 'white',
    color: '#374151',
    border: '1px solid #d1d5db',
    borderRadius: '4px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '4px'
  },
  btnSmallSuccess: {
    padding: '6px 12px',
    backgroundColor: '#10b981',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center'
  },
  btnSmallDanger: {
    padding: '6px 12px',
    backgroundColor: '#ef4444',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center'
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
    backgroundColor: 'white'
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
  roomStatus: {
    padding: '4px 8px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '500'
  },
  roomDetails: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    marginBottom: '16px'
  },
  roomDetail: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '14px'
  },
  rentAmount: {
    fontWeight: '600',
    color: '#111827'
  },
  roomFooter: {
    display: 'flex',
    gap: '8px',
    justifyContent: 'flex-end'
  },
  infoCard: {
    padding: '24px',
    backgroundColor: '#f9fafb',
    borderRadius: '8px',
    border: '1px solid #e5e7eb',
    textAlign: 'center'
  },
  tenantInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  contactInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px'
  },
  roomBadge: {
    display: 'inline-block',
    padding: '4px 8px',
    backgroundColor: '#dbeafe',
    color: '#1e40af',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '500'
  },
  paymentDate: {
    fontSize: '12px',
    color: '#6b7280',
    marginTop: '4px'
  },
  actionButtons: {
    display: 'flex',
    gap: '8px'
  },
  roomNumber: {
    display: 'block',
    fontSize: '12px',
    color: '#6b7280',
    marginTop: '4px'
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
    padding: '20px'
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: '12px',
    maxWidth: '600px',
    width: '100%',
    maxHeight: '90vh',
    display: 'flex',
    flexDirection: 'column'
  },
  modalHeader: {
    padding: '20px 24px',
    borderBottom: '1px solid #e5e7eb',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  modalClose: {
    background: 'transparent',
    border: 'none',
    fontSize: '28px',
    cursor: 'pointer',
    color: '#6b7280',
    padding: '0',
    lineHeight: 1
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
    justifyContent: 'flex-end'
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
    fontWeight: '500'
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
    boxSizing: 'border-box'
  },
  formSelect: {
    width: '100%',
    padding: '10px 12px',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    fontSize: '14px',
    backgroundColor: 'white',
    boxSizing: 'border-box',
    cursor: 'pointer'
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
  helpText: {
    fontSize: '12px',
    color: '#6b7280',
    marginTop: '4px',
    display: 'block',
    lineHeight: '1.4'
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

  mobileTopNav: {
    display: 'flex',
    overflowX: 'auto',
    backgroundColor: '#1f2937',
    padding: '12px',
    gap: '12px',
    position: 'sticky',
    top: '64px',
    zIndex: 10,
    scrollbarWidth: 'none',
    msOverflowStyle: 'none'
  },
  mobileNavItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: '70px',
    padding: '8px',
    color: '#9ca3af',
    background: 'none',
    border: 'none',
    fontSize: '11px',
    gap: '4px',
    borderRadius: '8px',
    cursor: 'pointer'
  },
  mobileNavActive: {
    color: 'white',
    backgroundColor: '#374151'
  },

  inquiryCard: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '20px',
    marginBottom: '16px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
    border: '1px solid #e5e7eb',
    transition: 'transform 0.2s, box-shadow 0.2s'
  },
  inquiryHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '12px',
    gap: '12px'
  },
  senderInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  avatar: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    backgroundColor: '#3b82f6',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '18px',
    fontWeight: '600'
  },
  msgMeta: {
    display: 'flex',
    flexDirection: 'column'
  },
  senderName: {
    fontWeight: '600',
    color: '#111827',
    fontSize: '15px'
  },
  msgTime: {
    fontSize: '12px',
    color: '#6b7280'
  },
  subjectBadge: {
    display: 'inline-block',
    padding: '2px 8px',
    borderRadius: '12px',
    fontSize: '11px',
    fontWeight: '500',
    marginTop: '4px',
    alignSelf: 'flex-start'
  },
  msgPreview: {
    color: '#4b5563',
    lineHeight: '1.5',
    fontSize: '14px',
    backgroundColor: '#f9fafb',
    padding: '12px',
    borderRadius: '8px'
  },

  modalTabs: {
    display: 'flex',
    borderBottom: '1px solid #e5e7eb',
    marginBottom: '20px',
    padding: '0 20px'
  },
  modalTab: {
    padding: '12px 20px',
    background: 'none',
    border: 'none',
    borderBottom: '2px solid transparent',
    color: '#6b7280',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    marginBottom: '-1px'
  },
  modalTabActive: {
    color: '#2563eb',
    borderBottomColor: '#2563eb'
  },
  imagePreview: {
    width: '100%',
    height: '200px',
    objectFit: 'cover',
    borderRadius: '8px',
    border: '1px solid #e5e7eb'
  }
};


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