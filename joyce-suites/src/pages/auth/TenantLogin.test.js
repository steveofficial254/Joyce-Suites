import React from 'react';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';


const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => {
  const actual = jest.requireActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

import TenantLogin from './TenantLogin';

const renderComponent = () => {
  return render(
    <MemoryRouter>
      <TenantLogin />
    </MemoryRouter>
  );
};





beforeAll(() => {
  
  if (global.localStorage) {
    try {
      global.localStorage.clear();
    } catch (e) {
      
    }
  }
});


describe('TenantLogin Component', () => {
  beforeEach(() => {
    
    mockNavigate.mockClear();
    mockNavigate.mockReset();
    
    
    jest.restoreAllMocks();
    
    
    jest.clearAllMocks();
    
    
    if (global.fetch && global.fetch.mockRestore) {
      global.fetch.mockRestore();
    }
    global.fetch = jest.fn();

    
    if (Object.getOwnPropertyDescriptor(global, 'localStorage')) {
      delete global.localStorage;
    }

    
    const store = {};

    
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

    
    Object.defineProperty(global, 'localStorage', {
      value: mockLocalStorage,
      writable: true,
      configurable: true,
    });
  });

  afterEach(() => {
    mockNavigate.mockClear();
    mockNavigate.mockReset();
    jest.restoreAllMocks();
    
    
    if (Object.getOwnPropertyDescriptor(global, 'localStorage')) {
      if (global.localStorage && global.localStorage.clear) {
        global.localStorage.clear();
      }
      delete global.localStorage;
    }
  });

  test('renders login form with email and password fields', () => {
    renderComponent();

    expect(screen.getByText(/Joyce Suits Apartments/i)).toBeInTheDocument();
    expect(screen.getByText(/Tenant Login/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email Address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^Login$/i })).toBeInTheDocument();
  });

  test('renders navigation buttons for caretaker and admin login', () => {
    renderComponent();

    expect(screen.getByRole('button', { name: /Caretaker Login/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Admin Login/i })).toBeInTheDocument();
  });

  test('renders forgot password link', () => {
    renderComponent();

    const forgotLink = screen.getByRole('link', { name: /Forgot Password/i });
    expect(forgotLink).toHaveAttribute('href', '/forgot-password');
  });

  test('renders registration link', () => {
    renderComponent();

    const registerLink = screen.getByRole('link', { name: /Register here/i });
    expect(registerLink).toHaveAttribute('href', '/register-tenant');
  });

  test('navigates to caretaker login when caretaker button clicked', () => {
    renderComponent();

    fireEvent.click(screen.getByRole('button', { name: /Caretaker Login/i }));

    expect(mockNavigate).toHaveBeenCalledWith('/caretaker-login');
  });

  test('navigates to admin login when admin button clicked', () => {
    renderComponent();

    fireEvent.click(screen.getByRole('button', { name: /Admin Login/i }));

    expect(mockNavigate).toHaveBeenCalledWith('/admin-login');
  });

  test('shows error when email field is empty', async () => {
    renderComponent();

    const emailInput = screen.getByLabelText(/Email Address/i);
    expect(emailInput).toHaveAttribute('required');
  });

  test('shows error when password field is empty', async () => {
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
                    token: 'test-token',
                    userId: '123',
                    leaseSigned: true,
                  }),
              }),
            100
          )
        )
    );

    renderComponent();

    fireEvent.change(screen.getByLabelText(/Email Address/i), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/Password/i), {
      target: { value: 'password123' },
    });

    const loginButton = screen.getByRole('button', { name: /^Login$/i });
    fireEvent.click(loginButton);

    expect(loginButton).toBeDisabled();
    expect(loginButton).toHaveTextContent(/Logging in/i);
  });

  test('handles successful login with lease signed', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          token: 'test-token-12345',
          userId: '123',
          leaseSigned: true,
        }),
    });

    renderComponent();

    fireEvent.change(screen.getByLabelText(/Email Address/i), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/Password/i), {
      target: { value: 'password123' },
    });

    fireEvent.click(screen.getByRole('button', { name: /^Login$/i }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'password123',
          role: 'tenant',
        }),
      });
    });

    await waitFor(() => {
      expect(localStorage.getItem('token')).toBe('test-token-12345');
      expect(localStorage.getItem('userRole')).toBe('tenant');
      expect(localStorage.getItem('userId')).toBe('123');
      expect(mockNavigate).toHaveBeenCalledWith('/tenant/dashboard');
    });
  });

  test('handles successful login with lease not signed', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          token: 'test-token-45678',
          userId: '456',
          leaseSigned: false,
        }),
    });

    renderComponent();

    fireEvent.change(screen.getByLabelText(/Email Address/i), {
      target: { value: 'newtenant@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/Password/i), {
      target: { value: 'securepass456' },
    });

    fireEvent.click(screen.getByRole('button', { name: /^Login$/i }));

    await waitFor(() => {
      expect(localStorage.getItem('token')).toBe('test-token-45678');
      expect(localStorage.getItem('userRole')).toBe('tenant');
      expect(localStorage.getItem('userId')).toBe('456');
      expect(mockNavigate).toHaveBeenCalledWith('/lease-agreement');
    });
  });

  test('handles login failure with error message from server', async () => {
  
  localStorage.setItem('token', 'test-token');

  jest.spyOn(global, 'fetch').mockResolvedValueOnce({
    ok: false,
    json: () =>
      Promise.resolve({
        message: 'Invalid email or password',
      }),
  });

  renderComponent();

  fireEvent.change(screen.getByLabelText(/Email Address/i), {
    target: { value: 'wrong@example.com' },
  });
  fireEvent.change(screen.getByLabelText(/Password/i), {
    target: { value: 'wrongpassword' },
  });

  fireEvent.click(screen.getByRole('button', { name: /^Login$/i }));

  
  await waitFor(() =>
    expect(screen.getByText(/Invalid email or password/i)).toBeInTheDocument()
  );

  
  await waitFor(() => {
    expect(localStorage.getItem('token')).toBeNull();
    expect(localStorage.getItem('userRole')).toBeNull();
    expect(localStorage.getItem('userId')).toBeNull();
  });

 
  expect(mockNavigate).not.toHaveBeenCalled();
});


  test('handles login failure with generic error message', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({}),
    });

    renderComponent();

    fireEvent.change(screen.getByLabelText(/Email Address/i), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/Password/i), {
      target: { value: 'password123' },
    });

    fireEvent.click(screen.getByRole('button', { name: /^Login$/i }));

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
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/Password/i), {
      target: { value: 'password123' },
    });

    fireEvent.click(screen.getByRole('button', { name: /^Login$/i }));

    await waitFor(() => {
      expect(screen.getByText(/Network error/i)).toBeInTheDocument();
    });

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
            token: 'success-token',
            userId: '789',
            leaseSigned: true,
          }),
      });

    renderComponent();

   
    fireEvent.change(screen.getByLabelText(/Email Address/i), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/Password/i), {
      target: { value: 'wrongpass' },
    });

    fireEvent.click(screen.getByRole('button', { name: /^Login$/i }));

    await waitFor(() => {
      expect(screen.getByText(/Login failed/i)).toBeInTheDocument();
    });

    
    fireEvent.change(screen.getByLabelText(/Email Address/i), {
      target: { value: 'correct@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/Password/i), {
      target: { value: 'correctpass' },
    });

    fireEvent.click(screen.getByRole('button', { name: /^Login$/i }));

    await waitFor(() => {
      expect(screen.queryByText(/Login failed/i)).not.toBeInTheDocument();
      expect(mockNavigate).toHaveBeenCalledWith('/tenant/dashboard');
    });
  });

  test('sends correct request payload to API', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          token: 'test-token',
          userId: '123',
          leaseSigned: true,
        }),
    });

    renderComponent();

    const testEmail = 'tenant@example.com';
    const testPassword = 'mypassword123';

    fireEvent.change(screen.getByLabelText(/Email Address/i), {
      target: { value: testEmail },
    });
    fireEvent.change(screen.getByLabelText(/Password/i), {
      target: { value: testPassword },
    });

    fireEvent.click(screen.getByRole('button', { name: /^Login$/i }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: testEmail,
          password: testPassword,
          role: 'tenant',
        }),
      });
    });
  });

  test('button text changes back to Login after error', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({ message: 'Login failed' }),
    });

    renderComponent();

    fireEvent.change(screen.getByLabelText(/Email Address/i), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/Password/i), {
      target: { value: 'password' },
    });

    const loginButton = screen.getByRole('button', { name: /^Login$/i });
    fireEvent.click(loginButton);

    await waitFor(() => {
      expect(loginButton).toHaveTextContent(/^Login$/);
      expect(loginButton).not.toBeDisabled();
    });
  });
});