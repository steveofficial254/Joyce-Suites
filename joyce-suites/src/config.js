const config = {
  apiBaseUrl: process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000',
  
  appName: 'Joyce Suites',
  appVersion: '1.0.0',
  
  endpoints: {
    auth: {
      login: '/api/auth/login',
      signup: '/api/auth/register',
      logout: '/api/auth/logout',
      profile: '/api/auth/profile',
      updateProfile: '/api/auth/profile/update'
    },
    
    admin: {
      overview: '/api/admin/overview',
      tenants: '/api/admin/tenants',
      tenant: '/api/admin/tenant/:id',
      tenantCreate: '/api/admin/tenant/create',
      tenantDelete: '/api/admin/tenant/delete/:id',
      contracts: '/api/admin/contracts',
      contractCreate: '/api/admin/lease/create',
      payments: '/api/admin/payments/report',
      occupancy: '/api/admin/occupancy/report',
      vacateNotices: '/api/admin/vacate-notices',
      vacateNoticeUpdate: '/api/admin/vacate-notices/:id'
    },
    
    caretaker: {
      dashboard: '/api/caretaker/dashboard',
      profile: '/api/caretaker/profile',
      tenants: '/api/caretaker/tenants',
      payments: '/api/caretaker/payments',
      maintenance: '/api/caretaker/maintenance',
      maintenanceUpdate: '/api/caretaker/maintenance/:id',
      pendingPayments: '/api/caretaker/payments/pending',
      availableRooms: '/api/caretaker/rooms/available',
      occupiedRooms: '/api/caretaker/rooms/occupied',
      allRooms: '/api/caretaker/rooms/all',
      sendNotification: '/api/caretaker/notifications/send'
    },
    
    tenant: {
      dashboard: '/api/tenant/dashboard',
      profile: '/api/tenant/profile',
      payments: '/api/tenant/payments',
      paymentDetails: '/api/tenant/payment-details',
      requests: '/api/tenant/maintenance/request',
      getRequests: '/api/tenant/maintenance',
      lease: '/api/tenant/lease',
      leasePreview: '/api/tenant/lease/preview/:room_id',
      leaseSign: '/api/tenant/lease/sign',
      leaseSignature: '/api/tenant/lease/:lease_id/signature',
      roomPricing: '/api/tenant/rooms/:room_number',
      roomDetails: '/api/tenant/room-details/:unit_number',
      vacateNotices: '/api/tenant/vacate-notices',
      submitVacateNotice: '/api/tenant/vacate-notice',
      cancelVacateNotice: '/api/tenant/vacate-notice/:notice_id/cancel',
      notifications: '/api/tenant/notifications',
      markNotificationRead: '/api/tenant/notifications/mark-read/:notification_id'
    }
  }
};

export default config;