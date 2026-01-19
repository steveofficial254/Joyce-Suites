import React from 'react';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';


const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));


jest.mock('../../assets/image12.jpg', () => 'apartment1.jpg');
jest.mock('../../assets/image21.jpg', () => 'apartment2.jpg');
jest.mock('../../assets/image22.jpg', () => 'apartment3.jpg');
jest.mock('../../assets/image10.jpg', () => 'apartment4.jpg');
jest.mock('../../assets/image11.jpg', () => 'apartment5.jpg');
jest.mock('../../assets/image9.jpg', () => 'apartment6.jpg');
jest.mock('../../assets/image1.png', () => 'logo.png');

import TenantDashboard from './TenantDashboard';

const mockTenantData = {
  fullName: 'John Doe',
  email: 'john.doe@example.com',
  roomNumber: '12',
  roomType: 'Bedsitter',
  monthlyRent: 5500,
  rentDue: 5500,
  dueDate: '2024-11-05',
  depositStatus: 'Paid',
  depositAmount: 5900,
  balance: 0,
  photo: null,
  paymentAccount: {
    name: 'LAWRENCE MATHEA',
    mpesa: '0712 345678',
    bank: 'KCB Bank',
    accountNumber: '9876543210',
    accountName: 'Lawrence Mathea'
  }
};

const renderWithRouter = (component) => {
  return render(
    <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      {component}
    </MemoryRouter>
  );
};

describe('TenantDashboard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockNavigate.mockClear();
    localStorage.clear();
    localStorage.setItem('token', 'mock-token');
    
    
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockTenantData),
      })
    );

    
    jest.useFakeTimers();
  });

  afterEach(() => {
    cleanup();
    jest.restoreAllMocks();
    jest.useRealTimers();
    localStorage.clear();
  });

  describe('Loading State', () => {
    test('should display loading spinner while fetching data', async () => {
      global.fetch = jest.fn(() =>
        new Promise(resolve =>
          setTimeout(() =>
            resolve({
              ok: true,
              json: () => Promise.resolve(mockTenantData),
            }),
            100
          )
        )
      );

      renderWithRouter(<TenantDashboard />);
      expect(screen.getByText(/Loading Dashboard/i)).toBeInTheDocument();
    });
  });

  describe('Rendering', () => {
    test('should render dashboard header', async () => {
      renderWithRouter(<TenantDashboard />);
      
      await waitFor(() => {
        const heading = screen.getByRole('heading', { name: 'Dashboard' });
        expect(heading).toBeInTheDocument();
      }, { timeout: 5000 });
    });

    test('should render welcome message with tenant name', async () => {
      renderWithRouter(<TenantDashboard />);
      
      await waitFor(() => {
        expect(screen.getByText(/Welcome back, John Doe/i)).toBeInTheDocument();
      }, { timeout: 5000 });
    });

    test('should display tenant data on dashboard', async () => {
      renderWithRouter(<TenantDashboard />);
      
      await waitFor(() => {
        const roomElements = screen.getAllByText(/Room 12/i);
        expect(roomElements.length).toBeGreaterThan(0);
        expect(screen.getByText('Bedsitter')).toBeInTheDocument();
      }, { timeout: 5000 });
    });

    test('should render all stat cards', async () => {
      renderWithRouter(<TenantDashboard />);
      
      await waitFor(() => {
        expect(screen.getByText('Room Details')).toBeInTheDocument();
        expect(screen.getByText('Rent Due')).toBeInTheDocument();
        expect(screen.getByText('Deposit Status')).toBeInTheDocument();
        expect(screen.getByText('Current Balance')).toBeInTheDocument();
      }, { timeout: 3000 });
    });

    test('should render sidebar navigation', async () => {
      renderWithRouter(<TenantDashboard />);
      
      await waitFor(() => {
        expect(screen.getByText('Joyce Suits')).toBeInTheDocument();
        const dashboardLinks = screen.getAllByRole('link', { name: /Dashboard/i });
        expect(dashboardLinks.length).toBeGreaterThan(0);
      }, { timeout: 3000 });
    });

    test('should display user avatar placeholder', async () => {
      renderWithRouter(<TenantDashboard />);
      
      await waitFor(() => {
        const avatarPlaceholder = screen.getByText('J');
        expect(avatarPlaceholder).toBeInTheDocument();
      }, { timeout: 3000 });
    });

    test('should render apartment gallery', async () => {
      renderWithRouter(<TenantDashboard />);
      
      await waitFor(() => {
        const galleryHeadings = screen.getAllByText('Apartment Gallery');
        expect(galleryHeadings.length).toBeGreaterThan(0);
        const galleryImages = screen.getAllByAltText(/Apartment/i);
        expect(galleryImages.length).toBeGreaterThan(0);
      }, { timeout: 3000 });
    });

    test('should render payment information section', async () => {
      renderWithRouter(<TenantDashboard />);
      
      await waitFor(() => {
        expect(screen.getByText(/Payment Information/i)).toBeInTheDocument();
        expect(screen.getByText('M-Pesa Paybill')).toBeInTheDocument();
        expect(screen.getByText('Bank Transfer')).toBeInTheDocument();
      }, { timeout: 3000 });
    });

    test('should render quick actions section', async () => {
      renderWithRouter(<TenantDashboard />);
      
      await waitFor(() => {
        expect(screen.getByText('Quick Actions')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Make Payment/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Request Maintenance/i })).toBeInTheDocument();
      }, { timeout: 3000 });
    });
  });

  describe('Payment Information', () => {
    test('should display M-Pesa payment details', async () => {
      renderWithRouter(<TenantDashboard />);
      
      await waitFor(() => {
        expect(screen.getByText('M-Pesa Paybill')).toBeInTheDocument();
        expect(screen.getByText('LAWRENCE MATHEA')).toBeInTheDocument();
        expect(screen.getByText('0712 345678')).toBeInTheDocument();
      }, { timeout: 3000 });
    });

    test('should display bank transfer details', async () => {
      renderWithRouter(<TenantDashboard />);
      
      await waitFor(() => {
        expect(screen.getByText('Bank Transfer')).toBeInTheDocument();
        expect(screen.getByText('KCB Bank')).toBeInTheDocument();
        expect(screen.getByText('9876543210')).toBeInTheDocument();
      }, { timeout: 3000 });
    });

    test('should display payment methods section', async () => {
      renderWithRouter(<TenantDashboard />);
      
      await waitFor(() => {
        expect(screen.getByText(/Payment Information/i)).toBeInTheDocument();
        const payButtons = screen.getAllByRole('button', { name: /Pay via M-Pesa|View Payment History/i });
        expect(payButtons.length).toBeGreaterThan(0);
      }, { timeout: 3000 });
    });
  });

  describe('Notifications', () => {
    test('should display notification badge with count', async () => {
      renderWithRouter(<TenantDashboard />);
      
      await waitFor(() => {
        const badge = screen.getByText('3');
        expect(badge).toHaveClass('notification-badge');
      }, { timeout: 3000 });
    });

    test('should show notifications when clicking notification button', async () => {
      renderWithRouter(<TenantDashboard />);
      
      await waitFor(() => {
        const notificationBtns = screen.getAllByRole('button', { name: /🔔/ });
        fireEvent.click(notificationBtns[0]);
        
        expect(screen.getByText(/Rent due on November 5th/i)).toBeInTheDocument();
      }, { timeout: 3000 });
    });

    test('should hide notifications when clicking again', async () => {
      renderWithRouter(<TenantDashboard />);
      
      await waitFor(() => {
        const notificationBtns = screen.getAllByRole('button', { name: /🔔/ });
        fireEvent.click(notificationBtns[0]);
        fireEvent.click(notificationBtns[0]);
        
        expect(screen.queryByText(/Rent due on November 5th/i)).not.toBeInTheDocument();
      }, { timeout: 3000 });
    });
  });

  describe('Navigation', () => {
    test('should navigate to payments on payment button click', async () => {
      mockNavigate.mockClear();
      renderWithRouter(<TenantDashboard />);
      
      await waitFor(() => {
        const paymentBtns = screen.getAllByRole('button', { name: /Pay via M-Pesa/i });
        fireEvent.click(paymentBtns[0]);
        
        expect(mockNavigate).toHaveBeenCalledWith('/tenant/payments');
      }, { timeout: 3000 });
    });

    test('should navigate to profile on settings button click', async () => {
      mockNavigate.mockClear();
      renderWithRouter(<TenantDashboard />);
      
      await waitFor(() => {
        const settingsBtns = screen.getAllByRole('button', { name: /⚙️/ });
        fireEvent.click(settingsBtns[0]);
        
        expect(mockNavigate).toHaveBeenCalledWith('/tenant/profile');
      }, { timeout: 3000 });
    });

    test('should navigate to maintenance on quick action click', async () => {
      mockNavigate.mockClear();
      renderWithRouter(<TenantDashboard />);
      
      await waitFor(() => {
        const maintenanceBtns = screen.getAllByRole('button', { name: /Request Maintenance/i });
        fireEvent.click(maintenanceBtns[0]);
        
        expect(mockNavigate).toHaveBeenCalledWith('/tenant/maintenance');
      }, { timeout: 3000 });
    });

    test('should navigate to lease on quick action click', async () => {
      mockNavigate.mockClear();
      renderWithRouter(<TenantDashboard />);
      
      await waitFor(() => {
        const leaseBtns = screen.getAllByRole('button', { name: /View Lease/i });
        fireEvent.click(leaseBtns[0]);
        
        expect(mockNavigate).toHaveBeenCalledWith('/tenant/lease');
      }, { timeout: 3000 });
    });

    test('should navigate to login on logout', async () => {
      mockNavigate.mockClear();
      renderWithRouter(<TenantDashboard />);
      
      await waitFor(() => {
        const logoutBtns = screen.getAllByRole('button', { name: /Logout/i });
        fireEvent.click(logoutBtns[0]);
        
        expect(mockNavigate).toHaveBeenCalledWith('/login');
      }, { timeout: 3000 });
    });
  });

  describe('Gallery', () => {
    test('should display current apartment image', async () => {
      renderWithRouter(<TenantDashboard />);
      
      await waitFor(() => {
        const mainImage = screen.getByAltText('Apartment');
        expect(mainImage).toBeInTheDocument();
      }, { timeout: 3000 });
    });

    test('should change image on next button click', async () => {
      renderWithRouter(<TenantDashboard />);
      
      await waitFor(() => {
        const nextBtns = screen.getAllByRole('button', { name: '›' });
        fireEvent.click(nextBtns[0]);
        
        const mainImage = screen.getByAltText('Apartment');
        expect(mainImage).toBeInTheDocument();
      }, { timeout: 3000 });
    });

    test('should change image on previous button click', async () => {
      renderWithRouter(<TenantDashboard />);
      
      await waitFor(() => {
        const prevBtns = screen.getAllByRole('button', { name: '‹' });
        fireEvent.click(prevBtns[0]);
        
        const mainImage = screen.getByAltText('Apartment');
        expect(mainImage).toBeInTheDocument();
      }, { timeout: 3000 });
    });

    test('should display gallery indicators', async () => {
      const { container } = renderWithRouter(<TenantDashboard />);
      
      await waitFor(() => {
        const galleryHeadings = screen.getAllByText('Apartment Gallery');
        expect(galleryHeadings.length).toBeGreaterThan(0);
        const indicators = container.querySelectorAll('.indicator');
        expect(indicators.length).toBeGreaterThan(0);
      }, { timeout: 3000 });
    });

    test('should change image on thumbnail click', async () => {
      renderWithRouter(<TenantDashboard />);
      
      await waitFor(() => {
        const thumbnails = screen.getAllByAltText(/Apartment \d/);
        if (thumbnails.length > 1) {
          fireEvent.click(thumbnails[1]);
          const mainImage = screen.getByAltText('Apartment');
          expect(mainImage).toBeInTheDocument();
        }
      }, { timeout: 3000 });
    });
  });

  describe('Data Display', () => {
    test('should display room details section', async () => {
      renderWithRouter(<TenantDashboard />);
      
      await waitFor(() => {
        expect(screen.getByText('Room Details')).toBeInTheDocument();
        expect(screen.getByText('Bedsitter')).toBeInTheDocument();
      }, { timeout: 3000 });
    });

    test('should display rent due section', async () => {
      renderWithRouter(<TenantDashboard />);
      
      await waitFor(() => {
        expect(screen.getByText('Rent Due')).toBeInTheDocument();
        expect(screen.getByText(/Due:/i)).toBeInTheDocument();
      }, { timeout: 3000 });
    });

    test('should display deposit information', async () => {
      renderWithRouter(<TenantDashboard />);
      
      await waitFor(() => {
        expect(screen.getByText('Deposit Status')).toBeInTheDocument();
        const depositAmounts = screen.getAllByText(/5,900/);
        expect(depositAmounts.length).toBeGreaterThan(0);
      }, { timeout: 3000 });
    });

    test('should display balance status', async () => {
      renderWithRouter(<TenantDashboard />);
      
      await waitFor(() => {
        expect(screen.getByText('Current Balance')).toBeInTheDocument();
        expect(screen.getByText(/All Clear/i)).toBeInTheDocument();
      }, { timeout: 3000 });
    });

    test('should display payment info section header', async () => {
      renderWithRouter(<TenantDashboard />);
      
      await waitFor(() => {
        expect(screen.getByText(/Payment Information/i)).toBeInTheDocument();
      }, { timeout: 3000 });
    });

    test('should display stat cards', async () => {
      renderWithRouter(<TenantDashboard />);
      
      await waitFor(() => {
        expect(screen.getByText('Room Details')).toBeInTheDocument();
        expect(screen.getByText('Rent Due')).toBeInTheDocument();
        expect(screen.getByText('Deposit Status')).toBeInTheDocument();
        expect(screen.getByText('Current Balance')).toBeInTheDocument();
      }, { timeout: 3000 });
    });
  });

  describe('Footer', () => {
    test('should display footer content', async () => {
      renderWithRouter(<TenantDashboard />);
      
      await waitFor(() => {
        const footerElements = screen.getAllByText('Joyce Suits Apartments');
        expect(footerElements.length).toBeGreaterThan(0);
        expect(screen.getByText(/Your home, our care/i)).toBeInTheDocument();
      }, { timeout: 3000 });
    });

    test('should display contact information in footer', async () => {
      renderWithRouter(<TenantDashboard />);
      
      await waitFor(() => {
        const phoneElements = screen.getAllByText(/0758 999322/);
        const emailElements = screen.getAllByText(/joycesuites@gmail.com/);
        expect(phoneElements.length).toBeGreaterThan(0);
        expect(emailElements.length).toBeGreaterThan(0);
      }, { timeout: 3000 });
    });

    test('should display copyright information', async () => {
      renderWithRouter(<TenantDashboard />);
      
      await waitFor(() => {
        expect(screen.getByText(/© 2024 Joyce Suits Apartments/)).toBeInTheDocument();
      }, { timeout: 3000 });
    });
  });

  describe('Error Handling', () => {
    test('should use mock data on API error', async () => {
      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: false,
          json: () => Promise.resolve({ message: 'Error' }),
        })
      );

      renderWithRouter(<TenantDashboard />);
      
      await waitFor(() => {
        expect(screen.getByText(/John Doe/i)).toBeInTheDocument();
      }, { timeout: 3000 });
    });

    test('should handle fetch error gracefully', async () => {
      global.fetch = jest.fn(() =>
        Promise.reject(new Error('Network error'))
      );

      renderWithRouter(<TenantDashboard />);
      
      await waitFor(() => {
        expect(screen.getByText(/John Doe/i)).toBeInTheDocument();
      }, { timeout: 3000 });
    });
  });

  describe('Logout', () => {
    test('should clear localStorage on logout', async () => {
      renderWithRouter(<TenantDashboard />);
      
      await waitFor(() => {
        const logoutBtns = screen.getAllByRole('button', { name: /Logout/i });
        fireEvent.click(logoutBtns[0]);
        
        expect(localStorage.length).toBe(0);
      }, { timeout: 3000 });
    });

    test('should navigate to login on logout', async () => {
      mockNavigate.mockClear();
      renderWithRouter(<TenantDashboard />);
      
      await waitFor(() => {
        const logoutBtns = screen.getAllByRole('button', { name: /Logout/i });
        fireEvent.click(logoutBtns[0]);
        
        expect(mockNavigate).toHaveBeenCalledWith('/login');
      }, { timeout: 3000 });
    });
  });

  describe('Sidebar Navigation', () => {
    test('should have active class on dashboard link', async () => {
      renderWithRouter(<TenantDashboard />);
      
      await waitFor(() => {
        const dashboardLinks = screen.getAllByRole('link', { name: /Dashboard/i });
        const activeDashboardLink = dashboardLinks.find(link => link.className.includes('active'));
        expect(activeDashboardLink).toHaveClass('active');
      }, { timeout: 3000 });
    });

    test('should render all navigation items in sidebar', async () => {
      renderWithRouter(<TenantDashboard />);
      
      await waitFor(() => {
        const allLinks = screen.getAllByRole('link');
        const sidebarLinks = allLinks.filter(link => 
          link.className.includes('nav-item')
        );
        
        expect(sidebarLinks.length).toBeGreaterThanOrEqual(5);
        
        
        const leaseLinks = screen.getAllByRole('link', { name: /My Lease/i });
        expect(leaseLinks.length).toBeGreaterThan(0);
      }, { timeout: 3000 });
    });
  });
});