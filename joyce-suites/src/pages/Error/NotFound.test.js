import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';


const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

import NotFound from './NotFound';

const renderWithRouter = (component) => {
  return render(
    <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      {component}
    </MemoryRouter>
  );
};

describe('NotFound', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockNavigate.mockClear();
  });

  describe('Rendering', () => {
    test('should render the 404 heading', () => {
      renderWithRouter(<NotFound />);
      const heading = screen.getByRole('heading', { name: '404' });
      expect(heading).toBeInTheDocument();
    });

    test('should render page not found message', () => {
      renderWithRouter(<NotFound />);
      expect(screen.getByRole('heading', { name: 'Page Not Found' })).toBeInTheDocument();
    });

    test('should render description text', () => {
      renderWithRouter(<NotFound />);
      expect(screen.getByText(/The page you're looking for doesn't exist/)).toBeInTheDocument();
    });

    test('should render go home button', () => {
      renderWithRouter(<NotFound />);
      expect(screen.getByRole('button', { name: /Go Home/i })).toBeInTheDocument();
    });

    test('should display 404 with correct styling', () => {
      renderWithRouter(<NotFound />);
      const heading = screen.getByRole('heading', { name: '404' });
      expect(heading).toHaveStyle('fontSize: 4rem');
      expect(heading).toHaveStyle('color: #7D1F3F');
    });

    test('should have centered layout', () => {
      const { container } = renderWithRouter(<NotFound />);
      const mainDiv = container.querySelector('div');
      expect(mainDiv).toHaveStyle('display: flex');
      expect(mainDiv).toHaveStyle('flexDirection: column');
      expect(mainDiv).toHaveStyle('alignItems: center');
      expect(mainDiv).toHaveStyle('justifyContent: center');
    });

    test('should have minimum height of viewport', () => {
      const { container } = renderWithRouter(<NotFound />);
      const mainDiv = container.querySelector('div');
      expect(mainDiv).toHaveStyle('minHeight: 100vh');
    });

    test('should have text centered', () => {
      const { container } = renderWithRouter(<NotFound />);
      const mainDiv = container.querySelector('div');
      expect(mainDiv).toHaveStyle('textAlign: center');
    });
  });

  describe('Button Functionality', () => {
    test('should render button with correct styling', () => {
      renderWithRouter(<NotFound />);
      const button = screen.getByRole('button', { name: /Go Home/i });
      expect(button).toHaveStyle('padding: 12px 24px');
      expect(button).toHaveStyle('background: #7D1F3F');
      expect(button).toHaveStyle('color: white');
      expect(button).toHaveStyle('borderRadius: 8px');
      expect(button).toHaveStyle('cursor: pointer');
    });

    test('should have button with margin top', () => {
      renderWithRouter(<NotFound />);
      const button = screen.getByRole('button', { name: /Go Home/i });
      expect(button).toHaveStyle('marginTop: 20px');
    });

    test('should call navigate when button clicked', () => {
      mockNavigate.mockClear();
      renderWithRouter(<NotFound />);
      const button = screen.getByRole('button', { name: /Go Home/i });
      fireEvent.click(button);

      expect(mockNavigate).toHaveBeenCalledWith('/');
    });

    test('should navigate to home page on button click', () => {
      mockNavigate.mockClear();
      renderWithRouter(<NotFound />);
      fireEvent.click(screen.getByRole('button', { name: /Go Home/i }));

      expect(mockNavigate).toHaveBeenCalledTimes(1);
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });

  describe('Accessibility', () => {
    test('should have proper heading hierarchy', () => {
      renderWithRouter(<NotFound />);
      const h1 = screen.getByRole('heading', { level: 1, name: '404' });
      const h2 = screen.getByRole('heading', { level: 2, name: 'Page Not Found' });
      expect(h1).toBeInTheDocument();
      expect(h2).toBeInTheDocument();
    });

    test('should have button with accessible name', () => {
      renderWithRouter(<NotFound />);
      const button = screen.getByRole('button', { name: /Go Home/i });
      expect(button).toBeInTheDocument();
      expect(button.textContent).toBe('Go Home');
    });

    test('should have semantic button element', () => {
      renderWithRouter(<NotFound />);
      const button = screen.getByRole('button');
      expect(button.tagName).toBe('BUTTON');
    });

    test('should have descriptive text content', () => {
      renderWithRouter(<NotFound />);
      expect(screen.getByText(/The page you're looking for doesn't exist/)).toBeInTheDocument();
    });
  });

  describe('Content Verification', () => {
    test('should render all required text elements', () => {
      renderWithRouter(<NotFound />);
      expect(screen.getByText('404')).toBeInTheDocument();
      expect(screen.getByText('Page Not Found')).toBeInTheDocument();
      expect(screen.getByText(/The page you're looking for doesn't exist/)).toBeInTheDocument();
      expect(screen.getByText('Go Home')).toBeInTheDocument();
    });

    test('should have exactly one button', () => {
      renderWithRouter(<NotFound />);
      const buttons = screen.getAllByRole('button');
      expect(buttons).toHaveLength(1);
    });

    test('should have exactly two headings', () => {
      renderWithRouter(<NotFound />);
      const headings = screen.getAllByRole('heading');
      expect(headings).toHaveLength(2);
    });
  });

  describe('Layout and Styling', () => {
    test('should center content vertically and horizontally', () => {
      const { container } = renderWithRouter(<NotFound />);
      const mainDiv = container.querySelector('div');
      expect(mainDiv).toHaveStyle('display: flex');
      expect(mainDiv).toHaveStyle('alignItems: center');
      expect(mainDiv).toHaveStyle('justifyContent: center');
    });

    test('should have full viewport height', () => {
      const { container } = renderWithRouter(<NotFound />);
      const mainDiv = container.querySelector('div');
      expect(mainDiv).toHaveStyle('minHeight: 100vh');
    });

    test('should have padding for mobile responsiveness', () => {
      const { container } = renderWithRouter(<NotFound />);
      const mainDiv = container.querySelector('div');
      expect(mainDiv).toHaveStyle('padding: 20px');
    });

    test('should have brand color for 404 heading', () => {
      renderWithRouter(<NotFound />);
      const heading = screen.getByRole('heading', { name: '404' });
      expect(heading).toHaveStyle('color: #7D1F3F');
    });

    test('should have brand color for button background', () => {
      renderWithRouter(<NotFound />);
      const button = screen.getByRole('button');
      expect(button).toHaveStyle('background: #7D1F3F');
    });
  });

  describe('DOM Structure', () => {
    test('should render a single main container', () => {
      const { container } = renderWithRouter(<NotFound />);
      const divs = container.querySelectorAll('div');
      expect(divs.length).toBeGreaterThan(0);
    });

    test('should have button as descendant of main container', () => {
      const { container } = renderWithRouter(<NotFound />);
      const mainDiv = container.querySelector('div');
      const button = mainDiv.querySelector('button');
      expect(button).toBeInTheDocument();
    });

    test('should render without any image elements', () => {
      const { container } = renderWithRouter(<NotFound />);
      const images = container.querySelectorAll('img');
      expect(images).toHaveLength(0);
    });

    test('should render without any input elements', () => {
      const { container } = renderWithRouter(<NotFound />);
      const inputs = container.querySelectorAll('input');
      expect(inputs).toHaveLength(0);
    });
  });

  describe('Edge Cases', () => {
    test('should handle multiple clicks on button', () => {
      mockNavigate.mockClear();
      renderWithRouter(<NotFound />);
      const button = screen.getByRole('button');

      fireEvent.click(button);
      fireEvent.click(button);
      fireEvent.click(button);

      expect(mockNavigate).toHaveBeenCalledTimes(3);
    });

    test('should maintain styling after interaction', () => {
      mockNavigate.mockClear();
      renderWithRouter(<NotFound />);
      const button = screen.getByRole('button');

      fireEvent.click(button);

      expect(button).toHaveStyle('background: #7D1F3F');
      expect(button).toHaveStyle('color: white');
    });

    test('should render correctly on initial mount', () => {
      renderWithRouter(<NotFound />);
      expect(screen.getByRole('heading', { name: '404' })).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: 'Page Not Found' })).toBeInTheDocument();
      expect(screen.getByText(/The page you're looking for doesn't exist/)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Go Home/i })).toBeInTheDocument();
    });
  });

  describe('Color and Branding', () => {
    test('should use brand color #7D1F3F for 404 text', () => {
      renderWithRouter(<NotFound />);
      const heading = screen.getByRole('heading', { name: '404' });
      expect(heading).toHaveStyle('color: #7D1F3F');
    });

    test('should use brand color #7D1F3F for button', () => {
      renderWithRouter(<NotFound />);
      const button = screen.getByRole('button');
      expect(button).toHaveStyle('background: #7D1F3F');
    });

    test('should have white text on button', () => {
      renderWithRouter(<NotFound />);
      const button = screen.getByRole('button');
      expect(button).toHaveStyle('color: white');
    });
  });

  describe('Typography', () => {
    test('should display large 404 heading', () => {
      renderWithRouter(<NotFound />);
      const heading = screen.getByRole('heading', { name: '404' });
      expect(heading).toHaveStyle('fontSize: 4rem');
    });

    test('should have appropriate heading levels', () => {
      renderWithRouter(<NotFound />);
      const h1 = screen.getByRole('heading', { level: 1 });
      const h2 = screen.getByRole('heading', { level: 2 });
      expect(h1).toBeInTheDocument();
      expect(h2).toBeInTheDocument();
    });
  });

  describe('Component Props', () => {
    test('should render without any props required', () => {
      expect(() => renderWithRouter(<NotFound />)).not.toThrow();
    });

    test('should not require children prop', () => {
      const { container } = renderWithRouter(<NotFound />);
      expect(container.firstChild).toBeInTheDocument();
    });
  });
});