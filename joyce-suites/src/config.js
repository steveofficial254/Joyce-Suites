

const getConfig = () => {
  return {
    
    apiBaseUrl: 'https://joyce-suites-xdkp.onrender.com',

    
    appName: 'Joyce Suites',
    appVersion: '1.0.0',
    appDescription: 'Property Management System',

    
    endpoints: {
      
      auth: {
        login: '/api/auth/login',
        logout: '/api/auth/logout',
        profile: '/api/auth/profile',
        register: '/api/auth/register',
        verify: '/api/auth/verify'
      },

      
      caretaker: {
        dashboard: '/api/caretaker/dashboard',
        maintenance: '/api/caretaker/maintenance',
        maintenanceDetail: '/api/caretaker/maintenance/:id',
        payments: '/api/caretaker/payments',
        pendingPayments: '/api/caretaker/payments/pending',
        paymentDetails: '/api/caretaker/payments/:id',
        rooms: '/api/caretaker/rooms',
        availableRooms: '/api/caretaker/rooms/available',
        occupiedRooms: '/api/caretaker/rooms/occupied',
        roomDetails: '/api/caretaker/rooms/:id',
        updateRoomStatus: '/api/caretaker/rooms/:id/status',
        tenants: '/api/caretaker/tenants',
        tenantDetails: '/api/caretaker/tenants/:id',
        updateTenantStatus: '/api/caretaker/tenants/:id/status',
        notifications: '/api/caretaker/notifications',
        sendNotification: '/api/caretaker/notifications/send',
        markNotificationRead: '/api/caretaker/notifications/:id/read',
        markAllNotificationsRead: '/api/caretaker/notifications/read-all',
        vacateNotices: '/api/caretaker/vacate-notices',
        vacateNoticeDetail: '/api/caretaker/vacate-notices/:id',
        occupancyReport: '/api/caretaker/reports/occupancy',
        paymentReport: '/api/caretaker/reports/payments',
        maintenanceReport: '/api/caretaker/reports/maintenance',
        profile: '/api/caretaker/profile',
        updateProfile: '/api/caretaker/profile',
        systemHealth: '/api/caretaker/system/health',
        debugRooms: '/api/caretaker/debug/rooms',
        inquiries: '/api/caretaker/inquiries',
        approveInquiry: '/api/caretaker/inquiries/:id/approve',
        rejectInquiry: '/api/caretaker/inquiries/:id/reject',
        markInquiryPaid: '/api/caretaker/inquiries/:id/mark-paid'
      },

      
      admin: {
        overview: '/api/admin/overview',
        tenants: '/api/admin/tenants',
        payments: '/api/admin/payments',
        reports: '/api/admin/reports'
      },

      
      tenant: {
        dashboard: '/api/tenant/dashboard',
        profile: '/api/tenant/profile',
        payments: '/api/tenant/payments',
        maintenance: '/api/tenant/maintenance',
        lease: '/api/tenant/lease'
      },

      
      public: {
        rooms: '/api/caretaker/rooms/public'
      }
    },

    
    settings: {
      itemsPerPage: 20,
      defaultCurrency: 'KES',
      dateFormat: 'DD/MM/YYYY',
      timeFormat: 'HH:mm',
      notificationLimit: 20,
      maintenancePriorities: ['urgent', 'high', 'normal', 'low'],
      maintenanceStatuses: ['pending', 'in_progress', 'completed', 'cancelled'],
      paymentStatuses: ['successful', 'pending', 'failed', 'refunded'],
      propertyStatuses: ['vacant', 'occupied', 'under_maintenance', 'reserved'],
      propertyTypes: ['bedsitter', 'one_bedroom'],
      vacateStatuses: ['pending', 'approved', 'completed', 'rejected']
    },

    
    ui: {
      primaryColor: '#3b82f6',
      secondaryColor: '#10b981',
      dangerColor: '#ef4444',
      warningColor: '#f59e0b',
      infoColor: '#06b6d4',
      darkColor: '#1e293b',
      lightColor: '#f8fafc',
      breakpoints: {
        mobile: 768,
        tablet: 1024,
        desktop: 1280
      },
      transitionSpeed: '0.3s',
      shadow: {
        small: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        medium: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        large: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
      }
    }
  };
};

const config = getConfig();

export default config;