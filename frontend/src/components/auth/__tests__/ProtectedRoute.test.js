import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { AuthProvider, useAuth } from '../../../context/AuthContext';
import ProtectedRoute from '../ProtectedRoute';

// Mock useAuth hook
jest.mock('../../../context/AuthContext', () => {
  const originalModule = jest.requireActual('../../../context/AuthContext');
  return {
    ...originalModule,
    useAuth: jest.fn()
  };
});

describe('ProtectedRoute Component', () => {
  // Test component to render inside protected route
  const TestComponent = () => <div>Protected Content</div>;
  
  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
  });

  test('renders children when user is authenticated', () => {
    // Mock authenticated user
    useAuth.mockReturnValue({
      currentUser: { id: 1, name: 'Test User', role: 'user' },
      loading: false,
      isAdmin: () => false
    });

    render(
      <MemoryRouter initialEntries={['/protected']}>
        <Routes>
          <Route 
            path="/protected" 
            element={
              <ProtectedRoute>
                <TestComponent />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </MemoryRouter>
    );

    // Check if protected content is rendered
    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  test('redirects to login when user is not authenticated', () => {
    // Mock unauthenticated user
    useAuth.mockReturnValue({
      currentUser: null,
      loading: false,
      isAdmin: () => false
    });

    render(
      <MemoryRouter initialEntries={['/protected']}>
        <Routes>
          <Route path="/login" element={<div>Login Page</div>} />
          <Route 
            path="/protected" 
            element={
              <ProtectedRoute>
                <TestComponent />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </MemoryRouter>
    );

    // Check if redirected to login page
    expect(screen.getByText('Login Page')).toBeInTheDocument();
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  test('shows loading spinner when authentication state is loading', () => {
    // Mock loading state
    useAuth.mockReturnValue({
      currentUser: null,
      loading: true,
      isAdmin: () => false
    });

    render(
      <MemoryRouter initialEntries={['/protected']}>
        <Routes>
          <Route 
            path="/protected" 
            element={
              <ProtectedRoute>
                <TestComponent />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </MemoryRouter>
    );

    // Check if loading spinner is rendered
    // Note: We can't easily test for the CircularProgress component directly,
    // but we can check that the protected content is not rendered
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  test('restricts access based on required role', () => {
    // Mock authenticated user without admin role
    useAuth.mockReturnValue({
      currentUser: { id: 1, name: 'Test User', role: 'user' },
      loading: false,
      isAdmin: () => false
    });

    render(
      <MemoryRouter initialEntries={['/admin']}>
        <Routes>
          <Route path="/" element={<div>Dashboard</div>} />
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute requiredRole="admin">
                <div>Admin Content</div>
              </ProtectedRoute>
            } 
          />
        </Routes>
      </MemoryRouter>
    );

    // Check if redirected to dashboard
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.queryByText('Admin Content')).not.toBeInTheDocument();
  });

  test('allows access when user has required role', () => {
    // Mock authenticated admin user
    useAuth.mockReturnValue({
      currentUser: { id: 1, name: 'Admin User', role: 'admin' },
      loading: false,
      isAdmin: () => true
    });

    render(
      <MemoryRouter initialEntries={['/admin']}>
        <Routes>
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute requiredRole="admin">
                <div>Admin Content</div>
              </ProtectedRoute>
            } 
          />
        </Routes>
      </MemoryRouter>
    );

    // Check if admin content is rendered
    expect(screen.getByText('Admin Content')).toBeInTheDocument();
  });
});
