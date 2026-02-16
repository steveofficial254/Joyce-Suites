import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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

import './CaretakerDashboard.css';

import config from '../../config';

const API_BASE_URL = config.apiBaseUrl;

// Helper function for authenticated API calls
const fetchWithAuth = async (url, options = {}) => {
  const token = localStorage.getItem('joyce-suites-token');
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  };

  const response = await fetch(url, { ...defaultOptions, ...options });
  return response;
};

// Basic styles object to prevent ReferenceError
const styles = {
  loadingContainer: { display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '40px' },
  spinner: { width: '40px', height: '40px', border: '4px solid #f3f4f6', borderTop: '4px solid #3b82f6', borderRadius: '50%', animation: 'spin 1s linear infinite' },
  section: { marginBottom: '24px' },
  pageHeaderControls: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' },
  pageTitle: { fontSize: '24px', fontWeight: '600', margin: 0 },
  tableWrapper: { overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse', backgroundColor: 'white', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' },
  tableHeader: { backgroundColor: '#f8fafc' },
  th: { padding: '12px 16px', textAlign: 'left', fontWeight: '600', color: '#374151', borderBottom: '1px solid #e5e7eb' },
  tableRow: { borderBottom: '1px solid #e5e7eb', transition: 'background-color 0.2s ease' },
  td: { padding: '12px 16px', color: '#6b7280' },
  statusBadge: { padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: '500' },
  btn: { padding: '8px 12px', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', transition: 'all 0.2s ease' },
  btnSm: { padding: '4px 8px', fontSize: '12px' },
  btnPrimary: { backgroundColor: '#3b82f6', color: 'white' },
  btnSecondary: { backgroundColor: '#6b7280', color: 'white' },
  btnSuccess: { backgroundColor: '#10b981', color: 'white' },
  btnWarning: { backgroundColor: '#f59e0b', color: 'white' },
  btnDanger: { backgroundColor: '#ef4444', color: 'white' },
  filterSelect: { padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px', backgroundColor: 'white' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' },
  statCard: { backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', gap: '12px', transition: 'transform 0.2s ease' },
  statIcon: { color: '#3b82f6' },
  statNumber: { fontSize: '24px', fontWeight: '600', color: '#111827' },
  statLabel: { fontSize: '14px', color: '#6b7280' },
  sectionTitle: { fontSize: '18px', fontWeight: '600', margin: '0 0 16px 0' },
  card: { backgroundColor: 'white', padding: '16px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' },

  // Enhanced admin-like styles
  container: { display: 'flex', minHeight: '100vh' },
  sidebar: { width: '260px', backgroundColor: '#1f2937', color: 'white', position: 'fixed', height: '100vh', overflowY: 'auto', transition: 'all 0.3s ease', zIndex: 1000 },
  sidebarHidden: { width: '60px' },
  sidebarHeader: { padding: '20px', borderBottom: '1px solid #374151', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  sidebarTitle: { fontSize: '18px', fontWeight: '600', margin: 0 },
  closeBtn: { background: 'none', border: 'none', color: 'white', cursor: 'pointer', padding: '4px' },
  nav: { padding: '20px 0' },
  navItem: { display: 'flex', alignItems: 'center', padding: '12px 20px', color: 'white', textDecoration: 'none', cursor: 'pointer', border: 'none', background: 'none', width: '100%', textAlign: 'left', transition: 'background-color 0.2s ease' },
  navItemActive: { backgroundColor: '#3b82f6' },
  userInfo: { padding: '20px', borderTop: '1px solid #374151' },
  userAvatar: { width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#374151', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '8px' },
  userDetails: { fontSize: '14px' },
  logoutBtnWrapper: { padding: '0 20px 20px', opacity: 0, transition: 'opacity 0.3s ease' },
  logoutBtnWrapperVisible: { opacity: 1 },
  logoutBtn: { display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 15px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', width: '100%', justifyContent: 'center' },
  main: { flex: 1, backgroundColor: '#f8fafc', minHeight: '100vh' },
  header: { backgroundColor: 'white', padding: '16px 24px', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' },
  headerLeft: { display: 'flex', alignItems: 'center', gap: '12px' },
  menuBtn: { background: 'none', border: 'none', cursor: 'pointer', padding: '4px' },
  homeBtn: { background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: '#3b82f6' },
  headerTitle: { fontSize: '20px', fontWeight: '600', margin: 0 },
  headerRight: { display: 'flex', alignItems: 'center', gap: '12px' },
  refreshBtn: { background: 'none', border: 'none', cursor: 'pointer', padding: '4px' },
  notificationBadge: { position: 'relative', cursor: 'pointer' },
  badgeCount: { position: 'absolute', top: '-8px', right: '-8px', backgroundColor: '#ef4444', color: 'white', fontSize: '10px', padding: '2px 4px', borderRadius: '10px' },

  errorBanner: { backgroundColor: '#fef2f2', color: '#dc2626', padding: '12px 16px', borderRadius: '6px', margin: '16px', display: 'flex', alignItems: 'center', gap: '8px' },
  successBanner: { backgroundColor: '#f0fdf4', color: '#16a34a', padding: '12px 16px', borderRadius: '6px', margin: '16px', display: 'flex', alignItems: 'center', gap: '8px' },
  closeBannerBtn: { background: 'none', border: 'none', cursor: 'pointer', padding: '4px', marginLeft: 'auto' },
  content: { padding: '24px' },
  overlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 999 }
};




// End of styles


const CaretakerDashboard = () => {
  const navigate = useNavigate();
  const [activePage, setActivePage] = useState('dashboard');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  const [loading, setLoading] = useState(true);
  const [financialSummary, setFinancialSummary] = useState(null);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      // For unified layout, we might want the sidebar open by default on desktop
      // and closed on mobile to save space, but accessible via a clean toggle.
      if (!mobile) setSidebarOpen(true);
      // else setSidebarOpen(false); // User wants only 1 layout, sidebar used universally
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [userProfile, setUserProfile] = useState(null);


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
      // Failed to fetch overview
    }
  };

  const fetchMaintenanceRequests = async () => {
    try {
      const data = await apiCall('/api/caretaker/maintenance?page=1&per_page=100');
      if (data && data.success) {
        setMaintenanceRequests(data.requests || []);
      }
    } catch (err) {
      // Failed to fetch maintenance requests
    }
  };

  const fetchAvailableRooms = async () => {
    try {
      const data = await apiCall('/api/caretaker/rooms/available');
      if (data && data.success) {
        setAvailableRooms(data.available_rooms || []);
      }
    } catch (err) {
      // Error occurred
    }
  };

  const fetchOccupiedRooms = async () => {
    try {
      const data = await apiCall('/api/caretaker/rooms/occupied');
      if (data && data.success) {
        setOccupiedRooms(data.occupied_rooms || []);
      }
    } catch (err) {
      // Error occurred
    }
  };

  const fetchAllRooms = async () => {
    try {
      const data = await apiCall('/api/caretaker/rooms/all');
      if (data && data.success) {
        setAllRooms(data.rooms || []);
      }
    } catch (err) {
      // Error occurred
    }
  };

  const fetchTenants = async () => {
    try {
      const data = await apiCall('/api/caretaker/tenants?page=1&per_page=100');
      if (data && data.success) {
        setTenants(data.tenants || []);
      }
    } catch (err) {
      // Error occurred
    }
  };

  const fetchPendingPayments = async () => {
    try {
      const data = await apiCall('/api/caretaker/payments/pending');
      if (data && data.success) {
        setPendingPayments(data.tenants_with_arrears || []);
      }
    } catch (err) {
      // Error occurred
    }
  };

  const fetchAllTenantsPaymentStatus = async () => {
    try {
      const data = await apiCall('/api/caretaker/payments/all-tenants');
      if (data && data.success) {
        setAllTenantsPaymentStatus(data.tenants || []);
      }
    } catch (err) {
      // Error occurred
    }
  };

  const fetchVacateNotices = async () => {
    try {
      const data = await apiCall('/api/caretaker/vacate-notices?per_page=100');
      if (data && data.success) {
        setVacateNotices(data.notices || []);
      }
    } catch (err) {
      // Error occurred
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
      // Failed to update maintenance
    }
  };

  const handleViewMaintenanceDetails = (request) => {
    // For now, just log the details. In a real implementation, this would open a modal
    console.log('Maintenance details:', request);
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
      // Failed to fetch notifications
    }
  };

  const fetchUserProfile = async () => {
    try {
      const data = await apiCall('/api/auth/profile');
      if (data && data.success) {
        setUserProfile(data.user);
        // Debug: Log profile data
        if (data.user?.photo_path) {
          console.log('✅ Caretaker photo found:', data.user.photo_path);
        } else {
          console.log('ℹ️ No caretaker photo found, will use default icon');
        }
      }
    } catch (err) {
      // Failed to fetch user profile
      console.log('❌ Failed to fetch caretaker profile');
    }
  };

  const fetchFinancialSummary = async () => {
    try {
      const data = await apiCall('/api/caretaker/financial-summary');
      if (data && data.success) {
        setFinancialSummary(data.summary);
      }
    } catch (err) {
      console.log('❌ Failed to fetch financial summary');
    }
  };

  const handleMarkNotificationRead = async (id) => {
    try {
      await apiCall(`/api/auth/notifications/${id}/read`, { method: 'PUT' });
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, is_read: true } : n)
      );
    } catch (err) {
      // Failed to mark notification read
    }
  };

  const handleMarkPayment = async (paymentData) => {
    try {
      setLoading(true);
      const data = await apiCall('/api/rent-deposit/rent/mark-payment', {
        method: 'POST',
        body: JSON.stringify(paymentData)
      });

      if (data && data.success || (data && data.message)) {
        setSuccessMessage('Payment marked successfully');
        await fetchAllTenantsPaymentStatus();
        await fetchOverview();
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (err) {
      setError(err.message || 'Failed to mark payment');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkRentPaid = async (rentId) => {
    try {
      const data = await apiCall(`/api/rent-deposit/rent/${rentId}/mark-paid`, {
        method: 'PUT'
      });

      if (data && data.success) {
        setSuccessMessage('Rent marked as paid');
        await fetchPendingPayments();
        await fetchOverview();
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (err) {
      // Failed to mark rent as paid
    }
  };

  const handleMarkRentUnpaid = async (rentId) => {
    try {
      const data = await apiCall(`/api/rent-deposit/rent/${rentId}/mark-unpaid`, {
        method: 'PUT'
      });

      if (data && data.success) {
        setSuccessMessage('Rent marked as unpaid');
        await fetchPendingPayments();
        await fetchOverview();
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (err) {
      // Failed to mark rent as unpaid
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
      // Logout error
    } finally {
      localStorage.clear();
      navigate('/caretaker-login');
    }
  };

  useEffect(() => {
    const token = getToken();
    if (!token) {
      navigate('/caretaker-login');
      return;
    }

    const fetchPageData = async () => {
      setLoading(true);
      setError('');

      try {
        switch (activePage) {
          case 'dashboard':
            fetchAvailableRooms().catch(() => { }),
              fetchOccupiedRooms().catch(() => { }),
              fetchAllRooms().catch(() => { }),
              fetchTenants().catch(() => { }),
              fetchPendingPayments().catch(() => { }),
              fetchVacateNotices().catch(() => { }),
              fetchNotifications().catch(() => { }),
              fetchUserProfile().catch(() => { }),
              fetchFinancialSummary().catch(() => { })
            break;
          case 'maintenance':
            await fetchMaintenanceRequests();
            break;
          case 'properties':
            await Promise.all([
              fetchAvailableRooms(),
              fetchOccupiedRooms(),
              fetchAllRooms(),
              fetchTenants()
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
            await Promise.all([fetchVacateNotices(), fetchTenants()]);
            break;
          case 'notifications':
          case 'inquiries':
            await Promise.all([fetchNotifications(), fetchTenants()]);
            break;
          default:
            break;
        }
      } catch (err) {
        // Page data fetch error
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
            financialSummary={financialSummary}
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
              setShowCreateVacateNoticeModal(true);
            }}
          />
        );
      case 'maintenance':
        return (
          <MaintenancePage
            requests={maintenanceRequests}
            loading={loading}
            onUpdateStatus={handleUpdateMaintenanceStatus}
            onViewDetails={handleViewMaintenanceDetails}
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
        // Map payment status array to an object keyed by tenant_id for O(1) lookup
        const paymentStatusMap = {};
        if (Array.isArray(allTenantsPaymentStatus)) {
          allTenantsPaymentStatus.forEach(status => {
            paymentStatusMap[status.tenant_id] = {
              status: status.current_month_paid ? 'paid' : 'unpaid',
              ...status
            };
          });
        }

        return (
          <TenantsPage
            tenants={tenants}
            paymentStatus={paymentStatusMap}
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
        return <NotificationsPage tenants={tenants} />;
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
        return <WaterBillPage />;
      case 'deposits':
        return <DepositsPage />;
      default:
        return null;
    }
  };

  return (
    <div className="caretaker-dashboard">
      <aside style={{
        ...styles.sidebar,
        transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
        display: isMobile && !sidebarOpen ? 'none' : 'block'
      }}>
        <div style={styles.sidebarHeader}>
          <h2 style={styles.sidebarTitle}>Joyce Suites</h2>
          {isMobile && (
            <button style={styles.closeBtn} onClick={() => setSidebarOpen(false)}>
              <X size={20} />
            </button>
          )}
        </div>
        <nav style={styles.nav}>
          <button
            style={{ ...styles.navItem, ...(activePage === 'dashboard' ? styles.navItemActive : {}) }}
            onClick={() => { setActivePage('dashboard'); if (isMobile) setSidebarOpen(false); }}
          >
            <PieChart size={18} /> Dashboard
          </button>
          <button
            style={{ ...styles.navItem, ...(activePage === 'properties' ? styles.navItemActive : {}) }}
            onClick={() => { setActivePage('properties'); if (isMobile) setSidebarOpen(false); }}
          >
            <Home size={18} /> Room Management
          </button>
          <button
            style={{ ...styles.navItem, ...(activePage === 'tenants' ? styles.navItemActive : {}) }}
            onClick={() => { setActivePage('tenants'); if (isMobile) setSidebarOpen(false); }}
          >
            <Users size={18} /> Tenants
          </button>
          <button
            style={{ ...styles.navItem, ...(activePage === 'payments' ? styles.navItemActive : {}) }}
            onClick={() => { setActivePage('payments'); if (isMobile) setSidebarOpen(false); }}
          >
            <CreditCard size={18} /> Rent Payments
          </button>
          <button
            style={{ ...styles.navItem, ...(activePage === 'water-bill' ? styles.navItemActive : {}) }}
            onClick={() => { setActivePage('water-bill'); if (isMobile) setSidebarOpen(false); }}
          >
            <Droplet size={18} /> Water Bills
          </button>
          <button
            style={{ ...styles.navItem, ...(activePage === 'maintenance' ? styles.navItemActive : {}) }}
            onClick={() => { setActivePage('maintenance'); if (isMobile) setSidebarOpen(false); }}
          >
            <Wrench size={18} /> Maintenance
          </button>
          <button
            style={{ ...styles.navItem, ...(activePage === 'vacate' ? styles.navItemActive : {}) }}
            onClick={() => { setActivePage('vacate'); if (isMobile) setSidebarOpen(false); }}
          >
            <LogOut size={18} /> Vacate Notices
          </button>
          <button
            style={{ ...styles.navItem, ...(activePage === 'notifications' ? styles.navItemActive : {}) }}
            onClick={() => { setActivePage('notifications'); if (isMobile) setSidebarOpen(false); }}
          >
            <Bell size={18} /> Notifications
          </button>
        </nav>

        <div style={styles.userInfo}>
          <div style={styles.userAvatar}>
            <User size={20} color="white" />
          </div>
          <div style={styles.userDetails}>
            <p style={{ margin: 0, fontWeight: '600' }}>{userProfile?.name || 'Caretaker'}</p>
            <p style={{ margin: 0, fontSize: '12px', color: '#9ca3af' }}>{userProfile?.email}</p>
          </div>
        </div>
        <div style={{ ...styles.logoutBtnWrapper, ...(sidebarOpen ? styles.logoutBtnWrapperVisible : {}) }}>
          <button style={styles.logoutBtn} onClick={() => { localStorage.clear(); window.location.href = '/caretaker-login'; }}>
            <LogOut size={18} /> Logout
          </button>
        </div>
      </aside>

      <main style={{
        ...styles.main,
        marginLeft: !isMobile && sidebarOpen ? '260px' : '0',
        width: !isMobile && sidebarOpen ? 'calc(100% - 260px)' : '100%'
      }}>
        <header style={styles.header}>
          <div style={styles.headerLeft}>
            <button style={styles.menuBtn} onClick={() => setSidebarOpen(!sidebarOpen)}>
              <Menu size={24} />
            </button>
            <h1 style={styles.headerTitle}>
              {activePage.charAt(0).toUpperCase() + activePage.slice(1)}
            </h1>
          </div>
          <div style={styles.headerRight}>
            <button style={styles.refreshBtn} onClick={() => window.location.reload()}>
              <RefreshCw size={20} />
            </button>
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
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
        <button style={styles.btnSecondary} onClick={onCreateMaintenance}>
          <Plus size={16} /> Maintenance
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
      <div style={{ ...styles.tabs, marginBottom: '20px' }}>
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
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
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
  const [messageType, setMessageType] = useState('individual');
  const [selectedTenant, setSelectedTenant] = useState('');
  const [messageTitle, setMessageTitle] = useState('');
  const [messageContent, setMessageContent] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendMessage = async () => {
    if (!messageTitle || !messageContent) {
      alert('Please fill in all required fields');
      return;
    }

    if (messageType === 'individual' && !selectedTenant) {
      alert('Please select a tenant');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('joyce-suites-token');
      const recipients = messageType === 'all'
        ? tenants.map(t => t.id)
        : [parseInt(selectedTenant)];

      const response = await fetch(`${config.apiBaseUrl}/api/caretaker/notifications/send-bulk`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          recipient_ids: recipients,
          title: messageTitle,
          message: messageContent,
          type: 'general'
        })
      });

      if (response.ok) {
        alert('Message sent successfully!');
        setMessageTitle('');
        setMessageContent('');
        setSelectedTenant('');
      } else {
        alert('Failed to send message');
      }
    } catch (err) {
      alert('Error sending message');
    } finally {
      setLoading(false);
    }
  };

  const activeTenantsCount = tenants.filter(t => t.is_active).length;

  return (
    <div style={styles.section}>
      <div style={{ marginBottom: '20px' }}>
        <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600' }}>Send Message to Tenants</h3>
      </div>

      <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>Message Type</label>
          <div style={{ display: 'flex', gap: '16px' }}>
            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
              <input
                type="radio"
                value="individual"
                checked={messageType === 'individual'}
                onChange={(e) => setMessageType(e.target.value)}
                style={{ marginRight: '8px' }}
              />
              Send to Individual Tenant
            </label>
            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
              <input
                type="radio"
                value="all"
                checked={messageType === 'all'}
                onChange={(e) => setMessageType(e.target.value)}
                style={{ marginRight: '8px' }}
              />
              Send to All Tenants
            </label>
          </div>
        </div>

        {messageType === 'individual' && (
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>Select Tenant</label>
            <select
              value={selectedTenant}
              onChange={(e) => setSelectedTenant(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px'
              }}
            >
              <option value="">Choose a tenant...</option>
              {tenants.filter(t => t.is_active).map(tenant => (
                <option key={tenant.id} value={tenant.id}>
                  {tenant.name} - Room {tenant.room_number}
                </option>
              ))}
            </select>
          </div>
        )}

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>Message Title</label>
          <input
            type="text"
            value={messageTitle}
            onChange={(e) => setMessageTitle(e.target.value)}
            placeholder="Enter message title..."
            style={{
              width: '100%',
              padding: '10px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '14px'
            }}
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>Message Content</label>
          <textarea
            value={messageContent}
            onChange={(e) => setMessageContent(e.target.value)}
            placeholder="Type your message here..."
            rows={6}
            style={{
              width: '100%',
              padding: '10px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '14px',
              minHeight: '120px',
              resize: 'vertical'
            }}
          />
        </div>

      </div>
    </div>
  );
};





const SendNotificationModal = ({ tenants = [], onClose, onSubmit, loading }) => {
  const [formData, setFormData] = useState({
    tenant_id: '',
    title: '',
    message: '',
    type: 'general'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
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
              <label style={styles.formLabel}>Select Tenant</label>
              <select
                value={formData.tenant_id}
                onChange={(e) => setFormData({ ...formData, tenant_id: e.target.value })}
                required
                style={styles.formSelect}
              >
                <option value="">Choose...</option>
                {tenants.map(t => (
                  <option key={t.tenant_id || t.id} value={t.tenant_id || t.id}>
                    {t.tenant_name || t.name} - {t.room_number || 'No Room'}
                  </option>
                ))}
              </select>
            </div>
            <div style={styles.formGroup}>
              <label style={styles.formLabel}>Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                style={styles.formInput}
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.formLabel}>Message</label>
              <textarea
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                rows="4"
                required
                style={styles.formInput}
              />
            </div>
          </div>
          <div style={styles.modalFooter}>
            <button type="button" style={styles.btnSecondary} onClick={onClose}>Cancel</button>
            <button type="submit" style={styles.btnPrimary} disabled={loading}>
              {loading ? 'Sending...' : 'Send'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const TenantsPage = ({ tenants, paymentStatus, loading, onMarkPayment, onSendNotification, onViewDetails, onCreateVacateNotice }) => {
  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p>Loading tenants...</p>
      </div>
    );
  }

  return (
    <div style={styles.section}>


      {tenants?.length === 0 ? (
        <div style={styles.emptyState}>
          <Users size={48} />
          <p>No tenants found</p>
        </div>
      ) : (
        <div style={styles.tableContainer}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Name</th>
                <th style={styles.th}>Room</th>
                <th style={styles.th}>Rent</th>
                <th style={styles.th}>Payment Status</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {tenants?.map(tenant => (
                <tr key={tenant.id} style={styles.tr}>
                  <td style={styles.td}>
                    <div style={styles.userCell}>
                      <User size={16} />
                      <span>{tenant.name}</span>
                    </div>
                  </td>
                  <td style={styles.td}>{tenant.room_number}</td>
                  <td style={styles.td}>KSh {tenant.rent_amount?.toLocaleString() || '0'}</td>
                  <td style={styles.td}>
                    <span style={{
                      ...styles.statusBadge,
                      backgroundColor: paymentStatus?.[tenant.id]?.status === 'paid' ? '#dcfce7' : '#fef3c7',
                      color: paymentStatus?.[tenant.id]?.status === 'paid' ? '#166534' : '#92400e'
                    }}>
                      {paymentStatus?.[tenant.id]?.status || 'Unknown'}
                    </span>
                  </td>
                  <td style={styles.td}>
                    <div style={styles.actionButtons}>
                      <button style={styles.btnSmallPrimary} onClick={() => onViewDetails(tenant)}>
                        View
                      </button>
                      {paymentStatus?.[tenant.id]?.status !== 'paid' && (
                        <button style={styles.btnSmallSecondary} onClick={() => onMarkPayment(tenant)}>
                          Mark Paid
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

const PropertiesPage = ({ availableRooms, occupiedRooms, allRooms, loading, onViewDetails }) => {
  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p>Loading properties...</p>
      </div>
    );
  }

  return (
    <div style={styles.section}>


      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>Available Rooms ({availableRooms?.length || 0})</h3>
        {availableRooms?.length === 0 ? (
          <div style={styles.emptyState}>
            <Building size={48} />
            <p>No available rooms found</p>
          </div>
        ) : (
          <div style={styles.roomsGrid}>
            {availableRooms?.map(room => (
              <div key={room.id} style={styles.roomCard} onClick={() => onViewDetails(room)}>
                <div style={styles.roomHeader}>
                  <Building size={20} />
                  <span style={styles.roomName}>{room.name}</span>
                  <span style={styles.roomTypeBadge}>{room.property_type}</span>
                </div>
                <div style={styles.roomDetails}>
                  <div style={styles.roomDetail}>
                    <span style={styles.detailLabel}>Monthly Rent:</span>
                    <span style={styles.detailValue}>KSh {room.rent_amount?.toLocaleString() || '0'}</span>
                  </div>
                  <div style={styles.roomDetail}>
                    <span style={styles.detailLabel}>Deposit:</span>
                    <span style={styles.detailValue}>KSh {room.deposit_amount?.toLocaleString() || '0'}</span>
                  </div>
                  <div style={styles.roomDetail}>
                    <span style={styles.detailLabel}>Status:</span>
                    <span style={{ ...styles.statusBadge, backgroundColor: '#dcfce7', color: '#166534' }}>
                      Vacant
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>Occupied Rooms ({occupiedRooms?.length || 0})</h3>
        {occupiedRooms?.length === 0 ? (
          <div style={styles.emptyState}>
            <Home size={48} />
            <p>No occupied rooms found</p>
          </div>
        ) : (
          <div style={styles.roomsGrid}>
            {occupiedRooms?.map(room => (
              <div key={room.id} style={styles.roomCard} onClick={() => onViewDetails(room)}>
                <div style={styles.roomHeader}>
                  <Home size={20} />
                  <span style={styles.roomName}>{room.name}</span>
                  <span style={styles.roomTypeBadge}>{room.property_type}</span>
                </div>
                <div style={styles.roomDetails}>
                  <div style={styles.roomDetail}>
                    <span style={styles.detailLabel}>Monthly Rent:</span>
                    <span style={styles.detailValue}>KSh {room.rent_amount?.toLocaleString() || '0'}</span>
                  </div>
                  <div style={styles.roomDetail}>
                    <span style={styles.detailLabel}>Tenant:</span>
                    <span style={styles.detailValue}>{room.current_tenant || 'N/A'}</span>
                  </div>
                  <div style={styles.roomDetail}>
                    <span style={styles.detailLabel}>Status:</span>
                    <span style={{ ...styles.statusBadge, backgroundColor: '#fef3c7', color: '#92400e' }}>
                      Occupied
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const MarkPaymentModal = ({ tenant, onClose, onSubmit, loading }) => {
  const [formData, setFormData] = useState({
    amount_paid: tenant?.rent_amount || '',
    payment_method: 'Cash',
    payment_reference: '',
    notes: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      tenant_id: tenant.tenant_id || tenant.id,
      ...formData
    });
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.card} onClick={(e) => e.stopPropagation()}>
        <div style={styles.pageHeaderControls}>
          <h3 style={styles.pageTitle}>Mark Rent Payment</h3>
          <button style={styles.closeBtn} onClick={onClose}>×</button>
        </div>
        <div style={{ marginBottom: '16px', padding: '12px', backgroundColor: '#f9fafb', borderRadius: '6px' }}>
          <p style={{ margin: '0 0 4px 0', fontSize: '14px', fontWeight: '600', color: '#374151' }}>
            Tenant: {tenant?.tenant_name || tenant?.name}
          </p>
          <p style={{ margin: 0, fontSize: '13px', color: '#6b7280' }}>
            Room: {tenant?.room_number || 'N/A'}
          </p>
        </div>
        <form onSubmit={handleSubmit}>
          <div style={styles.section}>
            <div style={styles.formGroup}>
              <label style={styles.statLabel}>Amount Paid (KSh)</label>
              <input
                type="number"
                value={formData.amount_paid}
                onChange={(e) => setFormData({ ...formData, amount_paid: e.target.value })}
                required
                style={styles.filterSelect}
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.statLabel}>Payment Method</label>
              <select
                value={formData.payment_method}
                onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
                style={styles.filterSelect}
              >
                <option value="Cash">Cash</option>
                <option value="M-Pesa">M-Pesa</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Cheque">Cheque</option>
              </select>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '20px' }}>
            <button type="button" style={styles.btnSecondary} onClick={onClose}>Cancel</button>
            <button type="submit" style={styles.btnPrimary} disabled={loading}>
              {loading ? 'Processing...' : 'Mark Paid'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const WaterBillPage = () => {
  const [waterBillRecords, setWaterBillRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showReadingModal, setShowReadingModal] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState(null);
  const [tenants, setTenants] = useState([]);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedBillForPayment, setSelectedBillForPayment] = useState(null);
  const [readingForm, setReadingForm] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    previous_reading: '',
    current_reading: '',
    unit_rate: 50.0
  });

  const fetchWaterBillRecords = async () => {
    try {
      setLoading(true);
      const response = await fetchWithAuth(`${config.apiBaseUrl}/api/rent-deposit/water-bill/records`);
      if (response.ok) {
        const data = await response.json();
        setWaterBillRecords(data.records || []);
      }
    } catch (err) { setError('Error fetching water bills'); } finally { setLoading(false); }
  };

  const fetchTenantsForWater = async () => {
    try {
      const response = await fetchWithAuth(`${config.apiBaseUrl}/api/rent-deposit/tenants-with-leases`);
      if (response.ok) {
        const data = await response.json();
        setTenants(data.tenants || []);
      }
    } catch (err) { console.error('Failed to fetch tenants:', err); }
  };

  useEffect(() => {
    fetchWaterBillRecords();
    fetchTenantsForWater();
  }, []);

  const getMonthName = (month) => {
    const months = ['January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'];
    return months[month - 1] || 'Unknown';
  };

  const handleCreateWaterBill = async () => {
    try {
      const tenant = tenants.find(t => t.tenant_id === parseInt(selectedTenant)) || tenants.find(t => t.id === parseInt(selectedTenant));
      if (!tenant) throw new Error("Selected tenant not found");

      const units_consumed = parseFloat(readingForm.current_reading) - parseFloat(readingForm.previous_reading);
      const amount = units_consumed * parseFloat(readingForm.unit_rate);

      const response = await fetchWithAuth(`${config.apiBaseUrl}/api/rent-deposit/water-bill/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenant_id: parseInt(selectedTenant),
          property_id: parseInt(tenant.property_id),
          month: parseInt(readingForm.month),
          year: parseInt(readingForm.year),
          reading_date: new Date().toISOString().split('T')[0],
          previous_reading: parseFloat(readingForm.previous_reading),
          current_reading: parseFloat(readingForm.current_reading),
          units_consumed: units_consumed,
          unit_rate: parseFloat(readingForm.unit_rate),
          amount_due: amount
        })
      });

      if (response.ok) {
        setSuccessMessage('Water bill created!');
        setShowReadingModal(false);
        fetchWaterBillRecords();
      }
    } catch (err) { setError(err.message); }
  };

  const handleRecordPayment = async (billId, paymentData) => {
    try {
      const response = await fetchWithAuth(`${config.apiBaseUrl}/api/rent-deposit/water-bill/mark-payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bill_id: billId, ...paymentData })
      });
      if (response.ok) {
        setSuccessMessage('Payment recorded!');
        setShowPaymentModal(false);
        fetchWaterBillRecords();
      }
    } catch (err) { setError('Failed to record payment'); }
  };

  if (loading) return <div style={styles.loadingContainer}><div style={styles.spinner}></div></div>;

  return (
    <div style={styles.section}>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
        <button onClick={() => setShowReadingModal(true)} style={styles.btnPrimary}>Create Water Bill</button>
      </div>
      {error && <div style={styles.errorBanner}>{error}</div>}
      {successMessage && <div style={styles.successBanner}>{successMessage}</div>}
      <div style={styles.tableWrapper}>
        <table style={styles.table}>
          <thead style={styles.tableHeader}>
            <tr><th>Tenant</th><th>Period</th><th>Units</th><th>Amount</th><th>Status</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {waterBillRecords.map(record => (
              <tr key={record.id} style={styles.tableRow}>
                <td style={styles.td}>{record.tenant_name}</td>
                <td style={styles.td}>{getMonthName(record.month)} {record.year}</td>
                <td style={styles.td}>{record.units_consumed} units</td>
                <td style={styles.td}>KSh {record.amount_due?.toLocaleString()}</td>
                <td style={styles.td}>
                  <span style={{ ...styles.statusBadge, backgroundColor: record.status === 'paid' ? '#dcfce7' : '#fef3c7', color: record.status === 'paid' ? '#166534' : '#92400e' }}>
                    {record.status}
                  </span>
                </td>
                <td style={styles.td}>
                  {record.status !== 'paid' && (
                    <button onClick={() => { setSelectedBillForPayment(record); setShowPaymentModal(true); }} style={styles.btnSuccess}>Pay</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const DepositsPage = () => {
  const [depositRecords, setDepositRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [paymentForm, setPaymentForm] = useState({ amount_paid: '', payment_method: 'Cash' });

  useEffect(() => { fetchDepositRecords(); }, []);

  const fetchDepositRecords = async () => {
    try {
      setLoading(true);
      const response = await fetchWithAuth(`${config.apiBaseUrl}/api/rent-deposit/deposit/records`);
      if (response.ok) {
        const data = await response.json();
        setDepositRecords(data.records || []);
      }
    } catch (err) { setError('Error fetching deposits'); } finally { setLoading(false); }
  };

  const handleMarkPayment = async () => {
    try {
      const response = await fetchWithAuth(`${config.apiBaseUrl}/api/rent-deposit/deposit/mark-payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deposit_id: selectedRecord.id, ...paymentForm })
      });
      if (response.ok) {
        setSuccess('Payment marked!');
        setShowPaymentModal(false);
        fetchDepositRecords();
      }
    } catch (err) { setError(err.message); }
  };

  if (loading) return <div style={styles.loadingContainer}><div style={styles.spinner}></div></div>;

  return (
    <div style={styles.section}>

      {error && <div style={styles.errorBanner}>{error}</div>}
      {success && <div style={styles.successBanner}>{success}</div>}
      <div style={styles.tableWrapper}>
        <table style={styles.table}>
          <thead style={styles.tableHeader}>
            <tr><th>Tenant</th><th>Property</th><th>Required</th><th>Balance</th><th>Status</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {depositRecords.map(r => (
              <tr key={r.id} style={styles.tableRow}>
                <td style={styles.td}>{r.tenant_name}</td>
                <td style={styles.td}>{r.property_name}</td>
                <td style={styles.td}>{r.amount_required}</td>
                <td style={styles.td}>{r.balance}</td>
                <td style={styles.td}>{r.status}</td>
                <td style={styles.td}>
                  <button onClick={() => { setSelectedRecord(r); setShowPaymentModal(true); }} style={styles.btnPrimary}>Pay</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const MaintenancePage = ({ requests, loading, onUpdateStatus, onViewDetails }) => {
  if (loading) return <div style={styles.loadingContainer}><div style={styles.spinner}></div></div>;
  return (
    <div style={styles.section}>

      <div style={styles.tableWrapper}>
        <table style={styles.table}>
          <thead style={styles.tableHeader}>
            <tr><th>ID</th><th>Tenant</th><th>Issue</th><th>Status</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {requests?.map(r => (
              <tr key={r.id} style={styles.tableRow}>
                <td style={styles.td}>#{r.id}</td>
                <td style={styles.td}>{r.tenant_name}</td>
                <td style={styles.td}>{r.issue_type}</td>
                <td style={styles.td}>{r.status}</td>
                <td style={styles.td}>
                  <button onClick={() => onViewDetails(r)} style={styles.btnPrimary}><Eye size={14} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CaretakerDashboard;