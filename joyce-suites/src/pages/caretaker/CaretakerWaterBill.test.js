import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import CaretakerWaterBill from './CaretakerWaterBill';
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

describe('CaretakerWaterBill Component - Production Ready Tests', () => {
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

      if (url.includes('/api/rent-deposit/water-bill/records')) {
        responseData = {
          success: true,
          records: [{
            id: 1,
            tenant_name: 'John Doe',
            room_number: '101',
            month: 1,
            year: 2024,
            amount: 500,
            status: 'pending',
            due_date: '2024-01-31',
            reading_date: '2024-01-15',
            units_consumed: 10
          }],
          pagination: {
            current_page: 1,
            total_pages: 1,
            total_records: 1
          }
        };
      } else if (url.includes('/api/caretaker/tenants')) {
        responseData = {
          success: true,
          tenants: [{
            id: 1,
            name: 'John Doe',
            email: 'john@example.com',
            room_number: '101'
          }]
        };
      } else if (url.includes('/api/rent-deposit/water-bill/bulk-create')) {
        responseData = {
          success: true,
          message: 'Water bills created successfully',
          bills: [{
            id: 2,
            tenant_id: 1,
            amount: 500
          }]
        };
      } else if (url.includes('/api/rent-deposit/water-bill/mark-payment')) {
        responseData = {
          success: true,
          message: 'Payment recorded successfully'
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
        <CaretakerWaterBill />
      </MemoryRouter>
    );
  });

  test('renders water bill management interface', async () => {
    expect(screen.getByText(/Water Bill Management/i)).toBeInTheDocument();
    expect(screen.getByText(/Water Bill Records/i)).toBeInTheDocument();
  });

  test('fetches water bill records on component mount', async () => {
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining(`${config.apiBaseUrl}/api/rent-deposit/water-bill/records`),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': 'Bearer fake-caretaker-token',
            'Content-Type': 'application/json'
          })
        })
      );
    });
  });

  test('displays water bill records correctly', async () => {
    await waitFor(() => {
      expect(screen.getByText(/John Doe/i)).toBeInTheDocument();
      expect(screen.getByText(/Room 101/i)).toBeInTheDocument();
      expect(screen.getByText(/500/i)).toBeInTheDocument();
      expect(screen.getByText(/pending/i)).toBeInTheDocument();
    });
  });

  test('opens bulk create modal', async () => {
    const createButton = screen.getByText(/Bulk Create Bills/i);
    fireEvent.click(createButton);

    expect(screen.getByText(/Bulk Create Water Bills/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Month/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Year/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Unit Rate/i)).toBeInTheDocument();
  });

  test('creates bulk water bills successfully', async () => {
    const createButton = screen.getByText(/Bulk Create Bills/i);
    fireEvent.click(createButton);

    // Fill form
    fireEvent.change(screen.getByLabelText(/Unit Rate/i), { target: { value: '50' } });

    // Submit form
    const submitButton = screen.getByText(/Create Bills/i);
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining(`${config.apiBaseUrl}/api/rent-deposit/water-bill/bulk-create`),
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

  test('opens payment modal for water bill', async () => {
    await waitFor(() => {
      expect(screen.getByText(/John Doe/i)).toBeInTheDocument();
    });

    const paymentButton = screen.getByText(/Record Payment/i);
    fireEvent.click(paymentButton);

    expect(screen.getByText(/Record Water Bill Payment/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Amount Paid/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Payment Method/i)).toBeInTheDocument();
  });

  test('records water bill payment successfully', async () => {
    await waitFor(() => {
      expect(screen.getByText(/John Doe/i)).toBeInTheDocument();
    });

    const paymentButton = screen.getByText(/Record Payment/i);
    fireEvent.click(paymentButton);

    // Fill payment form
    fireEvent.change(screen.getByLabelText(/Amount Paid/i), { target: { value: '500' } });
    fireEvent.change(screen.getByLabelText(/Payment Method/i), { target: { value: 'Cash' } });

    // Submit payment
    const submitButton = screen.getByText(/Record Payment/i);
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining(`${config.apiBaseUrl}/api/rent-deposit/water-bill/mark-payment`),
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

  test('filters water bill records by status', async () => {
    const statusFilter = screen.getByLabelText(/Filter by Status/i);
    fireEvent.change(statusFilter, { target: { value: 'pending' } });

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('status=pending'),
        expect.any(Object)
      );
    });
  });

  test('filters water bill records by month', async () => {
    const monthFilter = screen.getByLabelText(/Filter by Month/i);
    fireEvent.change(monthFilter, { target: { value: '1' } });

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('month=1'),
        expect.any(Object)
      );
    });
  });

  test('filters water bill records by year', async () => {
    const yearFilter = screen.getByLabelText(/Filter by Year/i);
    fireEvent.change(yearFilter, { target: { value: '2024' } });

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('year=2024'),
        expect.any(Object)
      );
    });
  });

  test('searches water bill records', async () => {
    const searchInput = screen.getByPlaceholderText(/Search water bills/i);
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
      expect(screen.getByText(/Error loading water bill records/i)).toBeInTheDocument();
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

  test('displays bill statistics', async () => {
    await waitFor(() => {
      expect(screen.getByText(/Total Bills/i)).toBeInTheDocument();
      expect(screen.getByText(/Pending Payments/i)).toBeInTheDocument();
      expect(screen.getByText(/Collected/i)).toBeInTheDocument();
    });
  });

  test('exports bill records', async () => {
    const exportButton = screen.getByText(/Export/i);
    fireEvent.click(exportButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/rent-deposit/water-bill/export'),
        expect.any(Object)
      );
    });
  });
});
