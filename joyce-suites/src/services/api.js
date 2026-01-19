import config from '../config';

class ApiService {
  constructor() {
    this.baseURL = config.apiBaseUrl;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;

    const defaultOptions = {
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    };

    const token = localStorage.getItem('joyce-suites-token');
    if (token) {
      defaultOptions.headers['Authorization'] = `Bearer ${token}`;
    }

    const requestOptions = {
      ...defaultOptions,
      ...options,
      headers: {
        ...defaultOptions.headers,
        ...options.headers,
      },
    };

    if (requestOptions.body && typeof requestOptions.body === 'object') {
      requestOptions.body = JSON.stringify(requestOptions.body);
    }

    try {
      const response = await fetch(url, requestOptions);

      

      
      const contentType = response.headers.get('content-type');
      let data;

      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text();
      }

      if (!response.ok) {
        console.error('❌ API Error Response:', data);
        throw new Error(data.message || data.error || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('❌ API request failed:', error);
      throw error;
    }
  }

  
  auth = {
    login: async (email, password) => {
      return this.request(config.endpoints.auth.login, {
        method: 'POST',
        body: { email, password },
      });
    },

    signup: async (userData) => {
      return this.request(config.endpoints.auth.signup, {
        method: 'POST',
        body: userData,
      });
    },

    logout: async () => {
      return this.request(config.endpoints.auth.logout, {
        method: 'POST',
      });
    },

    getProfile: async () => {
      return this.request(config.endpoints.auth.profile);
    },

    updateProfile: async (profileData) => {
      return this.request(config.endpoints.auth.profile, {
        method: 'PUT',
        body: profileData,
      });
    },
  };

  
  mpesa = {
    stkPush: async (paymentData) => {
      return this.request(config.endpoints.mpesa.stkPush, {
        method: 'POST',
        body: paymentData,
      });
    },

    handleCallback: async (callbackData) => {
      return this.request(config.endpoints.mpesa.callback, {
        method: 'POST',
        body: callbackData,
      });
    },
  };

  
  payments = {
    create: async (paymentData) => {
      return this.request(config.endpoints.payments.create, {
        method: 'POST',
        body: paymentData,
      });
    },

    getHistory: async (filters = {}) => {
      const queryString = new URLSearchParams(filters).toString();
      const endpoint = `${config.endpoints.payments.history}?${queryString}`;
      return this.request(endpoint);
    },

    verify: async (paymentId) => {
      return this.request(`${config.endpoints.payments.verify}/${paymentId}`);
    },
  };

  
  caretaker = {
    getProfile: async () => {
      return this.request(config.endpoints.caretaker.profile);
    },

    getTenants: async () => {
      return this.request(config.endpoints.caretaker.tenants);
    },

    getPayments: async (filters = {}) => {
      const queryString = new URLSearchParams(filters).toString();
      const endpoint = `${config.endpoints.caretaker.payments}?${queryString}`;
      return this.request(endpoint);
    },

    updateTenant: async (tenantId, updateData) => {
      return this.request(`${config.endpoints.caretaker.tenants}/${tenantId}`, {
        method: 'PUT',
        body: updateData,
      });
    },
  };

  
  tenant = {
    getDashboard: async () => {
      return this.request(config.endpoints.tenant.dashboard);
    },

    getProfile: async () => {
      return this.request(config.endpoints.tenant.profile);
    },

    getPayments: async () => {
      return this.request(config.endpoints.tenant.payments);
    },

    getRequests: async () => {
      return this.request(config.endpoints.tenant.requests);
    },

    createRequest: async (requestData) => {
      return this.request(config.endpoints.tenant.requests, {
        method: 'POST',
        body: requestData,
      });
    },

    updateProfile: async (profileData) => {
      return this.request(config.endpoints.tenant.profile, {
        method: 'PUT',
        body: profileData,
      });
    },
  };
}

const apiService = new ApiService();
export default apiService;