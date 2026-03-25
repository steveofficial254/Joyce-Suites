
import React from 'react';
import { render, screen, fireEvent, waitFor, within, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import MenuPage from './MenuPage';
import '@testing-library/jest-dom';

// Mock the navigate function
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => mockNavigate,
}));

// Mock the assets
jest.mock('../assets/image13.jpg', () => 'hero-bg');
jest.mock('../assets/image1.png', () => 'logo');
jest.mock('../assets/image11.jpg', () => 'gallery1');
jest.mock('../assets/image12.jpg', () => 'gallery2');
jest.mock('../assets/image15.jpg', () => 'gallery3');
jest.mock('../assets/image16.jpg', () => 'gallery4');
jest.mock('../assets/image17.jpg', () => 'gallery5');
jest.mock('../assets/image20.jpg', () => 'gallery6');
jest.mock('../assets/image21.jpg', () => 'gallery7');
jest.mock('../assets/image22.jpg', () => 'gallery8');
jest.mock('../assets/image10.jpg', () => 'gallery9');
jest.mock('../assets/image9.jpg', () => 'gallery10');
jest.mock('../assets/image18.jpg', () => 'gallery11');

describe('MenuPage Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();

        // Very robust mock fetch
        global.fetch = jest.fn().mockImplementation((url) => {
            const urlStr = String(url);

            // Use logical matching regardless of the base URL
            if (urlStr.includes('/api/auth/rooms/available')) {
                return Promise.resolve({
                    ok: true,
                    status: 200,
                    json: () => Promise.resolve({
                        success: true,
                        rooms: [
                            {
                                id: 1,
                                name: 'Room 101',
                                property_type: 'one_bedroom',
                                rent_amount: 15000,
                                description: 'A cozy one bedroom apartment'
                            }
                        ],
                        next_available_date: '2026-02-01'
                    }),
                });
            }

            if (urlStr.includes('/api/auth/inquiry')) {
                return Promise.resolve({
                    ok: true,
                    status: 200,
                    json: () => Promise.resolve({ success: true }),
                });
            }

            return Promise.reject(new Error(`Unhandled fetch URL: ${urlStr}`));
        });

        // Mock timers for the auto-advancing gallery
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    test('renders the hero section with title', () => {
        render(
            <MemoryRouter>
                <MenuPage />
            </MemoryRouter>
        );

        expect(screen.getAllByText(/Premium Living at/i).length).toBeGreaterThan(0);
        expect(screen.getAllByText(/Joyce Suites/i).length).toBeGreaterThan(0);
    });

    test('fetches and displays available rooms', async () => {
        render(
            <MemoryRouter>
                <MenuPage />
            </MemoryRouter>
        );

        // Wait for loading to complete first
        await waitFor(() => {
            expect(screen.queryByText('Loading available rooms...')).not.toBeInTheDocument();
        }, { timeout: 3000 });

        // Then wait for rooms to load
        await waitFor(() => {
            expect(screen.getByText('Room 101')).toBeInTheDocument();
            expect(screen.getAllByText(/One Bedroom/i).length).toBeGreaterThan(0);
            expect(screen.getByText(/KSh 15,000/i)).toBeInTheDocument();
        }, { timeout: 5000 });
    });

    test('submits the inquiry form successfully', async () => {
        render(
            <MemoryRouter>
                <MenuPage />
            </MemoryRouter>
        );

        // Use the IDs I added for unique targeting
        const nameInput = screen.getByLabelText(/^Name$/i);
        const emailInput = screen.getByLabelText(/^Email$/i);
        const phoneInput = screen.getByLabelText(/^Phone$/i);
        const messageInput = screen.getByLabelText(/^Message$/i);

        fireEvent.change(nameInput, { target: { value: 'John Doe' } });
        fireEvent.change(emailInput, { target: { value: 'john@example.com' } });
        fireEvent.change(phoneInput, { target: { value: '0712345678' } });
        fireEvent.change(messageInput, { target: { value: 'Inquiry message' } });

        fireEvent.click(screen.getByRole('button', { name: /Send Message/i }));

        await waitFor(() => {
            expect(screen.getByText(/Message sent! We will contact you shortly/i)).toBeInTheDocument();
        });
    });

    test('opens the booking modal and submits request', async () => {
        render(
            <MemoryRouter>
                <MenuPage />
            </MemoryRouter>
        );

        fireEvent.click(screen.getByText(/Check Availability \/ Book Now/i));

        const modal = screen.getByRole('dialog');
        const modalQuery = within(modal);

        fireEvent.change(modalQuery.getByLabelText(/Full Name/i), { target: { value: 'Jane Doe' } });
        fireEvent.change(modalQuery.getByLabelText(/^Phone$/i), { target: { value: '0711111111' } });
        fireEvent.change(modalQuery.getByLabelText(/^Email$/i), { target: { value: 'jane@example.com' } });
        fireEvent.change(modalQuery.getByLabelText(/Desired Move-in Date/i), { target: { value: '2026-02-10' } });

        fireEvent.click(modalQuery.getByRole('button', { name: /Send Booking Request/i }));

        await waitFor(() => {
            expect(modalQuery.getByText(/Booking request sent! Once processed, you will be directed to register/i)).toBeInTheDocument();
        });

        // Fast-forward timers for navigation
        act(() => {
            jest.advanceTimersByTime(4000);
        });

        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith('/register-tenant');
        });
    });
});
