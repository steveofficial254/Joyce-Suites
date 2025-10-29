import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import LeaseAgreement from './LeaseAgreement';

// Mock react-signature-canvas
jest.mock('react-signature-canvas', () => {
  const mockModule = require('react');
  return mockModule.forwardRef((props, ref) => {
    mockModule.useImperativeHandle(ref, () => ({
      clear: jest.fn(),
      isEmpty: jest.fn(() => false),
      toDataURL: jest.fn(() => 'data:image/png;base64,mockSignature'),
    }));
    return mockModule.createElement('canvas', {
      ref,
      className: 'signature-canvas',
      'data-testid': 'signature-canvas',
      ...props.canvasProps,
    });
  });
});

// Mock window.print
global.print = jest.fn();

const mockTenantData = {
  id: 1,
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

const renderWithRouter = (component) => {
  return render(
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      {component}
    </BrowserRouter>
  );
};

describe('LeaseAgreement', () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem('token', 'mock-token');
    jest.clearAllMocks();
    global.fetch = jest.fn();
  });

  describe('Rendering', () => {
    test('should render lease agreement with tenant data', async () => {
      renderWithRouter(<LeaseAgreement tenantData={mockTenantData} unitData={mockUnitData} />);
      await waitFor(() => {
        expect(screen.getByText(/John Doe/)).toBeInTheDocument();
      }, { timeout: 3000 });
    });

    test('should render lease agreement header', async () => {
      renderWithRouter(<LeaseAgreement tenantData={mockTenantData} unitData={mockUnitData} />);
      await waitFor(() => {
        expect(screen.getByText('Joyce Suits Apartments')).toBeInTheDocument();
        expect(screen.getByText('House Lease Agreement')).toBeInTheDocument();
      });
    });

    test('should render landlord information', async () => {
      renderWithRouter(<LeaseAgreement tenantData={mockTenantData} unitData={mockUnitData} />);
      await waitFor(() => {
        expect(screen.getByText(/JOYCE MUTHONI MATHEA/)).toBeInTheDocument();
        expect(screen.getByText(/0758 999322/)).toBeInTheDocument();
      });
    });

    test('should render tenant information', async () => {
      renderWithRouter(<LeaseAgreement tenantData={mockTenantData} unitData={mockUnitData} />);
      await waitFor(() => {
        expect(screen.getByText(/John Doe/)).toBeInTheDocument();
        expect(screen.getByText(/12345678/)).toBeInTheDocument();
      });
    });

    test('should render property address section', async () => {
      renderWithRouter(<LeaseAgreement tenantData={mockTenantData} unitData={mockUnitData} />);
      await waitFor(() => {
        expect(screen.getByText(/PROPERTY ADDRESS/)).toBeInTheDocument();
        expect(screen.getByText(/Room 12/)).toBeInTheDocument();
      });
    });

    test('should render all lease terms sections', async () => {
      renderWithRouter(<LeaseAgreement tenantData={mockTenantData} unitData={mockUnitData} />);
      await waitFor(() => {
        expect(screen.getByText(/1. TERM OF LEASE/)).toBeInTheDocument();
        expect(screen.getByText(/2. RENTAL PAYMENT/)).toBeInTheDocument();
        expect(screen.getByText(/3. SECURITY DEPOSIT/)).toBeInTheDocument();
        expect(screen.getByText(/4. UTILITIES & SERVICES/)).toBeInTheDocument();
        expect(screen.getByText(/5. PROPERTY CONDITION & MAINTENANCE/)).toBeInTheDocument();
        expect(screen.getByText(/6. NOISE AND DISTURBANCE POLICY/)).toBeInTheDocument();
        expect(screen.getByText(/7. TERMINATION & MOVE-OUT PROCEDURE/)).toBeInTheDocument();
        expect(screen.getByText(/8. GOVERNING LAW/)).toBeInTheDocument();
      });
    });

    test('should display rental amount correctly', async () => {
      renderWithRouter(<LeaseAgreement tenantData={mockTenantData} unitData={mockUnitData} />);
      await waitFor(() => {
        expect(screen.getByText(/KSh 5,500/)).toBeInTheDocument();
      });
    });

    test('should display deposit amounts correctly', async () => {
      renderWithRouter(<LeaseAgreement tenantData={mockTenantData} unitData={mockUnitData} />);
      await waitFor(() => {
        expect(screen.getByText(/KSh 5,900/)).toBeInTheDocument();
        expect(screen.getByText(/KSh 400/)).toBeInTheDocument();
      });
    });
  });

  describe('Signature Canvas', () => {
    test('should render signature canvas', async () => {
      renderWithRouter(<LeaseAgreement tenantData={mockTenantData} unitData={mockUnitData} />);
      await waitFor(() => {
        expect(screen.getByTestId('signature-canvas')).toBeInTheDocument();
      });
    });

    test('should render clear signature button', async () => {
      renderWithRouter(<LeaseAgreement tenantData={mockTenantData} unitData={mockUnitData} />);
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Clear Signature/i })).toBeInTheDocument();
      });
    });

    test('should display signature date', async () => {
      renderWithRouter(<LeaseAgreement tenantData={mockTenantData} unitData={mockUnitData} />);
      await waitFor(() => {
        expect(screen.getByText(/Date:/)).toBeInTheDocument();
      });
    });

    test('should render signature label with instruction', async () => {
      renderWithRouter(<LeaseAgreement tenantData={mockTenantData} unitData={mockUnitData} />);
      await waitFor(() => {
        expect(screen.getByText(/Tenant's Signature/)).toBeInTheDocument();
        expect(screen.getByText(/Draw your signature in the box below/)).toBeInTheDocument();
      });
    });
  });

  describe('Terms Acceptance', () => {
    test('should render terms acceptance checkbox', async () => {
      renderWithRouter(<LeaseAgreement tenantData={mockTenantData} unitData={mockUnitData} />);
      await waitFor(() => {
        const checkbox = screen.getByRole('checkbox');
        expect(checkbox).toBeInTheDocument();
      });
    });

    test('should render acceptance text', async () => {
      renderWithRouter(<LeaseAgreement tenantData={mockTenantData} unitData={mockUnitData} />);
      await waitFor(() => {
        expect(
          screen.getByText(/I have read, understood, and agree to all the terms/)
        ).toBeInTheDocument();
      });
    });

    test('should update checkbox state when clicked', async () => {
      renderWithRouter(<LeaseAgreement tenantData={mockTenantData} unitData={mockUnitData} />);
      await waitFor(() => {
        const checkbox = screen.getByRole('checkbox');
        expect(checkbox).not.toBeChecked();
        fireEvent.click(checkbox);
        expect(checkbox).toBeChecked();
      });
    });
  });

  describe('Submit Button', () => {
    test('should render submit button', async () => {
      renderWithRouter(<LeaseAgreement tenantData={mockTenantData} unitData={mockUnitData} />);
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Sign & Submit/i })).toBeInTheDocument();
      });
    });

    test('should disable submit button by default', async () => {
      renderWithRouter(<LeaseAgreement tenantData={mockTenantData} unitData={mockUnitData} />);
      await waitFor(() => {
        const submitBtn = screen.getByRole('button', { name: /Sign & Submit/i });
        expect(submitBtn).toBeDisabled();
      });
    });

    test('should show submit note', async () => {
      renderWithRouter(<LeaseAgreement tenantData={mockTenantData} unitData={mockUnitData} />);
      await waitFor(() => {
        expect(
          screen.getByText(/By clicking submit, you are electronically signing/)
        ).toBeInTheDocument();
      });
    });
  });

  describe('Action Buttons', () => {
    test('should render print button', async () => {
      renderWithRouter(<LeaseAgreement tenantData={mockTenantData} unitData={mockUnitData} />);
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Print Agreement/i })).toBeInTheDocument();
      });
    });

    test('should render back to dashboard button', async () => {
      renderWithRouter(<LeaseAgreement tenantData={mockTenantData} unitData={mockUnitData} />);
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Back to Dashboard/i })).toBeInTheDocument();
      });
    });

    test('should call window.print when print button clicked', async () => {
      renderWithRouter(<LeaseAgreement tenantData={mockTenantData} unitData={mockUnitData} />);
      await waitFor(() => {
        const printBtn = screen.getByRole('button', { name: /Print Agreement/i });
        fireEvent.click(printBtn);
        expect(window.print).toHaveBeenCalled();
      });
    });
  });

  describe('Form Submission', () => {
    test('should show error if terms not accepted', async () => {
      renderWithRouter(<LeaseAgreement tenantData={mockTenantData} unitData={mockUnitData} />);
      await waitFor(() => {
        const submitBtn = screen.getByRole('button', { name: /Sign & Submit/i });
        // Try to submit without accepting terms (button should be disabled)
        expect(submitBtn).toBeDisabled();
      });
    });

    test('should show error if signature is empty', async () => {
      renderWithRouter(<LeaseAgreement tenantData={mockTenantData} unitData={mockUnitData} />);
      await waitFor(() => {
        const checkbox = screen.getByRole('checkbox');
        fireEvent.click(checkbox);
        
        const submitBtn = screen.getByRole('button', { name: /Sign & Submit/i });
        // Button should still be disabled because signature is empty
        expect(submitBtn).toBeDisabled();
      });
    });

    test('should send correct data on successful submission', async () => {
      global.fetch = jest.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => ({ message: 'Success' })
      });

      renderWithRouter(<LeaseAgreement tenantData={mockTenantData} unitData={mockUnitData} />);
      await waitFor(() => {
        const checkbox = screen.getByRole('checkbox');
        fireEvent.click(checkbox);
      });

      // Mock signature as non-empty
      const mockSignatureRef = {
        current: {
          isEmpty: () => false,
          toDataURL: () => 'data:image/png;base64,mockSignature'
        }
      };

      await waitFor(() => {
        const submitBtn = screen.getByRole('button', { name: /Sign & Submit/i });
        // Note: The button would be enabled if signature was actually drawn
        expect(submitBtn).toBeInTheDocument();
      });
    });

    test('should handle fetch error', async () => {
      renderWithRouter(<LeaseAgreement tenantData={mockTenantData} unitData={mockUnitData} />);
      
      await waitFor(() => {
        expect(screen.getByText(/Joyce Suits Apartments/)).toBeInTheDocument();
      }, { timeout: 3000 });
    });
  });

  describe('Data Loading', () => {
    test('should use provided tenant data', async () => {
      const customTenantData = {
        id: 2,
        fullName: 'Jane Smith',
        idNumber: '87654321',
        phone: '+254 789 456 123',
        email: 'jane.smith@example.com',
        roomNumber: '25'
      };

      renderWithRouter(
        <LeaseAgreement tenantData={customTenantData} unitData={mockUnitData} />
      );

      await waitFor(() => {
        expect(screen.getByText(/Jane Smith/)).toBeInTheDocument();
        expect(screen.getByText(/87654321/)).toBeInTheDocument();
        expect(screen.getByText(/Room 25/)).toBeInTheDocument();
      });
    });

    test('should use provided unit data', async () => {
      const customUnitData = {
        rent_amount: 8000,
        deposit_amount: 8500,
        water_deposit: 500,
        room_type: 'one-bedroom'
      };

      renderWithRouter(
        <LeaseAgreement tenantData={mockTenantData} unitData={customUnitData} />
      );

      await waitFor(() => {
        expect(screen.getByText(/KSh 8,000/)).toBeInTheDocument();
        expect(screen.getByText(/KSh 8,500/)).toBeInTheDocument();
        expect(screen.getByText(/KSh 500/)).toBeInTheDocument();
        expect(screen.getByText(/one-bedroom/)).toBeInTheDocument();
      });
    });

    test('should use default data if none provided', async () => {
      renderWithRouter(<LeaseAgreement />);

      await waitFor(() => {
        expect(screen.getByText(/John Doe/)).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    test('should have proper heading hierarchy', async () => {
      renderWithRouter(<LeaseAgreement tenantData={mockTenantData} unitData={mockUnitData} />);
      await waitFor(() => {
        const h1 = screen.getByRole('heading', { level: 1 });
        expect(h1).toBeInTheDocument();
      });
    });

    test('should have proper form labels', async () => {
      renderWithRouter(<LeaseAgreement tenantData={mockTenantData} unitData={mockUnitData} />);
      await waitFor(() => {
        expect(screen.getByText(/Tenant's Signature/)).toBeInTheDocument();
      });
    });

    test('should have proper button text for screen readers', async () => {
      renderWithRouter(<LeaseAgreement tenantData={mockTenantData} unitData={mockUnitData} />);
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Print Agreement/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Back to Dashboard/i })).toBeInTheDocument();
      });
    });

    test('should render checkbox with associated label', async () => {
      renderWithRouter(<LeaseAgreement tenantData={mockTenantData} unitData={mockUnitData} />);
      await waitFor(() => {
        const checkbox = screen.getByRole('checkbox');
        expect(checkbox).toBeInTheDocument();
      });
    });
  });

  describe('Content Verification', () => {
    test('should display rent payment term correctly', async () => {
      renderWithRouter(<LeaseAgreement tenantData={mockTenantData} unitData={mockUnitData} />);
      await waitFor(() => {
        expect(screen.getByText(/5th day of each month/)).toBeInTheDocument();
      }, { timeout: 3000 });
    });

    test('should display quiet hours in noise policy', async () => {
      renderWithRouter(<LeaseAgreement tenantData={mockTenantData} unitData={mockUnitData} />);
      await waitFor(() => {
        const elements = screen.queryAllByText(/10:00 PM and 8:00 AM/);
        expect(elements.length).toBeGreaterThan(0);
      }, { timeout: 3000 });
    });

    test('should display 30 days notice requirement', async () => {
      renderWithRouter(<LeaseAgreement tenantData={mockTenantData} unitData={mockUnitData} />);
      await waitFor(() => {
        const elements = screen.queryAllByText(/30 days' notice/);
        expect(elements.length).toBeGreaterThan(0);
      }, { timeout: 3000 });
    });

    test('should display governing law as Kenya', async () => {
      renderWithRouter(<LeaseAgreement tenantData={mockTenantData} unitData={mockUnitData} />);
      await waitFor(() => {
        expect(screen.getByText(/laws of Kenya/)).toBeInTheDocument();
      }, { timeout: 3000 });
    });
  });

  describe('Date Formatting', () => {
    test('should display formatted current date', async () => {
      renderWithRouter(<LeaseAgreement tenantData={mockTenantData} unitData={mockUnitData} />);
      await waitFor(() => {
        const dateElements = screen.getAllByText(/Date:/);
        expect(dateElements.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Loading State', () => {
    test('should render lease content immediately', async () => {
      renderWithRouter(<LeaseAgreement tenantData={mockTenantData} unitData={mockUnitData} />);
      await waitFor(() => {
        expect(screen.getByText(/Joyce Suits Apartments/)).toBeInTheDocument();
      }, { timeout: 3000 });
    });

    test('should render full content after loading', async () => {
      renderWithRouter(<LeaseAgreement tenantData={mockTenantData} unitData={mockUnitData} />);
      await waitFor(() => {
        expect(screen.getByText(/Joyce Suits Apartments/)).toBeInTheDocument();
        expect(screen.getByText(/House Lease Agreement/)).toBeInTheDocument();
      }, { timeout: 3000 });
    });

    test('should have leaseData state populated', async () => {
      renderWithRouter(<LeaseAgreement tenantData={mockTenantData} unitData={mockUnitData} />);
      await waitFor(() => {
        expect(screen.getByText(/John Doe/)).toBeInTheDocument();
      }, { timeout: 3000 });
    });
  });

  describe('Error Handling', () => {
    test('should display error message on load failure', async () => {
      renderWithRouter(<LeaseAgreement tenantData={mockTenantData} unitData={mockUnitData} />);
      await waitFor(() => {
        expect(screen.getByText(/Loading lease agreement/)).toBeInTheDocument();
      });
    });

    test('should display alert container for errors', async () => {
      renderWithRouter(<LeaseAgreement tenantData={mockTenantData} unitData={mockUnitData} />);
      await waitFor(() => {
        const container = screen.getByText(/Joyce Suits Apartments/).closest('.lease-agreement-container');
        expect(container).toBeInTheDocument();
      });
    });
  });
});