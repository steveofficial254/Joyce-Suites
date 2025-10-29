/**
 * @file AdminDashboard.test.js
 * @description Unit tests for AdminDashboard React component
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AdminDashboard from './AdminDashboard';
import '@testing-library/jest-dom';

beforeAll(() => {
  jest.spyOn(console, 'warn').mockImplementation((msg) => {
    if (
      msg.includes('React Router Future Flag Warning') ||
      msg.includes('Relative route resolution')
    ) {
      return; // ignore warnings
    }
    console.warn(msg);
  });
});

describe('AdminDashboard Component', () => {
  beforeEach(() => {
    render(
      <MemoryRouter>
        <AdminDashboard />
      </MemoryRouter>
    );
  });

  test('renders the main dashboard title', () => {
    expect(
      screen.getByText(/Admin Dashboard – Joyce Suits Apartments/i)
    ).toBeInTheDocument();
  });

  test('displays the default DashboardPage content', () => {
    expect(screen.getByText(/System Overview/i)).toBeInTheDocument();
    expect(screen.getByText(/Total Tenants/i)).toBeInTheDocument();
    expect(screen.getByText(/Recent Payment Transactions/i)).toBeInTheDocument();
  });

  test('renders sidebar navigation buttons', () => {
    const sidebarButtons = screen.getAllByRole('button', { name: /dashboard|tenants|caretakers|payments|notifications/i });
    expect(sidebarButtons.length).toBeGreaterThan(0);
  });

  test('navigates to Tenants page when clicked', () => {
    const tenantsButton = screen.getByRole('button', { name: /tenants/i });
    fireEvent.click(tenantsButton);
    expect(screen.getByText(/Manage Tenants/i)).toBeInTheDocument();
  });

  test('navigates to Caretakers page when clicked', () => {
    const caretakersButton = screen.getByRole('button', { name: /caretakers/i });
    fireEvent.click(caretakersButton);
    expect(screen.getByText(/Manage Caretakers/i)).toBeInTheDocument();
  });

  test('renders payments table when navigating to Payments page', () => {
    const paymentsButton = screen.getByRole('button', { name: /payments/i });
    fireEvent.click(paymentsButton);
    expect(screen.getByText(/Payment Management/i)).toBeInTheDocument();
    expect(screen.getByRole('table')).toBeInTheDocument();
  });

  test('opens Notifications page and sends a message', () => {
  const notificationsButton = screen.getByText(/🔔 Notifications/i);
  fireEvent.click(notificationsButton);

  // Check page loaded
  expect(screen.getByText(/Send Notifications/i)).toBeInTheDocument();

  // Fill out form
  const subjectInput = screen.getByPlaceholderText(/Enter message subject/i);
  const messageTextarea = screen.getByPlaceholderText(/Enter your message here/i);

  fireEvent.change(subjectInput, { target: { value: 'Test Subject' } });
  fireEvent.change(messageTextarea, { target: { value: 'This is a test message.' } });

  // Click send
  const sendButton = screen.getByRole('button', { name: /Send Notification/i });
  fireEvent.click(sendButton);

  // ✅ Only check for the message (since subject isn't displayed)
  expect(screen.getByText(/This is a test message./i)).toBeInTheDocument();
});

  

  test('logout button works correctly', () => {
    const logoutButton = screen.getByRole('button', { name: /Logout/i });
    expect(logoutButton).toBeInTheDocument();
    fireEvent.click(logoutButton);
    // Since navigation is mocked, just ensure no crash
  });

  test('renders stats cards correctly on dashboard', () => {
    const dashboardButton = screen.getByRole('button', { name: /dashboard/i });
    fireEvent.click(dashboardButton);

    const cards = screen.getAllByText(/Tenants|Units|Collected|Payments|Balance|Caretakers/i);
    expect(cards.length).toBeGreaterThan(0);
  });
});
