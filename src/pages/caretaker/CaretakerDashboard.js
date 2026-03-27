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
  BedDouble, Bath, Square, Layers, MapPin, Droplet, ArrowRight
} from 'lucide-react';



import config from '../../config';
import TenantDetailsModal from '../../components/TenantDetailsModal';

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

const OverviewCard = ({ title, value, icon: Icon, color, subtitle }) => (
  <div style={styles.overviewCard}>
    <div style={{ ...styles.cardIcon, backgroundColor: color + '20', color: color }}>
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
    <span style={{ ...styles.summaryValue, color: color }}>{value}</span>
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
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 24px',
    color: '#9ca3af',
    textDecoration: 'none',
    transition: 'all 0.2s',
    border: 'none',
    background: 'none',
    width: '100%',
    textAlign: 'left',
    cursor: 'pointer'
  },
  navItemActive: {
    color: 'white',
    backgroundColor: '#374151',
    borderLeft: '4px solid #fbbf24'
  },
  userInfo: {
    padding: '20px',
    borderTop: '1px solid #374151',
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  userAvatar: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    backgroundColor: '#374151',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  userDetails: {
    flex: 1,
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column'
  },
  logoutBtnWrapper: {
    padding: '10px 20px 20px',
    display: 'none'
  },
  logoutBtnWrapperVisible: {
    display: 'block'
  },
  logoutBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    color: '#ef4444',
    background: 'none',
    border: 'none',
    padding: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    width: '100%',
    borderRadius: '6px',
    transition: 'background 0.2s'
  },
  main: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh',
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
    zIndex: 50
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px'
  },
  menuBtn: {
    background: 'none',
    border: 'none',
    color: '#6b7280',
    cursor: 'pointer',
    padding: '4px',
    display: 'flex',
    alignItems: 'center'
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
  gridContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '20px',
    marginBottom: '32px'
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
    margin: '0 0 4px 0',
    fontSize: '24px',
    fontWeight: '600',
    color: '#111827'
  },
  cardSubtitle: {
    margin: 0,
    fontSize: '12px',
    color: '#9ca3af'
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
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    flexWrap: 'wrap',
    gap: '12px'
  },
  sectionHeaderControls: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
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
    transition: 'all 0.2s'
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
    maxHeight: 'calc(100vh - 40px)',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
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
    transition: 'all 0.2s'
  },
  formSelect: {
    width: '100%',
    padding: '10px 12px',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    fontSize: '14px',
    backgroundColor: 'white'
  }
};

const spinKeyframes = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = spinKeyframes;
  document.head.appendChild(style);
}


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
          console.log('Success: Caretaker photo found:', data.user.photo_path);
        } else {
          console.log('Info: No caretaker photo found, will use default icon');
        }
      }
    } catch (err) {
      // Failed to fetch user profile
      console.log('Error: Failed to fetch caretaker profile');
    }
  };

  const fetchFinancialSummary = async () => {
    try {
      const data = await apiCall('/api/caretaker/financial-summary');
      if (data && data.success) {
        setFinancialSummary(data.summary);
      }
    } catch (err) {
      console.log('Error: Failed to fetch financial summary');
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
              fetchFinancialSummary().catch(() => { }),
              fetchOverview().catch(() => { });
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
    <div style={styles.container}>
      {/* Sidebar Overlay for Mobile */}
      {isMobile && sidebarOpen && (
        <div
          style={styles.overlay}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside style={{
        ...styles.sidebar,
        ...(isMobile && !sidebarOpen ? styles.sidebarHidden : {})
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
          {[
            { id: 'dashboard', label: 'Dashboard', icon: Home },
            { id: 'properties', label: 'Room Management', icon: Building },
            { id: 'tenants', label: 'Tenants', icon: Users },
            { id: 'payments', label: 'Rent Payments', icon: CreditCard },
            { id: 'water-bill', label: 'Water Bills', icon: Droplet },
            { id: 'maintenance', label: 'Maintenance', icon: Wrench },
            { id: 'vacate', label: 'Vacate Notices', icon: LogOut },
            { id: 'notifications', label: 'Notifications', icon: Bell }
          ].map(item => (
            <button
              key={item.id}
              style={{
                ...styles.navItem,
                ...(activePage === item.id ? styles.navItemActive : {})
              }}
              onClick={() => {
                handlePageChange(item.id);
                if (isMobile) setSidebarOpen(false);
              }}
            >
              <item.icon size={18} />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div style={styles.userInfo}>
          <div style={styles.userAvatar}>
            {userProfile?.photo_path ? (
              <img
                src={`${API_BASE_URL}/${userProfile.photo_path}`}
                alt="Profile"
                style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
              />
            ) : (
              <User size={20} color="white" />
            )}
          </div>
          <div style={styles.userDetails}>
            <p style={{ margin: 0, fontWeight: '600', color: 'white', fontSize: '14px' }}>
              {userProfile?.name || 'Caretaker'}
            </p>
            <p style={{ margin: 0, fontSize: '11px', color: '#9ca3af', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {userProfile?.email}
            </p>
          </div>
        </div>

        <div style={{ ...styles.logoutBtnWrapper, display: 'block' }}>
          <button
            style={styles.logoutBtn}
            onClick={() => { localStorage.clear(); window.location.href = '/caretaker-login'; }}
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main style={{
        ...styles.main,
        marginLeft: isMobile ? 0 : (sidebarOpen ? '260px' : 0),
        width: '100%'
      }}>
        <header style={styles.header}>
          <div style={styles.headerLeft}>
            <button style={styles.menuBtn} onClick={() => setSidebarOpen(!sidebarOpen)}>
              <Menu size={24} />
            </button>
            <button
              style={{
                background: 'none',
                border: 'none',
                color: '#6b7280',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                padding: '8px'
              }}
              onClick={() => handlePageChange('dashboard')}
            >
              <Home size={20} />
            </button>
            <h1 style={styles.headerTitle}>
              {activePage.charAt(0).toUpperCase() + activePage.slice(1).replace('-', ' ')}
            </h1>
          </div>
          <div style={styles.headerRight}>
            <button style={styles.refreshBtn} onClick={() => window.location.reload()}>
              <RefreshCw size={20} />
            </button>
            <div style={styles.notificationBadge}>
              <Bell size={20} color="#6b7280" />
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
            <button style={styles.closeBannerBtn} onClick={() => setError('')}><X size={18} /></button>
          </div>
        )}

        {successMessage && (
          <div style={styles.successBanner}>
            <CheckCircle size={16} />
            <span>{successMessage}</span>
            <button style={styles.closeBannerBtn} onClick={() => setSuccessMessage('')}><X size={18} /></button>
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
        <TenantDetailsModal
          tenant={selectedProperty}
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
  financialSummary,
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
          <Plus size={16} /> Maintenance Request
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

      <div style={styles.dashboardGrid}>
        <div style={styles.dashboardColumn}>
          <div style={styles.section}>
            <div style={styles.sectionHeader}>
              <h3 style={styles.sectionTitle}>
                <Wrench size={18} /> Recent Maintenance ({filteredMaintenance.length})
              </h3>
              <div style={styles.sectionHeaderControls}>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  style={styles.formSelect}
                >
                  <option value="all">All</option>
                  <option value="pending">Pending</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
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
                              style={styles.btnPrimary}
                              onClick={() => onViewDetails(req)}
                              title="View Details"
                            >
                              <Eye size={14} /> View
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
            <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                style={styles.btnSecondary}
                onClick={onViewAllMaintenance || (() => { })}
              >
                View All <ArrowRight size={14} style={{ marginLeft: '8px' }} />
              </button>
            </div>
          </div>
        </div>

        <div style={styles.dashboardColumn}>
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
                            <span style={{
                              ...styles.statusBadge,
                              backgroundColor: '#fef3c7',
                              color: '#92400e'
                            }}>
                              {tenant.pending_payments} payments
                            </span>
                          </td>
                          <td style={styles.td}>
                            <button
                              style={styles.btnPrimary}
                              onClick={() => onMarkPayment(tenant)}
                              title="Mark Payment"
                            >
                              <CheckCircle size={14} /> Pay
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
                              style={styles.btnPrimary}
                              onClick={() => onViewVacateNotice(notice)}
                            >
                              <Eye size={14} /> View
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

  const filteredPayments = (Array.isArray(paymentsToShow) ? paymentsToShow : []).filter(payment =>
    !searchTerm ||
    (payment.tenant_name && payment.tenant_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (payment.room_number && String(payment.room_number).toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const paidCount = (Array.isArray(allPayments) ? allPayments : []).filter(p => p.current_month_paid || p.status === 'paid').length;
  const unpaidCount = (Array.isArray(allPayments) ? allPayments : []).length - paidCount;

  return (
    <>
      <div style={styles.summaryGrid}>
        <SummaryCard
          label="Paid This Month"
          value={paidCount}
          color="#10b981"
        />
        <SummaryCard
          label="Unpaid This Month"
          value={unpaidCount}
          color="#ef4444"
        />
        <SummaryCard
          label="Pending Payments"
          value={pendingPayments.length}
          color="#f59e0b"
        />
        <SummaryCard
          label="Total Tenants"
          value={allPayments.length}
          color="#3b82f6"
        />
      </div>

      <div style={styles.section}>
        <div style={styles.sectionHeader}>
          <div style={styles.tabContainer}>
            <button
              style={activeTab === 'all' ? styles.tabActive : styles.tab}
              onClick={() => setActiveTab('all')}
            >
              All Tenants
            </button>
            <button
              style={activeTab === 'pending' ? styles.tabActive : styles.tab}
              onClick={() => setActiveTab('pending')}
            >
              Pending Only
            </button>
          </div>

          <div style={styles.sectionHeaderControls}>
            <div style={styles.searchWrapper}>
              <Search size={18} style={styles.searchIcon} />
              <input
                type="text"
                placeholder="Search tenant or room..."
                style={styles.searchInput}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead style={styles.tableHeader}>
              <tr>
                <th style={styles.th}>Tenant</th>
                <th style={styles.th}>Room</th>
                <th style={styles.th}>Monthly Rent</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Last Payment</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPayments.length > 0 ? (
                filteredPayments.map((payment) => (
                  <tr key={payment.tenant_id || payment.id} style={styles.tableRow}>
                    <td style={styles.td}>
                      <div style={{ fontWeight: '500', color: '#111827' }}>{payment.tenant_name}</div>
                    </td>
                    <td style={styles.td}>{payment.room_number || 'N/A'}</td>
                    <td style={styles.td}>KSh {payment.monthly_rent?.toLocaleString() || payment.amount?.toLocaleString() || '0'}</td>
                    <td style={styles.td}>
                      <span style={{
                        ...styles.statusBadge,
                        backgroundColor: (payment.current_month_paid || payment.status === 'paid') ? '#dcfce7' : '#fef3c7',
                        color: (payment.current_month_paid || payment.status === 'paid') ? '#166534' : '#92400e'
                      }}>
                        {payment.current_month_paid || payment.status === 'paid' ? 'Paid' : 'Unpaid'}
                        {payment.pending_payments > 0 && ` (${payment.pending_payments} pending)`}
                      </span>
                    </td>
                    <td style={styles.td}>
                      {payment.last_payment_date ?
                        new Date(payment.last_payment_date).toLocaleDateString() :
                        'Never'
                      }
                    </td>
                    <td style={styles.td}>
                      {!(payment.current_month_paid || payment.status === 'paid') && (
                        <button
                          style={styles.btnPrimary}
                          onClick={() => onMarkPayment(payment)}
                        >
                          Mark Paid
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" style={{ ...styles.td, textAlign: 'center', color: '#6b7280', padding: '32px' }}>
                    No matching payment records found
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

  const filtered = (Array.isArray(notices) ? notices : []).filter(notice => {
    const statusMatch = filterStatus === 'all' || notice.status === filterStatus;
    const searchMatch = !searchTerm ||
      (notice.tenant_name && notice.tenant_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (notice.property_name && notice.property_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (notice.room_number && String(notice.room_number).toLowerCase().includes(searchTerm.toLowerCase()));
    return statusMatch && searchMatch;
  });

  const summary = {
    pending: (Array.isArray(notices) ? notices : []).filter(n => n.status === 'pending').length,
    approved: (Array.isArray(notices) ? notices : []).filter(n => n.status === 'approved').length,
    rejected: (Array.isArray(notices) ? notices : []).filter(n => n.status === 'rejected').length,
    total: (Array.isArray(notices) ? notices : []).length
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
          title="Total Notices"
          value={summary.total}
          icon={FileText}
          color="#3b82f6"
        />
      </div>

      <div style={styles.section}>
        <div style={styles.sectionHeader}>
          <div style={styles.tabContainer}>
            <button
              style={filterStatus === 'all' ? styles.tabActive : styles.tab}
              onClick={() => setFilterStatus('all')}
            >
              All Notices
            </button>
            <button
              style={filterStatus === 'pending' ? styles.tabActive : styles.tab}
              onClick={() => setFilterStatus('pending')}
            >
              Pending
            </button>
            <button
              style={filterStatus === 'approved' ? styles.tabActive : styles.tab}
              onClick={() => setFilterStatus('approved')}
            >
              Approved
            </button>
          </div>

          <div style={styles.sectionHeaderControls}>
            <div style={styles.searchWrapper}>
              <Search size={18} style={styles.searchIcon} />
              <input
                type="text"
                placeholder="Search tenant or room..."
                style={styles.searchInput}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead style={styles.tableHeader}>
              <tr>
                <th style={styles.th}>Tenant</th>
                <th style={styles.th}>Room / Property</th>
                <th style={styles.th}>Vacate Date</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Created</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length > 0 ? (
                filtered.map((notice) => (
                  <tr key={notice.id} style={styles.tableRow}>
                    <td style={styles.td}>
                      <div style={{ fontWeight: '500', color: '#111827' }}>{notice.tenant_name}</div>
                    </td>
                    <td style={styles.td}>
                      <div>{notice.room_number || 'N/A'}</div>
                      <div style={{ fontSize: '12px', color: '#6b7280' }}>{notice.property_name}</div>
                    </td>
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
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          style={styles.btnPrimary}
                          onClick={() => onViewDetails(notice)}
                          title="View Details"
                        >
                          <Eye size={14} />
                        </button>
                        {notice.status === 'pending' && (
                          <>
                            <button
                              style={{ ...styles.btnPrimary, backgroundColor: '#10b981' }}
                              onClick={() => onUpdateStatus(notice.id, 'approve')}
                              title="Approve"
                            >
                              <Check size={14} />
                            </button>
                            <button
                              style={{ ...styles.btnPrimary, backgroundColor: '#ef4444' }}
                              onClick={() => onUpdateStatus(notice.id, 'reject')}
                              title="Reject"
                            >
                              <X size={14} />
                            </button>
                          </>
                        )}
                        {notice.status === 'approved' && (
                          <button
                            style={{ ...styles.btnPrimary, backgroundColor: '#3b82f6' }}
                            onClick={() => onUpdateStatus(notice.id, 'complete')}
                            title="Mark Complete"
                          >
                            <ShieldCheck size={14} />
                          </button>
                        )}
                        <button
                          style={{ ...styles.btnPrimary, backgroundColor: '#9ca3af' }}
                          onClick={() => onDelete(notice.id)}
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" style={{ ...styles.td, textAlign: 'center', color: '#6b7280', padding: '32px' }}>
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
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSendMessage = async () => {
    if (!messageTitle || !messageContent) {
      alert('Please fill in all required fields');
      return;
    }

    if (messageType === 'individual' && !selectedTenant) {
      alert('Please select a tenant');
      return;
    }

    setIsSubmitting(true);
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
      console.error('Error sending message:', err);
      alert('Error sending message');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={styles.section}>
      <div style={styles.sectionHeader}>
        <h3 style={styles.sectionTitle}>Send Message to Tenants</h3>
      </div>

      <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#374151' }}>
            Recipients
          </label>
          <div style={{ display: 'flex', gap: '24px' }}>
            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', gap: '8px' }}>
              <input
                type="radio"
                value="individual"
                checked={messageType === 'individual'}
                onChange={(e) => setMessageType(e.target.value)}
              />
              <span style={{ fontSize: '14px' }}>Single Tenant</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', gap: '8px' }}>
              <input
                type="radio"
                value="all"
                checked={messageType === 'all'}
                onChange={(e) => setMessageType(e.target.value)}
              />
              <span style={{ fontSize: '14px' }}>All Active Tenants</span>
            </label>
          </div>
        </div>

        {messageType === 'individual' && (
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#374151' }}>
              Select Tenant
            </label>
            <select
              value={selectedTenant}
              onChange={(e) => setSelectedTenant(e.target.value)}
              style={styles.formSelect}
            >
              <option value="">Choose a tenant...</option>
              {(Array.isArray(tenants) ? tenants : []).filter(t => t.is_active).map(tenant => (
                <option key={tenant.id} value={tenant.id}>
                  {tenant.name} - Room {tenant.room_number || 'N/A'}
                </option>
              ))}
            </select>
          </div>
        )}

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#374151' }}>
            Subject / Title
          </label>
          <input
            type="text"
            value={messageTitle}
            onChange={(e) => setMessageTitle(e.target.value)}
            placeholder="e.g., Routine Maintenance Notice"
            style={styles.formInput}
          />
        </div>

        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#374151' }}>
            Message Content
          </label>
          <textarea
            value={messageContent}
            onChange={(e) => setMessageContent(e.target.value)}
            placeholder="Type your message here..."
            rows={6}
            style={{ ...styles.formInput, minHeight: '120px', resize: 'vertical' }}
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button
            onClick={handleSendMessage}
            disabled={isSubmitting}
            style={{
              ...styles.btnPrimary,
              padding: '10px 24px',
              opacity: isSubmitting ? 0.7 : 1
            }}
          >
            {isSubmitting ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <RefreshCw size={16} className="animate-spin" /> Sending...
              </span>
            ) : (
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Send size={16} /> Send Announcement
              </span>
            )}
          </button>
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
          <h3>Send Direct Notification</h3>
          <button style={styles.modalClose} onClick={onClose}><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div style={styles.modalBody}>
            <div style={styles.formGroup}>
              <label style={styles.formLabel}>Recipient</label>
              <select
                value={formData.tenant_id}
                onChange={(e) => setFormData({ ...formData, tenant_id: e.target.value })}
                required
                style={styles.formSelect}
              >
                <option value="">Choose a tenant...</option>
                {tenants.map(t => (
                  <option key={t.tenant_id || t.id} value={t.tenant_id || t.id}>
                    {t.tenant_name || t.name} - {t.room_number || 'No Room'}
                  </option>
                ))}
              </select>
            </div>
            <div style={styles.formGroup}>
              <label style={styles.formLabel}>Subject</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                placeholder="e.g., Payment Received"
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
                placeholder="Type your message..."
                style={styles.formInput}
              />
            </div>
          </div>
          <div style={styles.modalFooter}>
            <button type="button" style={styles.btnSecondary} onClick={onClose}>Cancel</button>
            <button type="submit" style={styles.btnPrimary} disabled={loading}>
              {loading ? 'Sending...' : 'Send Message'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const TenantsPage = ({ tenants, paymentStatus, loading, onMarkPayment, onSendNotification, onViewDetails, onCreateVacateNotice }) => {
  const [searchTerm, setSearchTerm] = useState('');

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p>Loading tenants...</p>
      </div>
    );
  }

  const filteredTenants = (Array.isArray(tenants) ? tenants : []).filter(tenant =>
    !searchTerm ||
    (tenant.name && tenant.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (tenant.room_number && String(tenant.room_number).toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div style={styles.section}>
      <div style={styles.sectionHeader}>
        <h3 style={styles.sectionTitle}>
          <Users size={18} /> Resident Directory ({filteredTenants.length})
        </h3>
        <div style={styles.sectionHeaderControls}>
          <div style={styles.searchWrapper}>
            <Search size={18} style={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search by name or room..."
              style={styles.searchInput}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button style={styles.btnSecondary} onClick={onSendNotification}>
            <Bell size={16} /> Bulk Notify
          </button>
        </div>
      </div>

      <div style={styles.tableWrapper}>
        <table style={styles.table}>
          <thead style={styles.tableHeader}>
            <tr>
              <th style={styles.th}>Name</th>
              <th style={styles.th}>Room</th>
              <th style={styles.th}>Monthly Rent</th>
              <th style={styles.th}>Financial Status</th>
              <th style={styles.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredTenants.length > 0 ? (
              filteredTenants.map((tenant) => (
                <tr key={tenant.id} style={styles.tableRow}>
                  <td style={styles.td}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        backgroundColor: '#f3f4f6',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#6b7280'
                      }}>
                        <User size={16} />
                      </div>
                      <span style={{ fontWeight: '500', color: '#111827' }}>{tenant.name}</span>
                    </div>
                  </td>
                  <td style={styles.td}>{tenant.room_number || 'N/A'}</td>
                  <td style={styles.td}>KSh {tenant.rent_amount?.toLocaleString() || '0'}</td>
                  <td style={styles.td}>
                    <span style={{
                      ...styles.statusBadge,
                      backgroundColor: paymentStatus?.[tenant.id]?.status === 'paid' ? '#dcfce7' : '#fef3c7',
                      color: paymentStatus?.[tenant.id]?.status === 'paid' ? '#166534' : '#92400e'
                    }}>
                      {paymentStatus?.[tenant.id]?.status === 'paid' ? 'Clear' : 'Overdue'}
                    </span>
                  </td>
                  <td style={styles.td}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        style={styles.btnPrimary}
                        onClick={() => onViewDetails(tenant)}
                        title="View Profile"
                      >
                        <Eye size={14} /> View
                      </button>
                      {paymentStatus?.[tenant.id]?.status !== 'paid' && (
                        <button
                          style={{ ...styles.btnPrimary, backgroundColor: '#10b981' }}
                          onClick={() => onMarkPayment(tenant)}
                          title="Record Payment"
                        >
                          <DollarSign size={14} /> Pay
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" style={{ ...styles.td, textAlign: 'center', color: '#6b7280', padding: '32px' }}>
                  No residents found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
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
      <div style={styles.sectionHeader}>
        <h3 style={styles.sectionTitle}>
          <Building size={18} /> Available Rooms ({availableRooms?.length || 0})
        </h3>
      </div>
      {availableRooms?.length === 0 ? (
        <div style={styles.emptyState}>
          <Building size={48} color="#9ca3af" />
          <p>No available rooms found</p>
        </div>
      ) : (
        <div style={styles.roomsGrid}>
          {availableRooms?.map(room => (
            <div key={room.id} style={styles.roomCard} onClick={() => onViewDetails(room)}>
              <div style={styles.roomHeader}>
                <div style={styles.roomIconWrapper}>
                  <Building size={20} />
                </div>
                <div style={styles.roomMeta}>
                  <span style={styles.roomName}>{room.name}</span>
                  <span style={styles.roomTypeBadge}>{room.property_type || 'Residential'}</span>
                </div>
              </div>
              <div style={styles.roomDetails}>
                <div style={styles.roomDetail}>
                  <span style={styles.detailLabel}>Monthly Rent</span>
                  <span style={styles.detailValue}>KSh {room.rent_amount?.toLocaleString() || '0'}</span>
                </div>
                <div style={styles.roomDetail}>
                  <span style={styles.detailLabel}>Status</span>
                  <span style={{ ...styles.statusBadge, backgroundColor: '#dcfce7', color: '#166534' }}>
                    Vacant
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div style={{ ...styles.sectionHeader, marginTop: '32px' }}>
        <h3 style={styles.sectionTitle}>
          <Home size={18} /> Occupied Rooms ({occupiedRooms?.length || 0})
        </h3>
      </div>
      {occupiedRooms?.length === 0 ? (
        <div style={styles.emptyState}>
          <Home size={48} color="#9ca3af" />
          <p>No occupied rooms found</p>
        </div>
      ) : (
        <div style={styles.roomsGrid}>
          {occupiedRooms?.map(room => (
            <div key={room.id} style={styles.roomCard} onClick={() => onViewDetails(room)}>
              <div style={styles.roomHeader}>
                <div style={{ ...styles.roomIconWrapper, backgroundColor: '#eff6ff', color: '#3b82f6' }}>
                  <Home size={20} />
                </div>
                <div style={styles.roomMeta}>
                  <span style={styles.roomName}>{room.name}</span>
                  <span style={styles.roomTypeBadge}>{room.property_type || 'Residential'}</span>
                </div>
              </div>
              <div style={styles.roomDetails}>
                <div style={styles.roomDetail}>
                  <span style={styles.detailLabel}>Tenant</span>
                  <span style={styles.detailValue}>{room.tenant_name || 'N/A'}</span>
                </div>
                <div style={styles.roomDetail}>
                  <span style={styles.detailLabel}>Status</span>
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
    <div style={styles.modalOverlay} onClick={onClose}>
      <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div style={styles.modalHeader}>
          <h3>Record Rent Payment</h3>
          <button style={styles.modalClose} onClick={onClose}><X size={20} /></button>
        </div>
        <div style={{ padding: '16px 24px', backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ margin: 0, fontSize: '13px', color: '#6b7280' }}>Tenant</p>
              <p style={{ margin: 0, fontWeight: '600', color: '#111827' }}>{tenant?.tenant_name || tenant?.name}</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ margin: 0, fontSize: '13px', color: '#6b7280' }}>Room</p>
              <p style={{ margin: 0, fontWeight: '600', color: '#111827' }}>{tenant?.room_number || 'N/A'}</p>
            </div>
          </div>
        </div>
        <form onSubmit={handleSubmit}>
          <div style={styles.modalBody}>
            <div style={styles.formGroup}>
              <label style={styles.formLabel}>Amount (KSh)</label>
              <input
                type="number"
                value={formData.amount_paid}
                onChange={(e) => setFormData({ ...formData, amount_paid: e.target.value })}
                required
                placeholder="0.00"
                style={styles.formInput}
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.formLabel}>Payment Channel</label>
              <select
                value={formData.payment_method}
                onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
                style={styles.formSelect}
              >
                <option value="Cash">Cash Payment</option>
                <option value="M-Pesa">M-Pesa STK/Paybill</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Cheque">Bank Cheque</option>
              </select>
            </div>
            <div style={styles.formGroup}>
              <label style={styles.formLabel}>Reference Number (Optional)</label>
              <input
                type="text"
                value={formData.payment_reference}
                onChange={(e) => setFormData({ ...formData, payment_reference: e.target.value })}
                placeholder="e.g., M-Pesa Transaction ID"
                style={styles.formInput}
              />
            </div>
          </div>
          <div style={styles.modalFooter}>
            <button type="button" style={styles.btnSecondary} onClick={onClose}>Discard</button>
            <button type="submit" style={styles.btnPrimary} disabled={loading}>
              {loading ? 'Processing...' : 'Confirm Receipt'}
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
  const [selectedTenant, setSelectedTenant] = useState('');
  const [tenants, setTenants] = useState([]);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedBillForPayment, setSelectedBillForPayment] = useState(null);
  const [readingForm, setReadingForm] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    previous_reading: '',
    current_reading: '',
    unit_rate: 100.0
  });

  const fetchWaterBillRecords = async () => {
    try {
      setLoading(true);
      const response = await fetchWithAuth(`${config.apiBaseUrl}/api/rent-deposit/water-bill/records`);
      if (response.ok) {
        const data = await response.json();
        setWaterBillRecords(data.records || []);
      }
    } catch (err) {
      setError('Error connecting to water billing service');
    } finally {
      setLoading(false);
    }
  };

  const fetchTenantsForWater = async () => {
    try {
      const currentDate = new Date();
      const month = currentDate.getMonth() + 1;
      const year = currentDate.getFullYear();
      
      const response = await fetchWithAuth(`${config.apiBaseUrl}/api/rent-deposit/water-bill/tenants-with-readings?month=${month}&year=${year}`);
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setTenants(data.tenants || []);
        }
      }
    } catch (err) {
      console.error('Error fetching tenants for water readings:', err);
    }
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
      if (!tenant) throw new Error("Please select a valid resident");

      const units_consumed = parseFloat(readingForm.current_reading) - parseFloat(readingForm.previous_reading);
      if (units_consumed < 0) throw new Error("Current reading cannot be less than previous reading");

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
        setSuccessMessage('Water bill generated successfully!');
        setShowReadingModal(false);
        fetchWaterBillRecords();
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        const errData = await response.json();
        throw new Error(errData.message || 'Failed to create bill');
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const handleRecordPayment = async (billId, paymentData) => {
    try {
      const response = await fetchWithAuth(`${config.apiBaseUrl}/api/rent-deposit/water-bill/mark-payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bill_id: billId, ...paymentData })
      });
      if (response.ok) {
        setSuccessMessage('Water bill payment recorded!');
        setShowPaymentModal(false);
        fetchWaterBillRecords();
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (err) {
      setError('Failed to process payment');
    }
  };

  if (loading) return <div style={styles.loadingContainer}><div style={styles.spinner}></div></div>;

  return (
    <div style={styles.section}>
      <div style={styles.sectionHeader}>
        <h3 style={styles.sectionTitle}>
          <Droplet size={18} /> Water Billing Records
        </h3>
        <button onClick={() => setShowReadingModal(true)} style={styles.btnPrimary}>
          <Plus size={16} /> New Reading
        </button>
      </div>

      {error && <div style={styles.errorBanner}><AlertCircle size={16} /> {error}</div>}
      {successMessage && <div style={styles.successBanner}><CheckCircle size={16} /> {successMessage}</div>}

      <div style={styles.tableWrapper}>
        <table style={styles.table}>
          <thead style={styles.tableHeader}>
            <tr>
              <th style={styles.th}>Resident</th>
              <th style={styles.th}>Billing Period</th>
              <th style={styles.th}>Consumption</th>
              <th style={styles.th}>Amount</th>
              <th style={styles.th}>Status</th>
              <th style={styles.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {waterBillRecords.length > 0 ? (
              waterBillRecords.map(record => (
                <tr key={record.id} style={styles.tableRow}>
                  <td style={styles.td}>{record.tenant_name}</td>
                  <td style={styles.td}>{getMonthName(record.month)} {record.year}</td>
                  <td style={styles.td}>{record.units_consumed} Units</td>
                  <td style={styles.td}>KSh {record.amount_due?.toLocaleString()}</td>
                  <td style={styles.td}>
                    <span style={{
                      ...styles.statusBadge,
                      backgroundColor: record.status === 'paid' ? '#dcfce7' : '#fef3c7',
                      color: record.status === 'paid' ? '#166534' : '#92400e'
                    }}>
                      {record.status}
                    </span>
                  </td>
                  <td style={styles.td}>
                    {record.status !== 'paid' && (
                      <button
                        onClick={() => { setSelectedBillForPayment(record); setShowPaymentModal(true); }}
                        style={{ ...styles.btnPrimary, backgroundColor: '#10b981' }}
                      >
                        Record Pay
                      </button>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" style={{ ...styles.td, textAlign: 'center', color: '#6b7280', padding: '32px' }}>
                  No water billing records found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showReadingModal && (
        <div style={styles.modalOverlay} onClick={() => setShowReadingModal(false)}>
          <div style={styles.modalContent} onClick={e => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h3>Entry New Meter Reading</h3>
              <button style={styles.modalClose} onClick={() => setShowReadingModal(false)}><X size={20} /></button>
            </div>
            <div style={styles.modalBody}>
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Select Resident</label>
                <select
                  value={selectedTenant}
                  onChange={e => setSelectedTenant(e.target.value)}
                  style={styles.formSelect}
                >
                  <option value="">Choose resident...</option>
                  {tenants.map(t => (
                    <option key={t.id || t.tenant_id} value={t.id || t.tenant_id}>
                      {t.name || t.tenant_name} - {t.room_number}
                    </option>
                  ))}
                </select>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>Previous Reading</label>
                  <input
                    type="number"
                    value={readingForm.previous_reading}
                    onChange={e => setReadingForm({ ...readingForm, previous_reading: e.target.value })}
                    style={styles.formInput}
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>Current Reading</label>
                  <input
                    type="number"
                    value={readingForm.current_reading}
                    onChange={e => setReadingForm({ ...readingForm, current_reading: e.target.value })}
                    style={styles.formInput}
                  />
                </div>
              </div>
            </div>
            <div style={styles.modalFooter}>
              <button style={styles.btnSecondary} onClick={() => setShowReadingModal(false)}>Cancel</button>
              <button style={styles.btnPrimary} onClick={handleCreateWaterBill}>Generate Bill</button>
            </div>
          </div>
        </div>
      )}
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
    } catch (err) { setError('Error fetching security deposit data'); } finally { setLoading(false); }
  };

  const handleMarkPayment = async () => {
    try {
      const response = await fetchWithAuth(`${config.apiBaseUrl}/api/rent-deposit/deposit/mark-payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deposit_id: selectedRecord.id, ...paymentForm })
      });
      if (response.ok) {
        setSuccess('Deposit payment recorded!');
        setShowPaymentModal(false);
        fetchDepositRecords();
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err) { alert(err.message); }
  };

  if (loading) return <div style={styles.loadingContainer}><div style={styles.spinner}></div></div>;

  return (
    <div style={styles.section}>
      <div style={styles.sectionHeader}>
        <h3 style={styles.sectionTitle}>
          <ShieldCheck size={18} /> Tenant Security Deposits
        </h3>
      </div>

      {error && <div style={styles.errorBanner}><AlertCircle size={16} /> {error}</div>}
      {success && <div style={styles.successBanner}><CheckCircle size={16} /> {success}</div>}

      <div style={styles.tableWrapper}>
        <table style={styles.table}>
          <thead style={styles.tableHeader}>
            <tr>
              <th style={styles.th}>Resident</th>
              <th style={styles.th}>Room</th>
              <th style={styles.th}>Target Deposit</th>
              <th style={styles.th}>Current Balance</th>
              <th style={styles.th}>Status</th>
              <th style={styles.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {depositRecords.length > 0 ? (
              depositRecords.map(r => (
                <tr key={r.id} style={styles.tableRow}>
                  <td style={styles.td}>{r.tenant_name}</td>
                  <td style={styles.td}>{r.property_name}</td>
                  <td style={styles.td}>KSh {r.amount_required?.toLocaleString()}</td>
                  <td style={styles.td}>KSh {r.balance?.toLocaleString()}</td>
                  <td style={styles.td}>
                    <span style={{
                      ...styles.statusBadge,
                      backgroundColor: r.status === 'fully_paid' ? '#dcfce7' : '#fef3c7',
                      color: r.status === 'fully_paid' ? '#166534' : '#92400e'
                    }}>
                      {r.status?.replace('_', ' ')}
                    </span>
                  </td>
                  <td style={styles.td}>
                    {r.status !== 'fully_paid' && (
                      <button
                        onClick={() => { setSelectedRecord(r); setShowPaymentModal(true); }}
                        style={styles.btnPrimary}
                      >
                        Take Deposit
                      </button>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" style={{ ...styles.td, textAlign: 'center', color: '#6b7280', padding: '32px' }}>
                  No deposit records found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showPaymentModal && (
        <div style={styles.modalOverlay} onClick={() => setShowPaymentModal(false)}>
          <div style={styles.modalContent} onClick={e => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h3>Record Deposit Installment</h3>
              <button style={styles.modalClose} onClick={() => setShowPaymentModal(false)}><X size={20} /></button>
            </div>
            <div style={styles.modalBody}>
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Amount (KSh)</label>
                <input
                  type="number"
                  placeholder="Enter amount paid"
                  value={paymentForm.amount_paid}
                  onChange={e => setPaymentForm({ ...paymentForm, amount_paid: e.target.value })}
                  style={styles.formInput}
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Method</label>
                <select
                  value={paymentForm.payment_method}
                  onChange={e => setPaymentForm({ ...paymentForm, payment_method: e.target.value })}
                  style={styles.formSelect}
                >
                  <option value="Cash">Cash</option>
                  <option value="M-Pesa">M-Pesa</option>
                  <option value="Bank">Bank Deposit</option>
                </select>
              </div>
            </div>
            <div style={styles.modalFooter}>
              <button style={styles.btnSecondary} onClick={() => setShowPaymentModal(false)}>Cancel</button>
              <button style={styles.btnPrimary} onClick={handleMarkPayment}>Commit Payment</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const MaintenancePage = ({ requests, loading, onUpdateStatus, onViewDetails }) => {
  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p>Loading maintenance requests...</p>
      </div>
    );
  }

  return (
    <div style={styles.section}>
      <div style={styles.sectionHeader}>
        <h3 style={styles.sectionTitle}>
          <Wrench size={18} /> Active Maintenance Tickets
        </h3>
      </div>

      <div style={styles.tableWrapper}>
        <table style={styles.table}>
          <thead style={styles.tableHeader}>
            <tr>
              <th style={styles.th}>ID</th>
              <th style={styles.th}>Resident</th>
              <th style={styles.th}>Issue Categorization</th>
              <th style={styles.th}>Ticket Status</th>
              <th style={styles.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {(Array.isArray(requests) ? requests : []).length > 0 ? (
              requests.map(r => (
                <tr key={r.id} style={styles.tableRow}>
                  <td style={styles.td}>#{r.id}</td>
                  <td style={styles.td}>{r.tenant_name}</td>
                  <td style={styles.td}>{r.issue_type?.toUpperCase()} - {r.title}</td>
                  <td style={styles.td}>
                    <span style={{
                      ...styles.statusBadge,
                      backgroundColor:
                        r.status === 'completed' ? '#dcfce7' :
                          r.status === 'in_progress' ? '#dbeafe' : '#fef3c7',
                      color:
                        r.status === 'completed' ? '#166534' :
                          r.status === 'in_progress' ? '#1e40af' : '#92400e'
                    }}>
                      {r.status?.replace('_', ' ')}
                    </span>
                  </td>
                  <td style={styles.td}>
                    <button
                      onClick={() => onViewDetails(r)}
                      style={styles.btnPrimary}
                    >
                      <Eye size={14} /> Handle
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" style={{ ...styles.td, textAlign: 'center', color: '#6b7280', padding: '32px' }}>
                  No active maintenance tickets
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CaretakerDashboard;