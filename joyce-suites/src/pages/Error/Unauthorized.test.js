import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';


const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

import Unauthorized from './Unauthorized';

const renderWithRouter = (component) => {
  return render(
    <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      {component}
    </MemoryRouter>
  );
};

describe('Unauthorized', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockNavigate.mockClear();
  });

  describe('Rendering', () => {
    test('should render the 403 heading', () => {
      renderWithRouter(<Unauthorized />);
      const heading = screen.getByRole('heading', { name: '403' });
      expect(heading).toBeInTheDocument();
    });

    test('should render unauthorized access message', () => {
      renderWithRouter(<Unauthorized />);
      expect(screen.getByRole('heading', { name: 'Unauthorized Access' })).toBeInTheDocument();
    });

    test('should render description text', () => {
      renderWithRouter(<Unauthorized />);
      expect(screen.getByText(/You don't have permission to access this page/)).toBeInTheDocument();
    });

    test('should render go to login button', () => {
      renderWithRouter(<Unauthorized />);
      expect(screen.getByRole('button', { name: /Go to Login/i })).toBeInTheDocument();
    });

    test('should display 403 with correct styling', () => {
      renderWithRouter(<Unauthorized />);
      const heading = screen.getByRole('heading', { name: '403' });
      expect(heading).toHaveStyle('fontSize: 4rem');
      expect(heading).toHaveStyle('color: #7D1F3F');
    });

    test('should have centered layout', () => {
      const { container } = renderWithRouter(<Unauthorized />);
      const mainDiv = container.querySelector('div');
      expect(mainDiv).toHaveStyle('display: flex');
      expect(mainDiv).toHaveStyle('flexDirection: column');
      expect(mainDiv).toHaveStyle('alignItems: center');
      expect(mainDiv).toHaveStyle('justifyContent: center');
    });

    test('should have minimum height of viewport', () => {
      const { container } = renderWithRouter(<Unauthorized />);
      const mainDiv = container.querySelector('div');
      expect(mainDiv).toHaveStyle('minHeight: 100vh');
    });

    test('should have text centered', () => {
      const { container } = renderWithRouter(<Unauthorized />);
      const mainDiv = container.querySelector('div');
      expect(mainDiv).toHaveStyle('textAlign: center');
    });
  });

  describe('Button Functionality', () => {
    test('should render button with correct styling', () => {
      renderWithRouter(<Unauthorized />);
      const button = screen.getByRole('button', { name: /Go to Login/i });
      expect(button).toHaveStyle('padding: 12px 24px');
      expect(button).toHaveStyle('background: #7D1F3F');
      expect(button).toHaveStyle('color: white');
      expect(button).toHaveStyle('borderRadius: 8px');
      expect(button).toHaveStyle('cursor: pointer');
    });

    test('should have button with margin top', () => {
      renderWithRouter(<Unauthorized />);
      const button = screen.getByRole('button', { name: /Go to Login/i });
      expect(button).toHaveStyle('marginTop: 20px');
    });

    test('should call navigate when button clicked', () => {
      mockNavigate.mockClear();
      renderWithRouter(<Unauthorized />);
      const button = screen.getByRole('button', { name: /Go to Login/i });
      fireEvent.click(button);

      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });

    test('should navigate to login page on button click', () => {
      mockNavigate.mockClear();
      renderWithRouter(<Unauthorized />);
      fireEvent.click(screen.getByRole('button', { name: /Go to Login/i }));

      expect(mockNavigate).toHaveBeenCalledTimes(1);
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });
  });

  describe('Accessibility', () => {
    test('should have proper heading hierarchy', () => {
      renderWithRouter(<Unauthorized />);
      const h1 = screen.getByRole('heading', { level: 1, name: '403' });
      const h2 = screen.getByRole('heading', { level: 2, name: 'Unauthorized Access' });
      expect(h1).toBeInTheDocument();
      expect(h2).toBeInTheDocument();
    });

    test('should have button with accessible name', () => {
      renderWithRouter(<Unauthorized />);
      const button = screen.getByRole('button', { name: /Go to Login/i });
      expect(button).toBeInTheDocument();
      expect(button.textContent).toBe('Go to Login');
    });

    test('should have semantic button element', () => {
      renderWithRouter(<Unauthorized />);
      const button = screen.getByRole('button');
      expect(button.tagName).toBe('BUTTON');
    });

    test('should have descriptive text content', () => {
      renderWithRouter(<Unauthorized />);
      expect(screen.getByText(/You don't have permission to access this page/)).toBeInTheDocument();
    });
  });

  describe('Content Verification', () => {
    test('should render all required text elements', () => {
      renderWithRouter(<Unauthorized />);
      expect(screen.getByText('403')).toBeInTheDocument();
      expect(screen.getByText('Unauthorized Access')).toBeInTheDocument();
      expect(screen.getByText(/You don't have permission to access this page/)).toBeInTheDocument();
      expect(screen.getByText('Go to Login')).toBeInTheDocument();
    });

    test('should have exactly one button', () => {
      renderWithRouter(<Unauthorized />);
      const buttons = screen.getAllByRole('button');
      expect(buttons).toHaveLength(1);
    });

    test('should have exactly two headings', () => {
      renderWithRouter(<Unauthorized />);
      const headings = screen.getAllByRole('heading');
      expect(headings).toHaveLength(2);
    });
  });

  describe('Layout and Styling', () => {
    test('should center content vertically and horizontally', () => {
      const { container } = renderWithRouter(<Unauthorized />);
      const mainDiv = container.querySelector('div');
      expect(mainDiv).toHaveStyle('display: flex');
      expect(mainDiv).toHaveStyle('alignItems: center');
      expect(mainDiv).toHaveStyle('justifyContent: center');
    });

    test('should have full viewport height', () => {
      const { container } = renderWithRouter(<Unauthorized />);
      const mainDiv = container.querySelector('div');
      expect(mainDiv).toHaveStyle('minHeight: 100vh');
    });

    test('should have padding for mobile responsiveness', () => {
      const { container } = renderWithRouter(<Unauthorized />);
      const mainDiv = container.querySelector('div');
      expect(mainDiv).toHaveStyle('padding: 20px');
    });

    test('should have brand color for 403 heading', () => {
      renderWithRouter(<Unauthorized />);
      const heading = screen.getByRole('heading', { name: '403' });
      expect(heading).toHaveStyle('color: #7D1F3F');
    });

    test('should have brand color for button background', () => {
      renderWithRouter(<Unauthorized />);
      const button = screen.getByRole('button');
      expect(button).toHaveStyle('background: #7D1F3F');
    });
  });

  describe('DOM Structure', () => {
    test('should render a single main container', () => {
      const { container } = renderWithRouter(<Unauthorized />);
      const divs = container.querySelectorAll('div');
      expect(divs.length).toBeGreaterThan(0);
    });

    test('should have button as descendant of main container', () => {
      const { container } = renderWithRouter(<Unauthorized />);
      const mainDiv = container.querySelector('div');
      const button = mainDiv.querySelector('button');
      expect(button).toBeInTheDocument();
    });

    test('should render without any image elements', () => {
      const { container } = renderWithRouter(<Unauthorized />);
      const images = container.querySelectorAll('img');
      expect(images).toHaveLength(0);
    });

    test('should render without any input elements', () => {
      const { container } = renderWithRouter(<Unauthorized />);
      const inputs = container.querySelectorAll('input');
      expect(inputs).toHaveLength(0);
    });
  });

  describe('Edge Cases', () => {
    test('should handle multiple clicks on button', () => {
      mockNavigate.mockClear();
      renderWithRouter(<Unauthorized />);
      const button = screen.getByRole('button');

      fireEvent.click(button);
      fireEvent.click(button);
      fireEvent.click(button);

      expect(mockNavigate).toHaveBeenCalledTimes(3);
    });

    test('should maintain styling after interaction', () => {
      mockNavigate.mockClear();
      renderWithRouter(<Unauthorized />);
      const button = screen.getByRole('button');

      fireEvent.click(button);

      expect(button).toHaveStyle('background: #7D1F3F');
      expect(button).toHaveStyle('color: white');
    });

    test('should render correctly on initial mount', () => {
      renderWithRouter(<Unauthorized />);
      expect(screen.getByRole('heading', { name: '403' })).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: 'Unauthorized Access' })).toBeInTheDocument();
      expect(screen.getByText(/You don't have permission to access this page/)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Go to Login/i })).toBeInTheDocument();
    });
  });

  describe('Color and Branding', () => {
    test('should use brand color #7D1F3F for 403 text', () => {
      renderWithRouter(<Unauthorized />);
      const heading = screen.getByRole('heading', { name: '403' });
      expect(heading).toHaveStyle('color: #7D1F3F');
    });

    test('should use brand color #7D1F3F for button', () => {
      renderWithRouter(<Unauthorized />);
      const button = screen.getByRole('button');
      expect(button).toHaveStyle('background: #7D1F3F');
    });

    test('should have white text on button', () => {
      renderWithRouter(<Unauthorized />);
      const button = screen.getByRole('button');
      expect(button).toHaveStyle('color: white');
    });
  });

  describe('Typography', () => {
    test('should display large 403 heading', () => {
      renderWithRouter(<Unauthorized />);
      const heading = screen.getByRole('heading', { name: '403' });
      expect(heading).toHaveStyle('fontSize: 4rem');
    });

    test('should have appropriate heading levels', () => {
      renderWithRouter(<Unauthorized />);
      const h1 = screen.getByRole('heading', { level: 1 });
      const h2 = screen.getByRole('heading', { level: 2 });
      expect(h1).toBeInTheDocument();
      expect(h2).toBeInTheDocument();
    });
  });

  describe('Component Props', () => {
    test('should render without any props required', () => {
      expect(() => renderWithRouter(<Unauthorized />)).not.toThrow();
    });

    test('should not require children prop', () => {
      const { container } = renderWithRouter(<Unauthorized />);
      expect(container.firstChild).toBeInTheDocument();
    });
  });

  describe('Navigation Routes', () => {
    test('should navigate to login route not home', () => {
      mockNavigate.mockClear();
      renderWithRouter(<Unauthorized />);
      fireEvent.click(screen.getByRole('button'));

      expect(mockNavigate).toHaveBeenCalledWith('/login');
      expect(mockNavigate).not.toHaveBeenCalledWith('/');
    });

    test('should use correct route for login page', () => {
      mockNavigate.mockClear();
      renderWithRouter(<Unauthorized />);
      const button = screen.getByRole('button', { name: /Go to Login/i });
      fireEvent.click(button);

      const callArgs = mockNavigate.mock.calls[0][0];
      expect(callArgs).toBe('/login');
    });
  });

  describe('Error Code Verification', () => {
    test('should display 403 error code specifically', () => {
      renderWithRouter(<Unauthorized />);
      const heading = screen.getByRole('heading', { name: '403' });
      expect(heading.textContent).toBe('403');
    });

    test('should not display other error codes', () => {
      renderWithRouter(<Unauthorized />);
      expect(screen.queryByText('404')).not.toBeInTheDocument();
      expect(screen.queryByText('500')).not.toBeInTheDocument();
    });
  });

  describe('Message Specificity', () => {
    test('should have unauthorized access message not page not found', () => {
      renderWithRouter(<Unauthorized />);
      expect(screen.getByText('Unauthorized Access')).toBeInTheDocument();
      expect(screen.queryByText('Page Not Found')).not.toBeInTheDocument();
    });

    test('should have permission-related message', () => {
      renderWithRouter(<Unauthorized />);
      expect(screen.getByText(/permission/i)).toBeInTheDocument();
    });

    test('should reference access denial in description', () => {
      renderWithRouter(<Unauthorized />);
      expect(screen.getByText(/don't have permission/i)).toBeInTheDocument();
    });
  });
});