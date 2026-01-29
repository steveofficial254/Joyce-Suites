import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Menu, LogOut, X, Bell, Eye, Edit, Trash2, Filter, Search,
  Download, Mail, Phone, FileText, ArrowLeft, User, Send,
  Check, AlertCircle, Home, Plus, Calendar, DollarSign,
  Building, Users, CreditCard, Key, CheckCircle, Clock, UserPlus,
  RefreshCw, XCircle, Wrench, AlertTriangle, UserX, MessageSquare,
  TrendingUp, PieChart, FileSpreadsheet, DoorOpen, List, Droplet
} from 'lucide-react';

import config from '../../config';

const API_BASE_URL = config.apiBaseUrl;

// AdminRentDeposit Component (simplified version)
const AdminRentDeposit = ({ defaultTab = 'rent' }) => {
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    setLoading(false);
  }, [activeTab]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '4px solid #f3f4f6',
          borderTop: '4px solid #3b82f6',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
      </div>
    );
  }

  return (
    <div>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px'
      }}>
        <h2 style={{ margin: 0, fontSize: '24px', fontWeight: '600', color: '#111827' }}>
          {activeTab === 'rent' && 'Rent Management'}
          {activeTab === 'deposit' && 'Deposit Management'}
          {activeTab === 'water' && 'Water Bill Management'}
        </h2>
      </div>

      <div style={{
        display: 'flex',
        borderBottom: '1px solid #e5e7eb',
        marginBottom: '24px'
      }}>
        <button
          style={{
            padding: '12px 24px',
            border: 'none',
            backgroundColor: 'transparent',
            color: activeTab === 'rent' ? '#3b82f6' : '#6b7280',
            cursor: 'pointer',
            borderBottom: activeTab === 'rent' ? '2px solid #3b82f6' : '2px solid transparent',
            fontSize: '14px',
            fontWeight: '500',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
          onClick={() => setActiveTab('rent')}
        >
          <DollarSign size={16} />
          Rent Records
        </button>
        <button
          style={{
            padding: '12px 24px',
            border: 'none',
            backgroundColor: 'transparent',
            color: activeTab === 'deposit' ? '#3b82f6' : '#6b7280',
            cursor: 'pointer',
            borderBottom: activeTab === 'deposit' ? '2px solid #3b82f6' : '2px solid transparent',
            fontSize: '14px',
            fontWeight: '500',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
          onClick={() => setActiveTab('deposit')}
        >
          <FileText size={16} />
          Deposits
        </button>
        <button
          style={{
            padding: '12px 24px',
            border: 'none',
            backgroundColor: 'transparent',
            color: activeTab === 'water' ? '#3b82f6' : '#6b7280',
            cursor: 'pointer',
            borderBottom: activeTab === 'water' ? '2px solid #3b82f6' : '2px solid transparent',
            fontSize: '14px',
            fontWeight: '500',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
          onClick={() => setActiveTab('water')}
        >
          <Droplet size={16} />
          Water Bills
        </button>
      </div>

      <div style={{
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        padding: '20px'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '200px',
          color: '#6b7280'
        }}>
          <div style={{ textAlign: 'center' }}>
            <FileText size={48} style={{ marginBottom: '16px', color: '#d1d5db' }} />
            <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>
              {activeTab === 'rent' && 'Rent Records'}
              {activeTab === 'deposit' && 'Deposit Management'}
              {activeTab === 'water' && 'Water Bill Management'}
            </h3>
            <p style={{ fontSize: '14px' }}>
              {activeTab === 'rent' && 'Rent management functionality will be available here'}
              {activeTab === 'deposit' && 'Deposit management functionality will be available here'}
              {activeTab === 'water' && 'Water bill management functionality will be available here'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// AdminMaintenancePage Component (simplified version)
const AdminMaintenancePage = ({ requests, loading, onUpdateStatus, onViewDetails }) => {
  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '400px',
        flexDirection: 'column',
        gap: '20px'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '4px solid #f3f4f6',
          borderTop: '4px solid #3b82f6',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
        <p style={{ color: '#6b7280', fontSize: '16px' }}>Loading maintenance requests...</p>
      </div>
    );
  }

  return (
    <div>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px'
      }}>
        <h2 style={{
          margin: 0,
          fontSize: '24px',
          fontWeight: '600',
          color: '#111827'
        }}>
          Maintenance Requests ({requests?.length || 0})
        </h2>
      </div>

      <div style={{
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        padding: '20px'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '200px',
          color: '#6b7280'
        }}>
          <div style={{ textAlign: 'center' }}>
            <Wrench size={48} style={{ marginBottom: '16px', color: '#d1d5db' }} />
            <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>
              Maintenance Management
            </h3>
            <p style={{ fontSize: '14px' }}>
              Maintenance request management functionality will be available here
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const AdminDashboard = () => {
  const navigate = useNavigate();
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
  const [userProfile, setUserProfile] = useState(null);


  const [overview, setOverview] = useState(null);
  const [tenants, setTenants] = useState([]);
  const [contracts, setContracts] = useState([]);
  const [paymentReport, setPaymentReport] = useState(null);
  const [occupancyReport, setOccupancyReport] = useState(null);
  const [availableRooms, setAvailableRooms] = useState([]);
  const [maintenanceRequests, setMaintenanceRequests] = useState([]);
  const [vacateNotices, setVacateNotices] = useState([]);
  const [notifications, setNotifications] = useState([]);


  const [selectedTenant, setSelectedTenant] = useState(null);
  const [showTenantModal, setShowTenantModal] = useState(false);
  const [showCreateTenantModal, setShowCreateTenantModal] = useState(false);
  const [showCreateLeaseModal, setShowCreateLeaseModal] = useState(false);
  const [tenantForLease, setTenantForLease] = useState(null);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [selectedMaintenanceRequest, setSelectedMaintenanceRequest] = useState(null);
  const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);
  const [selectedVacateNotice, setSelectedVacateNotice] = useState(null);
  const [showVacateModal, setShowVacateModal] = useState(false);
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [showInquiryModal, setShowInquiryModal] = useState(false);

  const getToken = () => {
    return localStorage.getItem('token') || localStorage.getItem('joyce-suites-token');
  };


  const apiCall = async (endpoint, options = {}) => {
    const token = getToken();
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
        // Unauthorized - redirecting to login
        localStorage.clear();
        window.location.href = '/admin-login';
        return null;
      }

      const data = await response.json();


      if (!response.ok) {
        throw new Error(data.error || data.message || `HTTP ${response.status}`);
      }

      return data;
    } catch (err) {
      // API call error
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
      }
    } catch (err) {
      // Failed to fetch user profile
    }
  };


  const markAsRead = async (id) => {
    try {
      await apiCall(`/api/auth/notifications/${id}/read`, { method: 'PUT' });
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, is_read: true } : n)
      );
    } catch (err) {
      // Failed to mark notification
    }
  };


  const fetchOverview = async () => {
    try {
      const data = await apiCall('/api/admin/overview');
      if (data && data.success) {
        setOverview(data.overview);
      }
    } catch (err) {
      // Failed to fetch overview
    }
  };

  const fetchTenants = async () => {
    try {
      const data = await apiCall('/api/admin/tenants?page=1&per_page=100');
      if (data && data.success) {
        setTenants(data.tenants || []);
      }
    } catch (err) {
      // Failed to fetch tenants
    }
  };

  const fetchContracts = async () => {
    try {
      const data = await apiCall('/api/admin/contracts?page=1&per_page=100');
      if (data && data.success) {
        setContracts(data.contracts || []);
      }
    } catch (err) {
      // Failed to fetch contracts
    }
  };

  const fetchPaymentReport = async () => {
    try {
      const data = await apiCall('/api/admin/payments/report');
      if (data && data.success) {
        setPaymentReport(data.report);
      }
    } catch (err) {
      // Failed to fetch payment report
    }
  };

  const fetchOccupancyReport = async () => {
    try {
      const data = await apiCall('/api/admin/occupancy/report');
      if (data && data.success) {
        setOccupancyReport(data.report);
      }
    } catch (err) {
      // Failed to fetch occupancy report
    }
  };

  const fetchAvailableRooms = async () => {
    try {
      const data = await apiCall('/api/caretaker/rooms/available');
      if (data && data.success) {
        setAvailableRooms(data.available_rooms || []);
      }
    } catch (err) {
      // Failed to fetch rooms
    }
  };

  const fetchMaintenanceRequests = async () => {
    try {
      const data = await apiCall('/api/caretaker/maintenance?page=1&per_page=100');
      if (data && data.success) {
        setMaintenanceRequests(data.requests || []);
      }
    } catch (err) {
      // Error occurred
    }
  };

  const fetchVacateNotices = async () => {
    try {
      const data = await apiCall('/api/admin/vacate-notices?page=1&per_page=100');
      if (data && data.success) {
        setVacateNotices(data.notices || []);
      }
    } catch (err) {
      // Error occurred
    }
  };

  const fetchTenantDetails = async (tenantId) => {
    setLoading(true);
    try {
      const data = await apiCall(`/api/admin/tenant/${tenantId}`);
      if (data && data.success) {
        setSelectedTenant(data.tenant);
        setShowTenantModal(true);
      }
    } catch (err) {
      // Failed to fetch tenant details
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTenant = async (tenantId) => {
    if (!window.confirm('Are you sure you want to delete this tenant?')) {
      return;
    }

    try {
      const data = await apiCall(`/api/admin/tenant/delete/${tenantId}`, { method: 'DELETE' });
      if (data && data.success) {
        setSuccessMessage('Tenant deleted successfully');
        setTenants(tenants.filter(t => t.id !== tenantId));

        await fetchAvailableRooms();
        await fetchOverview();
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (err) {
      // Failed to delete tenant
    }
  };

  const handleCreateTenant = async (tenantData) => {
    try {
      setLoading(true);
      const data = await apiCall('/api/admin/tenant/create', {
        method: 'POST',
        body: JSON.stringify({
          email: tenantData.email,
          password: tenantData.password,
          full_name: tenantData.name,
          phone: tenantData.phone,
          national_id: tenantData.national_id,
          room_number: tenantData.room_number
        })
      });

      if (data && data.success) {
        setSuccessMessage('Tenant created successfully');
        await fetchTenants();
        await fetchOverview();
        setShowCreateTenantModal(false);
        setTimeout(() => setSuccessMessage(''), 3000);

        const createLease = window.confirm('Create lease for this new tenant now?');
        if (createLease) {
          setTenantForLease(data.tenant);
          await fetchAvailableRooms();
          setShowCreateLeaseModal(true);
        }
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateLease = async (leaseData) => {
    try {
      setLoading(true);
      const data = await apiCall('/api/admin/lease/create', {
        method: 'POST',
        body: JSON.stringify(leaseData)
      });

      if (data && data.success) {
        setSuccessMessage(`Lease created successfully! Tenant can now sign the lease.`);
        await fetchContracts();
        await fetchTenants();
        await fetchAvailableRooms();
        await fetchOverview();
        setShowCreateLeaseModal(false);
        setTenantForLease(null);
        setTimeout(() => setSuccessMessage(''), 5000);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
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

  const handleSendNotification = async (notificationData) => {
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
  };

  const handleUpdateVacateNoticeStatus = async (noticeId, newStatus, notes = '') => {
    try {
      const data = await apiCall(`/api/admin/vacate-notices/${noticeId}`, {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus, admin_notes: notes })
      });

      if (data && data.success) {
        setSuccessMessage(`Vacate notice ${newStatus} successfully`);
        await fetchVacateNotices();
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (err) {
      console.error('Failed to update vacate notice:', err);
    }
  };

  const handlePageChange = (pageId) => {
    setActivePage(pageId);
    setSidebarOpen(false);
  };

  const handleLogout = async () => {
    try {
      const token = getToken();
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
      navigate('/admin-login');
    }
  };

  useEffect(() => {
    const token = getToken();
    if (!token) {
      console.error('No token found - redirecting to login');
      navigate('/admin-login');
      return;
    }

    const fetchPageData = async () => {
      setLoading(true);
      try {
        switch (activePage) {
          case 'dashboard':
            await Promise.all([
              fetchOverview().catch(() => {}),
              fetchMaintenanceRequests().catch(() => {}),
              fetchAvailableRooms().catch(() => {}),
              fetchTenants().catch(() => {}),
              fetchPaymentReport().catch(() => {}),
              fetchOccupancyReport().catch(() => {}),
              fetchContracts().catch(() => {}),
              fetchUserProfile().catch(() => {})
            ]);
            break;
          case 'contracts':
            await Promise.all([fetchContracts(), fetchTenants()]);
            break;
          case 'reports':
            await Promise.all([fetchPaymentReport(), fetchOccupancyReport()]);
            break;
          case 'rent-deposit':
          case 'water-bill':
            // AdminRentDeposit handles its own data fetching
            break;
          case 'properties':
            await fetchAvailableRooms();
            break;
          case 'maintenance':
            await fetchMaintenanceRequests();
            break;
          case 'notifications':
            await fetchTenants();
            break;
          case 'vacate':
            await Promise.all([fetchVacateNotices(), fetchTenants()]);
            break;
          case 'messages':
            await fetchNotifications();
            break;
          default:
            break;
        }
      } catch (error) {
        console.error("Error fetching page data:", error);
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
            paymentReport={paymentReport}
            occupancyReport={occupancyReport}
            tenants={tenants}
            loading={loading}
            onDeleteTenant={handleDeleteTenant}
            onViewTenant={fetchTenantDetails}
            onCreateLease={(tenant) => {
              setTenantForLease(tenant);
              fetchAvailableRooms();
              setShowCreateLeaseModal(true);
            }}
            onCreateTenant={() => setShowCreateTenantModal(true)}
            vacateNotices={vacateNotices}
            maintenanceRequests={maintenanceRequests}
          />
        );
      case 'contracts':
        return <ContractsPage contracts={contracts} tenants={tenants} loading={loading} />;
      case 'reports':
        return (
          <ReportsPage
            paymentReport={paymentReport}
            occupancyReport={occupancyReport}
            loading={loading}
            tenants={tenants}
          />
        );
      case 'rent-deposit':
        return <AdminRentDeposit defaultTab="rent" />;
      case 'water-bill':
        return <AdminRentDeposit defaultTab="water" />;
      case 'properties':
        return <PropertiesPage availableRooms={availableRooms} loading={loading} />;
      case 'maintenance':
        return (
          <AdminMaintenancePage
            requests={maintenanceRequests}
            loading={loading}
            onUpdateStatus={handleUpdateMaintenanceStatus}
            onViewDetails={(request) => {
              setSelectedMaintenanceRequest(request);
              setShowMaintenanceModal(true);
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
      case 'vacate':
        return (
          <VacateNoticesPage
            notices={vacateNotices}
            tenants={tenants}
            loading={loading}
            onUpdateStatus={handleUpdateVacateNoticeStatus}
            onViewDetails={(notice) => {
              setSelectedVacateNotice(notice);
              setShowVacateModal(true);
            }}
          />
        );
      case 'messages':
        return renderMessages();
      default:
        return null;
    }
  };

  const renderMessages = () => {
    const inquiries = notifications.filter(n => n.notification_type === 'inquiry');

    return (
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-6">Inquiries & Messages</h2>

        {inquiries.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
            <MessageSquare size={48} className="mx-auto mb-4 opacity-50" />
            <p>No inquiries found.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {inquiries.map(msg => (
              <div
                key={msg.id}
                style={{
                  ...styles.inquiryCard,
                  borderLeft: msg.is_read ? '1px solid #e5e7eb' : '4px solid #3b82f6',
                  backgroundColor: msg.is_read ? 'white' : '#eff6ff'
                }}
                onClick={() => {
                  setSelectedInquiry(msg);
                  setShowInquiryModal(true);
                  if (!msg.is_read) markAsRead(msg.id);
                }}
              >
                <div style={styles.inquiryHeader}>
                  <div style={styles.senderInfo}>
                    <div style={styles.avatar}>
                      {msg.sender_name ? msg.sender_name[0].toUpperCase() : 'U'}
                    </div>
                    <div style={styles.msgMeta}>
                      <span style={styles.senderName}>{msg.sender_name || 'Guest User'}</span>
                      <span style={styles.msgTime}>
                        {new Date(msg.created_at).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                      </span>
                      {msg.title.toLowerCase().includes('booking') && (
                        <span style={{
                          ...styles.subjectBadge,
                          backgroundColor: '#dcfce7',
                          color: '#166534'
                        }}>Booking Request</span>
                      )}
                      {!msg.title.toLowerCase().includes('booking') && (
                        <span style={{
                          ...styles.subjectBadge,
                          backgroundColor: '#f3f4f6',
                          color: '#4b5563'
                        }}>{msg.title}</span>
                      )}
                    </div>
                  </div>
                  {!msg.is_read && (
                    <span className="flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-blue-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
                    </span>
                  )}
                </div>
                <div style={styles.msgPreview}>
                  {msg.message.length > 180 ? `${msg.message.substring(0, 180)}...` : msg.message}
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
                  <span style={{ fontSize: '13px', color: '#2563eb', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    View Details <ArrowLeft size={14} style={{ transform: 'rotate(180deg)' }} />
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={styles.container}>
      <aside style={{
        ...styles.sidebar,
        ...(isMobile ? { display: 'none' } : (sidebarOpen ? {} : styles.sidebarHidden))
      }}>
        <div style={styles.sidebarHeader}>
          <h2 style={styles.sidebarTitle}>Joyce Suites</h2>
          {!isMobile && (
            <button style={styles.closeBtn} onClick={() => setSidebarOpen(false)}>
              <X size={24} />
            </button>
          )}
        </div>

        <nav style={styles.nav}>
          {[
            { id: 'dashboard', label: 'Dashboard', icon: Home },
            { id: 'contracts', label: 'Leases', icon: FileText },
            { id: 'rent-deposit', label: 'Rent & Deposits', icon: DollarSign },
            { id: 'water-bill', label: 'Water Bills', icon: Droplet },
            { id: 'maintenance', label: 'Maintenance', icon: Wrench },
            { id: 'vacate', label: 'Vacate Notices', icon: DoorOpen },
            { id: 'notifications', label: 'Notifications', icon: Bell },
            { id: 'reports', label: 'Reports', icon: FileSpreadsheet },
            { id: 'properties', label: 'Properties', icon: Building },
            { id: 'financial-summary', label: 'Financial Summary', icon: TrendingUp },
            { id: 'messages', label: 'Inquiries', icon: MessageSquare }
          ].map(item => (
            <button
              key={item.id}
              style={{
                ...styles.navItem,
                ...(activePage === item.id ? styles.navItemActive : {})
              }}
              onClick={() => handlePageChange(item.id)}
              title={!sidebarOpen ? item.label : ''}
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
                style={{ 
                  width: '36px', 
                  height: '36px', 
                  borderRadius: '50%',
                  objectFit: 'cover'
                }}
              />
            ) : (
              <User size={20} />
            )}
          </div>
          <div style={styles.userDetails}>
            <strong>{userProfile?.full_name || 'Admin'}</strong>
            <small>{userProfile?.email || 'Joyce Suites'}</small>
          </div>
        </div>

        <div style={{ ...styles.logoutBtnWrapper, ...(sidebarOpen && styles.logoutBtnWrapperVisible) }}>
          <button style={styles.logoutBtn} onClick={handleLogout}>
            <LogOut size={18} /> <span style={{ display: sidebarOpen ? 'inline' : 'none' }}>Logout</span>
          </button>
        </div>
      </aside>

      <main style={{
        ...styles.main,
        marginLeft: isMobile ? 0 : (sidebarOpen ? '260px' : 0),
        width: '100%'
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
            <h1 style={styles.headerTitle}>Admin Dashboard</h1>
          </div>
          <div style={styles.headerRight}>
            <button style={styles.refreshBtn} onClick={() => {
              if (activePage === 'dashboard') {
                fetchOverview();
                fetchTenants();
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
              { id: 'contracts', label: 'Leases', icon: FileText },
              { id: 'maintenance', label: 'Requests', icon: Wrench },
              { id: 'vacate', label: 'Vacate', icon: DoorOpen },
              { id: 'messages', label: 'Inquiries', icon: MessageSquare },
              { id: 'properties', label: 'Rooms', icon: Building },
              { id: 'reports', label: 'Reports', icon: FileSpreadsheet }
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
              style={{ ...styles.mobileNavItem, backgroundColor: '#ef4444' }}
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

      {showTenantModal && selectedTenant && (
        <TenantDetailsModal
          tenant={selectedTenant}
          onClose={() => {
            setShowTenantModal(false);
            setSelectedTenant(null);
          }}
        />
      )}

      {showCreateTenantModal && (
        <CreateTenantModal
          onClose={() => setShowCreateTenantModal(false)}
          onSubmit={handleCreateTenant}
          loading={loading}
        />
      )}

      {showCreateLeaseModal && tenantForLease && (
        <CreateLeaseModal
          tenant={tenantForLease}
          rooms={availableRooms}
          onClose={() => {
            setShowCreateLeaseModal(false);
            setTenantForLease(null);
          }}
          onSubmit={handleCreateLease}
          loading={loading}
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

      {showVacateModal && selectedVacateNotice && (
        <VacateNoticeDetailsModal
          notice={selectedVacateNotice}
          onClose={() => {
            setShowVacateModal(false);
            setSelectedVacateNotice(null);
          }}
          onUpdateStatus={handleUpdateVacateNoticeStatus}
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
  paymentReport,
  occupancyReport,
  tenants,
  loading,
  onDeleteTenant,
  onViewTenant,
  onCreateLease,
  onCreateTenant,
  vacateNotices,
  maintenanceRequests
}) => {
  const [searchTerm, setSearchTerm] = useState('');
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
            <p style={{ color: '#6b7280', fontSize: '14px' }}>
              Check console for errors
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

  const filteredTenants = tenants.filter(function (t) {
    const statusMatch = filterStatus === 'all' ||
      (filterStatus === 'active' ? t.is_active : !t.is_active);
    const searchMatch =
      (t.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t.room_number || '').toString().includes(searchTerm);

    return statusMatch && searchMatch;
  });


  const activeTenantsCount = tenants.filter(function (t) {
    return t.is_active;
  }).length || 0;


  const successRate = paymentReport && paymentReport.total_payments > 0
    ? Math.round((paymentReport.successful / paymentReport.total_payments) * 100)
    : 0;


  const pendingVacate = vacateNotices ? vacateNotices.filter(function (n) {
    return n.status === 'pending';
  }) : [];


  const recentMaintenance = maintenanceRequests ? maintenanceRequests.slice(0, 5) : [];

  return (
    <>
      <div style={styles.pageHeader}>
        <h2 style={styles.pageTitle}>System Overview</h2>
        <div style={styles.actionButtons}>
          <button style={styles.btnSecondary} onClick={() => window.print()}>
            <Download size={16} /> Export Report
          </button>
          <button style={styles.btnPrimary} onClick={onCreateTenant}>
            <UserPlus size={16} /> Add New Tenant
          </button>
        </div>
      </div>

      <div style={styles.gridContainer}>
        <OverviewCard
          title="Total Tenants"
          value={overview.total_tenants || 0}
          icon={Users}
          color="#3b82f6"
          subtitle={"Active: " + (activeTenantsCount)}
        />
        <OverviewCard
          title="Active Leases"
          value={overview.active_leases || 0}
          icon={FileText}
          color="#10b981"
        />
        <OverviewCard
          title="Pending Maintenance"
          value={overview.pending_maintenance || 0}
          icon={Wrench}
          color="#f59e0b"
        />
        <OverviewCard
          title="Total Revenue"
          value={"KSh " + ((overview.total_revenue || 0).toLocaleString())}
          icon={DollarSign}
          color="#8b5cf6"
        />
        <OverviewCard
          title="Occupancy Rate"
          value={(occupancyReport ? occupancyReport.occupancy_rate : 0) + "%"}
          icon={Building}
          color="#06b6d4"
          subtitle={(occupancyReport ? occupancyReport.occupied : 0) + " of " + (occupancyReport ? occupancyReport.total_properties : 0) + " rooms"}
        />
        <OverviewCard
          title="Payment Success Rate"
          value={successRate + "%"}
          icon={CheckCircle}
          color="#ec4899"
        />
      </div>

      <div style={styles.dashboardGrid}>
        { }
        <div style={styles.dashboardColumn}>
          {paymentReport && (
            <div style={styles.section}>
              <h3 style={styles.sectionTitle}>
                <PieChart size={18} /> Payment Summary
              </h3>
              <div style={styles.summaryGrid}>
                <SummaryCard label="Total Payments" value={paymentReport.total_payments || 0} />
                <SummaryCard label="Successful" value={paymentReport.successful || 0} color="#10b981" />
                <SummaryCard label="Pending" value={paymentReport.pending || 0} color="#f59e0b" />
                <SummaryCard label="Failed" value={paymentReport.failed || 0} color="#ef4444" />
                <SummaryCard
                  label="Total Collected"
                  value={"KSh " + ((paymentReport.total_amount || 0).toLocaleString())}
                  color="#3b82f6"
                />
                <SummaryCard
                  label="Success Rate"
                  value={successRate + "%"}
                  color="#8b5cf6"
                />
              </div>
            </div>
          )}

          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>
              <TrendingUp size={18} /> Quick Stats
            </h3>
            <div style={styles.quickStats}>
              <div style={styles.quickStat}>
                <span style={styles.quickStatLabel}>Pending Vacate Notices</span>
                <span style={styles.quickStatValue}>{pendingVacate.length}</span>
              </div>
              <div style={styles.quickStat}>
                <span style={styles.quickStatLabel}>Available Rooms</span>
                <span style={styles.quickStatValue}>{occupancyReport ? occupancyReport.vacant : 0}</span>
              </div>
              <div style={styles.quickStat}>
                <span style={styles.quickStatLabel}>Avg. Monthly Rent</span>
                <span style={styles.quickStatValue}>KSh 5,250</span>
              </div>
            </div>
          </div>
        </div>

        { }
        <div style={styles.dashboardColumn}>
          <div style={styles.section}>
            <div style={styles.sectionHeaderControls}>
              <h3 style={styles.sectionTitle}>
                <Users size={18} /> Tenant Management ({filteredTenants.length})
              </h3>
              <div style={styles.tableControls}>
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
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  style={styles.filterSelect}
                >
                  <option value="all">All</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>

            <div style={styles.tableWrapper}>
              <table style={styles.table}>
                <thead style={styles.tableHeader}>
                  <tr>
                    <th style={styles.th}>Full Name</th>
                    <th style={styles.th}>Email</th>
                    <th style={styles.th}>Room</th>
                    <th style={styles.th}>Status</th>
                    <th style={styles.th}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTenants.slice(0, 5).map(function (tenant) {
                    return (
                      <tr key={tenant.id} style={styles.tableRow}>
                        <td style={styles.td}>{tenant.name || 'N/A'}</td>
                        <td style={styles.td}>{tenant.email}</td>
                        <td style={styles.td}>Room {tenant.room_number || 'N/A'}</td>
                        <td style={styles.td}>
                          <span style={{
                            ...styles.statusBadge,
                            backgroundColor: tenant.is_active ? '#dcfce7' : '#fee2e2',
                            color: tenant.is_active ? '#166534' : '#991b1b'
                          }}>
                            {tenant.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td style={styles.td}>
                          <div style={styles.actionButtons}>
                            <button
                              style={styles.btnSmallPrimary}
                              onClick={() => onViewTenant(tenant.id)}
                              title="View Details"
                            >
                              <Eye size={14} />
                            </button>
                            <button
                              style={{
                                ...styles.btnSmallDanger,
                                backgroundColor: '#fee2e2',
                                color: '#dc2626',
                                border: '1px solid #fecaca',
                                borderRadius: '6px',
                                padding: '6px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}
                              onClick={() => onDeleteTenant(tenant.id)}
                              title="Delete Tenant"
                            >
                              <Trash2 size={14} />
                            </button>
                            <button
                              style={styles.btnSmallSuccess}
                              onClick={() => onCreateLease(tenant)}
                              title="Create Lease"
                            >
                              <FileText size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredTenants.length > 5 && (
                    <tr>
                      <td colSpan="5" style={{ ...styles.td, textAlign: 'center' }}>
                        <button style={styles.btnText} onClick={() => window.location.hash = '#tenants'}>
                          {"View all " + filteredTenants.length + " tenants →"}
                        </button>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      { }
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>Recent Activities</h3>
        <div style={styles.activitiesGrid}>
          {recentMaintenance.length > 0 && (
            <div style={styles.activityCard}>
              <h4 style={styles.activityTitle}>Recent Maintenance</h4>
              {recentMaintenance.map(function (req) {
                return (
                  <div key={req.id} style={styles.activityItem}>
                    <span>{req.title}</span>
                    <span style={{
                      ...styles.statusBadge,
                      backgroundColor: req.status === 'pending' ? '#fef3c7' : '#dcfce7',
                      color: req.status === 'pending' ? '#92400e' : '#166534'
                    }}>
                      {req.status}
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          {pendingVacate.length > 0 && (
            <div style={styles.activityCard}>
              <h4 style={styles.activityTitle}>Pending Vacate Notices</h4>
              {pendingVacate.slice(0, 3).map(function (notice) {
                return (
                  <div key={notice.id} style={styles.activityItem}>
                    <span>Room {notice.lease ? notice.lease.room_number : 'N/A'}</span>
                    <span style={styles.textMuted}>
                      {notice.vacate_date ? new Date(notice.vacate_date).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
};


const ContractsPage = ({ contracts, tenants, loading }) => {
  const [filterStatus, setFilterStatus] = useState('all');

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p>Loading contracts...</p>
      </div>
    );
  }

  const filtered = filterStatus === 'all'
    ? contracts
    : contracts.filter(function (c) {
      return c.status === filterStatus;
    });

  const enhancedContracts = filtered.map(function (contract) {
    const tenant = tenants.find(function (t) {
      return t.id === contract.tenant_id;
    });
    return {
      ...contract,
      tenant_name: tenant ? tenant.name : contract.tenant_name || 'Unknown'
    };
  });

  return (
    <>
      <div style={styles.pageHeaderControls}>
        <h2 style={styles.pageTitle}>Lease Contracts ({enhancedContracts.length})</h2>
        <div style={styles.filterSection}>
          <label style={styles.filterLabel}><Filter size={16} /> Filter:</label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            style={styles.filterSelect}
          >
            <option value="all">All</option>
            <option value="active">Active</option>
            <option value="expired">Expired</option>
            <option value="terminated">Terminated</option>
          </select>
        </div>
      </div>

      <div style={styles.section}>
        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead style={styles.tableHeader}>
              <tr>
                <th style={styles.th}>ID</th>
                <th style={styles.th}>Tenant</th>
                <th style={styles.th}>Property</th>
                <th style={styles.th}>Start Date</th>
                <th style={styles.th}>Rent</th>
                <th style={styles.th}>Deposit</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Signed</th>
              </tr>
            </thead>
            <tbody>
              {enhancedContracts.length > 0 ? (
                enhancedContracts.map(function (c) {
                  return (
                    <tr key={c.id} style={styles.tableRow}>
                      <td style={styles.td}>#{c.id}</td>
                      <td style={styles.td}>{c.tenant_name}</td>
                      <td style={styles.td}>{c.property_name}</td>
                      <td style={styles.td}>{c.start_date ? new Date(c.start_date).toLocaleDateString() : 'N/A'}</td>
                      <td style={styles.td}>KSh {(c.rent_amount || 0).toLocaleString()}</td>
                      <td style={styles.td}>KSh {((c.rent_amount * 1.07) || 0).toLocaleString()}</td>
                      <td style={styles.td}>
                        <span style={{
                          ...styles.statusBadge,
                          backgroundColor: c.status === 'active' ? '#dcfce7' : '#fee2e2',
                          color: c.status === 'active' ? '#166534' : '#991b1b'
                        }}>
                          {c.status}
                        </span>
                      </td>
                      <td style={styles.td}>
                        <span style={{
                          ...styles.statusBadge,
                          backgroundColor: c.signed_by_tenant ? '#dcfce7' : '#fef3c7',
                          color: c.signed_by_tenant ? '#166534' : '#92400e'
                        }}>
                          {c.signed_by_tenant ? 'Signed' : 'Pending'}
                        </span>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="8" style={{ ...styles.td, textAlign: 'center', padding: '40px' }}>
                    No contracts found
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


const VacateNoticesPage = ({ notices, tenants, loading, onUpdateStatus, onViewDetails }) => {
  const [filterStatus, setFilterStatus] = useState('all');

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p>Loading vacate notices...</p>
      </div>
    );
  }


  const noticesList = notices || [];

  const filtered = filterStatus === 'all'
    ? noticesList
    : noticesList.filter(function (n) {
      return n.status === filterStatus;
    });

  const statusColor = function (status) {
    switch (status) {
      case 'pending': return { bg: '#fef3c7', color: '#92400e' };
      case 'approved': return { bg: '#dbeafe', color: '#1e40af' };
      case 'rejected': return { bg: '#fee2e2', color: '#991b1b' };
      case 'completed': return { bg: '#dcfce7', color: '#166534' };
      default: return { bg: '#f3f4f6', color: '#4b5563' };
    }
  };

  return (
    <>
      <div style={styles.pageHeaderControls}>
        <h2 style={styles.pageTitle}>Vacate Notices ({filtered.length})</h2>
        <div style={styles.filterSection}>
          <label style={styles.filterLabel}>Status:</label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            style={styles.filterSelect}
          >
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      <div style={styles.section}>
        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead style={styles.tableHeader}>
              <tr>
                <th style={styles.th}>ID</th>
                <th style={styles.th}>Tenant</th>
                <th style={styles.th}>Room</th>
                <th style={styles.th}>Vacate Date</th>
                <th style={styles.th}>Days Left</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length > 0 ? (
                filtered.map(function (notice) {
                  const colors = statusColor(notice.status);
                  const daysLeft = notice.vacate_date
                    ? Math.ceil((new Date(notice.vacate_date) - new Date()) / (1000 * 60 * 60 * 24))
                    : 0;

                  return (
                    <tr key={notice.id} style={styles.tableRow}>
                      <td style={styles.td}>#{notice.id}</td>
                      <td style={styles.td}>{notice.tenant_name || 'Unknown'}</td>
                      <td style={styles.td}>Room {notice.room_number || 'N/A'}</td>
                      <td style={styles.td}>
                        {notice.vacate_date ? new Date(notice.vacate_date).toLocaleDateString() : 'N/A'}
                      </td>
                      <td style={styles.td}>
                        <span style={{
                          ...styles.statusBadge,
                          backgroundColor: daysLeft <= 7 ? '#fee2e2' : daysLeft <= 30 ? '#fef3c7' : '#dcfce7',
                          color: daysLeft <= 7 ? '#991b1b' : daysLeft <= 30 ? '#92400e' : '#166534'
                        }}>
                          {daysLeft} days
                        </span>
                      </td>
                      <td style={styles.td}>
                        <span style={{
                          ...styles.statusBadge,
                          backgroundColor: colors.bg,
                          color: colors.color
                        }}>
                          {notice.status}
                        </span>
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
                                onClick={() => onUpdateStatus(notice.id, 'approved')}
                                title="Approve"
                              >
                                <Check size={14} />
                              </button>
                              <button
                                style={styles.btnSmallDanger}
                                onClick={() => onUpdateStatus(notice.id, 'rejected')}
                                title="Reject"
                              >
                                <X size={14} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="7" style={{ ...styles.td, textAlign: 'center', padding: '40px' }}>
                    <div style={{ padding: '40px 20px', textAlign: 'center' }}>
                      <DoorOpen size={48} color="#9ca3af" />
                      <p style={{ marginTop: '16px', color: '#6b7280' }}>
                        No vacate notices found
                      </p>
                      <p style={{ color: '#9ca3af', fontSize: '14px', marginTop: '8px' }}>
                        The vacate notices API endpoint may not be implemented yet
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


const NotificationsPage = ({ tenants, onSendNotification }) => {
  const activeTenantsCount = tenants.filter(function (t) {
    return t.is_active;
  }).length;

  return (
    <>
      <div style={styles.pageHeader}>
        <h2 style={styles.pageTitle}>Notifications</h2>
        <button style={styles.btnPrimary} onClick={onSendNotification}>
          <Send size={16} /> Send Notification
        </button>
      </div>

      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>Send notifications to tenants</h3>
        <p style={{ color: '#6b7280', marginBottom: '20px' }}>
          You can send notifications to all tenants, specific tenants, or the caretaker.
        </p>
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


const ReportsPage = ({ paymentReport, occupancyReport, loading, tenants }) => {
  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p>Loading reports...</p>
      </div>
    );
  }


  const occupancyStats = occupancyReport ? {
    total: occupancyReport.total_properties || 0,
    occupied: occupancyReport.occupied || 0,
    vacant: occupancyReport.vacant || 0,
    occupancyRate: occupancyReport.occupancy_rate || 0,
    activeLeases: occupancyReport.active_leases || 0,
    vacantRate: occupancyReport.total_properties > 0
      ? Math.round((occupancyReport.vacant / occupancyReport.total_properties) * 100)
      : 0
  } : null;


  const paymentStats = paymentReport ? {
    total: paymentReport.total_payments || 0,
    successful: paymentReport.successful || 0,
    pending: paymentReport.pending || 0,
    failed: paymentReport.failed || 0,
    totalAmount: paymentReport.total_amount || 0,
    successRate: paymentReport.total_payments > 0
      ? Math.round((paymentReport.successful / paymentReport.total_payments) * 100)
      : 0,
    avgPayment: paymentReport.successful > 0
      ? Math.round(paymentReport.total_amount / paymentReport.successful)
      : 0
  } : null;

  return (
    <>
      <h2 style={styles.pageTitle}>Reports & Analytics</h2>

      {paymentStats && (
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>
            <DollarSign size={18} /> Payment Report
          </h3>
          <div style={styles.summaryGrid}>
            <SummaryCard label="Total Payments" value={paymentStats.total} />
            <SummaryCard label="Successful" value={paymentStats.successful} color="#10b981" />
            <SummaryCard label="Pending" value={paymentStats.pending} color="#f59e0b" />
            <SummaryCard label="Failed" value={paymentStats.failed} color="#ef4444" />
            <SummaryCard
              label="Total Amount"
              value={"KSh " + paymentStats.totalAmount.toLocaleString()}
              color="#3b82f6"
            />
            <SummaryCard
              label="Success Rate"
              value={paymentStats.successRate + "%"}
              color="#8b5cf6"
            />
            <SummaryCard
              label="Average Payment"
              value={"KSh " + paymentStats.avgPayment.toLocaleString()}
              color="#06b6d4"
            />
            <SummaryCard
              label="Collection Efficiency"
              value={(paymentStats.total > 0 ? Math.round((paymentStats.successful / tenants.length * 100)) : 0) + "%"}
              color="#ec4899"
            />
          </div>
        </div>
      )}

      {occupancyStats && (
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>
            <Building size={18} /> Occupancy Report
          </h3>
          <div style={styles.summaryGrid}>
            <SummaryCard label="Total Properties" value={occupancyStats.total} />
            <SummaryCard label="Occupied" value={occupancyStats.occupied} color="#10b981" />
            <SummaryCard label="Vacant" value={occupancyStats.vacant} color="#f59e0b" />
            <SummaryCard label="Active Leases" value={occupancyStats.activeLeases} color="#3b82f6" />
            <SummaryCard
              label="Occupancy Rate"
              value={occupancyStats.occupancyRate + "%"}
              color="#8b5cf6"
            />
            <SummaryCard
              label="Vacant Rate"
              value={occupancyStats.vacantRate + "%"}
              color="#ef4444"
            />
            <SummaryCard
              label="Room Utilization"
              value={(occupancyStats.total > 0 ? Math.round((occupancyStats.occupied / occupancyStats.total) * 100) : 0) + "%"}
              color="#06b6d4"
            />
            <SummaryCard
              label="Lease Coverage"
              value={(occupancyStats.total > 0 ? Math.round((occupancyStats.activeLeases / occupancyStats.occupied) * 100) : 0) + "%"}
              color="#ec4899"
            />
          </div>
        </div>
      )}

      { }
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>Financial Summary</h3>
        <div style={styles.financialSummary}>
          <div style={styles.financialCard}>
            <h4>Monthly Revenue Potential</h4>
            <p style={styles.financialValue}>
              {"KSh " + (occupancyStats ? (occupancyStats.total * 5250).toLocaleString() : '0')}
            </p>
            <small style={styles.financialNote}>Based on average rent of KSh 5,250</small>
          </div>
          <div style={styles.financialCard}>
            <h4>Collection Rate</h4>
            <p style={{ ...styles.financialValue, color: paymentStats?.successRate > 80 ? '#10b981' : '#f59e0b' }}>
              {(paymentStats ? paymentStats.successRate : 0) + "%"}
            </p>
            <small style={styles.financialNote}>Payment success rate</small>
          </div>
          <div style={styles.financialCard}>
            <h4>Revenue per Room</h4>
            <p style={styles.financialValue}>
              {"KSh " + (paymentStats && occupancyStats?.occupied > 0
                ? Math.round(paymentStats.totalAmount / occupancyStats.occupied).toLocaleString()
                : '0')}
            </p>
            <small style={styles.financialNote}>Average per occupied room</small>
          </div>
        </div>
      </div>
    </>
  );
};


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
      <h2 style={styles.pageTitle}>Properties Management</h2>

      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>Available Rooms ({availableRooms.length})</h3>
        {availableRooms.length === 0 ? (
          <div style={styles.emptyState}>
            <Building size={48} />
            <p>No available rooms found</p>
          </div>
        ) : (
          <div style={styles.roomsGrid}>
            {availableRooms.map(function (room) {
              return (
                <div key={room.id} style={styles.roomCard}>
                  <div style={styles.roomHeader}>
                    <Building size={20} />
                    <span style={styles.roomName}>{room.name}</span>
                    <span style={styles.roomTypeBadge}>
                      {room.property_type}
                    </span>
                  </div>
                  <div style={styles.roomDetails}>
                    <div style={styles.roomDetail}>
                      <span style={styles.detailLabel}>Monthly Rent:</span>
                      <span style={styles.detailValue}>{"KSh " + (room.rent_amount ? room.rent_amount.toLocaleString() : '0')}</span>
                    </div>
                    <div style={styles.roomDetail}>
                      <span style={styles.detailLabel}>Deposit:</span>
                      <span style={styles.detailValue}>
                        {"KSh " + ((room.rent_amount * 1.07) ? (room.rent_amount * 1.07).toLocaleString() : '0')}
                      </span>
                    </div>
                    <div style={styles.roomDetail}>
                      <span style={styles.detailLabel}>Status:</span>
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
    },
    lease: tenant && tenant.lease ? {
      'Lease ID': "#" + tenant.lease.id,
      'Property': tenant.lease.property_name || 'N/A',
      'Start Date': tenant.lease.start_date ? new Date(tenant.lease.start_date).toLocaleDateString() : 'N/A',
      'End Date': tenant.lease.end_date ? new Date(tenant.lease.end_date).toLocaleDateString() : 'N/A',
      'Monthly Rent': "KSh " + (tenant.lease.rent_amount ? tenant.lease.rent_amount.toLocaleString() : '0'),
      'Deposit Amount': "KSh " + ((tenant.lease.rent_amount * 1.07) ? (tenant.lease.rent_amount * 1.07).toLocaleString() : '0'),
      'Lease Status': tenant.lease.status || 'N/A',
      'Lease Signed': tenant.lease.signed_by_tenant ? 'Yes' : 'No',
      'Signed Date': tenant.lease.signed_at ? new Date(tenant.lease.signed_at).toLocaleDateString() : 'N/A'
    } : null,
    payments: tenant && tenant.recent_payments ? tenant.recent_payments.map(function (p) {
      return {
        'Date': p.created_at ? new Date(p.created_at).toLocaleDateString() : 'N/A',
        'Amount': "KSh " + (p.amount ? p.amount.toLocaleString() : '0'),
        'Status': p.status || 'N/A',
        'Transaction ID': p.transaction_id || 'N/A'
      };
    }) : [],
    maintenance: tenant && tenant.recent_maintenance ? tenant.recent_maintenance.map(function (m) {
      return {
        'Title': m.title || 'N/A',
        'Description': m.description || 'N/A',
        'Priority': m.priority || 'N/A',
        'Status': m.status || 'N/A',
        'Date Reported': m.created_at ? new Date(m.created_at).toLocaleDateString() : 'N/A'
      };
    }) : []
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
          <button
            style={{ ...styles.modalTab, ...(activeTab === 'lease' ? styles.modalTabActive : {}) }}
            onClick={() => setActiveTab('lease')}
            disabled={!tenantData.lease}
          >
            Lease Info
          </button>
          <button
            style={{ ...styles.modalTab, ...(activeTab === 'payments' ? styles.modalTabActive : {}) }}
            onClick={() => setActiveTab('payments')}
            disabled={!tenantData.payments || tenantData.payments.length === 0}
          >
            Payments
          </button>
          <button
            style={{ ...styles.modalTab, ...(activeTab === 'maintenance' ? styles.modalTabActive : {}) }}
            onClick={() => setActiveTab('maintenance')}
            disabled={!tenantData.maintenance || tenantData.maintenance.length === 0}
          >
            Maintenance
          </button>
        </div>

        <div style={styles.modalBody}>
          {activeTab === 'personal' && (
            <>
              <div style={styles.detailsGrid}>
                {Object.entries(tenantData.personal).map(function ([key, value]) {
                  return (
                    <div key={key} style={styles.detailItem}>
                      <label style={styles.detailLabel}>{key}</label>
                      <p style={styles.detailValue}>{value}</p>
                    </div>
                  );
                })}
              </div>

              <div style={{ marginTop: '24px', borderTop: '1px solid #e5e7eb', paddingTop: '16px' }}>
                <h4 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px' }}>Documents & Photos</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                  {tenantData.images && tenantData.images.photo && (
                    <div>
                      <p style={{ fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>Profile Photo</p>
                      <img
                        src={`${API_BASE_URL}/${tenantData.images.photo}`}
                        alt="Tenant Profile"
                        loading="lazy"
                        style={styles.imagePreview}
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/200?text=No+Image';
                        }}
                      />
                    </div>
                  )}
                  <div>
                    <p style={{ fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>National ID Document</p>
                    <img
                      src={`${API_BASE_URL}/${tenantData.images.id_doc}`}
                      alt="ID Document"
                      loading="lazy"
                      style={{ ...styles.imagePreview, objectFit: 'contain', backgroundColor: '#f3f4f6' }}
                      onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                    />
                    <div style={{ ...styles.imagePreview, display: 'none', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f3f4f6' }}>
                      <FileText size={48} color="#9ca3af" />
                      <span style={{ fontSize: '14px', color: '#6b7280', marginLeft: '8px' }}>Image Load Failed</span>
                    </div>
                  </div>
                  {(!tenantData.images || (!tenantData.images.photo && !tenantData.images.id_doc)) && (
                    <p style={{ color: '#9ca3af', fontStyle: 'italic' }}>No documents uploaded.</p>
                  )}
                </div>
              </div>
            </>
          )}

          {activeTab === 'lease' && tenantData.lease && (
            <div>
              <div style={styles.detailsGrid}>
                {Object.entries(tenantData.lease).map(function ([key, value]) {
                  return (
                    <div key={key} style={styles.detailItem}>
                      <label style={styles.detailLabel}>{key}</label>
                      <p style={styles.detailValue}>{value}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'payments' && tenantData.payments && tenantData.payments.length > 0 ? (
            <div style={styles.tableWrapper}>
              <table style={styles.table}>
                <thead style={styles.tableHeader}>
                  <tr>
                    <th style={styles.th}>Date</th>
                    <th style={styles.th}>Amount</th>
                    <th style={styles.th}>Status</th>
                    <th style={styles.th}>Transaction ID</th>
                  </tr>
                </thead>
                <tbody>
                  {tenantData.payments.map(function (payment, idx) {
                    return (
                      <tr key={idx} style={styles.tableRow}>
                        <td style={styles.td}>{payment.Date}</td>
                        <td style={styles.td}>{payment.Amount}</td>
                        <td style={styles.td}>
                          <span style={{
                            ...styles.statusBadge,
                            backgroundColor: payment.Status === 'successful' ? '#dcfce7' : '#fee2e2',
                            color: payment.Status === 'successful' ? '#166534' : '#991b1b'
                          }}>
                            {payment.Status}
                          </span>
                        </td>
                        <td style={styles.td}>{payment['Transaction ID']}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : activeTab === 'payments' && (
            <div style={styles.emptyState}>
              <DollarSign size={32} />
              <p>No payment history</p>
            </div>
          )}

          {activeTab === 'maintenance' && tenantData.maintenance && tenantData.maintenance.length > 0 ? (
            <div style={styles.tableWrapper}>
              <table style={styles.table}>
                <thead style={styles.tableHeader}>
                  <tr>
                    <th style={styles.th}>Title</th>
                    <th style={styles.th}>Priority</th>
                    <th style={styles.th}>Status</th>
                    <th style={styles.th}>Date Reported</th>
                  </tr>
                </thead>
                <tbody>
                  {tenantData.maintenance.map(function (req, idx) {
                    return (
                      <tr key={idx} style={styles.tableRow}>
                        <td style={styles.td}>{req.Title}</td>
                        <td style={styles.td}>{req.Priority}</td>
                        <td style={styles.td}>
                          <span style={{
                            ...styles.statusBadge,
                            backgroundColor: req.Status === 'completed' ? '#dcfce7' : '#fef3c7',
                            color: req.Status === 'completed' ? '#166534' : '#92400e'
                          }}>
                            {req.Status}
                          </span>
                        </td>
                        <td style={styles.td}>{req['Date Reported']}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : activeTab === 'maintenance' && (
            <div style={styles.emptyState}>
              <Wrench size={32} />
              <p>No maintenance requests</p>
            </div>
          )}
        </div>

        <div style={styles.modalFooter}>
          <button style={styles.btnSecondary} onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
};


const CreateTenantModal = ({ onClose, onSubmit, loading }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    national_id: '',
    password: 'Default@123',
    room_number: ''
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
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!formData.phone.trim()) newErrors.phone = 'Phone is required';
    if (!formData.national_id.trim()) newErrors.national_id = 'National ID is required';

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
          <h3>Create New Tenant</h3>
          <button style={styles.modalClose} onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={styles.modalBody}>
            <div style={styles.formGroup}>
              <label style={styles.formLabel}>Full Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="John Doe"
                style={{ ...styles.formInput, ...(errors.name ? styles.inputError : {}) }}
              />
              {errors.name && <span style={styles.errorText}>{errors.name}</span>}
            </div>

            <div style={styles.formGroup}>
              <label style={styles.formLabel}>Email Address *</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="john@example.com"
                style={{ ...styles.formInput, ...(errors.email ? styles.inputError : {}) }}
              />
              {errors.email && <span style={styles.errorText}>{errors.email}</span>}
            </div>

            <div style={styles.formGroup}>
              <label style={styles.formLabel}>Phone Number *</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="0712345678"
                style={{ ...styles.formInput, ...(errors.phone ? styles.inputError : {}) }}
              />
              {errors.phone && <span style={styles.errorText}>{errors.phone}</span>}
            </div>

            <div style={styles.formGroup}>
              <label style={styles.formLabel}>National ID *</label>
              <input
                type="text"
                name="national_id"
                value={formData.national_id}
                onChange={handleChange}
                placeholder="12345678"
                maxLength={9}
                style={{ ...styles.formInput, ...(errors.national_id ? styles.inputError : {}) }}
              />
              {errors.national_id && <span style={styles.errorText}>{errors.national_id}</span>}
            </div>

            <div style={styles.formGroup}>
              <label style={styles.formLabel}>Room Number (Optional)</label>
              <input
                type="text"
                name="room_number"
                value={formData.room_number}
                onChange={handleChange}
                placeholder="22"
                style={styles.formInput}
              />
              <small style={styles.formHelp}>Will be assigned when creating lease</small>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.formLabel}>Default Password</label>
              <input
                type="text"
                name="password"
                value={formData.password}
                readOnly
                style={styles.formInput}
              />
              <small style={styles.formHelp}>Tenant can change this after login</small>
            </div>
          </div>

          <div style={styles.modalFooter}>
            <button type="button" style={styles.btnSecondary} onClick={onClose}>
              Cancel
            </button>
            <button type="submit" style={styles.btnPrimary} disabled={loading}>
              {loading ? 'Creating...' : 'Create Tenant'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};


const CreateLeaseModal = ({ tenant, rooms, onClose, onSubmit, loading }) => {
  const [formData, setFormData] = useState({
    tenant_id: tenant.id,
    property_id: '',
    rent_amount: '',
    start_date: new Date().toISOString().split('T')[0]
  });
  const [errors, setErrors] = useState({});
  const [selectedRoom, setSelectedRoom] = useState(null);

  useEffect(() => {
    if (rooms.length > 0 && !formData.property_id) {
      const firstRoom = rooms[0];
      setFormData(prev => ({
        ...prev,
        property_id: firstRoom.id,
        rent_amount: firstRoom.rent_amount
      }));
      setSelectedRoom(firstRoom);
    }
  }, [rooms]);

  const handleRoomChange = (e) => {
    const roomId = parseInt(e.target.value);
    const room = rooms.find(function (r) {
      return r.id === roomId;
    });
    setFormData({
      ...formData,
      property_id: roomId,
      rent_amount: room ? room.rent_amount : ''
    });
    setSelectedRoom(room);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!formData.property_id) newErrors.property_id = 'Please select a room';
    if (!formData.rent_amount || formData.rent_amount <= 0) newErrors.rent_amount = 'Valid rent amount required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSubmit(formData);
  };

  const calculateDeposit = (rent) => {
    return rent * 1.07;
  };

  return (
    <div style={styles.modalOverlay} onClick={onClose}>
      <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div style={styles.modalHeader}>
          <h3>Create Lease for {tenant.name}</h3>
          <button style={styles.modalClose} onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={styles.modalBody}>
            <div style={styles.tenantInfoSummary}>
              <p><strong>Tenant:</strong> {tenant.name}</p>
              <p><strong>Email:</strong> {tenant.email}</p>
              <p><strong>Phone:</strong> {tenant.phone || 'N/A'}</p>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.formLabel}>Select Room *</label>
              {rooms.length === 0 ? (
                <div style={styles.alertWarning}>
                  <AlertCircle size={16} />
                  <span>No available rooms found</span>
                </div>
              ) : (
                <select
                  value={formData.property_id}
                  onChange={handleRoomChange}
                  style={{ ...styles.formSelect, ...(errors.property_id ? styles.inputError : {}) }}
                >
                  <option value="">Choose a room...</option>
                  {rooms.map(function (room) {
                    return (
                      <option key={room.id} value={room.id}>
                        {room.name} - {room.property_type} - KSh {room.rent_amount ? room.rent_amount.toLocaleString() : '0'}/month
                      </option>
                    );
                  })}
                </select>
              )}
              {errors.property_id && <span style={styles.errorText}>{errors.property_id}</span>}
            </div>

            <div style={styles.formGroup}>
              <label style={styles.formLabel}>Monthly Rent (KSh) *</label>
              <input
                type="number"
                value={formData.rent_amount}
                onChange={(e) => setFormData({ ...formData, rent_amount: e.target.value })}
                placeholder="Enter rent amount"
                style={{ ...styles.formInput, ...(errors.rent_amount ? styles.inputError : {}) }}
                min="0"
                step="100"
              />
              {errors.rent_amount && <span style={styles.errorText}>{errors.rent_amount}</span>}
            </div>

            {formData.rent_amount > 0 && (
              <div style={styles.leaseCalculations}>
                <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: '600' }}>Lease Calculations</h4>
                <div style={styles.calculationRow}>
                  <span>Monthly Rent:</span>
                  <strong>{"KSh " + parseFloat(formData.rent_amount).toLocaleString()}</strong>
                </div>
                <div style={styles.calculationRow}>
                  <span>Security Deposit (7%):</span>
                  <strong>{"KSh " + calculateDeposit(parseFloat(formData.rent_amount)).toLocaleString()}</strong>
                </div>
                <div style={{ ...styles.calculationRow, borderTop: '1px solid #e5e7eb', paddingTop: '8px', marginTop: '8px' }}>
                  <span>Initial Payment Required:</span>
                  <strong style={{ color: '#3b82f6' }}>
                    {"KSh " + (parseFloat(formData.rent_amount) + calculateDeposit(parseFloat(formData.rent_amount))).toLocaleString()}
                  </strong>
                </div>
              </div>
            )}

            <div style={styles.formGroup}>
              <label style={styles.formLabel}>Lease Start Date *</label>
              <input
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                style={styles.formInput}
              />
            </div>

            <div style={styles.leaseTermsNote}>
              <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: '600' }}>Lease Terms</h4>
              <p style={{ margin: '4px 0' }}>1-year lease term (auto-calculated)</p>
              <p style={{ margin: '4px 0' }}>Tenant must sign lease agreement before making payments</p>
              <p style={{ margin: '4px 0' }}>Rent payment due on 5th of each month</p>
            </div>
          </div>

          <div style={styles.modalFooter}>
            <button type="button" style={styles.btnSecondary} onClick={onClose}>
              Cancel
            </button>
            <button type="submit" style={styles.btnPrimary} disabled={loading || rooms.length === 0}>
              {loading ? 'Creating...' : 'Create Lease'}
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
                {tenants.filter(function (t) {
                  return t.is_active;
                }).map(function (tenant) {
                  return (
                    <option key={tenant.id} value={tenant.id}>
                      {tenant.name} - Room {tenant.room_number || 'N/A'}
                    </option>
                  );
                })}
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
            <div style={styles.detailItem}>
              <label style={styles.detailLabel}>Created</label>
              <p style={styles.detailValue}>
                {request.created_at ? new Date(request.created_at).toLocaleDateString() : 'N/A'}
              </p>
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
              Mark as Complete
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


const VacateNoticeDetailsModal = ({ notice, onClose, onUpdateStatus }) => {
  const [notes, setNotes] = useState(notice.admin_notes || '');
  const [action, setAction] = useState('');

  const handleApprove = () => {
    if (window.confirm('Are you sure you want to approve this vacate notice?')) {
      onUpdateStatus(notice.id, 'approved', notes);
      onClose();
    }
  };

  const handleReject = () => {
    if (window.confirm('Are you sure you want to reject this vacate notice?')) {
      onUpdateStatus(notice.id, 'rejected', notes);
      onClose();
    }
  };

  const handleComplete = () => {
    if (window.confirm('Are you sure you want to mark this vacate notice as completed?')) {
      onUpdateStatus(notice.id, 'completed', notes);
      onClose();
    }
  };

  const statusColor = function (status) {
    switch (status) {
      case 'pending': return { bg: '#fef3c7', color: '#92400e' };
      case 'approved': return { bg: '#dbeafe', color: '#1e40af' };
      case 'rejected': return { bg: '#fee2e2', color: '#991b1b' };
      case 'completed': return { bg: '#dcfce7', color: '#166534' };
      default: return { bg: '#f3f4f6', color: '#4b5563' };
    }
  };

  const colors = statusColor(notice.status);
  const daysLeft = notice.vacate_date
    ? Math.ceil((new Date(notice.vacate_date) - new Date()) / (1000 * 60 * 60 * 24))
    : 0;

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
              <label style={styles.detailLabel}>Notice ID</label>
              <p style={styles.detailValue}>#{notice.id}</p>
            </div>
            <div style={styles.detailItem}>
              <label style={styles.detailLabel}>Tenant</label>
              <p style={styles.detailValue}>{notice.tenant_name || 'Unknown'}</p>
            </div>
            <div style={styles.detailItem}>
              <label style={styles.detailLabel}>Room Number</label>
              <p style={styles.detailValue}>Room {notice.room_number || 'N/A'}</p>
            </div>
            <div style={styles.detailItem}>
              <label style={styles.detailLabel}>Status</label>
              <span style={{
                ...styles.statusBadge,
                backgroundColor: colors.bg,
                color: colors.color
              }}>
                {notice.status}
              </span>
            </div>
            <div style={styles.detailItem}>
              <label style={styles.detailLabel}>Vacate Date</label>
              <p style={styles.detailValue}>
                {notice.vacate_date ? new Date(notice.vacate_date).toLocaleDateString() : 'N/A'}
              </p>
            </div>
            <div style={styles.detailItem}>
              <label style={styles.detailLabel}>Days Remaining</label>
              <p style={styles.detailValue}>
                <span style={{
                  ...styles.statusBadge,
                  backgroundColor: daysLeft <= 7 ? '#fee2e2' : daysLeft <= 30 ? '#fef3c7' : '#dcfce7',
                  color: daysLeft <= 7 ? '#991b1b' : daysLeft <= 30 ? '#92400e' : '#166534'
                }}>
                  {daysLeft} days
                </span>
              </p>
            </div>
          </div>

          <div style={{ marginTop: '16px' }}>
            <label style={styles.detailLabel}>Reason for Vacating</label>
            <p style={{ ...styles.detailValue, lineHeight: '1.6', margin: '8px 0' }}>
              {notice.reason || 'No reason provided'}
            </p>
          </div>

          <div style={{ marginTop: '16px' }}>
            <label style={styles.detailLabel}>Admin Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any notes or comments..."
              rows="4"
              style={styles.formInput}
            />
          </div>

          {notice.admin_notes && (
            <div style={{ marginTop: '16px' }}>
              <label style={styles.detailLabel}>Previous Notes</label>
              <p style={{ ...styles.detailValue, lineHeight: '1.6', margin: '8px 0' }}>
                {notice.admin_notes}
              </p>
            </div>
          )}
        </div>

        <div style={styles.modalFooter}>
          {notice.status === 'pending' && (
            <>
              <button style={styles.btnSecondary} onClick={onClose}>Cancel</button>
              <button style={styles.btnDanger} onClick={handleReject}>Reject</button>
              <button style={styles.btnSuccess} onClick={handleApprove}>Approve</button>
            </>
          )}
          {notice.status === 'approved' && (
            <>
              <button style={styles.btnSecondary} onClick={onClose}>Close</button>
              <button style={styles.btnPrimary} onClick={handleComplete}>Mark as Completed</button>
            </>
          )}
          {(notice.status === 'rejected' || notice.status === 'completed') && (
            <button style={styles.btnSecondary} onClick={onClose}>Close</button>
          )}
        </div>
      </div>
    </div>
  );
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
    zIndex: 10,
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
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

  mobileTopNav: {
    display: 'flex',
    overflowX: 'auto',
    backgroundColor: '#1f2937',
    padding: '10px',
    gap: '12px',
    borderBottom: '1px solid #374151',
    whiteSpace: 'nowrap',
    WebkitOverflowScrolling: 'touch',
    scrollbarWidth: 'none',
    msOverflowStyle: 'none'
  },
  mobileNavItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 16px',
    borderRadius: '20px',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    color: '#d1d5db',
    fontSize: '14px',
    fontWeight: '500',
    border: 'none',
    cursor: 'pointer',
    flexShrink: 0
  },
  mobileNavActive: {
    backgroundColor: '#3b82f6',
    color: 'white',
    boxShadow: '0 2px 5px rgba(59, 130, 246, 0.5)'
  },

  inquiryCard: {
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
    border: '1px solid #e5e7eb',
    padding: '20px',
    marginBottom: '16px',
    transition: 'all 0.2s ease',
    cursor: 'pointer'
  },
  inquiryHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '12px'
  },
  senderInfo: {
    display: 'flex',
    gap: '12px',
    alignItems: 'center'
  },
  avatar: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    backgroundColor: '#e0f2fe',
    color: '#0369a1',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bold',
    fontSize: '16px'
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
    padding: '4px 10px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '500',
    marginTop: '4px',
    display: 'inline-block'
  },
  msgPreview: {
    color: '#4b5563',
    fontSize: '14px',
    lineHeight: '1.5',
    marginBottom: '12px'
  },
  msgAction: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '8px'
  },

  imagePreview: {
    width: '100%',
    height: '200px',
    objectFit: 'cover',
    borderRadius: '8px',
    backgroundColor: '#f3f4f6',
    border: '1px solid #e5e7eb'
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
  sidebarContent: {
    padding: '24px',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    overflowY: 'auto'
  },
  sidebarHeader: {
    marginBottom: '32px',
    paddingLeft: '12px'
  },
  sidebarTitle: {
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: '4px'
  },
  sidebarSubtitle: {
    fontSize: '14px',
    color: '#64748b'
  },
  menuList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    flex: 1
  },
  menuItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px',
    borderRadius: '12px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    fontSize: '15px',
    fontWeight: '500',
    color: '#64748b',
    border: 'none',
    width: '100%',
    textAlign: 'left'
  },
  navLink: {
    textDecoration: 'none',
    color: 'inherit',
    display: 'block'
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

  actionButtonsContainer: {
    display: 'flex',
    gap: '12px',
    alignItems: 'center'
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
    color: '#6b7280'
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
  sectionHeaderControls: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    flexWrap: 'wrap',
    gap: '16px'
  },
  tableControls: {
    display: 'flex',
    gap: '12px',
    alignItems: 'center'
  },
  searchBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 12px',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    backgroundColor: 'white',
    transition: 'all 0.2s'
  },
  searchInput: {
    border: 'none',
    outline: 'none',
    fontSize: '14px',
    width: '200px',
    backgroundColor: 'transparent'
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
  financialSummary: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '16px'
  },
  financialCard: {
    padding: '20px',
    backgroundColor: '#f8fafc',
    borderRadius: '8px',
    border: '1px solid #e5e7eb',
    textAlign: 'center'
  },
  financialValue: {
    fontSize: '28px',
    fontWeight: '600',
    color: '#111827',
    margin: '8px 0'
  },
  financialNote: {
    fontSize: '12px',
    color: '#6b7280'
  },
  activitiesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '16px'
  },
  activityCard: {
    padding: '16px',
    backgroundColor: '#f9fafb',
    borderRadius: '8px',
    border: '1px solid #e5e7eb'
  },
  activityTitle: {
    margin: '0 0 12px 0',
    fontSize: '16px',
    fontWeight: '600',
    color: '#111827'
  },
  activityItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '8px 0',
    borderBottom: '1px solid #e5e7eb'
  },
  textMuted: {
    color: '#6b7280',
    fontSize: '14px'
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

  buttonActions: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap'
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
  btnSuccess: {
    padding: '10px 16px',
    backgroundColor: '#10b981',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.2s'
  },
  btnDanger: {
    padding: '10px 16px',
    backgroundColor: '#ef4444',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.2s'
  },
  btnText: {
    background: 'transparent',
    border: 'none',
    color: '#3b82f6',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    padding: '8px'
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
  btnSmallSuccess: {
    padding: '6px 12px',
    backgroundColor: '#10b981',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    transition: 'all 0.2s'
  },
  btnSmallDanger: {
    padding: '6px 12px',
    backgroundColor: '#ef4444',
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
    gap: '8px'
  },
  roomDetail: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '14px'
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
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
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
  modalTabs: {
    display: 'flex',
    borderBottom: '1px solid #e5e7eb',
    padding: '0 24px',
    backgroundColor: '#f9fafb',
    flexShrink: 0,
    overflowX: 'auto'
  },
  modalTab: {
    padding: '12px 16px',
    background: 'transparent',
    border: 'none',
    borderBottom: '2px solid transparent',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    color: '#6b7280',
    transition: 'all 0.2s',
    whiteSpace: 'nowrap'
  },
  modalTabActive: {
    color: '#3b82f6',
    borderBottomColor: '#3b82f6'
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
  formHelp: {
    fontSize: '12px',
    color: '#6b7280',
    marginTop: '4px',
    display: 'block'
  },
  tenantInfoSummary: {
    backgroundColor: '#f9fafb',
    padding: '16px',
    borderRadius: '6px',
    marginBottom: '20px',
    fontSize: '14px',
    border: '1px solid #e5e7eb'
  },
  alertWarning: {
    backgroundColor: '#fef3c7',
    color: '#92400e',
    padding: '12px',
    borderRadius: '6px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '14px',
    border: '1px solid #fde68a'
  },
  leaseCalculations: {
    backgroundColor: '#f8fafc',
    padding: '16px',
    borderRadius: '6px',
    margin: '16px 0',
    fontSize: '14px',
    border: '1px solid #e5e7eb'
  },
  calculationRow: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '8px',
    fontSize: '14px'
  },
  leaseTermsNote: {
    backgroundColor: '#f0f9ff',
    padding: '16px',
    borderRadius: '6px',
    marginTop: '16px',
    fontSize: '13px',
    color: '#0369a1',
    border: '1px solid #bae6fd'
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


export default AdminDashboard;