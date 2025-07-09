import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import SessionTimeoutDialog from '../SessionTimeoutDialog';
import { useAuth } from '../../../context/AuthContext';

// Mock useAuth hook
jest.mock('../../../context/AuthContext', () => ({
  useAuth: jest.fn()
}));

describe('SessionTimeoutDialog Component', () => {
  // Mock functions for useAuth
  const mockExtendSession = jest.fn();
  const mockLogout = jest.fn();
  
  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
    
    // Mock timer functions
    jest.useFakeTimers();
  });
  
  afterEach(() => {
    // Restore timer functions
    jest.useRealTimers();
  });

  test('renders dialog when session timeout warning is active', () => {
    // Mock session timeout warning
    useAuth.mockReturnValue({
      sessionTimeoutWarning: true,
      extendSession: mockExtendSession,
      logout: mockLogout
    });

    render(<SessionTimeoutDialog />);

    // Check if dialog is rendered with correct content
    expect(screen.getByText(/Session Timeout Warning/i)).toBeInTheDocument();
    expect(screen.getByText(/Your session is about to expire due to inactivity/i)).toBeInTheDocument();
    expect(screen.getByText(/05:00/i)).toBeInTheDocument(); // Initial time (5 minutes)
    expect(screen.getByRole('button', { name: /Continue Session/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Log Out/i })).toBeInTheDocument();
  });

  test('does not render dialog when session timeout warning is inactive', () => {
    // Mock no session timeout warning
    useAuth.mockReturnValue({
      sessionTimeoutWarning: false,
      extendSession: mockExtendSession,
      logout: mockLogout
    });

    render(<SessionTimeoutDialog />);

    // Check if dialog is not rendered
    expect(screen.queryByText(/Session Timeout Warning/i)).not.toBeInTheDocument();
  });

  test('calls extendSession when continue button is clicked', () => {
    // Mock session timeout warning
    useAuth.mockReturnValue({
      sessionTimeoutWarning: true,
      extendSession: mockExtendSession,
      logout: mockLogout
    });

    render(<SessionTimeoutDialog />);

    // Click continue session button
    const continueButton = screen.getByRole('button', { name: /Continue Session/i });
    fireEvent.click(continueButton);

    // Check if extendSession was called
    expect(mockExtendSession).toHaveBeenCalledTimes(1);
    expect(mockLogout).not.toHaveBeenCalled();
  });

  test('calls logout when logout button is clicked', () => {
    // Mock session timeout warning
    useAuth.mockReturnValue({
      sessionTimeoutWarning: true,
      extendSession: mockExtendSession,
      logout: mockLogout
    });

    render(<SessionTimeoutDialog />);

    // Click logout button
    const logoutButton = screen.getByRole('button', { name: /Log Out/i });
    fireEvent.click(logoutButton);

    // Check if logout was called
    expect(mockLogout).toHaveBeenCalledTimes(1);
    expect(mockExtendSession).not.toHaveBeenCalled();
  });

  test('countdown timer decreases correctly', () => {
    // Mock session timeout warning
    useAuth.mockReturnValue({
      sessionTimeoutWarning: true,
      extendSession: mockExtendSession,
      logout: mockLogout
    });

    render(<SessionTimeoutDialog />);

    // Check initial time
    expect(screen.getByText(/05:00/i)).toBeInTheDocument();

    // Advance timer by 1 second
    act(() => {
      jest.advanceTimersByTime(1000);
    });

    // Check if time decreased
    expect(screen.getByText(/04:59/i)).toBeInTheDocument();

    // Advance timer by 60 seconds
    act(() => {
      jest.advanceTimersByTime(60000);
    });

    // Check if time decreased by 1 minute
    expect(screen.getByText(/03:59/i)).toBeInTheDocument();
  });

  test('resets countdown when sessionTimeoutWarning changes to false', () => {
    // Start with session timeout warning active
    useAuth.mockReturnValue({
      sessionTimeoutWarning: true,
      extendSession: mockExtendSession,
      logout: mockLogout
    });

    const { rerender } = render(<SessionTimeoutDialog />);

    // Advance timer by 30 seconds
    act(() => {
      jest.advanceTimersByTime(30000);
    });

    // Check if time decreased
    expect(screen.getByText(/04:30/i)).toBeInTheDocument();

    // Change session timeout warning to inactive
    useAuth.mockReturnValue({
      sessionTimeoutWarning: false,
      extendSession: mockExtendSession,
      logout: mockLogout
    });

    // Rerender component
    rerender(<SessionTimeoutDialog />);

    // Change session timeout warning back to active
    useAuth.mockReturnValue({
      sessionTimeoutWarning: true,
      extendSession: mockExtendSession,
      logout: mockLogout
    });

    // Rerender component
    rerender(<SessionTimeoutDialog />);

    // Check if time was reset to initial value
    expect(screen.getByText(/05:00/i)).toBeInTheDocument();
  });

  test('stops countdown when timer reaches zero', () => {
    // Mock session timeout warning
    useAuth.mockReturnValue({
      sessionTimeoutWarning: true,
      extendSession: mockExtendSession,
      logout: mockLogout
    });

    render(<SessionTimeoutDialog />);

    // Advance timer by 5 minutes (300 seconds)
    act(() => {
      jest.advanceTimersByTime(300000);
    });

    // Check if time shows 00:00
    expect(screen.getByText(/00:00/i)).toBeInTheDocument();

    // Advance timer by another 10 seconds
    act(() => {
      jest.advanceTimersByTime(10000);
    });

    // Time should still show 00:00 (not negative)
    expect(screen.getByText(/00:00/i)).toBeInTheDocument();
  });
});
