import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
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
  IconButton,
  CircularProgress,
  Divider,
  LinearProgress
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Lock,
  ArrowBack,
  CheckCircle
} from '@mui/icons-material';

const ResetPassword = () => {
  const navigate = useNavigate();
  const { token } = useParams();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [tokenValid, setTokenValid] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });
  
  // Password strength
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    feedback: ''
  });
  
  // Verify token on component mount
  useEffect(() => {
    const verifyToken = async () => {
      try {
        setLoading(true);
        
        // Verify token with the server
        await axios.get(`/api/auth/reset-password/verify/${token}`);
        
        // Token is valid
        setTokenValid(true);
        setError('');
      } catch (err) {
        console.error('Token verification error:', err);
        
        // Token is invalid or expired
        setTokenValid(false);
        setError('This password reset link is invalid or has expired. Please request a new one.');
      } finally {
        setLoading(false);
      }
    };
    
    verifyToken();
  }, [token]);
  
  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Check password strength if password field is changed
    if (name === 'password') {
      checkPasswordStrength(value);
    }
  };
  
  // Check password strength
  const checkPasswordStrength = (password) => {
    // Simple password strength check
    let score = 0;
    let feedback = '';
    
    if (password.length >= 8) score += 1;
    if (password.match(/[A-Z]/)) score += 1;
    if (password.match(/[a-z]/)) score += 1;
    if (password.match(/[0-9]/)) score += 1;
    if (password.match(/[^A-Za-z0-9]/)) score += 1;
    
    switch (score) {
      case 0:
      case 1:
        feedback = 'Very weak';
        break;
      case 2:
        feedback = 'Weak';
        break;
      case 3:
        feedback = 'Medium';
        break;
      case 4:
        feedback = 'Strong';
        break;
      case 5:
        feedback = 'Very strong';
        break;
      default:
        feedback = '';
    }
    
    setPasswordStrength({ score, feedback });
  };
  
  // Get color for password strength indicator
  const getPasswordStrengthColor = () => {
    switch (passwordStrength.score) {
      case 0:
      case 1:
        return 'error.main';
      case 2:
        return 'warning.main';
      case 3:
        return 'info.main';
      case 4:
      case 5:
        return 'success.main';
      default:
        return 'grey.500';
    }
  };
  
  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  
  // Toggle confirm password visibility
  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.password || !formData.confirmPassword) {
      setError('Please enter both password fields');
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }
    
    if (passwordStrength.score < 3) {
      setError('Please choose a stronger password');
      return;
    }
    
    try {
      setSubmitting(true);
      setError('');
      
      // Send reset password request to server
      await axios.post(`/api/auth/reset-password/${token}`, {
        password: formData.password
      });
      
      // Show success message
      setSuccess(true);
      
      // Clear form data
      setFormData({
        password: '',
        confirmPassword: ''
      });
      
      // Redirect to login after 5 seconds
      setTimeout(() => {
        navigate('/login');
      }, 5000);
    } catch (err) {
      console.error('Password reset error:', err);
      
      // Handle different error responses
      if (err.response) {
        switch (err.response.status) {
          case 400:
            setError('Invalid password. Please choose a different password.');
            break;
          case 404:
            setError('This password reset link is invalid or has expired. Please request a new one.');
            break;
          default:
            setError('An error occurred. Please try again later.');
        }
      } else {
        setError('Unable to connect to the server. Please check your internet connection.');
      }
    } finally {
      setSubmitting(false);
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
            {!loading && tokenValid && !success && (
              <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 1 }}>
                Please enter your new password below.
              </Typography>
            )}
          </Box>
          
          {loading && (
            <Box sx={{ width: '100%', mb: 3 }}>
              <LinearProgress />
              <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 2 }}>
                Verifying your reset link...
              </Typography>
            </Box>
          )}
          
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}
          
          {!loading && tokenValid && success && (
            <Box sx={{ textAlign: 'center' }}>
              <Alert 
                severity="success" 
                sx={{ mb: 3 }}
                icon={<CheckCircle fontSize="inherit" />}
              >
                Your password has been successfully reset!
              </Alert>
              
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                You will be redirected to the login page in a few seconds.
              </Typography>
              
              <Button
                component={Link}
                to="/login"
                variant="contained"
              >
                Go to Login
              </Button>
            </Box>
          )}
          
          {!loading && tokenValid && !success && (
            <Box component="form" onSubmit={handleSubmit} noValidate>
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="New Password"
                type={showPassword ? 'text' : 'password'}
                id="password"
                autoComplete="new-password"
                value={formData.password}
                onChange={handleChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock color="primary" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={togglePasswordVisibility}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
              
              {formData.password && (
                <Box sx={{ mt: 1, mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="body2" color="text.secondary">
                      Password strength:
                    </Typography>
                    <Typography variant="body2" sx={{ color: getPasswordStrengthColor() }}>
                      {passwordStrength.feedback}
                    </Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={(passwordStrength.score / 5) * 100} 
                    sx={{ 
                      height: 6, 
                      borderRadius: 3,
                      bgcolor: 'grey.200',
                      '& .MuiLinearProgress-bar': {
                        bgcolor: getPasswordStrengthColor()
                      }
                    }}
                  />
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                    Use at least 8 characters with uppercase, lowercase, numbers, and symbols.
                  </Typography>
                </Box>
              )}
              
              <TextField
                margin="normal"
                required
                fullWidth
                name="confirmPassword"
                label="Confirm New Password"
                type={showConfirmPassword ? 'text' : 'password'}
                id="confirmPassword"
                autoComplete="new-password"
                value={formData.confirmPassword}
                onChange={handleChange}
                error={formData.password !== formData.confirmPassword && formData.confirmPassword !== ''}
                helperText={
                  formData.password !== formData.confirmPassword && formData.confirmPassword !== ''
                    ? 'Passwords do not match'
                    : ' '
                }
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock color="primary" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle confirm password visibility"
                        onClick={toggleConfirmPasswordVisibility}
                        edge="end"
                      >
                        {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
              
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2, py: 1.5 }}
                disabled={submitting}
              >
                {submitting ? <CircularProgress size={24} /> : 'Reset Password'}
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
            </Box>
          )}
          
          {!loading && !tokenValid && (
            <Box sx={{ textAlign: 'center', mt: 2 }}>
              <Button
                component={Link}
                to="/forgot-password"
                variant="contained"
                color="primary"
                sx={{ mt: 2 }}
              >
                Request New Reset Link
              </Button>
            </Box>
          )}
          
          <Divider sx={{ my: 3 }}>
            <Typography variant="body2" color="text.secondary">
              Need help?
            </Typography>
          </Divider>
          
          <Typography variant="body2" color="text.secondary" align="center">
            Contact your administrator or the IT department for assistance.
          </Typography>
        </Paper>
        
        <Typography variant="body2" color="text.secondary" sx={{ mt: 4 }}>
          © {new Date().getFullYear()} Canadian Cancer Society. All rights reserved.
        </Typography>
      </Box>
    </Container>
  );
};

export default ResetPassword;
