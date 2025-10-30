const config = {
  // API Base URL - adjust based on your environment
  apiBaseUrl: process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api',
  
  // App configuration
  appName: 'Joyce Suites',
  appVersion: '1.0.0',
  
  // API Endpoints
  endpoints: {
    auth: {
      login: '/auth/login',
      signup: '/auth/signup',
      logout: '/auth/logout',
      profile: '/auth/profile'
    },
    mpesa: {
      stkPush: '/mpesa/stk-push',
      callback: '/mpesa/callback'
    },
    payments: {
      create: '/payments',
      history: '/payments/history',
      verify: '/payments/verify'
    },
    caretaker: {
      profile: '/caretaker/profile',
      tenants: '/caretaker/tenants',
      payments: '/caretaker/payments'
    },
    tenant: {
      profile: '/tenant/profile',
      payments: '/tenant/payments',
      requests: '/tenant/requests'
    }
  }
};

export default config;