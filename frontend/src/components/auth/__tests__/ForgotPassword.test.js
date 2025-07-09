import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import ForgotPassword from '../ForgotPassword';
import axios from 'axios';

// Mock axios
jest.mock('axios');

describe('ForgotPassword Component', () => {
  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
  });

  test('renders forgot password form correctly', () => {
    render(
      <BrowserRouter>
        <ForgotPassword />
      </BrowserRouter>
    );

    // Check if important elements are rendered
    expect(screen.getByText(/Reset Your Password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email Address/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Reset Password/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Back to Login/i })).toBeInTheDocument();
  });

  test('handles form input changes', () => {
    render(
      <BrowserRouter>
        <ForgotPassword />
      </BrowserRouter>
    );

    // Get email input
    const emailInput = screen.getByLabelText(/Email Address/i);

    // Simulate user input
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });

    // Check if input has correct value
    expect(emailInput.value).toBe('test@example.com');
  });

  test('shows validation error when form is submitted with empty email', async () => {
    render(
      <BrowserRouter>
        <ForgotPassword />
      </BrowserRouter>
    );

    // Submit form without filling email
    const submitButton = screen.getByRole('button', { name: /Reset Password/i });
    fireEvent.click(submitButton);

    // Check if validation error is shown
    await waitFor(() => {
      expect(screen.getByText(/Please enter your email address/i)).toBeInTheDocument();
    });
  });

  test('handles successful password reset request', async () => {
    // Mock successful password reset request
    axios.post.mockResolvedValueOnce({});

    render(
      <BrowserRouter>
        <ForgotPassword />
      </BrowserRouter>
    );

    // Fill email input
    const emailInput = screen.getByLabelText(/Email Address/i);
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });

    // Submit form
    const submitButton = screen.getByRole('button', { name: /Reset Password/i });
    fireEvent.click(submitButton);

    // Check if axios.post was called with correct arguments
    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith('/api/auth/forgot-password', {
        email: 'test@example.com'
      });
    });

    // Check if success message is displayed
    await waitFor(() => {
      expect(screen.getByText(/Password reset instructions have been sent to your email address/i)).toBeInTheDocument();
    });
  });

  test('handles password reset request error', async () => {
    // Mock password reset request error
    axios.post.mockRejectedValueOnce({
      response: {
        status: 404,
        data: { message: 'No account found with this email address' }
      }
    });

    render(
      <BrowserRouter>
        <ForgotPassword />
      </BrowserRouter>
    );

    // Fill email input
    const emailInput = screen.getByLabelText(/Email Address/i);
    fireEvent.change(emailInput, { target: { value: 'nonexistent@example.com' } });

    // Submit form
    const submitButton = screen.getByRole('button', { name: /Reset Password/i });
    fireEvent.click(submitButton);

    // Check if error message is displayed
    await waitFor(() => {
      expect(screen.getByText(/No account found with this email address/i)).toBeInTheDocument();
    });
  });

  test('back to login button navigates correctly', () => {
    render(
      <BrowserRouter>
        <ForgotPassword />
      </BrowserRouter>
    );

    // Check if back to login button has correct link
    const backButton = screen.getByRole('button', { name: /Back to Login/i });
    expect(backButton.closest('a')).toHaveAttribute('href', '/login');
  });

  test('shows different UI after successful submission', async () => {
    // Mock successful password reset request
    axios.post.mockResolvedValueOnce({});

    render(
      <BrowserRouter>
        <ForgotPassword />
      </BrowserRouter>
    );

    // Fill email input and submit form
    const emailInput = screen.getByLabelText(/Email Address/i);
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    const submitButton = screen.getByRole('button', { name: /Reset Password/i });
    fireEvent.click(submitButton);

    // Check if success UI is displayed
    await waitFor(() => {
      // Success message should be visible
      expect(screen.getByText(/Password reset instructions have been sent to your email address/i)).toBeInTheDocument();
      
      // Form should no longer be visible
      expect(screen.queryByLabelText(/Email Address/i)).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /Reset Password/i })).not.toBeInTheDocument();
      
      // Back to login button should still be available
      expect(screen.getByRole('button', { name: /Back to Login/i })).toBeInTheDocument();
    });
  });
});
