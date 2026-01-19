import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';


const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

import TenantRegister from './TenantRegister';

const renderComponent = () =>
  render(
    <MemoryRouter>
      <TenantRegister />
    </MemoryRouter>
  );

describe('TenantRegister Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  test('shows error when passwords do not match', async () => {
    renderComponent();

    fireEvent.change(screen.getByLabelText(/Full Name/i), { target: { value: 'John Doe' } });
    fireEvent.change(screen.getByLabelText(/Email Address/i), { target: { value: 'john@example.com' } });
    fireEvent.change(screen.getByLabelText(/Phone Number/i), { target: { value: '0712345678' } });
    fireEvent.change(screen.getByLabelText(/ID Number/i), { target: { value: '12345678' } });
    fireEvent.change(screen.getByLabelText(/Room Number/i), { target: { value: '12' } });
    fireEvent.change(screen.getByLabelText(/^Password/i), { target: { value: 'password1' } });
    fireEvent.change(screen.getByLabelText(/Confirm Password/i), { target: { value: 'password2' } });
    fireEvent.click(screen.getByLabelText(/I agree/i));

    fireEvent.click(screen.getByRole('button', { name: /Register as Tenant/i }));

    await waitFor(() => {
      expect(screen.getByText(/Passwords do not match/i)).toBeInTheDocument();
    });
  });

  test('handles successful registration and navigation', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            tenantId: 1,
            unitData: { room: '12' },
          }),
      })
    );

    renderComponent();

    fireEvent.change(screen.getByLabelText(/Full Name/i), { target: { value: 'John Doe' } });
    fireEvent.change(screen.getByLabelText(/Email Address/i), { target: { value: 'john@example.com' } });
    fireEvent.change(screen.getByLabelText(/Phone Number/i), { target: { value: '0712345678' } });
    fireEvent.change(screen.getByLabelText(/ID Number/i), { target: { value: '12345678' } });
    fireEvent.change(screen.getByLabelText(/Room Number/i), { target: { value: '12' } });
    fireEvent.change(screen.getByLabelText(/^Password/i), { target: { value: 'password1' } });
    fireEvent.change(screen.getByLabelText(/Confirm Password/i), { target: { value: 'password1' } });
    fireEvent.click(screen.getByLabelText(/I agree/i));

    const photoFile = new File(['photo'], 'photo.jpg', { type: 'image/jpeg' });
    const idFile = new File(['id'], 'id.jpg', { type: 'image/jpeg' });

    const photoInput = screen.getByLabelText(/Profile Photo/i);
    const idInput = screen.getByLabelText(/ID Document/i);

    fireEvent.change(photoInput, { target: { files: [photoFile] } });
    fireEvent.change(idInput, { target: { files: [idFile] } });

    fireEvent.click(screen.getByRole('button', { name: /Register as Tenant/i }));

    
    await waitFor(() => {
      expect(screen.getByText(/Registration successful/i)).toBeInTheDocument();
    });

    
    await act(async () => {
      jest.advanceTimersByTime(2000);
    });

    expect(mockNavigate).toHaveBeenCalledWith('/lease-agreement');
  });

  test('handles registration failure', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: false,
        json: () => Promise.resolve({ message: 'Email already exists' }),
      })
    );

    renderComponent();

    fireEvent.change(screen.getByLabelText(/Full Name/i), { target: { value: 'Jane Doe' } });
    fireEvent.change(screen.getByLabelText(/Email Address/i), { target: { value: 'jane@example.com' } });
    fireEvent.change(screen.getByLabelText(/Phone Number/i), { target: { value: '0712345678' } });
    fireEvent.change(screen.getByLabelText(/ID Number/i), { target: { value: '87654321' } });
    fireEvent.change(screen.getByLabelText(/Room Number/i), { target: { value: '14' } });
    fireEvent.change(screen.getByLabelText(/^Password/i), { target: { value: 'password1' } });
    fireEvent.change(screen.getByLabelText(/Confirm Password/i), { target: { value: 'password1' } });

    const mockFile = new File(['photo'], 'photo.png', { type: 'image/png' });
    const mockId = new File(['id'], 'id.png', { type: 'image/png' });

    const photoInput = screen.getByLabelText(/Profile Photo/i);
    const idInput = screen.getByLabelText(/ID Document/i);

    fireEvent.change(photoInput, { target: { files: [mockFile] } });
    fireEvent.change(idInput, { target: { files: [mockId] } });
    fireEvent.click(screen.getByLabelText(/I agree to the Terms and Conditions/i));

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Register as Tenant/i }));
      jest.runAllTimers();
    });

    await waitFor(() => {
      expect(screen.getByText(/Email already exists/i)).toBeInTheDocument();
    });

    expect(mockNavigate).not.toHaveBeenCalled();
  });
});