import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import TenantProfile from './TenantProfile';
import '@testing-library/jest-dom';
import config from '../../config';

// Mock the config module to use the database URL
jest.mock('../../config', () => ({
  apiBaseUrl: 'https://joyce-suites-xdkp.onrender.com'
}));

// Mock the navigate function
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
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

describe('TenantProfile Component - Production Ready Tests', () => {
  beforeEach(() => {
    const localStorageMock = (function () {
      let store = {
        'token': 'fake-tenant-token',
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

    global.fetch = jest.fn((url, options) => {
      let responseData = { success: true };

      if (url.includes('/api/tenant/profile')) {
        responseData = {
          success: true,
          profile: {
            id: 3,
            full_name: 'John Doe',
            email: 'john@example.com',
            phone: '0712345678',
            id_number: '12345678',
            room_number: '101',
            floor: '1',
            occupation: 'Software Engineer',
            emergency_contact: 'Jane Doe',
            emergency_phone: '0723456789'
          }
        };
      } else if (url.includes('/api/tenant/profile/update')) {
        responseData = {
          success: true,
          message: 'Profile updated successfully',
          profile: {
            id: 3,
            full_name: 'John Doe Updated',
            email: 'john.updated@example.com'
          }
        };
      } else if (url.includes('/api/tenant/logout')) {
        responseData = { success: true, message: 'Logged out successfully' };
      }

      return Promise.resolve({
        ok: true,
        headers: { get: () => 'application/json' },
        json: () => Promise.resolve(responseData),
      });
    });

    render(
      <MemoryRouter>
        <TenantProfile />
      </MemoryRouter>
    );
  });

  test('renders profile interface', async () => {
    await waitFor(() => {
      expect(screen.getByText(/Profile Information/i)).toBeInTheDocument();
      expect(screen.getByText(/John Doe/i)).toBeInTheDocument();
      expect(screen.getByText(/john@example.com/i)).toBeInTheDocument();
    });
  });

  test('fetches profile data on component mount', async () => {
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining(`${config.apiBaseUrl}/api/tenant/profile`),
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'Authorization': 'Bearer fake-tenant-token',
            'Content-Type': 'application/json'
          })
        })
      );
    });
  });

  test('displays all profile fields', async () => {
    await waitFor(() => {
      expect(screen.getByText(/Full Name/i)).toBeInTheDocument();
      expect(screen.getByText(/Email/i)).toBeInTheDocument();
      expect(screen.getByText(/Phone/i)).toBeInTheDocument();
      expect(screen.getByText(/ID Number/i)).toBeInTheDocument();
      expect(screen.getByText(/Room Number/i)).toBeInTheDocument();
      expect(screen.getByText(/Floor/i)).toBeInTheDocument();
      expect(screen.getByText(/Occupation/i)).toBeInTheDocument();
      expect(screen.getByText(/Emergency Contact/i)).toBeInTheDocument();
      expect(screen.getByText(/Emergency Phone/i)).toBeInTheDocument();
    });
  });

  test('enables edit mode', async () => {
    await waitFor(() => {
      expect(screen.getByText(/John Doe/i)).toBeInTheDocument();
    });

    const editButton = screen.getByText(/Edit Profile/i);
    fireEvent.click(editButton);

    expect(screen.getByText(/Save Changes/i)).toBeInTheDocument();
    expect(screen.getByText(/Cancel/i)).toBeInTheDocument();
  });

  test('updates profile successfully', async () => {
    await waitFor(() => {
      expect(screen.getByText(/John Doe/i)).toBeInTheDocument();
    });

    const editButton = screen.getByText(/Edit Profile/i);
    fireEvent.click(editButton);

    // Update name
    const nameInput = screen.getByLabelText(/Full Name/i);
    fireEvent.change(nameInput, { target: { value: 'John Doe Updated' } });

    // Save changes
    const saveButton = screen.getByText(/Save Changes/i);
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining(`${config.apiBaseUrl}/api/tenant/profile/update`),
        expect.objectContaining({
          method: 'PUT',
          headers: expect.objectContaining({
            'Authorization': 'Bearer fake-tenant-token',
            'Content-Type': 'application/json'
          })
        })
      );
    });
  });

  test('cancels edit mode', async () => {
    await waitFor(() => {
      expect(screen.getByText(/John Doe/i)).toBeInTheDocument();
    });

    const editButton = screen.getByText(/Edit Profile/i);
    fireEvent.click(editButton);

    // Change name
    const nameInput = screen.getByLabelText(/Full Name/i);
    fireEvent.change(nameInput, { target: { value: 'Changed Name' } });

    // Cancel changes
    const cancelButton = screen.getByText(/Cancel/i);
    fireEvent.click(cancelButton);

    // Should revert to original value
    expect(screen.getByText(/John Doe/i)).toBeInTheDocument();
    expect(screen.queryByText(/Changed Name/i)).not.toBeInTheDocument();
  });

  test('validates required fields', async () => {
    await waitFor(() => {
      expect(screen.getByText(/John Doe/i)).toBeInTheDocument();
    });

    const editButton = screen.getByText(/Edit Profile/i);
    fireEvent.click(editButton);

    // Clear required field
    const nameInput = screen.getByLabelText(/Full Name/i);
    fireEvent.change(nameInput, { target: { value: '' } });

    // Try to save
    const saveButton = screen.getByText(/Save Changes/i);
    fireEvent.click(saveButton);

    expect(screen.getByText(/Full name is required/i)).toBeInTheDocument();
  });

  test('validates email format', async () => {
    await waitFor(() => {
      expect(screen.getByText(/john@example.com/i)).toBeInTheDocument();
    });

    const editButton = screen.getByText(/Edit Profile/i);
    fireEvent.click(editButton);

    // Enter invalid email
    const emailInput = screen.getByLabelText(/Email/i);
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });

    // Try to save
    const saveButton = screen.getByText(/Save Changes/i);
    fireEvent.click(saveButton);

    expect(screen.getByText(/Invalid email format/i)).toBeInTheDocument();
  });

  test('validates phone number format', async () => {
    await waitFor(() => {
      expect(screen.getByText(/0712345678/i)).toBeInTheDocument();
    });

    const editButton = screen.getByText(/Edit Profile/i);
    fireEvent.click(editButton);

    // Enter invalid phone
    const phoneInput = screen.getByLabelText(/Phone/i);
    fireEvent.change(phoneInput, { target: { value: '123' } });

    // Try to save
    const saveButton = screen.getByText(/Save Changes/i);
    fireEvent.click(saveButton);

    expect(screen.getByText(/Invalid phone number format/i)).toBeInTheDocument();
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
      expect(screen.getByText(/Error loading profile/i)).toBeInTheDocument();
    });
  });

  test('displays loading state', async () => {
    // Test initial loading state
    expect(screen.getByText(/Loading profile/i)).toBeInTheDocument();
  });

  test('logs out successfully', async () => {
    const logoutButton = screen.getByText(/Logout/i);
    fireEvent.click(logoutButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining(`${config.apiBaseUrl}/api/tenant/logout`),
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Authorization': 'Bearer fake-tenant-token'
          })
        })
      );
    });

    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  test('shows success message after update', async () => {
    await waitFor(() => {
      expect(screen.getByText(/John Doe/i)).toBeInTheDocument();
    });

    const editButton = screen.getByText(/Edit Profile/i);
    fireEvent.click(editButton);

    // Update name
    const nameInput = screen.getByLabelText(/Full Name/i);
    fireEvent.change(nameInput, { target: { value: 'John Doe Updated' } });

    // Save changes
    const saveButton = screen.getByText(/Save Changes/i);
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText(/Profile updated successfully/i)).toBeInTheDocument();
    });
  });

  test('shows error message on update failure', async () => {
    global.fetch.mockImplementationOnce(() => 
      Promise.resolve({
        ok: false,
        status: 400,
        json: () => Promise.resolve({ success: false, error: 'Update failed' })
      })
    );

    await waitFor(() => {
      expect(screen.getByText(/John Doe/i)).toBeInTheDocument();
    });

    const editButton = screen.getByText(/Edit Profile/i);
    fireEvent.click(editButton);

    // Update name
    const nameInput = screen.getByLabelText(/Full Name/i);
    fireEvent.change(nameInput, { target: { value: 'John Doe Updated' } });

    // Save changes
    const saveButton = screen.getByText(/Save Changes/i);
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText(/Failed to update profile/i)).toBeInTheDocument();
    });
  });
});
