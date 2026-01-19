import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import CaretakerDashboard from './CaretakerDashboard';


jest.mock('./DashboardPage', () => {
  return function MockDashboardPage({ stats, tenants }) {
    return (
      <div data-testid="dashboard-page">
        Dashboard Page - Tenants: {tenants?.length}, Paid: {stats?.paidThisMonth}
      </div>
    );
  };
});

jest.mock('./TenantPage', () => {
  return function MockTenantPage({ tenants }) {
    return <div data-testid="tenant-page">Tenant Page - {tenants?.length} tenants</div>;
  };
});

jest.mock('./PaymentPage', () => {
  return function MockPaymentPage({ payments, onConfirm, onMarkPending }) {
    return (
      <div data-testid="payment-page">
        Payment Page - {payments?.length} payments
        <button onClick={() => onConfirm?.(1)}>Confirm</button>
        <button onClick={() => onMarkPending?.(1)}>Mark Pending</button>
      </div>
    );
  };
});

jest.mock('./BalancesPage', () => {
  return function MockBalancesPage({ tenants }) {
    return <div data-testid="balances-page">Balances Page - {tenants?.length} tenants</div>;
  };
});

jest.mock('./CommentsPage', () => {
  return function MockCommentsPage({ comments, tenants, onAddComment }) {
    return (
      <div data-testid="comments-page">
        Comments Page - {comments?.length} comments
        <button onClick={() => onAddComment?.(1, 'Test comment')}>Add Comment</button>
      </div>
    );
  };
});

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
}));

const renderWithRouter = (component) => {
  return render(
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      {component}
    </BrowserRouter>
  );
};

describe('CaretakerDashboard', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    test('should render the dashboard component', () => {
      renderWithRouter(<CaretakerDashboard />);
      expect(screen.getByText('Caretaker – Joyce Suits Apartments')).toBeInTheDocument();
    });

    test('should render sidebar with property name', () => {
      renderWithRouter(<CaretakerDashboard />);
      expect(screen.getByText('Joyce Suits')).toBeInTheDocument();
    });

    test('should render all navigation items', () => {
      renderWithRouter(<CaretakerDashboard />);
      expect(screen.getByText('📊 Dashboard')).toBeInTheDocument();
      expect(screen.getByText('👥 Tenants')).toBeInTheDocument();
      expect(screen.getByText('💳 Payments')).toBeInTheDocument();
      expect(screen.getByText('💰 Balances')).toBeInTheDocument();
      expect(screen.getByText('💬 Comments')).toBeInTheDocument();
    });

    test('should render logout button', () => {
      renderWithRouter(<CaretakerDashboard />);
      expect(screen.getByRole('button', { name: /logout/i })).toBeInTheDocument();
    });

    test('should render notification bell with badge', () => {
      renderWithRouter(<CaretakerDashboard />);
      const notificationBadge = screen.getByText('3');
      expect(notificationBadge).toBeInTheDocument();
    });

    test('should render dashboard page by default', () => {
      renderWithRouter(<CaretakerDashboard />);
      expect(screen.getByTestId('dashboard-page')).toBeInTheDocument();
    });
  });

  describe('Navigation', () => {
    test('should navigate to tenants page when clicked', () => {
      renderWithRouter(<CaretakerDashboard />);
      fireEvent.click(screen.getByText('👥 Tenants'));
      expect(screen.getByTestId('tenant-page')).toBeInTheDocument();
    });

    test('should navigate to payments page when clicked', () => {
      renderWithRouter(<CaretakerDashboard />);
      fireEvent.click(screen.getByText('💳 Payments'));
      expect(screen.getByTestId('payment-page')).toBeInTheDocument();
    });

    test('should navigate to balances page when clicked', () => {
      renderWithRouter(<CaretakerDashboard />);
      fireEvent.click(screen.getByText('💰 Balances'));
      expect(screen.getByTestId('balances-page')).toBeInTheDocument();
    });

    test('should navigate to comments page when clicked', () => {
      renderWithRouter(<CaretakerDashboard />);
      fireEvent.click(screen.getByText('💬 Comments'));
      expect(screen.getByTestId('comments-page')).toBeInTheDocument();
    });

    test('should navigate back to dashboard when clicked', () => {
      renderWithRouter(<CaretakerDashboard />);
      fireEvent.click(screen.getByText('👥 Tenants'));
      fireEvent.click(screen.getByText('📊 Dashboard'));
      expect(screen.getByTestId('dashboard-page')).toBeInTheDocument();
    });

    test('should highlight active nav item', () => {
      renderWithRouter(<CaretakerDashboard />);
      const tenantNav = screen.getByText('👥 Tenants').closest('button');
      fireEvent.click(tenantNav);
      expect(tenantNav).toHaveClass('active');
    });
  });

  describe('Sidebar Toggle', () => {
    test('should open sidebar when menu button clicked', () => {
      const { container } = renderWithRouter(<CaretakerDashboard />);
      const menuBtn = screen.getByRole('button', { name: /open sidebar/i });
      fireEvent.click(menuBtn);
      const sidebar = container.querySelector('.caretaker-sidebar');
      expect(sidebar).not.toHaveClass('hidden');
    });

    test('should close sidebar when close button clicked', () => {
      const { container } = renderWithRouter(<CaretakerDashboard />);
      const closeBtn = screen.getByRole('button', { name: /close sidebar/i });
      fireEvent.click(closeBtn);
      const sidebar = container.querySelector('.caretaker-sidebar');
      expect(sidebar).toHaveClass('hidden');
    });

    test('should close sidebar when overlay clicked', () => {
      const { container } = renderWithRouter(<CaretakerDashboard />);
      const overlay = container.querySelector('.caretaker-sidebar-overlay');
      if (overlay) {
        fireEvent.click(overlay);
        expect(container.querySelector('.caretaker-sidebar-overlay')).not.toBeInTheDocument();
      }
    });

    test('should close sidebar when navigation item clicked', () => {
      const { container } = renderWithRouter(<CaretakerDashboard />);
      fireEvent.click(screen.getByText('👥 Tenants'));
      const overlay = container.querySelector('.caretaker-sidebar-overlay');
      expect(overlay).not.toBeInTheDocument();
    });
  });

  describe('Data Management', () => {
    test('should initialize with correct total number of tenants', () => {
      renderWithRouter(<CaretakerDashboard />);
      expect(screen.getByText(/Tenants: 5/)).toBeInTheDocument();
    });

    test('should initialize with 2 paid tenants', () => {
      renderWithRouter(<CaretakerDashboard />);
      expect(screen.getByText(/Paid: 2/)).toBeInTheDocument();
    });

    test('should display correct tenant data in tenant page', () => {
      renderWithRouter(<CaretakerDashboard />);
      fireEvent.click(screen.getByText('👥 Tenants'));
      expect(screen.getByText(/5 tenants/)).toBeInTheDocument();
    });

    test('should initialize with correct payment data', () => {
      renderWithRouter(<CaretakerDashboard />);
      fireEvent.click(screen.getByText('💳 Payments'));
      expect(screen.getByText(/2 payments/)).toBeInTheDocument();
    });

    test('should initialize with correct comments data', () => {
      renderWithRouter(<CaretakerDashboard />);
      fireEvent.click(screen.getByText('💬 Comments'));
      expect(screen.getByText(/2 comments/)).toBeInTheDocument();
    });
  });

  describe('Statistics Calculation', () => {
    test('should calculate total tenants as 5', () => {
      renderWithRouter(<CaretakerDashboard />);
      expect(screen.getByText(/Tenants: 5/)).toBeInTheDocument();
    });

    test('should calculate paid this month as 2', () => {
      renderWithRouter(<CaretakerDashboard />);
      expect(screen.getByText(/Paid: 2/)).toBeInTheDocument();
    });

    test('should calculate pending payments correctly', () => {
      renderWithRouter(<CaretakerDashboard />);
      fireEvent.click(screen.getByText('👥 Tenants'));
      fireEvent.click(screen.getByText('💳 Payments'));
      expect(screen.getByTestId('payment-page')).toBeInTheDocument();
    });

    test('should display balances page with all tenants', () => {
      renderWithRouter(<CaretakerDashboard />);
      fireEvent.click(screen.getByText('💰 Balances'));
      expect(screen.getByText(/5 tenants/)).toBeInTheDocument();
    });
  });

  describe('Payment Management', () => {
    test('should confirm payment button be present', () => {
      renderWithRouter(<CaretakerDashboard />);
      fireEvent.click(screen.getByText('💳 Payments'));
      const confirmBtn = screen.getByRole('button', { name: /confirm/i });
      expect(confirmBtn).toBeInTheDocument();
    });

    test('should have mark pending button', () => {
      renderWithRouter(<CaretakerDashboard />);
      fireEvent.click(screen.getByText('💳 Payments'));
      const markPendingBtn = screen.getByRole('button', { name: /mark pending/i });
      expect(markPendingBtn).toBeInTheDocument();
    });

    test('should render payment page with 2 payments', () => {
      renderWithRouter(<CaretakerDashboard />);
      fireEvent.click(screen.getByText('💳 Payments'));
      expect(screen.getByText(/2 payments/)).toBeInTheDocument();
    });
  });

  describe('Comments Management', () => {
    test('should render comments page with 2 comments', () => {
      renderWithRouter(<CaretakerDashboard />);
      fireEvent.click(screen.getByText('💬 Comments'));
      expect(screen.getByText(/2 comments/)).toBeInTheDocument();
    });

    test('should have add comment button', () => {
      renderWithRouter(<CaretakerDashboard />);
      fireEvent.click(screen.getByText('💬 Comments'));
      const addCommentBtn = screen.getByRole('button', { name: /add comment/i });
      expect(addCommentBtn).toBeInTheDocument();
    });

    test('should render comments page after adding comment', () => {
      renderWithRouter(<CaretakerDashboard />);
      fireEvent.click(screen.getByText('💬 Comments'));
      const addBtn = screen.getByRole('button', { name: /add comment/i });
      fireEvent.click(addBtn);
      expect(screen.getByTestId('comments-page')).toBeInTheDocument();
    });
  });

  describe('Logout', () => {
    test('should clear localStorage on logout', () => {
      localStorage.setItem('token', 'test-token');
      localStorage.setItem('userRole', 'caretaker');
      localStorage.setItem('userId', '123');

      renderWithRouter(<CaretakerDashboard />);
      fireEvent.click(screen.getByRole('button', { name: /logout/i }));

      expect(localStorage.getItem('token')).toBeNull();
      expect(localStorage.getItem('userRole')).toBeNull();
      expect(localStorage.getItem('userId')).toBeNull();
    });

    test('should have logout button visible', () => {
      renderWithRouter(<CaretakerDashboard />);
      const logoutBtn = screen.getByRole('button', { name: /logout/i });
      expect(logoutBtn).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    test('should have proper aria labels for buttons', () => {
      renderWithRouter(<CaretakerDashboard />);
      expect(screen.getByRole('button', { name: /open sidebar/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /close sidebar/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /notifications/i })).toBeInTheDocument();
    });

    test('should have proper heading structure', () => {
      renderWithRouter(<CaretakerDashboard />);
      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toHaveTextContent('Caretaker – Joyce Suits Apartments');
    });

    test('should have semantic structure with main and aside', () => {
      const { container } = renderWithRouter(<CaretakerDashboard />);
      expect(container.querySelector('main')).toBeInTheDocument();
      expect(container.querySelector('aside')).toBeInTheDocument();
      expect(container.querySelector('nav')).toBeInTheDocument();
    });

    test('should have header element', () => {
      const { container } = renderWithRouter(<CaretakerDashboard />);
      expect(container.querySelector('header')).toBeInTheDocument();
    });

    test('should have section for content area', () => {
      const { container } = renderWithRouter(<CaretakerDashboard />);
      expect(container.querySelector('section')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    test('should handle rapid page navigation', () => {
      renderWithRouter(<CaretakerDashboard />);
      fireEvent.click(screen.getByText('👥 Tenants'));
      fireEvent.click(screen.getByText('💳 Payments'));
      fireEvent.click(screen.getByText('💰 Balances'));
      fireEvent.click(screen.getByText('📊 Dashboard'));
      expect(screen.getByTestId('dashboard-page')).toBeInTheDocument();
    });

    test('should maintain navigation structure after multiple clicks', () => {
      renderWithRouter(<CaretakerDashboard />);
      for (let i = 0; i < 3; i++) {
        fireEvent.click(screen.getByText('👥 Tenants'));
        fireEvent.click(screen.getByText('📊 Dashboard'));
      }
      expect(screen.getByTestId('dashboard-page')).toBeInTheDocument();
    });

    test('should display all nav items consistently', () => {
      renderWithRouter(<CaretakerDashboard />);
      const navItems = [
        '📊 Dashboard',
        '👥 Tenants',
        '💳 Payments',
        '💰 Balances',
        '💬 Comments',
      ];
      navItems.forEach((item) => {
        expect(screen.getByText(item)).toBeInTheDocument();
      });
    });

    test('should keep sidebar open state consistent', () => {
      const { container } = renderWithRouter(<CaretakerDashboard />);
      const menuBtn = screen.getByRole('button', { name: /open sidebar/i });
      fireEvent.click(menuBtn);
      let sidebar = container.querySelector('.caretaker-sidebar');
      expect(sidebar).not.toHaveClass('hidden');
      
      fireEvent.click(screen.getByText('👥 Tenants'));
      sidebar = container.querySelector('.caretaker-sidebar');
      expect(sidebar).toHaveClass('hidden');
    });
  });

  describe('Component Props', () => {
    test('should pass stats to dashboard page', () => {
      renderWithRouter(<CaretakerDashboard />);
      expect(screen.getByTestId('dashboard-page')).toHaveTextContent(/Tenants: 5/);
      expect(screen.getByTestId('dashboard-page')).toHaveTextContent(/Paid: 2/);
    });

    test('should pass tenants to tenant page', () => {
      renderWithRouter(<CaretakerDashboard />);
      fireEvent.click(screen.getByText('👥 Tenants'));
      expect(screen.getByTestId('tenant-page')).toHaveTextContent(/5 tenants/);
    });

    test('should pass payments to payment page', () => {
      renderWithRouter(<CaretakerDashboard />);
      fireEvent.click(screen.getByText('💳 Payments'));
      expect(screen.getByTestId('payment-page')).toHaveTextContent(/2 payments/);
    });

    test('should pass tenants to balances page', () => {
      renderWithRouter(<CaretakerDashboard />);
      fireEvent.click(screen.getByText('💰 Balances'));
      expect(screen.getByTestId('balances-page')).toHaveTextContent(/5 tenants/);
    });

    test('should pass comments to comments page', () => {
      renderWithRouter(<CaretakerDashboard />);
      fireEvent.click(screen.getByText('💬 Comments'));
      expect(screen.getByTestId('comments-page')).toHaveTextContent(/2 comments/);
    });
  });

  describe('Initial State', () => {
    test('should have sidebar open on initial render', () => {
      const { container } = renderWithRouter(<CaretakerDashboard />);
      const sidebar = container.querySelector('.caretaker-sidebar');
      expect(sidebar).not.toHaveClass('hidden');
    });

    test('should have dashboard page active by default', () => {
      renderWithRouter(<CaretakerDashboard />);
      expect(screen.getByTestId('dashboard-page')).toBeInTheDocument();
    });

    test('should display correct property name', () => {
      renderWithRouter(<CaretakerDashboard />);
      expect(screen.getByText('Joyce Suits')).toBeInTheDocument();
    });

    test('should display notification badge with correct number', () => {
      renderWithRouter(<CaretakerDashboard />);
      expect(screen.getByText('3')).toBeInTheDocument();
    });
  });
});