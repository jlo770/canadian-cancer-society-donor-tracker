import React from 'react';
import { render, screen, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';
import App from './App';
import { useAuth } from './context/AuthContext';

// Mock useAuth hook
jest.mock('./context/AuthContext', () => ({
  useAuth: jest.fn(),
  AuthProvider: ({ children }) => <div data-testid="auth-provider">{children}</div>
}));

// Mock components
jest.mock('./components/auth/Login', () => () => <div data-testid="login-component">Login Component</div>);
jest.mock('./components/auth/ForgotPassword', () => () => <div data-testid="forgot-password-component">Forgot Password Component</div>);
jest.mock('./components/auth/ResetPassword', () => () => <div data-testid="reset-password-component">Reset Password Component</div>);
jest.mock('./components/auth/ProtectedRoute', () => ({ children }) => <div data-testid="protected-route">{children}</div>);
jest.mock('./components/auth/SessionTimeoutDialog', () => () => <div data-testid="session-timeout-dialog">Session Timeout Dialog</div>);
jest.mock('./components/layout/Header', () => () => <div data-testid="header">Header Component</div>);
jest.mock('./components/layout/Sidebar', () => () => <div data-testid="sidebar">Sidebar Component</div>);
jest.mock('./components/layout/Footer', () => () => <div data-testid="footer">Footer Component</div>);
jest.mock('./components/dashboard/Dashboard', () => () => <div data-testid="dashboard-component">Dashboard Component</div>);
jest.mock('./components/donors/DonorList', () => () => <div data-testid="donor-list-component">Donor List Component</div>);
jest.mock('./components/donors/DonorDetail', () => () => <div data-testid="donor-detail-component">Donor Detail Component</div>);
jest.mock('./components/donors/DonorForm', () => () => <div data-testid="donor-form-component">Donor Form Component</div>);
jest.mock('./components/donations/DonationList', () => () => <div data-testid="donation-list-component">Donation List Component</div>);
jest.mock('./components/campaigns/CampaignList', () => () => <div data-testid="campaign-list-component">Campaign List Component</div>);
jest.mock('./components/reports/Reports', () => () => <div data-testid="reports-component">Reports Component</div>);
jest.mock('./components/settings/Settings', () => () => <div data-testid="settings-component">Settings Component</div>);

describe('App Component', () => {
  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
    
    // Default auth state - unauthenticated
    useAuth.mockReturnValue({
      currentUser: null,
      loading: false,
      sessionTimeoutWarning: false
    });
  });

  test('renders login route when not authenticated', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>
    );

    // Should redirect to login
    expect(screen.getByTestId('login-component')).toBeInTheDocument();
  });

  test('renders forgot password route', () => {
    render(
      <MemoryRouter initialEntries={['/forgot-password']}>
        <App />
      </MemoryRouter>
    );

    expect(screen.getByTestId('forgot-password-component')).toBeInTheDocument();
  });

  test('renders reset password route', () => {
    render(
      <MemoryRouter initialEntries={['/reset-password/some-token']}>
        <App />
      </MemoryRouter>
    );

    expect(screen.getByTestId('reset-password-component')).toBeInTheDocument();
  });

  test('renders authenticated layout with dashboard when authenticated', () => {
    // Mock authenticated user
    useAuth.mockReturnValue({
      currentUser: { id: 1, name: 'Test User', role: 'user' },
      loading: false,
      sessionTimeoutWarning: false
    });

    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <App />
      </MemoryRouter>
    );

    // Should render authenticated layout components
    expect(screen.getByTestId('header')).toBeInTheDocument();
    expect(screen.getByTestId('sidebar')).toBeInTheDocument();
    expect(screen.getByTestId('footer')).toBeInTheDocument();
    expect(screen.getByTestId('session-timeout-dialog')).toBeInTheDocument();
    
    // Should render dashboard component
    expect(screen.getByTestId('dashboard-component')).toBeInTheDocument();
  });

  test('renders donor list route when authenticated', () => {
    // Mock authenticated user
    useAuth.mockReturnValue({
      currentUser: { id: 1, name: 'Test User', role: 'user' },
      loading: false,
      sessionTimeoutWarning: false
    });

    render(
      <MemoryRouter initialEntries={['/donors']}>
        <App />
      </MemoryRouter>
    );

    // Should render authenticated layout with donor list
    expect(screen.getByTestId('header')).toBeInTheDocument();
    expect(screen.getByTestId('donor-list-component')).toBeInTheDocument();
  });

  test('renders donor detail route when authenticated', () => {
    // Mock authenticated user
    useAuth.mockReturnValue({
      currentUser: { id: 1, name: 'Test User', role: 'user' },
      loading: false,
      sessionTimeoutWarning: false
    });

    render(
      <MemoryRouter initialEntries={['/donors/123']}>
        <App />
      </MemoryRouter>
    );

    // Should render authenticated layout with donor detail
    expect(screen.getByTestId('header')).toBeInTheDocument();
    expect(screen.getByTestId('donor-detail-component')).toBeInTheDocument();
  });

  test('renders donor form route when authenticated', () => {
    // Mock authenticated user
    useAuth.mockReturnValue({
      currentUser: { id: 1, name: 'Test User', role: 'user' },
      loading: false,
      sessionTimeoutWarning: false
    });

    render(
      <MemoryRouter initialEntries={['/donors/new']}>
        <App />
      </MemoryRouter>
    );

    // Should render authenticated layout with donor form
    expect(screen.getByTestId('header')).toBeInTheDocument();
    expect(screen.getByTestId('donor-form-component')).toBeInTheDocument();
  });

  test('renders donation list route when authenticated', () => {
    // Mock authenticated user
    useAuth.mockReturnValue({
      currentUser: { id: 1, name: 'Test User', role: 'user' },
      loading: false,
      sessionTimeoutWarning: false
    });

    render(
      <MemoryRouter initialEntries={['/donations']}>
        <App />
      </MemoryRouter>
    );

    // Should render authenticated layout with donation list
    expect(screen.getByTestId('header')).toBeInTheDocument();
    expect(screen.getByTestId('donation-list-component')).toBeInTheDocument();
  });

  test('renders campaign list route when authenticated', () => {
    // Mock authenticated user
    useAuth.mockReturnValue({
      currentUser: { id: 1, name: 'Test User', role: 'user' },
      loading: false,
      sessionTimeoutWarning: false
    });

    render(
      <MemoryRouter initialEntries={['/campaigns']}>
        <App />
      </MemoryRouter>
    );

    // Should render authenticated layout with campaign list
    expect(screen.getByTestId('header')).toBeInTheDocument();
    expect(screen.getByTestId('campaign-list-component')).toBeInTheDocument();
  });

  test('renders reports route when authenticated', () => {
    // Mock authenticated user
    useAuth.mockReturnValue({
      currentUser: { id: 1, name: 'Test User', role: 'user' },
      loading: false,
      sessionTimeoutWarning: false
    });

    render(
      <MemoryRouter initialEntries={['/reports']}>
        <App />
      </MemoryRouter>
    );

    // Should render authenticated layout with reports
    expect(screen.getByTestId('header')).toBeInTheDocument();
    expect(screen.getByTestId('reports-component')).toBeInTheDocument();
  });

  test('renders settings route when authenticated', () => {
    // Mock authenticated user
    useAuth.mockReturnValue({
      currentUser: { id: 1, name: 'Test User', role: 'user' },
      loading: false,
      sessionTimeoutWarning: false
    });

    render(
      <MemoryRouter initialEntries={['/settings']}>
        <App />
      </MemoryRouter>
    );

    // Should render authenticated layout with settings
    expect(screen.getByTestId('header')).toBeInTheDocument();
    expect(screen.getByTestId('settings-component')).toBeInTheDocument();
  });

  test('theme preference is stored in localStorage', () => {
    // Mock localStorage
    const localStorageMock = {
      getItem: jest.fn().mockReturnValue('dark'),
      setItem: jest.fn()
    };
    Object.defineProperty(window, 'localStorage', { value: localStorageMock });

    render(
      <MemoryRouter initialEntries={['/login']}>
        <App />
      </MemoryRouter>
    );

    // Check if localStorage was accessed to get theme preference
    expect(localStorageMock.getItem).toHaveBeenCalledWith('themePreference');
  });
});
