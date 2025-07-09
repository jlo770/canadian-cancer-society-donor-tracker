import React from 'react';
import { render, screen, act, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { AuthProvider, useAuth } from '../AuthContext';
import axios from 'axios';

// Mock axios
jest.mock('axios');

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: jest.fn(key => store[key] || null),
    setItem: jest.fn((key, value) => {
      store[key] = value.toString();
    }),
    removeItem: jest.fn(key => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    })
  };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Test component that uses the auth context
const TestComponent = () => {
  const { 
    currentUser, 
    loading, 
    login, 
    logout, 
    sessionTimeoutWarning,
    extendSession,
    isAdmin,
    forgotPassword,
    resetPassword,
    changePassword,
    updateProfile
  } = useAuth();

  return (
    <div>
      <div data-testid="loading">{loading.toString()}</div>
      <div data-testid="user">{currentUser ? JSON.stringify(currentUser) : 'no user'}</div>
      <div data-testid="timeout-warning">{sessionTimeoutWarning.toString()}</div>
      <button onClick={() => login('test@example.com', 'password123')}>Login</button>
      <button onClick={() => logout()}>Logout</button>
      <button onClick={() => extendSession()}>Extend Session</button>
      <button onClick={() => isAdmin()}>Check Admin</button>
      <button onClick={() => forgotPassword('test@example.com')}>Forgot Password</button>
      <button onClick={() => resetPassword('token123', 'newpassword')}>Reset Password</button>
      <button onClick={() => changePassword('oldpassword', 'newpassword')}>Change Password</button>
      <button onClick={() => updateProfile({ name: 'Updated Name' })}>Update Profile</button>
    </div>
  );
};

describe('AuthContext', () => {
  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
    localStorageMock.clear();
    
    // Mock timer functions
    jest.useFakeTimers();
  });
  
  afterEach(() => {
    // Restore timer functions
    jest.useRealTimers();
  });

  test('provides initial auth state', () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Check initial state
    expect(screen.getByTestId('loading')).toHaveTextContent('true');
    expect(screen.getByTestId('user')).toHaveTextContent('no user');
    expect(screen.getByTestId('timeout-warning')).toHaveTextContent('false');
  });

  test('loads user from token in localStorage', async () => {
    // Set token in localStorage
    localStorageMock.setItem('token', 'fake-token');
    
    // Mock successful user fetch
    axios.get.mockResolvedValueOnce({
      data: { user: { id: 1, name: 'Test User', email: 'test@example.com', role: 'user' } }
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Check if axios.get was called to fetch user data
    expect(axios.get).toHaveBeenCalledWith('/api/auth/user');
    
    // Wait for user data to load
    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
      expect(screen.getByTestId('user')).toHaveTextContent(/"id":1/);
      expect(screen.getByTestId('user')).toHaveTextContent(/"name":"Test User"/);
    });
  });

  test('handles login correctly', async () => {
    // Mock successful login
    axios.post.mockResolvedValueOnce({
      data: {
        token: 'fake-token',
        user: { id: 1, name: 'Test User', email: 'test@example.com', role: 'user' }
      }
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Click login button
    const loginButton = screen.getByText('Login');
    await act(async () => {
      loginButton.click();
    });

    // Check if axios.post was called with correct arguments
    expect(axios.post).toHaveBeenCalledWith('/api/auth/login', {
      email: 'test@example.com',
      password: 'password123'
    });

    // Check if token was stored in localStorage
    expect(localStorageMock.setItem).toHaveBeenCalledWith('token', 'fake-token');

    // Check if user data was updated
    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent(/"id":1/);
      expect(screen.getByTestId('user')).toHaveTextContent(/"name":"Test User"/);
    });
  });

  test('handles logout correctly', async () => {
    // Set initial state with user logged in
    localStorageMock.setItem('token', 'fake-token');
    axios.get.mockResolvedValueOnce({
      data: { user: { id: 1, name: 'Test User', email: 'test@example.com', role: 'user' } }
    });

    // Mock successful logout
    axios.post.mockResolvedValueOnce({});

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Wait for user data to load
    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent(/"id":1/);
    });

    // Click logout button
    const logoutButton = screen.getByText('Logout');
    await act(async () => {
      logoutButton.click();
    });

    // Check if axios.post was called for logout
    expect(axios.post).toHaveBeenCalledWith('/api/auth/logout');

    // Check if token was removed from localStorage
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('token');

    // Check if user data was cleared
    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('no user');
    });
  });

  test('handles session timeout warning', async () => {
    // Set initial state with user logged in
    localStorageMock.setItem('token', 'fake-token');
    axios.get.mockResolvedValueOnce({
      data: { user: { id: 1, name: 'Test User', email: 'test@example.com', role: 'user' } }
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Wait for user data to load
    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent(/"id":1/);
    });

    // Initially, timeout warning should be false
    expect(screen.getByTestId('timeout-warning')).toHaveTextContent('false');

    // Advance timer to just before warning time (25 minutes)
    act(() => {
      jest.advanceTimersByTime(25 * 60 * 1000 - 1000);
    });

    // Timeout warning should still be false
    expect(screen.getByTestId('timeout-warning')).toHaveTextContent('false');

    // Advance timer to warning time (25 minutes)
    act(() => {
      jest.advanceTimersByTime(1000);
    });

    // Timeout warning should now be true
    expect(screen.getByTestId('timeout-warning')).toHaveTextContent('true');
  });

  test('extends session correctly', async () => {
    // Set initial state with user logged in
    localStorageMock.setItem('token', 'fake-token');
    axios.get.mockResolvedValueOnce({
      data: { user: { id: 1, name: 'Test User', email: 'test@example.com', role: 'user' } }
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Wait for user data to load
    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent(/"id":1/);
    });

    // Advance timer to warning time (25 minutes)
    act(() => {
      jest.advanceTimersByTime(25 * 60 * 1000);
    });

    // Timeout warning should be true
    expect(screen.getByTestId('timeout-warning')).toHaveTextContent('true');

    // Click extend session button
    const extendButton = screen.getByText('Extend Session');
    await act(async () => {
      extendButton.click();
    });

    // Timeout warning should be reset to false
    expect(screen.getByTestId('timeout-warning')).toHaveTextContent('false');
  });

  test('isAdmin returns correct value based on user role', async () => {
    // Set initial state with admin user
    localStorageMock.setItem('token', 'fake-token');
    axios.get.mockResolvedValueOnce({
      data: { user: { id: 1, name: 'Admin User', email: 'admin@example.com', role: 'admin' } }
    });

    const { rerender } = render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Wait for user data to load
    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent(/"role":"admin"/);
    });

    // Reset mocks
    jest.clearAllMocks();
    localStorageMock.clear();

    // Set initial state with regular user
    localStorageMock.setItem('token', 'fake-token');
    axios.get.mockResolvedValueOnce({
      data: { user: { id: 2, name: 'Regular User', email: 'user@example.com', role: 'user' } }
    });

    // Rerender with regular user
    rerender(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Wait for user data to load
    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent(/"role":"user"/);
    });
  });

  test('handles forgot password correctly', async () => {
    // Mock successful forgot password request
    axios.post.mockResolvedValueOnce({});

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Click forgot password button
    const forgotPasswordButton = screen.getByText('Forgot Password');
    await act(async () => {
      forgotPasswordButton.click();
    });

    // Check if axios.post was called with correct arguments
    expect(axios.post).toHaveBeenCalledWith('/api/auth/forgot-password', {
      email: 'test@example.com'
    });
  });

  test('handles reset password correctly', async () => {
    // Mock successful reset password request
    axios.post.mockResolvedValueOnce({});

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Click reset password button
    const resetPasswordButton = screen.getByText('Reset Password');
    await act(async () => {
      resetPasswordButton.click();
    });

    // Check if axios.post was called with correct arguments
    expect(axios.post).toHaveBeenCalledWith('/api/auth/reset-password/token123', {
      password: 'newpassword'
    });
  });

  test('handles change password correctly', async () => {
    // Set initial state with user logged in
    localStorageMock.setItem('token', 'fake-token');
    axios.get.mockResolvedValueOnce({
      data: { user: { id: 1, name: 'Test User', email: 'test@example.com', role: 'user' } }
    });

    // Mock successful change password request
    axios.post.mockResolvedValueOnce({});

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Wait for user data to load
    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent(/"id":1/);
    });

    // Click change password button
    const changePasswordButton = screen.getByText('Change Password');
    await act(async () => {
      changePasswordButton.click();
    });

    // Check if axios.post was called with correct arguments
    expect(axios.post).toHaveBeenCalledWith('/api/auth/change-password', {
      oldPassword: 'oldpassword',
      newPassword: 'newpassword'
    });
  });

  test('handles update profile correctly', async () => {
    // Set initial state with user logged in
    localStorageMock.setItem('token', 'fake-token');
    axios.get.mockResolvedValueOnce({
      data: { user: { id: 1, name: 'Test User', email: 'test@example.com', role: 'user' } }
    });

    // Mock successful update profile request and user refresh
    axios.put.mockResolvedValueOnce({});
    axios.get.mockResolvedValueOnce({
      data: { user: { id: 1, name: 'Updated Name', email: 'test@example.com', role: 'user' } }
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Wait for user data to load
    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent(/"name":"Test User"/);
    });

    // Click update profile button
    const updateProfileButton = screen.getByText('Update Profile');
    await act(async () => {
      updateProfileButton.click();
    });

    // Check if axios.put was called with correct arguments
    expect(axios.put).toHaveBeenCalledWith('/api/users/profile', {
      name: 'Updated Name'
    });

    // Check if user data was refreshed
    expect(axios.get).toHaveBeenCalledWith('/api/auth/user');

    // Check if user data was updated
    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent(/"name":"Updated Name"/);
    });
  });
});
