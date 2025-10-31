import React from 'react';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';

// ✅ Mock BEFORE importing component
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => {
  const actual = jest.requireActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

import CaretakerLogin from './CaretakerLogin';

const renderComponent = () => {
  return render(
    <MemoryRouter>
      <CaretakerLogin />
    </MemoryRouter>
  );
};

// Global setup before all tests
beforeAll(() => {
  // Ensure clean localStorage from the start
  if (global.localStorage) {
    try {
      global.localStorage.clear();
    } catch (e) {
      // Ignore
    }
  }
});

describe('CaretakerLogin Component', () => {
  beforeEach(() => {
    // ABSOLUTE FIRST: Clear any existing localStorage multiple times to be sure
    let clearAttempts = 0;
    while (clearAttempts < 3) {
      if (global.localStorage && typeof global.localStorage.clear === 'function') {
        try {
          global.localStorage.clear();
          // Verify it's actually cleared
          if (global.localStorage.length === 0) {
            break;
          }
        } catch (e) {
          // Continue trying
        }
      }
      clearAttempts++;
    }

    // Clean up from previous test
    cleanup();

    // Reset mockNavigate IMMEDIATELY
    mockNavigate.mockReset();
    mockNavigate.mockClear();
    mockNavigate.mockImplementation(() => {});

    // Reset all Jest mocks (this includes fetch spies)
    jest.restoreAllMocks();
    jest.clearAllMocks();

    // Completely remove old localStorage property
    const descriptor = Object.getOwnPropertyDescriptor(global, 'localStorage');
    if (descriptor && descriptor.configurable) {
      delete global.localStorage;
    }

    // Create a completely isolated store for this test
    const store = {};

    // Create the mock with this test's store
    const mockLocalStorage = {
      getItem: (key) => {
        const value = store[key];
        return value ?? null;
      },
      setItem: (key, value) => {
        store[key] = String(value);
      },
      removeItem: (key) => {
        delete store[key];
      },
      clear: () => {
        Object.keys(store).forEach(key => {
          delete store[key];
        });
      },
      get length() {
        return Object.keys(store).length;
      },
      key: (index) => {
        const keys = Object.keys(store);
        return keys[index] ?? null;
      },
    };

    // Replace global.localStorage with a fresh mock - use writable: false for safety
    Object.defineProperty(global, 'localStorage', {
      value: mockLocalStorage,
      writable: false,
      configurable: true,
    });
  });

  afterEach(() => {
    // Clean up React components
    cleanup();

    // Restore ALL mocks including fetch
    jest.restoreAllMocks();

    // Clear mocks
    jest.clearAllMocks();
    mockNavigate.mockClear();
    mockNavigate.mockReset();

    // Clean up localStorage completely
    try {
      if (global.localStorage) {
        global.localStorage.clear();
      }
    } catch (e) {
      // Ignore
    }

    // Delete the property
    const descriptor = Object.getOwnPropertyDescriptor(global, 'localStorage');
    if (descriptor && descriptor.configurable) {
      delete global.localStorage;
    }
  });

  test('renders login form with email and password fields', () => {
    renderComponent();

    expect(screen.getByText(/Joyce Suits Apartments/i)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Caretaker Login/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/Email Address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Login as Caretaker/i })).toBeInTheDocument();
  });

  test('renders navigation buttons for tenant and admin login', () => {
    renderComponent();

    expect(screen.getByRole('button', { name: /Tenant Login/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Admin Login/i })).toBeInTheDocument();
  });

  test('navigates to tenant login when tenant button clicked', () => {
    renderComponent();

    fireEvent.click(screen.getByRole('button', { name: /Tenant Login/i }));

    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  test('navigates to admin login when admin button clicked', () => {
    renderComponent();

    fireEvent.click(screen.getByRole('button', { name: /Admin Login/i }));

    expect(mockNavigate).toHaveBeenCalledWith('/admin-login');
  });

  test('shows error when email field is empty', () => {
    renderComponent();

    const emailInput = screen.getByLabelText(/Email Address/i);
    expect(emailInput).toHaveAttribute('required');
  });

  test('shows error when password field is empty', () => {
    renderComponent();

    const passwordInput = screen.getByLabelText(/Password/i);
    expect(passwordInput).toHaveAttribute('required');
  });

  test('disables login button while loading', async () => {
    jest.spyOn(global, 'fetch').mockImplementationOnce(
      () =>
        new Promise((resolve) =>
          setTimeout(
            () =>
              resolve({
                ok: true,
                json: () =>
                  Promise.resolve({
                    token: 'caretaker-token',
                    userId: '1',
                  }),
              }),
            100
          )
        )
    );

    renderComponent();

    fireEvent.change(screen.getByLabelText(/Email Address/i), {
      target: { value: 'caretaker@joycesuites.com' },
    });
    fireEvent.change(screen.getByLabelText(/Password/i), {
      target: { value: 'password123' },
    });

    const loginButton = screen.getByRole('button', { name: /Login as Caretaker/i });
    fireEvent.click(loginButton);

    expect(loginButton).toBeDisabled();
    expect(loginButton).toHaveTextContent(/Logging in/i);
  });

  test('handles successful login', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          token: 'caretaker-token-12345',
          userId: '1',
        }),
    });

    renderComponent();

    fireEvent.change(screen.getByLabelText(/Email Address/i), {
      target: { value: 'caretaker@joycesuites.com' },
    });
    fireEvent.change(screen.getByLabelText(/Password/i), {
      target: { value: 'securepass' },
    });

    fireEvent.click(screen.getByRole('button', { name: /Login as Caretaker/i }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'caretaker@joycesuites.com',
          password: 'securepass',
          role: 'caretaker',
        }),
      });
    });

    await waitFor(() => {
      expect(localStorage.getItem('token')).toBe('caretaker-token-12345');
      expect(localStorage.getItem('userRole')).toBe('caretaker');
      expect(localStorage.getItem('userId')).toBe('1');
      expect(mockNavigate).toHaveBeenCalledWith('/caretaker/dashboard');
    });
  });

  test('handles login failure with error message from server', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: false,
      json: () =>
        Promise.resolve({
          message: 'Invalid caretaker credentials',
        }),
    });

    renderComponent();

    fireEvent.change(screen.getByLabelText(/Email Address/i), {
      target: { value: 'wrong@joycesuites.com' },
    });
    fireEvent.change(screen.getByLabelText(/Password/i), {
      target: { value: 'wrongpass' },
    });

    fireEvent.click(screen.getByRole('button', { name: /Login as Caretaker/i }));

    await waitFor(() => {
      expect(screen.getByText(/Invalid caretaker credentials/i)).toBeInTheDocument();
    });

    expect(localStorage.getItem('token')).toBeNull();
    expect(mockNavigate).toHaveBeenCalledTimes(0);
  });

  test('handles login failure with generic error message', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({}),
    });

    renderComponent();

    fireEvent.change(screen.getByLabelText(/Email Address/i), {
      target: { value: 'caretaker@joycesuites.com' },
    });
    fireEvent.change(screen.getByLabelText(/Password/i), {
      target: { value: 'password123' },
    });

    fireEvent.click(screen.getByRole('button', { name: /Login as Caretaker/i }));

    await waitFor(() => {
      expect(screen.getByText(/Login failed/i)).toBeInTheDocument();
    });

    expect(localStorage.getItem('token')).toBeNull();
    expect(mockNavigate).toHaveBeenCalledTimes(0);
  });

  test('handles network error during login', async () => {
    jest.spyOn(global, 'fetch').mockRejectedValueOnce(new Error('Network error'));

    renderComponent();

    fireEvent.change(screen.getByLabelText(/Email Address/i), {
      target: { value: 'caretaker@joycesuites.com' },
    });
    fireEvent.change(screen.getByLabelText(/Password/i), {
      target: { value: 'password123' },
    });

    fireEvent.click(screen.getByRole('button', { name: /Login as Caretaker/i }));

    await waitFor(
      () => {
        expect(screen.getByText(/Network error/i)).toBeInTheDocument();
      },
      { timeout: 3000 }
    );

    // Verify no data was stored
    expect(localStorage.getItem('token')).toBeNull();
    expect(localStorage.getItem('userRole')).toBeNull();
    expect(localStorage.getItem('userId')).toBeNull();
    expect(mockNavigate).toHaveBeenCalledTimes(0);
  });

  test('clears error message when form is submitted again', async () => {
    jest
      .spyOn(global, 'fetch')
      .mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ message: 'Login failed' }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            token: 'caretaker-success-token',
            userId: '1',
          }),
      });

    renderComponent();

    // First failed attempt
    fireEvent.change(screen.getByLabelText(/Email Address/i), {
      target: { value: 'caretaker@joycesuites.com' },
    });
    fireEvent.change(screen.getByLabelText(/Password/i), {
      target: { value: 'wrongpass' },
    });

    fireEvent.click(screen.getByRole('button', { name: /Login as Caretaker/i }));

    await waitFor(() => {
      expect(screen.getByText(/Login failed/i)).toBeInTheDocument();
    });

    // Second successful attempt
    fireEvent.change(screen.getByLabelText(/Email Address/i), {
      target: { value: 'caretaker@joycesuites.com' },
    });
    fireEvent.change(screen.getByLabelText(/Password/i), {
      target: { value: 'correctpass' },
    });

    fireEvent.click(screen.getByRole('button', { name: /Login as Caretaker/i }));

    await waitFor(() => {
      expect(screen.queryByText(/Login failed/i)).not.toBeInTheDocument();
      expect(mockNavigate).toHaveBeenCalledWith('/caretaker/dashboard');
    });
  });

  test('sends correct request payload to API with caretaker role', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          token: 'caretaker-token',
          userId: '1',
        }),
    });

    renderComponent();

    const testEmail = 'caretaker@joycesuites.com';
    const testPassword = 'mypassword123';

    fireEvent.change(screen.getByLabelText(/Email Address/i), {
      target: { value: testEmail },
    });
    fireEvent.change(screen.getByLabelText(/Password/i), {
      target: { value: testPassword },
    });

    fireEvent.click(screen.getByRole('button', { name: /Login as Caretaker/i }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: testEmail,
          password: testPassword,
          role: 'caretaker',
        }),
      });
    });
  });

  test('button text changes back to Login as Caretaker after error', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({ message: 'Login failed' }),
    });

    renderComponent();

    fireEvent.change(screen.getByLabelText(/Email Address/i), {
      target: { value: 'caretaker@joycesuites.com' },
    });
    fireEvent.change(screen.getByLabelText(/Password/i), {
      target: { value: 'password' },
    });

    const loginButton = screen.getByRole('button', { name: /Login as Caretaker/i });
    fireEvent.click(loginButton);

    await waitFor(() => {
      expect(loginButton).toHaveTextContent(/Login as Caretaker/i);
      expect(loginButton).not.toBeDisabled();
    });
  });
});