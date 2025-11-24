const config = {
  // API Base URL - should NOT include /api since endpoints already have it
  apiBaseUrl: process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000',
  
  // App configuration
  appName: 'Joyce Suites',
  appVersion: '1.0.0',
  
  // API Endpoints - these include the /api prefix
  endpoints: {
    auth: {
      login: '/api/auth/login',
      signup: '/api/auth/register',
      logout: '/api/auth/logout',
      profile: '/api/auth/profile'
    },
    mpesa: {
      stkPush: '/api/mpesa/stk-push',
      callback: '/api/mpesa/callback'
    },
    payments: {
      create: '/api/payments',
      history: '/api/payments/history',
      verify: '/api/payments/verify'
    },
    caretaker: {
      profile: '/api/caretaker/profile',
      tenants: '/api/caretaker/tenants',
      payments: '/api/caretaker/payments'
    },
    tenant: {
      dashboard: '/api/tenant/dashboard',
      profile: '/api/tenant/profile',
      payments: '/api/tenant/payments',
      requests: '/api/tenant/maintenance/request',
      getRequests: '/api/tenant/maintenance',
      lease: '/api/tenant/lease',
      leaseSgn: '/api/tenant/lease/sign',
      leaseSignature: '/api/tenant/lease/:lease_id/signature',
      vacateNotices: '/api/tenant/vacate-notices',
      submitVacateNotice: '/api/tenant/vacate-notice',
      cancelVacateNotice: '/api/tenant/vacate-notice/:notice_id/cancel'
    }
  }
};

export default config;