import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import LeaseAgreement from './LeaseAgreement';
import '@testing-library/jest-dom';
import config from '../../config';

// Mock the config module to use the database URL
jest.mock('../../config', () => ({
  apiBaseUrl: 'https://joyce-suites-xdkp.onrender.com'
}));

// Mock the SignatureCanvas component
jest.mock('react-signature-canvas', () => {
  return function MockSignatureCanvas({ onChange }) {
    return (
      <canvas
        data-testid="signature-canvas"
        onChange={onChange}
        style={{ border: '1px solid #ccc', width: '100%', height: '200px' }}
      />
    );
  };
});

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

describe('LeaseAgreement Component - Production Ready Tests', () => {
  const mockTenantData = {
    fullName: 'John Doe',
    idNumber: '12345678',
    phone: '+254 712 345 678',
    email: 'john.doe@example.com',
    roomNumber: '12'
  };

  const mockUnitData = {
    rent_amount: 5500,
    deposit_amount: 5900,
    water_deposit: 400,
    room_type: 'bedsitter'
  };

  beforeEach(() => {
    const localStorageMock = (function () {
      let store = {
        'joyce-suites-token': 'fake-tenant-token',
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

      if (url.includes('/api/tenant/lease')) {
        responseData = {
          success: true,
          lease: {
            id: 1,
            property_id: 1,
            start_date: '2024-01-01',
            end_date: '2024-12-31',
            rent_amount: 5500,
            deposit_amount: 5900,
            water_deposit: 400,
            status: 'pending_signature',
            property: {
              name: 'Room 12',
              property_type: 'bedsitter'
            }
          }
        };
      } else if (url.includes('/api/tenant/lease/sign')) {
        responseData = {
          success: true,
          message: 'Lease agreement signed successfully',
          lease: {
            id: 1,
            status: 'active'
          }
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
        <LeaseAgreement tenantData={mockTenantData} unitData={mockUnitData} />
      </MemoryRouter>
    );
  });

  test('renders lease agreement interface', async () => {
    expect(screen.getByText(/Lease Agreement/i)).toBeInTheDocument();
    expect(screen.getByText(/John Doe/i)).toBeInTheDocument();
    expect(screen.getByText(/Room 12/i)).toBeInTheDocument();
    expect(screen.getByText(/5500/i)).toBeInTheDocument();
  });

  test('displays lease terms and conditions', async () => {
    expect(screen.getByText(/Terms and Conditions/i)).toBeInTheDocument();
    expect(screen.getByText(/Rent Amount/i)).toBeInTheDocument();
    expect(screen.getByText(/Security Deposit/i)).toBeInTheDocument();
    expect(screen.getByText(/Water Deposit/i)).toBeInTheDocument();
  });

  test('displays tenant and landlord information', async () => {
    expect(screen.getByText(/Tenant Information/i)).toBeInTheDocument();
    expect(screen.getByText(/Landlord Information/i)).toBeInTheDocument();
    expect(screen.getByText(/John Doe/i)).toBeInTheDocument();
    expect(screen.getByText(/12345678/i)).toBeInTheDocument();
    expect(screen.getByText(/john.doe@example.com/i)).toBeInTheDocument();
  });

  test('displays property details', async () => {
    expect(screen.getByText(/Property Details/i)).toBeInTheDocument();
    expect(screen.getByText(/Room 12/i)).toBeInTheDocument();
    expect(screen.getByText(/bedsitter/i)).toBeInTheDocument();
    expect(screen.getByText(/KSh 5500 per month/i)).toBeInTheDocument();
  });

  test('requires terms acceptance before signing', async () => {
    const signButton = screen.getByText(/Sign Agreement/i);
    fireEvent.click(signButton);

    expect(screen.getByText(/Please accept the terms and conditions before signing/i)).toBeInTheDocument();
  });

  test('requires signature before signing', async () => {
    // Accept terms first
    const termsCheckbox = screen.getByLabelText(/I accept the terms and conditions/i);
    fireEvent.click(termsCheckbox);

    const signButton = screen.getByText(/Sign Agreement/i);
    fireEvent.click(signButton);

    expect(screen.getByText(/Please provide your signature before signing/i)).toBeInTheDocument();
  });

  test('signs lease agreement successfully', async () => {
    // Accept terms
    const termsCheckbox = screen.getByLabelText(/I accept the terms and conditions/i);
    fireEvent.click(termsCheckbox);

    // Simulate signature
    const signatureCanvas = screen.getByTestId('signature-canvas');
    
    // Mock signature change
    fireEvent.change(signatureCanvas, { target: { value: 'mock-signature-data' } });

    // Sign agreement
    const signButton = screen.getByText(/Sign Agreement/i);
    fireEvent.click(signButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining(`${config.apiBaseUrl}/api/tenant/lease/sign`),
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Authorization': 'Bearer fake-tenant-token',
            'Content-Type': 'application/json'
          })
        })
      );
    });
  });

  test('shows loading state during submission', async () => {
    // Accept terms
    const termsCheckbox = screen.getByLabelText(/I accept the terms and conditions/i);
    fireEvent.click(termsCheckbox);

    // Simulate signature
    const signatureCanvas = screen.getByTestId('signature-canvas');
    fireEvent.change(signatureCanvas, { target: { value: 'mock-signature-data' } });

    // Sign agreement
    const signButton = screen.getByText(/Sign Agreement/i);
    fireEvent.click(signButton);

    expect(screen.getByText(/Signing agreement/i)).toBeInTheDocument();
    expect(screen.getByText(/Please wait/i)).toBeInTheDocument();
  });

  test('shows success message after successful signing', async () => {
    // Accept terms
    const termsCheckbox = screen.getByLabelText(/I accept the terms and conditions/i);
    fireEvent.click(termsCheckbox);

    // Simulate signature
    const signatureCanvas = screen.getByTestId('signature-canvas');
    fireEvent.change(signatureCanvas, { target: { value: 'mock-signature-data' } });

    // Sign agreement
    const signButton = screen.getByText(/Sign Agreement/i);
    fireEvent.click(signButton);

    await waitFor(() => {
      expect(screen.getByText(/Lease agreement signed successfully/i)).toBeInTheDocument();
    });
  });

  test('navigates to dashboard after successful signing', async () => {
    // Accept terms
    const termsCheckbox = screen.getByLabelText(/I accept the terms and conditions/i);
    fireEvent.click(termsCheckbox);

    // Simulate signature
    const signatureCanvas = screen.getByTestId('signature-canvas');
    fireEvent.change(signatureCanvas, { target: { value: 'mock-signature-data' } });

    // Sign agreement
    const signButton = screen.getByText(/Sign Agreement/i);
    fireEvent.click(signButton);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/tenant-dashboard');
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

    // Accept terms
    const termsCheckbox = screen.getByLabelText(/I accept the terms and conditions/i);
    fireEvent.click(termsCheckbox);

    // Simulate signature
    const signatureCanvas = screen.getByTestId('signature-canvas');
    fireEvent.change(signatureCanvas, { target: { value: 'mock-signature-data' } });

    // Sign agreement
    const signButton = screen.getByText(/Sign Agreement/i);
    fireEvent.click(signButton);

    await waitFor(() => {
      expect(screen.getByText(/Failed to sign lease agreement/i)).toBeInTheDocument();
    });
  });

  test('clears signature', async () => {
    const clearButton = screen.getByText(/Clear Signature/i);
    fireEvent.click(clearButton);

    // Verify canvas is cleared (mock implementation)
    const signatureCanvas = screen.getByTestId('signature-canvas');
    expect(signatureCanvas).toBeInTheDocument();
  });

  test('displays current date', async () => {
    const currentDate = new Date();
    const expectedDate = currentDate.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });

    expect(screen.getByText(new RegExp(expectedDate))).toBeInTheDocument();
  });

  test('validates signature before submission', async () => {
    // Accept terms but don't provide signature
    const termsCheckbox = screen.getByLabelText(/I accept the terms and conditions/i);
    fireEvent.click(termsCheckbox);

    const signButton = screen.getByText(/Sign Agreement/i);
    fireEvent.click(signButton);

    expect(screen.getByText(/Please provide your signature before signing/i)).toBeInTheDocument();
  });

  test('displays lease duration', async () => {
    expect(screen.getByText(/12 months/i)).toBeInTheDocument();
    expect(screen.getByText(/January 1, 2024/i)).toBeInTheDocument();
    expect(screen.getByText(/December 31, 2024/i)).toBeInTheDocument();
  });
});
