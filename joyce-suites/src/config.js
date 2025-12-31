// config.js
const config = {
  // API Configuration
  apiBaseUrl: process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000',
  
  // App Configuration
  appName: 'Joyce Suites',
  appVersion: '1.0.0',
  appDescription: 'Property Management System',
  
  // Endpoints Configuration
  endpoints: {
    // Authentication Endpoints
    auth: {
      login: '/api/auth/login',
      logout: '/api/auth/logout',
      profile: '/api/auth/profile',
      register: '/api/auth/register',
      verify: '/api/auth/verify'
    },
    
    // Caretaker Endpoints
    caretaker: {
      // Dashboard
      dashboard: '/api/caretaker/dashboard',
      
      // Maintenance
      maintenance: '/api/caretaker/maintenance',
      maintenanceDetail: '/api/caretaker/maintenance/:id',
      
      // Payments
      payments: '/api/caretaker/payments',
      pendingPayments: '/api/caretaker/payments/pending',
      paymentDetails: '/api/caretaker/payments/:id',
      
      // Rooms/Properties
      rooms: '/api/caretaker/rooms',
      availableRooms: '/api/caretaker/rooms/available',
      occupiedRooms: '/api/caretaker/rooms/occupied',
      roomDetails: '/api/caretaker/rooms/:id',
      updateRoomStatus: '/api/caretaker/rooms/:id/status',
      
      // Tenants
      tenants: '/api/caretaker/tenants',
      tenantDetails: '/api/caretaker/tenants/:id',
      updateTenantStatus: '/api/caretaker/tenants/:id/status',
      
      // Notifications
      notifications: '/api/caretaker/notifications',
      sendNotification: '/api/caretaker/notifications/send',
      markNotificationRead: '/api/caretaker/notifications/:id/read',
      markAllNotificationsRead: '/api/caretaker/notifications/read-all',
      
      // Vacate Notices
      vacateNotices: '/api/caretaker/vacate-notices',
      vacateNoticeDetail: '/api/caretaker/vacate-notices/:id',
      
      // Reports
      occupancyReport: '/api/caretaker/reports/occupancy',
      paymentReport: '/api/caretaker/reports/payments',
      maintenanceReport: '/api/caretaker/reports/maintenance',
      
      // Profile
      profile: '/api/caretaker/profile',
      updateProfile: '/api/caretaker/profile',
      
      // System
      systemHealth: '/api/caretaker/system/health',
      
      // Debug
      debugRooms: '/api/caretaker/debug/rooms'
    },
    
    // Admin Endpoints
    admin: {
      overview: '/api/admin/overview',
      tenants: '/api/admin/tenants',
      payments: '/api/admin/payments',
      reports: '/api/admin/reports'
    },
    
    // Tenant Endpoints
    tenant: {
      dashboard: '/api/tenant/dashboard',
      profile: '/api/tenant/profile',
      payments: '/api/tenant/payments',
      maintenance: '/api/tenant/maintenance',
      lease: '/api/tenant/lease'
    },
    
    // Public Endpoints
    public: {
      rooms: '/api/caretaker/rooms/public'
    }
  },
  
  // App Settings
  settings: {
    itemsPerPage: 20,
    defaultCurrency: 'KES',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: 'HH:mm',
    notificationLimit: 20,
    maintenancePriorities: ['urgent', 'high', 'normal', 'low'],
    maintenanceStatuses: ['pending', 'in_progress', 'completed', 'cancelled'],
    paymentStatuses: ['successful', 'pending', 'failed', 'refunded'],
    propertyStatuses: ['vacant', 'occupied', 'under_maintenance'],
    propertyTypes: ['bedsitter', 'one_bedroom'],
    vacateStatuses: ['pending', 'approved', 'completed', 'rejected']
  },
  
  // UI Configuration
  ui: {
    primaryColor: '#3b82f6',
    secondaryColor: '#10b981',
    dangerColor: '#ef4444',
    warningColor: '#f59e0b',
    infoColor: '#06b6d4',
    darkColor: '#1e293b',
    lightColor: '#f8fafc',
    
    // Breakpoints
    breakpoints: {
      mobile: 768,
      tablet: 1024,
      desktop: 1280
    },
    
    // Animations
    transitionSpeed: '0.3s',
    
    // Shadows
    shadow: {
      small: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      medium: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
      large: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
    }
  }
};

export default config;