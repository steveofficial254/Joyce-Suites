import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import MaintenancePage from './MaintenancePage';
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

describe('MaintenancePage Component - Production Ready Tests', () => {
  const mockRequests = [
    {
      id: 1,
      title: 'Leaking Faucet',
      description: 'Kitchen faucet is leaking continuously',
      status: 'pending',
      priority: 'medium',
      tenant_name: 'John Doe',
      room_number: '101',
      created_at: '2024-01-15'
    },
    {
      id: 2,
      title: 'Broken Window',
      description: 'Bedroom window cracked',
      status: 'in_progress',
      priority: 'high',
      tenant_name: 'Jane Smith',
      room_number: '102',
      created_at: '2024-01-14'
    }
  ];

  const mockOnUpdateStatus = jest.fn();

  beforeEach(() => {
    mockOnUpdateStatus.mockClear();
    global.fetch = jest.fn((url, options) => {
      let responseData = { success: true };

      if (url.includes('/api/caretaker/maintenance/')) {
        responseData = {
          success: true,
          message: 'Maintenance status updated successfully'
        };
      }

      return Promise.resolve({
        ok: true,
        headers: { get: () => 'application/json' },
        json: () => Promise.resolve(responseData),
      });
    });

    render(
      <MaintenancePage 
        requests={mockRequests} 
        loading={false} 
        onUpdateStatus={mockOnUpdateStatus}
      />
    );
  });

  test('renders maintenance requests interface', async () => {
    expect(screen.getByText(/Maintenance Requests/i)).toBeInTheDocument();
    expect(screen.getByText(/Leaking Faucet/i)).toBeInTheDocument();
    expect(screen.getByText(/Broken Window/i)).toBeInTheDocument();
  });

  test('displays request details correctly', async () => {
    expect(screen.getByText(/John Doe/i)).toBeInTheDocument();
    expect(screen.getByText(/Room 101/i)).toBeInTheDocument();
    expect(screen.getByText(/Jane Smith/i)).toBeInTheDocument();
    expect(screen.getByText(/Room 102/i)).toBeInTheDocument();
  });

  test('filters requests by status', async () => {
    const statusFilter = screen.getByLabelText(/Filter by Status/i);
    fireEvent.change(statusFilter, { target: { value: 'pending' } });

    expect(screen.getByText(/Leaking Faucet/i)).toBeInTheDocument();
    expect(screen.queryByText(/Broken Window/i)).not.toBeInTheDocument();
  });

  test('filters requests by priority', async () => {
    const priorityFilter = screen.getByLabelText(/Filter by Priority/i);
    fireEvent.change(priorityFilter, { target: { value: 'high' } });

    expect(screen.getByText(/Broken Window/i)).toBeInTheDocument();
    expect(screen.queryByText(/Leaking Faucet/i)).not.toBeInTheDocument();
  });

  test('searches requests by title or description', async () => {
    const searchInput = screen.getByPlaceholderText(/Search requests/i);
    fireEvent.change(searchInput, { target: { value: 'leaking' } });

    expect(screen.getByText(/Leaking Faucet/i)).toBeInTheDocument();
    expect(screen.queryByText(/Broken Window/i)).not.toBeInTheDocument();
  });

  test('updates maintenance request status', async () => {
    const updateButton = screen.getByText(/Mark In Progress/i);
    fireEvent.click(updateButton);

    await waitFor(() => {
      expect(mockOnUpdateStatus).toHaveBeenCalledWith(1, { status: 'in_progress' });
    });
  });

  test('displays status colors correctly', async () => {
    const pendingStatus = screen.getByText(/pending/i);
    expect(pendingStatus).toHaveStyle('color: #FF9800');

    const inProgressStatus = screen.getByText(/in_progress/i);
    expect(inProgressStatus).toHaveStyle('color: #2196F3');
  });

  test('displays priority colors correctly', async () => {
    const mediumPriority = screen.getByText(/medium/i);
    expect(mediumPriority).toHaveStyle('color: #FF9800');

    const highPriority = screen.getByText(/high/i);
    expect(highPriority).toHaveStyle('color: #F44336');
  });

  test('shows loading state', async () => {
    const { rerender } = render(
      <MaintenancePage 
        requests={[]} 
        loading={true} 
        onUpdateStatus={mockOnUpdateStatus}
      />
    );

    expect(screen.getByText(/Loading maintenance requests/i)).toBeInTheDocument();
  });

  test('displays empty state when no requests', async () => {
    const { rerender } = render(
      <MaintenancePage 
        requests={[]} 
        loading={false} 
        onUpdateStatus={mockOnUpdateStatus}
      />
    );

    expect(screen.getByText(/No maintenance requests found/i)).toBeInTheDocument();
  });

  test('handles status update errors gracefully', async () => {
    mockOnUpdateStatus.mockImplementationOnce(() => {
      throw new Error('Failed to update status');
    });

    const updateButton = screen.getByText(/Mark In Progress/i);
    fireEvent.click(updateButton);

    await waitFor(() => {
      expect(screen.getByText(/Failed to update status/i)).toBeInTheDocument();
    });
  });

  test('opens request details modal', async () => {
    const requestCard = screen.getByText(/Leaking Faucet/i);
    fireEvent.click(requestCard);

    expect(screen.getByText(/Request Details/i)).toBeInTheDocument();
    expect(screen.getByText(/Kitchen faucet is leaking continuously/i)).toBeInTheDocument();
  });

  test('closes request details modal', async () => {
    const requestCard = screen.getByText(/Leaking Faucet/i);
    fireEvent.click(requestCard);

    const closeButton = screen.getByText(/Close/i);
    fireEvent.click(closeButton);

    expect(screen.queryByText(/Request Details/i)).not.toBeInTheDocument();
  });

  test('updates status from modal', async () => {
    const requestCard = screen.getByText(/Leaking Faucet/i);
    fireEvent.click(requestCard);

    const completeButton = screen.getByText(/Mark Completed/i);
    fireEvent.click(completeButton);

    await waitFor(() => {
      expect(mockOnUpdateStatus).toHaveBeenCalledWith(1, { status: 'completed' });
    });
  });
});
