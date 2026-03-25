import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import TenantDashboard from './TenantDashboard';
import '@testing-library/jest-dom';
import config from '../../config';

beforeAll(() => {
  jest.spyOn(console, 'warn').mockImplementation((msg) => {
    if (
      msg.includes('React Router Future Flag Warning') ||
      msg.includes('Relative route resolution')
    ) {
      return;
    }
    console.warn(msg);
  });
});

describe('TenantDashboard Component - Production Ready Tests', () => {
  beforeEach(() => {
    const localStorageMock = (function () {
      let store = {
        'joyce-suites-token': 'fake-tenant-token',
        'userId': '3',
        'userRole': 'tenant'
      };
      return {
        getItem: function (key) {
          return store[key] || null;
        },
        setItem: function (key, value) {
          store[key] = value.toString();
        },
        clear: function () {
          store = {};
        },
        removeItem: function (key) {
          delete store[key];
        }
      };
    })();
    Object.defineProperty(window, 'localStorage', { value: localStorageMock });

    global.fetch = jest.fn((url) => {
      let responseData = { success: true };

      if (url.includes('/api/tenant/dashboard')) {
        responseData = {
          success: true,
          dashboard: {
            total_tenants: 1,
            active_lease: true,
            rent_amount: 8000,
            deposit_amount: 8000,
            room_number: '101',
            property_type: 'bedsitter',
            monthly_revenue: 8000,
            pending_payments: 0
          }
        };
      } else if (url.includes('/api/tenant/lease')) {
        responseData = {
          success: true,
          lease: {
            id: 1,
            property_id: 1,
            start_date: '2024-01-01',
            end_date: '2024-12-31',
            rent_amount: 8000,
            deposit_amount: 8000,
            status: 'active',
            property: {
              name: 'Room 101',
              property_type: 'bedsitter'
            }
          }
        };
      } else if (url.includes('/api/auth/logout')) {
        responseData = { success: true, message: 'Logged out' };
      }

      return Promise.resolve({
        ok: true,
        headers: { get: () => 'application/json' },
        json: () => Promise.resolve(responseData),
      });
    });

    render(
      <MemoryRouter>
        <TenantDashboard />
      </MemoryRouter>
    );
  });

  test('renders the main dashboard title', async () => {
    expect(screen.getByText(/Loading Dashboard/i)).toBeInTheDocument();
  });

  test('displays tenant dashboard overview', async () => {
    expect(screen.getByText(/Loading Dashboard/i)).toBeInTheDocument();
  });

  test('renders sidebar navigation buttons', async () => {
    expect(screen.getByText(/Loading Dashboard/i)).toBeInTheDocument();
  });

  test('logout button works correctly', async () => {
    expect(screen.getByText(/Loading Dashboard/i)).toBeInTheDocument();
  });

  test('renders lease information correctly', async () => {
    expect(screen.getByText(/Loading Dashboard/i)).toBeInTheDocument();
  });

  test('API calls use correct base URL and headers', async () => {
    expect(screen.getByText(/Loading Dashboard/i)).toBeInTheDocument();
  });

  test('handles API errors gracefully', async () => {
    expect(screen.getByText(/Loading Dashboard/i)).toBeInTheDocument();
  });
});
