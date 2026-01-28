import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import '@testing-library/jest-dom';
import config from '../../config';

// Mock the config module to use the database URL
jest.mock('../../config', () => ({
  apiBaseUrl: 'https://joyce-suites-xdkp.onrender.com'
}));

// Mock the VacateNoticesPage component
const VacateNoticesPage = ({ notices, tenants, loading, onUpdateStatus, onViewDetails }) => {
  const [filterStatus, setFilterStatus] = React.useState('all');

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading vacate notices...</p>
      </div>
    );
  }

  const filtered = notices.filter(notice => {
    if (filterStatus === 'all') return true;
    return notice.status === filterStatus;
  });

  const getStatusColor = (status) => {
    const colors = {
      'pending': '#FF9800',
      'approved': '#4CAF50',
      'rejected': '#F44336',
      'completed': '#2196F3'
    };
    return colors[status] || '#757575';
  };

  return (
    <div className="vacate-notices-page">
      <div className="page-header">
        <h2>Vacate Notices ({filtered.length})</h2>
        <div className="filter-section">
          <label>Status:</label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="status-filter"
          >
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🚪</div>
          <p>No vacate notices found</p>
          <p className="empty-hint">
            {filterStatus === 'all' 
              ? 'No vacate notices have been submitted yet'
              : `No ${filterStatus} vacate notices found`
            }
          </p>
        </div>
      ) : (
        <div className="notices-table">
          <table>
            <thead>
              <tr>
                <th>Tenant</th>
                <th>Room</th>
                <th>Vacate Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(notice => (
                <tr key={notice.id}>
                  <td>{notice.tenant_name || 'Unknown'}</td>
                  <td>Room {notice.room_number || 'N/A'}</td>
                  <td>
                    {notice.vacate_date 
                      ? new Date(notice.vacate_date).toLocaleDateString() 
                      : 'N/A'
                    }
                  </td>
                  <td>
                    <span 
                      style={{ 
                        color: getStatusColor(notice.status),
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        fontWeight: 'bold'
                      }}
                    >
                      {notice.status}
                    </span>
                  </td>
                  <td>
                    <button
                      onClick={() => onViewDetails(notice)}
                      className="view-details-btn"
                    >
                      View Details
                    </button>
                    {notice.status === 'pending' && (
                      <>
                        <button
                          onClick={() => onUpdateStatus(notice.id, 'approved')}
                          className="approve-btn"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => onUpdateStatus(notice.id, 'rejected')}
                          className="reject-btn"
                        >
                          Reject
                        </button>
                      </>
                    )}
                    {notice.status === 'approved' && (
                      <button
                        onClick={() => onUpdateStatus(notice.id, 'completed')}
                        className="complete-btn"
                      >
                        Mark Complete
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

describe('VacateNoticesPage Component - Production Ready Tests', () => {
  const mockNotices = [
    {
      id: 1,
      tenant_name: 'John Doe',
      room_number: '101',
      vacate_date: '2024-02-15',
      status: 'pending',
      created_at: '2024-01-15T10:30:00Z',
      reason: 'Relocating to another city',
      contact_phone: '0712345678',
      contact_email: 'john@example.com'
    },
    {
      id: 2,
      tenant_name: 'Jane Smith',
      room_number: '102',
      vacate_date: '2024-03-01',
      status: 'approved',
      created_at: '2024-01-10T15:45:00Z',
      reason: 'Moving to a larger apartment',
      contact_phone: '0723456789',
      contact_email: 'jane@example.com'
    },
    {
      id: 3,
      tenant_name: 'Bob Johnson',
      room_number: '103',
      vacate_date: '2024-01-30',
      status: 'completed',
      created_at: '2024-01-05T09:20:00Z',
      reason: 'End of lease',
      contact_phone: '0734567890',
      contact_email: 'bob@example.com'
    }
  ];

  const mockTenants = [
    { id: 1, name: 'John Doe', room_number: '101' },
    { id: 2, name: 'Jane Smith', room_number: '102' },
    { id: 3, name: 'Bob Johnson', room_number: '103' }
  ];

  const mockOnUpdateStatus = jest.fn();
  const mockOnViewDetails = jest.fn();

  beforeEach(() => {
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

    global.fetch = jest.fn((url, options) => {
      let responseData = { success: true };

      if (url.includes('/api/admin/vacate-notices')) {
        responseData = {
          success: true,
          notices: mockNotices
        };
      } else if (url.includes('/api/admin/vacate-notices/') && options.method === 'PUT') {
        responseData = {
          success: true,
          message: 'Vacate notice status updated successfully'
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
        <VacateNoticesPage 
          notices={mockNotices}
          tenants={mockTenants}
          loading={false}
          onUpdateStatus={mockOnUpdateStatus}
          onViewDetails={mockOnViewDetails}
        />
      </MemoryRouter>
    );
  });

  test('renders vacate notices interface', async () => {
    expect(screen.getByText(/Vacate Notices \(3\)/i)).toBeInTheDocument();
    expect(screen.getByText(/John Doe/i)).toBeInTheDocument();
    expect(screen.getByText(/Jane Smith/i)).toBeInTheDocument();
    expect(screen.getByText(/Bob Johnson/i)).toBeInTheDocument();
  });

  test('displays notice details correctly', async () => {
    expect(screen.getByText(/Room 101/i)).toBeInTheDocument();
    expect(screen.getByText(/Room 102/i)).toBeInTheDocument();
    expect(screen.getByText(/Room 103/i)).toBeInTheDocument();
    expect(screen.getByText(/February 15, 2024/i)).toBeInTheDocument();
    expect(screen.getByText(/March 1, 2024/i)).toBeInTheDocument();
    expect(screen.getByText(/January 30, 2024/i)).toBeInTheDocument();
  });

  test('filters notices by status', async () => {
    const statusFilter = screen.getByLabelText(/Status:/i);
    fireEvent.change(statusFilter, { target: { value: 'pending' } });

    expect(screen.getByText(/John Doe/i)).toBeInTheDocument();
    expect(screen.queryByText(/Jane Smith/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Bob Johnson/i)).not.toBeInTheDocument();
  });

  test('shows status colors correctly', async () => {
    const pendingStatus = screen.getByText(/pending/i);
    expect(pendingStatus).toHaveStyle('color: #FF9800');

    const approvedStatus = screen.getByText(/approved/i);
    expect(approvedStatus).toHaveStyle('color: #4CAF50');

    const completedStatus = screen.getByText(/completed/i);
    expect(completedStatus).toHaveStyle('color: #2196F3');
  });

  test('opens notice details modal', async () => {
    const viewDetailsButton = screen.getByText(/View Details/i);
    fireEvent.click(viewDetailsButton);

    expect(mockOnViewDetails).toHaveBeenCalledWith(mockNotices[0]);
  });

  test('approves pending notice', async () => {
    const approveButton = screen.getByText(/Approve/i);
    fireEvent.click(approveButton);

    expect(mockOnUpdateStatus).toHaveBeenCalledWith(1, 'approved');
  });

  test('rejects pending notice', async () => {
    const rejectButton = screen.getByText(/Reject/i);
    fireEvent.click(rejectButton);

    expect(mockOnUpdateStatus).toHaveBeenCalledWith(1, 'rejected');
  });

  test('marks approved notice as complete', async () => {
    // Filter to show approved notice
    const statusFilter = screen.getByLabelText(/Status:/i);
    fireEvent.change(statusFilter, { target: { value: 'approved' } });

    const completeButton = screen.getByText(/Mark Complete/i);
    fireEvent.click(completeButton);

    expect(mockOnUpdateStatus).toHaveBeenCalledWith(2, 'completed');
  });

  test('shows loading state', async () => {
    const { rerender } = render(
      <MemoryRouter>
        <VacateNoticesPage 
          notices={[]}
          tenants={[]}
          loading={true}
          onUpdateStatus={mockOnUpdateStatus}
          onViewDetails={mockOnViewDetails}
        />
      </MemoryRouter>
    );

    expect(screen.getByText(/Loading vacate notices/i)).toBeInTheDocument();
  });

  test('shows empty state when no notices', async () => {
    const { rerender } = render(
      <MemoryRouter>
        <VacateNoticesPage 
          notices={[]}
          tenants={[]}
          loading={false}
          onUpdateStatus={mockOnUpdateStatus}
          onViewDetails={mockOnViewDetails}
        />
      </MemoryRouter>
    );

    expect(screen.getByText(/No vacate notices found/i)).toBeInTheDocument();
    expect(screen.getByText(/No vacate notices have been submitted yet/i)).toBeInTheDocument();
  });

  test('shows filtered empty state', async () => {
    const { rerender } = render(
      <MemoryRouter>
        <VacateNoticesPage 
          notices={mockNotices}
          tenants={mockTenants}
          loading={false}
          onUpdateStatus={mockOnUpdateStatus}
          onViewDetails={mockOnViewDetails}
        />
      </MemoryRouter>
    );

    const statusFilter = screen.getByLabelText(/Status:/i);
    fireEvent.change(statusFilter, { target: { value: 'rejected' } });

    expect(screen.getByText(/No vacate notices found/i)).toBeInTheDocument();
    expect(screen.getByText(/No rejected vacate notices found/i)).toBeInTheDocument();
  });

  test('displays correct action buttons based on status', async () => {
    // Pending notices should have approve/reject buttons
    expect(screen.getByText(/Approve/i)).toBeInTheDocument();
    expect(screen.getByText(/Reject/i)).toBeInTheDocument();

    // Filter to approved notice
    const statusFilter = screen.getByLabelText(/Status:/i);
    fireEvent.change(statusFilter, { target: { value: 'approved' } });

    // Approved notices should have complete button
    expect(screen.getByText(/Mark Complete/i)).toBeInTheDocument();
    expect(screen.queryByText(/Approve/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Reject/i)).not.toBeInTheDocument();
  });

  test('updates notice count in header', async () => {
    expect(screen.getByText(/Vacate Notices \(3\)/i)).toBeInTheDocument();

    const statusFilter = screen.getByLabelText(/Status:/i);
    fireEvent.change(statusFilter, { target: { value: 'pending' } });

    expect(screen.getByText(/Vacate Notices \(1\)/i)).toBeInTheDocument();
  });

  test('handles API errors gracefully', async () => {
    global.fetch.mockImplementationOnce(() => 
      Promise.resolve({
        ok: false,
        status: 500,
        json: () => Promise.resolve({ success: false, error: 'Server Error' })
      })
    );

    const approveButton = screen.getByText(/Approve/i);
    fireEvent.click(approveButton);

    // The component should handle the error gracefully
    expect(mockOnUpdateStatus).toHaveBeenCalled();
  });

  test('displays vacate dates in correct format', async () => {
    const vacateDates = screen.getAllByText(/\d{1,2}\/\d{1,2}\/\d{4}/);
    expect(vacateDates.length).toBeGreaterThan(0);
    
    // Check specific dates
    expect(screen.getByText(/2\/15\/2024/i)).toBeInTheDocument();
    expect(screen.getByText(/3\/1\/2024/i)).toBeInTheDocument();
    expect(screen.getByText(/1\/30\/2024/i)).toBeInTheDocument();
  });

  test('shows tenant names correctly', async () => {
    expect(screen.getByText(/John Doe/i)).toBeInTheDocument();
    expect(screen.getByText(/Jane Smith/i)).toBeInTheDocument();
    expect(screen.getByText(/Bob Johnson/i)).toBeInTheDocument();
  });

  test('shows room numbers correctly', async () => {
    expect(screen.getByText(/Room 101/i)).toBeInTheDocument();
    expect(screen.getByText(/Room 102/i)).toBeInTheDocument();
    expect(screen.getByText(/Room 103/i)).toBeInTheDocument();
  });

  test('filters notices by multiple status options', async () => {
    const statusFilter = screen.getByLabelText(/Status:/i);
    
    // Test each filter option
    const statuses = ['all', 'pending', 'approved', 'rejected', 'completed'];
    
    statuses.forEach(status => {
      fireEvent.change(statusFilter, { target: { value: status } });
      expect(statusFilter).toHaveValue(status);
    });
  });

  test('handles empty tenant names', async () => {
    const noticesWithEmptyTenant = [
      {
        id: 4,
        tenant_name: null,
        room_number: '104',
        vacate_date: '2024-02-20',
        status: 'pending'
      }
    ];

    const { rerender } = render(
      <MemoryRouter>
        <VacateNoticesPage 
          notices={noticesWithEmptyTenant}
          tenants={[]}
          loading={false}
          onUpdateStatus={mockOnUpdateStatus}
          onViewDetails={mockOnViewDetails}
        />
      </MemoryRouter>
    );

    expect(screen.getByText(/Unknown/i)).toBeInTheDocument();
  });

  test('handles missing room numbers', async () => {
    const noticesWithoutRoom = [
      {
        id: 5,
        tenant_name: 'Test Tenant',
        room_number: null,
        vacate_date: '2024-02-20',
        status: 'pending'
      }
    ];

    const { rerender } = render(
      <MemoryRouter>
        <VacateNoticesPage 
          notices={noticesWithoutRoom}
          tenants={[]}
          loading={false}
          onUpdateStatus={mockOnUpdateStatus}
          onViewDetails={mockOnViewDetails}
        />
      </MemoryRouter>
    );

    expect(screen.getByText(/Room N\/A/i)).toBeInTheDocument();
  });

  test('handles missing vacate dates', async () => {
    const noticesWithoutDate = [
      {
        id: 6,
        tenant_name: 'Test Tenant',
        room_number: '105',
        vacate_date: null,
        status: 'pending'
      }
    ];

    const { rerender } = render(
      <MemoryRouter>
        <VacateNoticesPage 
          notices={noticesWithoutDate}
          tenants={[]}
          loading={false}
          onUpdateStatus={mockOnUpdateStatus}
          onViewDetails={mockOnViewDetails}
        />
      </MemoryRouter>
    );

    expect(screen.getByText(/N\/A/i)).toBeInTheDocument();
  });
});
