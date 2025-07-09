import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import ResetPassword from '../ResetPassword';
import axios from 'axios';

// Mock axios
jest.mock('axios');

// Mock useParams
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ token: 'valid-token' }),
  useNavigate: () => jest.fn()
}));

describe('ResetPassword Component', () => {
  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
  });

  test('renders loading state initially', () => {
    // Mock token verification (not resolved yet)
    axios.get.mockImplementation(() => new Promise(() => {}));

    render(
      <BrowserRouter>
        <ResetPassword />
      </BrowserRouter>
    );

    // Check if loading state is shown
    expect(screen.getByText(/Verifying your reset link/i)).toBeInTheDocument();
  });

  test('renders form when token is valid', async () => {
    // Mock successful token verification
    axios.get.mockResolvedValueOnce({});

    render(
      <BrowserRouter>
        <ResetPassword />
      </BrowserRouter>
    );

    // Check if form is rendered after token verification
    await waitFor(() => {
      expect(screen.getByLabelText(/New Password/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Confirm New Password/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Reset Password/i })).toBeInTheDocument();
    });
  });

  test('shows error when token is invalid', async () => {
    // Mock token verification error
    axios.get.mockRejectedValueOnce({
      response: {
        status: 404,
        data: { message: 'Invalid or expired token' }
      }
    });

    render(
      <BrowserRouter>
        <ResetPassword />
      </BrowserRouter>
    );

    // Check if error message is shown
    await waitFor(() => {
      expect(screen.getByText(/This password reset link is invalid or has expired/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Request New Reset Link/i })).toBeInTheDocument();
    });
  });

  test('handles form input changes', async () => {
    // Mock successful token verification
    axios.get.mockResolvedValueOnce({});

    render(
      <BrowserRouter>
        <ResetPassword />
      </BrowserRouter>
    );

    // Wait for form to render
    await waitFor(() => {
      expect(screen.getByLabelText(/New Password/i)).toBeInTheDocument();
    });

    // Get form inputs
    const passwordInput = screen.getByLabelText(/New Password/i);
    const confirmPasswordInput = screen.getByLabelText(/Confirm New Password/i);

    // Simulate user input
    fireEvent.change(passwordInput, { target: { value: 'NewPassword123!' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'NewPassword123!' } });

    // Check if inputs have correct values
    expect(passwordInput.value).toBe('NewPassword123!');
    expect(confirmPasswordInput.value).toBe('NewPassword123!');
  });

  test('shows validation errors for empty fields', async () => {
    // Mock successful token verification
    axios.get.mockResolvedValueOnce({});

    render(
      <BrowserRouter>
        <ResetPassword />
      </BrowserRouter>
    );

    // Wait for form to render
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Reset Password/i })).toBeInTheDocument();
    });

    // Submit form without filling inputs
    const submitButton = screen.getByRole('button', { name: /Reset Password/i });
    fireEvent.click(submitButton);

    // Check if validation error is shown
    await waitFor(() => {
      expect(screen.getByText(/Please enter both password fields/i)).toBeInTheDocument();
    });
  });

  test('shows validation error when passwords do not match', async () => {
    // Mock successful token verification
    axios.get.mockResolvedValueOnce({});

    render(
      <BrowserRouter>
        <ResetPassword />
      </BrowserRouter>
    );

    // Wait for form to render
    await waitFor(() => {
      expect(screen.getByLabelText(/New Password/i)).toBeInTheDocument();
    });

    // Fill form inputs with different passwords
    const passwordInput = screen.getByLabelText(/New Password/i);
    const confirmPasswordInput = screen.getByLabelText(/Confirm New Password/i);
    fireEvent.change(passwordInput, { target: { value: 'Password123!' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'DifferentPassword123!' } });

    // Submit form
    const submitButton = screen.getByRole('button', { name: /Reset Password/i });
    fireEvent.click(submitButton);

    // Check if validation error is shown
    await waitFor(() => {
      expect(screen.getByText(/Passwords do not match/i)).toBeInTheDocument();
    });
  });

  test('shows validation error for weak password', async () => {
    // Mock successful token verification
    axios.get.mockResolvedValueOnce({});

    render(
      <BrowserRouter>
        <ResetPassword />
      </BrowserRouter>
    );

    // Wait for form to render
    await waitFor(() => {
      expect(screen.getByLabelText(/New Password/i)).toBeInTheDocument();
    });

    // Fill form inputs with weak password
    const passwordInput = screen.getByLabelText(/New Password/i);
    const confirmPasswordInput = screen.getByLabelText(/Confirm New Password/i);
    fireEvent.change(passwordInput, { target: { value: 'weak' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'weak' } });

    // Submit form
    const submitButton = screen.getByRole('button', { name: /Reset Password/i });
    fireEvent.click(submitButton);

    // Check if validation error is shown
    await waitFor(() => {
      expect(screen.getByText(/Password must be at least 8 characters long/i)).toBeInTheDocument();
    });
  });

  test('handles successful password reset', async () => {
    // Mock successful token verification
    axios.get.mockResolvedValueOnce({});
    
    // Mock successful password reset
    axios.post.mockResolvedValueOnce({});

    render(
      <BrowserRouter>
        <ResetPassword />
      </BrowserRouter>
    );

    // Wait for form to render
    await waitFor(() => {
      expect(screen.getByLabelText(/New Password/i)).toBeInTheDocument();
    });

    // Fill form inputs with strong password
    const passwordInput = screen.getByLabelText(/New Password/i);
    const confirmPasswordInput = screen.getByLabelText(/Confirm New Password/i);
    fireEvent.change(passwordInput, { target: { value: 'StrongPassword123!' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'StrongPassword123!' } });

    // Submit form
    const submitButton = screen.getByRole('button', { name: /Reset Password/i });
    fireEvent.click(submitButton);

    // Check if axios.post was called with correct arguments
    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith('/api/auth/reset-password/valid-token', {
        password: 'StrongPassword123!'
      });
    });

    // Check if success message is displayed
    await waitFor(() => {
      expect(screen.getByText(/Your password has been successfully reset/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Go to Login/i })).toBeInTheDocument();
    });
  });

  test('handles password reset error', async () => {
    // Mock successful token verification
    axios.get.mockResolvedValueOnce({});
    
    // Mock password reset error
    axios.post.mockRejectedValueOnce({
      response: {
        status: 400,
        data: { message: 'Invalid password. Please choose a different password.' }
      }
    });

    render(
      <BrowserRouter>
        <ResetPassword />
      </BrowserRouter>
    );

    // Wait for form to render
    await waitFor(() => {
      expect(screen.getByLabelText(/New Password/i)).toBeInTheDocument();
    });

    // Fill form inputs
    const passwordInput = screen.getByLabelText(/New Password/i);
    const confirmPasswordInput = screen.getByLabelText(/Confirm New Password/i);
    fireEvent.change(passwordInput, { target: { value: 'StrongPassword123!' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'StrongPassword123!' } });

    // Submit form
    const submitButton = screen.getByRole('button', { name: /Reset Password/i });
    fireEvent.click(submitButton);

    // Check if error message is displayed
    await waitFor(() => {
      expect(screen.getByText(/Invalid password. Please choose a different password./i)).toBeInTheDocument();
    });
  });

  test('toggles password visibility', async () => {
    // Mock successful token verification
    axios.get.mockResolvedValueOnce({});

    render(
      <BrowserRouter>
        <ResetPassword />
      </BrowserRouter>
    );

    // Wait for form to render
    await waitFor(() => {
      expect(screen.getByLabelText(/New Password/i)).toBeInTheDocument();
    });

    // Get password input and toggle buttons
    const passwordInput = screen.getByLabelText(/New Password/i);
    const confirmPasswordInput = screen.getByLabelText(/Confirm New Password/i);
    const toggleButtons = screen.getAllByLabelText(/toggle.*password visibility/i);

    // Check initial state (passwords are hidden)
    expect(passwordInput).toHaveAttribute('type', 'password');
    expect(confirmPasswordInput).toHaveAttribute('type', 'password');

    // Click first toggle button (for new password)
    fireEvent.click(toggleButtons[0]);

    // Check if new password is now visible
    expect(passwordInput).toHaveAttribute('type', 'text');
    expect(confirmPasswordInput).toHaveAttribute('type', 'password'); // Should still be hidden

    // Click second toggle button (for confirm password)
    fireEvent.click(toggleButtons[1]);

    // Check if confirm password is now visible
    expect(passwordInput).toHaveAttribute('type', 'text');
    expect(confirmPasswordInput).toHaveAttribute('type', 'text');
  });
});
