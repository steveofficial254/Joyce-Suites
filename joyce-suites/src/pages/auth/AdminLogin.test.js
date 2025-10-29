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

import AdminLogin from './AdminLogin';

const renderComponent = () => {
  return render(
    <MemoryRouter>
      <AdminLogin />
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

// Suppress act() warnings for AdminLogin
beforeEach(() => {
  const originalError = console.error;
  jest.spyOn(console, 'error').mockImplementation((...args) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('An update to AdminLogin inside a test was not wrapped in act')
    ) {
      return;
    }
    originalError.call(console, ...args);
  });
});

describe('AdminLogin Component', () => {
  beforeEach(() => {
    // Suppress act() warnings for this test suite
    const originalError = console.error;
    jest.spyOn(console, 'error').mockImplementation((...args) => {
      if (
        typeof args[0] === 'string' &&
        args[0].includes('An update to AdminLogin inside a test was not wrapped in act')
      ) {
        return;
      }
      originalError.call(console, ...args);
    });

    // Clean up from previous test
    cleanup();

    // FIRST: Delete localStorage if it exists to ensure complete cleanup
    if (Object.getOwnPropertyDescriptor(global, 'localStorage')) {
      delete global.localStorage;
    }

    // SECOND: Reset all Jest mocks
    jest.clearAllMocks();
    jest.restoreAllMocks();
    mockNavigate.mockClear();
    mockNavigate.mockReset();

    // THIRD: Create a completely isolated store for this test
    const store = {};

    // Create the mock with this test's store
    const mockLocalStorage = {
      getItem: (key) => store[key] ?? null,
      setItem: (key, value) => {
        store[key] = String(value);
      },
      removeItem: (key) => {
        delete store[key];
      },
      clear: () => {
        Object.keys(store).forEach(key => delete store[key]);
      },
      get length() {
        return Object.keys(store).length;
      },
      key: (index) => {
        const keys = Object.keys(store);
        return keys[index] ?? null;
      },
    };

    // Replace global.localStorage completely with fresh mock
    Object.defineProperty(global, 'localStorage', {
      value: mockLocalStorage,
      writable: true,
      configurable: true,
    });

    // FOURTH: Create fresh fetch mock
    global.fetch = jest.fn();
  });

  afterEach(() => {
    // Clean up React components
    cleanup();

    // Clean up mocks
    mockNavigate.mockClear();
    mockNavigate.mockReset();
    jest.restoreAllMocks();

    // Clean up localStorage
    if (Object.getOwnPropertyDescriptor(global, 'localStorage')) {
      delete global.localStorage;
    }
  });

  test('renders login form with email and password fields', () => {
    renderComponent();

    expect(screen.getByText(/Joyce Suits Apartments/i)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Admin Portal/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/Admin Email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Admin Password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Login to Admin Portal/i })).toBeInTheDocument();
  });

  test('renders navigation buttons for tenant and caretaker login', () => {
    renderComponent();

    expect(screen.getByRole('button', { name: /Tenant Login/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Caretaker Login/i })).toBeInTheDocument();
  });

  test('renders admin notice', () => {
    renderComponent();

    expect(screen.getByText(/Authorized Personnel Only/i)).toBeInTheDocument();
  });

  test('navigates to tenant login when tenant button clicked', () => {
    renderComponent();

    fireEvent.click(screen.getByRole('button', { name: /Tenant Login/i }));

    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  test('navigates to caretaker login when caretaker button clicked', () => {
    renderComponent();

    fireEvent.click(screen.getByRole('button', { name: /Caretaker Login/i }));

    expect(mockNavigate).toHaveBeenCalledWith('/caretaker-login');
  });

  test('shows error when email field is empty', () => {
    renderComponent();

    const emailInput = screen.getByLabelText(/Admin Email/i);
    expect(emailInput).toHaveAttribute('required');
  });

  test('shows error when password field is empty', () => {
    renderComponent();

    const passwordInput = screen.getByLabelText(/Admin Password/i);
    expect(passwordInput).toHaveAttribute('required');
  });

  test('disables login button while loading', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          token: 'admin-token',
          userId: '1',
        }),
    });

    renderComponent();

    fireEvent.change(screen.getByLabelText(/Admin Email/i), {
      target: { value: 'admin@joycesuites.com' },
    });
    fireEvent.change(screen.getByLabelText(/Admin Password/i), {
      target: { value: 'adminpass123' },
    });

    const loginButton = screen.getByRole('button', { name: /Login to Admin Portal/i });
    fireEvent.click(loginButton);

    expect(loginButton).toBeDisabled();
    expect(loginButton).toHaveTextContent(/Verifying/i);
  });

  test('handles successful admin login', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          token: 'admin-token-12345',
          userId: '1',
        }),
    });

    renderComponent();

    fireEvent.change(screen.getByLabelText(/Admin Email/i), {
      target: { value: 'admin@joycesuites.com' },
    });
    fireEvent.change(screen.getByLabelText(/Admin Password/i), {
      target: { value: 'securepass' },
    });

    fireEvent.click(screen.getByRole('button', { name: /Login to Admin Portal/i }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'admin@joycesuites.com',
          password: 'securepass',
          role: 'admin',
        }),
      });
    });

    await waitFor(() => {
      expect(localStorage.getItem('token')).toBe('admin-token-12345');
      expect(localStorage.getItem('userRole')).toBe('admin');
      expect(localStorage.getItem('userId')).toBe('1');
      expect(mockNavigate).toHaveBeenCalledWith('/admin/dashboard');
    });
  });

  test('handles login failure with error message from server', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: false,
      json: () =>
        Promise.resolve({
          message: 'Invalid admin credentials',
        }),
    });

    renderComponent();

    fireEvent.change(screen.getByLabelText(/Admin Email/i), {
      target: { value: 'wrong@joycesuites.com' },
    });
    fireEvent.change(screen.getByLabelText(/Admin Password/i), {
      target: { value: 'wrongpass' },
    });

    fireEvent.click(screen.getByRole('button', { name: /Login to Admin Portal/i }));

    await waitFor(() => {
      expect(screen.getByText(/Invalid admin credentials/i)).toBeInTheDocument();
    });

    expect(localStorage.getItem('token')).toBeNull();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  test('handles login failure with generic error message', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({}),
    });

    renderComponent();

    fireEvent.change(screen.getByLabelText(/Admin Email/i), {
      target: { value: 'admin@joycesuites.com' },
    });
    fireEvent.change(screen.getByLabelText(/Admin Password/i), {
      target: { value: 'password123' },
    });

    fireEvent.click(screen.getByRole('button', { name: /Login to Admin Portal/i }));

    await waitFor(() => {
      expect(screen.getByText(/Login failed/i)).toBeInTheDocument();
    });

    expect(mockNavigate).not.toHaveBeenCalled();
  });

  test('handles network error during login', async () => {
    jest.spyOn(global, 'fetch').mockRejectedValueOnce(new Error('Network error'));

    renderComponent();

    fireEvent.change(screen.getByLabelText(/Admin Email/i), {
      target: { value: 'admin@joycesuites.com' },
    });
    fireEvent.change(screen.getByLabelText(/Admin Password/i), {
      target: { value: 'password123' },
    });

    const loginButton = screen.getByRole('button', { name: /Login to Admin Portal/i });
    fireEvent.click(loginButton);

    await waitFor(
      () => {
        expect(screen.getByText(/Network error/i)).toBeInTheDocument();
      },
      { timeout: 3000 }
    );

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
            token: 'admin-success-token',
            userId: '1',
          }),
      });

    renderComponent();

    // First failed attempt
    fireEvent.change(screen.getByLabelText(/Admin Email/i), {
      target: { value: 'admin@joycesuites.com' },
    });
    fireEvent.change(screen.getByLabelText(/Admin Password/i), {
      target: { value: 'wrongpass' },
    });

    fireEvent.click(screen.getByRole('button', { name: /Login to Admin Portal/i }));

    await waitFor(() => {
      expect(screen.getByText(/Login failed/i)).toBeInTheDocument();
    });

    // Second successful attempt
    fireEvent.change(screen.getByLabelText(/Admin Email/i), {
      target: { value: 'admin@joycesuites.com' },
    });
    fireEvent.change(screen.getByLabelText(/Admin Password/i), {
      target: { value: 'correctpass' },
    });

    fireEvent.click(screen.getByRole('button', { name: /Login to Admin Portal/i }));

    await waitFor(() => {
      expect(screen.queryByText(/Login failed/i)).not.toBeInTheDocument();
      expect(mockNavigate).toHaveBeenCalledWith('/admin/dashboard');
    });
  });

  test('sends correct request payload to API', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          token: 'admin-token',
          userId: '1',
        }),
    });

    renderComponent();

    const testEmail = 'admin@joycesuites.com';
    const testPassword = 'mypassword123';

    fireEvent.change(screen.getByLabelText(/Admin Email/i), {
      target: { value: testEmail },
    });
    fireEvent.change(screen.getByLabelText(/Admin Password/i), {
      target: { value: testPassword },
    });

    fireEvent.click(screen.getByRole('button', { name: /Login to Admin Portal/i }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: testEmail,
          password: testPassword,
          role: 'admin',
        }),
      });
    });
  });

  test('button text changes back to default after error', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({ message: 'Login failed' }),
    });

    renderComponent();

    fireEvent.change(screen.getByLabelText(/Admin Email/i), {
      target: { value: 'admin@joycesuites.com' },
    });
    fireEvent.change(screen.getByLabelText(/Admin Password/i), {
      target: { value: 'password' },
    });

    const loginButton = screen.getByRole('button', { name: /Login to Admin Portal/i });
    fireEvent.click(loginButton);

    await waitFor(() => {
      expect(loginButton).toHaveTextContent(/Login to Admin Portal/i);
      expect(loginButton).not.toBeDisabled();
    });
  });

  test('email input has correct placeholder', () => {
    renderComponent();

    const emailInput = screen.getByLabelText(/Admin Email/i);
    expect(emailInput).toHaveAttribute('placeholder', 'admin@joycesuites.com');
  });

  test('password input has correct placeholder', () => {
    renderComponent();

    const passwordInput = screen.getByLabelText(/Admin Password/i);
    expect(passwordInput).toHaveAttribute('placeholder', 'Enter admin password');
  });

  test('form inputs have required attribute', () => {
    renderComponent();

    expect(screen.getByLabelText(/Admin Email/i)).toHaveAttribute('required');
    expect(screen.getByLabelText(/Admin Password/i)).toHaveAttribute('required');
  });

  test('stores admin role in localStorage on successful login', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          token: 'admin-token',
          userId: '1',
        }),
    });

    renderComponent();

    fireEvent.change(screen.getByLabelText(/Admin Email/i), {
      target: { value: 'admin@joycesuites.com' },
    });
    fireEvent.change(screen.getByLabelText(/Admin Password/i), {
      target: { value: 'password123' },
    });

    fireEvent.click(screen.getByRole('button', { name: /Login to Admin Portal/i }));

    await waitFor(() => {
      expect(localStorage.getItem('userRole')).toBe('admin');
    });
  });

  test('sends role as admin in request payload', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          token: 'admin-token',
          userId: '1',
        }),
    });

    renderComponent();

    fireEvent.change(screen.getByLabelText(/Admin Email/i), {
      target: { value: 'admin@joycesuites.com' },
    });
    fireEvent.change(screen.getByLabelText(/Admin Password/i), {
      target: { value: 'password123' },
    });

    fireEvent.click(screen.getByRole('button', { name: /Login to Admin Portal/i }));

    await waitFor(() => {
      const callArgs = global.fetch.mock.calls[0];
      const body = JSON.parse(callArgs[1].body);
      expect(body.role).toBe('admin');
    });
  });
});