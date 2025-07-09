import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Alert,
  InputAdornment,
  CircularProgress,
  Divider
} from '@mui/material';
import {
  Email,
  ArrowBack
} from '@mui/icons-material';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  // Handle email change
  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!email) {
      setError('Please enter your email address');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      // Send password reset request to server
      await axios.post('/api/auth/forgot-password', { email });
      
      // Show success message
      setSuccess(true);
    } catch (err) {
      console.error('Password reset error:', err);
      
      // Handle different error responses
      if (err.response) {
        switch (err.response.status) {
          case 404:
            setError('No account found with this email address');
            break;
          default:
            setError('An error occurred. Please try again later.');
        }
      } else {
        setError('Unable to connect to the server. Please check your internet connection.');
      }
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Container component="main" maxWidth="sm">
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          py: 8
        }}
      >
        <Paper
          elevation={3}
          sx={{
            p: 4,
            width: '100%',
            borderRadius: 2
          }}
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              mb: 3
            }}
          >
            {/* Logo or Brand Image */}
            <Box
              component="img"
              src="/logo.png"
              alt="Canadian Cancer Society"
              sx={{
                height: 80,
                mb: 2
              }}
            />
            
            <Typography component="h1" variant="h5" fontWeight="bold">
              Reset Your Password
            </Typography>
            <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 1 }}>
              Enter your email address and we'll send you instructions to reset your password.
            </Typography>
          </Box>
          
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}
          
          {success ? (
            <Box sx={{ textAlign: 'center' }}>
              <Alert severity="success" sx={{ mb: 3 }}>
                Password reset instructions have been sent to your email address.
                Please check your inbox and follow the instructions to reset your password.
              </Alert>
              
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                If you don't receive an email within a few minutes, please check your spam folder.
              </Typography>
              
              <Button
                component={Link}
                to="/login"
                variant="contained"
                startIcon={<ArrowBack />}
              >
                Back to Login
              </Button>
            </Box>
          ) : (
            <Box component="form" onSubmit={handleSubmit} noValidate>
              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                autoComplete="email"
                autoFocus
                value={email}
                onChange={handleEmailChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Email color="primary" />
                    </InputAdornment>
                  )
                }}
              />
              
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2, py: 1.5 }}
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : 'Reset Password'}
              </Button>
              
              <Box sx={{ textAlign: 'center', mt: 2 }}>
                <Button
                  component={Link}
                  to="/login"
                  variant="text"
                  startIcon={<ArrowBack />}
                  size="small"
                >
                  Back to Login
                </Button>
              </Box>
              
              <Divider sx={{ my: 3 }}>
                <Typography variant="body2" color="text.secondary">
                  Need help?
                </Typography>
              </Divider>
              
              <Typography variant="body2" color="text.secondary" align="center">
                Contact your administrator or the IT department for assistance.
              </Typography>
            </Box>
          )}
        </Paper>
        
        <Typography variant="body2" color="text.secondary" sx={{ mt: 4 }}>
          © {new Date().getFullYear()} Canadian Cancer Society. All rights reserved.
        </Typography>
      </Box>
    </Container>
  );
};

export default ForgotPassword;
