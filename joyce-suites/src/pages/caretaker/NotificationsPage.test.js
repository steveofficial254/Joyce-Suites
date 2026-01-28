import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import NotificationsPage from './NotificationsPage';
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

describe('NotificationsPage Component - Production Ready Tests', () => {
  const mockNotifications = [
    {
      id: 1,
      title: 'New Booking Inquiry',
      message: 'A new booking inquiry has been received for Room 101',
      notification_type: 'inquiry',
      is_read: false,
      created_at: '2024-01-15T10:30:00Z',
      user: {
        full_name: 'John Doe',
        email: 'john@example.com'
      }
    },
    {
      id: 2,
      title: 'Maintenance Request Updated',
      message: 'Maintenance request for Room 102 has been marked as completed',
      notification_type: 'maintenance',
      is_read: true,
      created_at: '2024-01-14T15:45:00Z',
      user: {
        full_name: 'Jane Smith',
        email: 'jane@example.com'
      }
    },
    {
      id: 3,
      title: 'Payment Received',
      message: 'Payment of KSh 8000 received for Room 103',
      notification_type: 'payment',
      is_read: false,
      created_at: '2024-01-13T09:20:00Z',
      user: {
        full_name: 'Bob Johnson',
        email: 'bob@example.com'
      }
    }
  ];

  const mockOnMarkAsRead = jest.fn();
  const mockOnDeleteNotification = jest.fn();

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
          store[key] = 'Bearer ' + value;
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

      if (url.includes('/api/auth/notifications')) {
        responseData = {
          success: true,
          notifications: mockNotifications
        };
      } else if (url.includes('/api/auth/notifications/') && url.includes('/read')) {
        responseData = {
          success: true,
          message: 'Notification marked as read'
        };
      } else if (url.includes('/api/auth/notifications/') && options.method === 'DELETE') {
        responseData = {
          success: true,
          message: 'Notification deleted successfully'
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
        <NotificationsPage 
          notifications={mockNotifications}
          onMarkAsRead={mockOnMarkAsRead}
          onDeleteNotification={mockOnDeleteNotification}
        />
      </MemoryRouter>
    );
  });

  test('renders notifications interface', async () => {
    expect(screen.getByText(/Notifications/i)).toBeInTheDocument();
    expect(screen.getByText(/New Booking Inquiry/i)).toBeInTheDocument();
    expect(screen.getByText(/Maintenance Request Updated/i)).toBeInTheDocument();
    expect(screen.getByText(/Payment Received/i)).toBeInTheDocument();
  });

  test('displays notification details correctly', async () => {
    expect(screen.getByText(/John Doe/i)).toBeInTheDocument();
    expect(screen.getByText(/Room 101/i)).toBeInTheDocument();
    expect(screen.getByText(/jane@example.com/i)).toBeInTheDocument();
    expect(screen.getByText(/Room 102/i)).toBeInTheDocument();
    expect(screen.getByText(/bob@example.com/i)).toBeInTheDocument();
    expect(screen.getByText(/Room 103/i)).toBeInTheDocument();
  });

  test('shows unread notifications with proper styling', async () => {
    const unreadNotifications = screen.getAllByText(/New Booking Inquiry/i);
    expect(unreadNotifications.length).toBeGreaterThan(0);
    
    // Check for unread indicator
    expect(screen.getByText(/Unread/i)).toBeInTheDocument();
  });

  test('filters notifications by type', async () => {
    const typeFilter = screen.getByLabelText(/Filter by Type/i);
    fireEvent.change(typeFilter, { target: { value: 'inquiry' } });

    expect(screen.getByText(/New Booking Inquiry/i)).toBeInTheDocument();
    expect(screen.queryByText(/Maintenance Request Updated/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Payment Received/i)).not.toBeInTheDocument();
  });

  test('filters notifications by read status', async () => {
    const statusFilter = screen.getByLabelText(/Filter by Status/i);
    fireEvent.change(statusFilter, { target: { value: 'unread' } });

    expect(screen.getByText(/New Booking Inquiry/i)).toBeInTheDocument();
    expect(screen.getByText(/Payment Received/i)).toBeInTheDocument();
    expect(screen.queryByText(/Maintenance Request Updated/i)).not.toBeInTheDocument();
  });

  test('searches notifications', async () => {
    const searchInput = screen.getByPlaceholderText(/Search notifications/i);
    fireEvent.change(searchInput, { target: { value: 'booking' } });

    expect(screen.getByText(/New Booking Inquiry/i)).toBeInTheDocument();
    expect(screen.queryByText(/Maintenance Request Updated/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Payment Received/i)).not.toBeInTheDocument();
  });

  test('marks notification as read', async () => {
    const markAsReadButton = screen.getByText(/Mark as Read/i);
    fireEvent.click(markAsReadButton);

    await waitFor(() => {
      expect(mockOnMarkAsRead).toHaveBeenCalledWith(1);
    });
  });

  test('marks notification as unread', async () => {
    const markAsUnreadButton = screen.getByText(/Mark as Unread/i);
    fireEvent.click(markAsUnreadButton);

    await waitFor(() => {
      expect(mockOnMarkAsRead).toHaveBeenCalledWith(1, { is_read: false });
    });
  });

  test('deletes notification', async () => {
    const deleteButton = screen.getByText(/Delete/i);
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(screen.getByText(/Are you sure/i)).toBeInTheDocument();
    });

    const confirmButton = screen.getByText(/Yes, Delete/i);
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(mockOnDeleteNotification).toHaveBeenCalledWith(1);
    });
  });

  test('shows notification timestamps', async () => {
    expect(screen.getByText(/January 15, 2024/i)).toBeInTheDocument();
    expect(screen.getByText(/January 14, 2024/i)).toBeInTheDocument();
    expect(screen.getByText(/January 13, 2024/i)).toBeInTheDocument();
  });

  test('displays notification types with proper icons', async () => {
    expect(screen.getByText(/inquiry/i)).toBeInTheDocument();
    expect(screen.getByText(/maintenance/i)).toBeInTheDocument();
    expect(screen.byText(/payment/i)).toBeInTheDocument();
  });

  test('shows notification priority indicators', async () => {
    // Check for priority badges or colors
    expect(screen.getByText(/High Priority/i)).toBeInTheDocument();
    expect(screen.getByText(/Medium Priority/i)).toBeInTheDocument();
    expect(screen.getByText(/Low Priority/i)).toBeInTheDocument();
  });

  test('refreshes notifications list', async () => {
    const refreshButton = screen.getByText(/Refresh/i);
    fireEvent.click(refreshButton);

    expect(screen.getByText(/Refreshing notifications/i)).toBeInTheDocument();
  });

  test('shows empty state when no notifications', async () => {
    const { rerender } = render(
      <MemoryRouter>
        <NotificationsPage 
          notifications={[]}
          onMarkAsRead={mockOnMarkAsRead}
          onDeleteNotification={mockOnDeleteNotification}
        />
      </MemoryRouter>
    );

    expect(screen.getByText(/No notifications found/i)).toBeInTheDocument();
    expect(screen.getByText(/You're all caught up/i)).toBeInTheDocument();
  });

  test('shows loading state', async () => {
    const { rerender } = render(
      <MemoryRouter>
        <NotificationsPage 
          notifications={[]}
          loading={true}
          onMarkAsRead={mockOnMarkAsRead}
          onDeleteNotification={mockOnDeleteNotification}
        />
      </MemoryRouter>
    );

    expect(screen.getByText(/Loading notifications/i)).toBeInTheDocument();
  });

  test('displays notification count badge', async () => {
    expect(screen.getByText(/3 notifications/i)).toBeInTheDocument();
    expect(screen.getByText(/2 unread/i)).toBeInTheDocument();
  });

  test('opens notification details modal', async () => {
    const notificationCard = screen.getByText(/New Booking Inquiry/i);
    fireEvent.click(notificationCard);

    expect(screen.getByText(/Notification Details/i)).toBeInTheDocument();
    expect(screen.getByText(/A new booking inquiry has been received for Room 101/i)).toBeInTheDocument();
    expect(screen.getByText(/john@example.com/i)).toBeInTheDocument();
  });

  test('closes notification details modal', async () => {
    const notificationCard = screen.getByText(/New Booking Inquiry/i);
    fireEvent.click(notificationCard);

    const closeButton = screen.getByText(/Close/i);
    fireEvent.click(closeButton);

    expect(screen.queryByText(/Notification Details/i)).not.toBeInTheDocument();
  });

  test('marks all notifications as read', async () => {
    const markAllAsReadButton = screen.getByText(/Mark All as Read/i);
    fireEvent.click(markAllAsReadButton);

    await waitFor(() => {
      expect(screen.getByText(/All notifications marked as read/i)).toBeInTheDocument();
    });
  });

  test('deletes all notifications', async () => {
    const deleteAllButton = screen.getByText(/Delete All/i);
    fireEvent.click(deleteAllButton);

    await waitFor(() => {
      expect(screen.getByText(/Are you sure you want to delete all notifications/i)).toBeInTheDocument();
    });

    const confirmButton = screen.getByText(/Yes, Delete All/i);
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(screen.getByText(/All notifications deleted successfully/i)).toBeInTheDocument();
    });
  });

  test('exports notifications', async () => {
    const exportButton = screen.getByText(/Export/i);
    fireEvent.click(exportButton);

    expect(screen.getByText(/Exporting notifications/i)).toBeInTheDocument();
  });

  test('filters notifications by date range', async () => {
    const dateFilter = screen.getByLabelText(/Filter by Date/i);
    fireEvent.change(dateFilter, { target: { value: 'today' } });

    expect(screen.getByText(/Today/i)).toBeInTheDocument();
    expect(screen.queryByText(/January 13, 2024/i)).not.toBeInTheDocument();
  });

  test('shows notification actions', async () => {
    const notificationCard = screen.getByText(/New Booking Inquiry/i);
    fireEvent.click(notificationCard);

    expect(screen.getByText(/Reply/i)).toBeInTheDocument();
    expect(screen.getByText(/Archive/i)).toBeInTheDocument();
    expect(screen.getByText(/Share/i)).toBeInTheDocument();
  });
});
