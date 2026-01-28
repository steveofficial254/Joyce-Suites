import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import CaretakerDeposits from './CaretakerDeposits';
import '@testing-library/jest-dom';
import config from '../../config';

// Mock the config module to use the database URL
jest.mock('../../config', () => ({
  apiBaseUrl: 'https://joyce-suites-xdkp.onrender.com'
}));

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

describe('CaretakerDeposits Component - Production Ready Tests', () => {
  beforeEach(() => {
    const localStorageMock = (function () {
      let store = {
        'joyce-suites-token': 'fake-caretaker-token',
        'userId': '2',
        'userRole': 'caretaker'
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

    global.fetch = jest.fn((url, options) => {
      let responseData = { success: true };

      if (url.includes('/api/rent-deposit/deposit/records')) {
        responseData = {
          success: true,
          records: [{
            id: 1,
            tenant_name: 'John Doe',
            property_name: 'Room 101',
            amount_required: 8000,
            amount_paid: 4000,
            balance: 4000,
            status: 'partial',
            due_date: '2024-02-01',
            created_at: '2024-01-01'
          }],
          pagination: {
            current_page: 1,
            total_pages: 1,
            total_records: 1
          }
        };
      } else if (url.includes('/api/users/tenants')) {
        responseData = {
          success: true,
          tenants: [{
            id: 1,
            name: 'John Doe',
            email: 'john@example.com',
            room_number: '101'
          }]
        };
      } else if (url.includes('/api/rent-deposit/deposit/create')) {
        responseData = {
          success: true,
          message: 'Deposit record created successfully',
          record: {
            id: 2,
            tenant_id: 1,
            amount_required: 8000
          }
        };
      } else if (url.includes('/api/rent-deposit/deposit/mark-payment')) {
        responseData = {
          success: true,
          message: 'Payment marked successfully'
        };
      }

      return Promise.resolve({
        ok: true,
        headers: { get: () => 'application/json' },
        json: () => Promise.resolve(responseData),
      });
    });

    render(
      <MemoryRouter>
        <CaretakerDeposits />
      </MemoryRouter>
    );
  });

  test('renders deposit management interface', async () => {
    expect(screen.getByText(/Deposit Management/i)).toBeInTheDocument();
    expect(screen.getByText(/Deposit Records/i)).toBeInTheDocument();
  });

  test('fetches deposit records on component mount', async () => {
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining(`${config.apiBaseUrl}/api/rent-deposit/deposit/records`),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': 'Bearer fake-caretaker-token',
            'Content-Type': 'application/json'
          })
        })
      );
    });
  });

  test('displays deposit records correctly', async () => {
    await waitFor(() => {
      expect(screen.getByText(/John Doe/i)).toBeInTheDocument();
      expect(screen.getByText(/Room 101/i)).toBeInTheDocument();
      expect(screen.getByText(/8000/i)).toBeInTheDocument();
      expect(screen.getByText(/partial/i)).toBeInTheDocument();
    });
  });

  test('opens create deposit modal', async () => {
    const createButton = screen.getByText(/Create Deposit/i);
    fireEvent.click(createButton);

    expect(screen.getByText(/Create New Deposit/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Tenant/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Amount Required/i)).toBeInTheDocument();
  });

  test('creates new deposit successfully', async () => {
    const createButton = screen.getByText(/Create Deposit/i);
    fireEvent.click(createButton);

    // Fill form
    fireEvent.change(screen.getByLabelText(/Tenant/i), { target: { value: '1' } });
    fireEvent.change(screen.getByLabelText(/Amount Required/i), { target: { value: '8000' } });

    // Submit form
    const submitButton = screen.getByText(/Create Deposit/i, { selector: 'button[type="submit"]' });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining(`${config.apiBaseUrl}/api/rent-deposit/deposit/create`),
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Authorization': 'Bearer fake-caretaker-token',
            'Content-Type': 'application/json'
          })
        })
      );
    });
  });

  test('opens payment modal for deposit', async () => {
    await waitFor(() => {
      expect(screen.getByText(/John Doe/i)).toBeInTheDocument();
    });

    const paymentButton = screen.getByText(/Mark Payment/i);
    fireEvent.click(paymentButton);

    expect(screen.getByText(/Record Payment/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Amount Paid/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Payment Method/i)).toBeInTheDocument();
  });

  test('records deposit payment successfully', async () => {
    await waitFor(() => {
      expect(screen.getByText(/John Doe/i)).toBeInTheDocument();
    });

    const paymentButton = screen.getByText(/Mark Payment/i);
    fireEvent.click(paymentButton);

    // Fill payment form
    fireEvent.change(screen.getByLabelText(/Amount Paid/i), { target: { value: '4000' } });
    fireEvent.change(screen.getByLabelText(/Payment Method/i), { target: { value: 'cash' } });

    // Submit payment
    const submitButton = screen.getByText(/Record Payment/i);
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining(`${config.apiBaseUrl}/api/rent-deposit/deposit/mark-payment`),
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Authorization': 'Bearer fake-caretaker-token',
            'Content-Type': 'application/json'
          })
        })
      );
    });
  });

  test('filters deposit records by status', async () => {
    const statusFilter = screen.getByLabelText(/Filter by Status/i);
    fireEvent.change(statusFilter, { target: { value: 'partial' } });

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('status=partial'),
        expect.any(Object)
      );
    });
  });

  test('searches deposit records', async () => {
    const searchInput = screen.getByPlaceholderText(/Search deposits/i);
    fireEvent.change(searchInput, { target: { value: 'John Doe' } });

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('search=John Doe'),
        expect.any(Object)
      );
    });
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
      expect(screen.getByText(/Error loading deposit records/i)).toBeInTheDocument();
    });
  });

  test('displays loading state', async () => {
    // Test initial loading state
    expect(screen.getByText(/Loading/i)).toBeInTheDocument();
  });

  test('navigates between pages', async () => {
    const nextPageButton = screen.getByText(/Next/i);
    fireEvent.click(nextPageButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('page=2'),
        expect.any(Object)
      );
    });
  });
});
