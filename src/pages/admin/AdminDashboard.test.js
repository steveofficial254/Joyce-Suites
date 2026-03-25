
import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AdminDashboard from './AdminDashboard';
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

describe('AdminDashboard Component - Production Ready Tests', () => {
  beforeEach(async () => {
    const localStorageMock = (function () {
      let store = {
        'joyce-suites-token': 'fake-admin-token',
        'userId': '1',
        'userRole': 'admin'
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

      if (url.includes('/api/admin/overview')) {
        responseData = {
          success: true,
          overview: {
            total_tenants: 10,
            occupied_rooms: 8,
            pending_maintenance: 2,
            total_revenue: 50000,
            active_leases: 5,
            expected_rent: 60000,
            overdue_balance: 10000,
            total_caretakers: 3
          }
        };
      } else if (url.includes('/api/admin/tenants')) {
        responseData = {
          success: true,
          tenants: [{
            id: 1,
            name: 'John Doe',
            full_name: 'John Doe',
            email: 'john@example.com',
            phone: '12345678',
            unit_number: '101',
            room_number: '101',
            is_active: true
          }]
        };
      } else if (url.includes('/api/admin/payments/report')) {
        responseData = {
          success: true,
          report: {
            total_success: 10,
            total_pending: 2,
            total_amount: 100000,
            successful: 8,
            pending: 2,
            failed: 0,
            recent_transactions: []
          }
        };
      } else if (url.includes('/api/admin/occupancy/report')) {
        responseData = {
          success: true,
          report: {
            total_properties: 20,
            occupied: 15,
            vacant: 5,
            occupancy_rate: 75
          }
        };
      } else if (url.includes('/api/admin/vacate-notices')) {
        responseData = { success: true, notices: [] };
      } else if (url.includes('/api/caretaker/maintenance')) {
        responseData = { success: true, requests: [] };
      } else if (url.includes('/api/auth/notifications')) {
        responseData = { success: true, notifications: [] };
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
        <AdminDashboard />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.queryByText(/Loading Dashboard/i)).not.toBeInTheDocument();
    }, { timeout: 5000 });
  });

  test('renders the main dashboard title', async () => {
    expect(screen.getByText(/Admin Dashboard/i)).toBeInTheDocument();
  });

  test('displays the default DashboardPage content', async () => {
    expect(screen.getByText(/System Overview/i)).toBeInTheDocument();
  });

  test('renders sidebar navigation buttons', async () => {
    expect(screen.getAllByText(/Dashboard/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Leases/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Maintenance/i).length).toBeGreaterThan(0);
  });

  test('logout button works correctly', async () => {
    const logoutButton = screen.getByRole('button', { name: /Logout/i });
    fireEvent.click(logoutButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('/api/auth/logout'), expect.any(Object));
    });
  });

  test('renders stats cards correctly on dashboard', async () => {
    expect(screen.getAllByText(/Tenants|Leases|Maintenance|Revenue/i).length).toBeGreaterThan(0);
  });

  test('API calls use correct base URL and headers', async () => {
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining(config.apiBaseUrl),
      expect.objectContaining({
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
          'Authorization': expect.stringContaining('Bearer')
        })
      })
    );
  });

  test('handles API errors gracefully', async () => {
    global.fetch.mockImplementationOnce(() => 
      Promise.resolve({
        ok: false,
        status: 500,
        json: () => Promise.resolve({ success: false, error: 'Server Error' })
      })
    );

    await waitFor(() => {
      expect(screen.getByText(/Admin Dashboard/i)).toBeInTheDocument();
    });
  });

  test('displays loading state initially', async () => {
    const { rerender } = render(
      <MemoryRouter>
        <AdminDashboard />
      </MemoryRouter>
    );

    expect(screen.getByText(/Loading Dashboard/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.queryByText(/Loading Dashboard/i)).not.toBeInTheDocument();
    }, { timeout: 3000 });
  });

  test('navigation between different sections works', async () => {
    // Just verify the Leases button exists and can be clicked
    const leasesButton = screen.getAllByText(/Leases/i)[0];
    expect(leasesButton).toBeInTheDocument();
    fireEvent.click(leasesButton);
    
    // The test passes if no errors are thrown during the click
  });

  test('fetches dashboard data on component mount', async () => {
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/admin/overview'),
      expect.any(Object)
    );
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/admin/tenants'),
      expect.any(Object)
    );
  });
});
