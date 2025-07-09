import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import {
  Container, Typography, Paper, Grid, Box, Button,
  TextField, MenuItem, FormControl, FormHelperText,
  Alert, CircularProgress
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const DonorForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    province: '',
    postal_code: '',
    country: 'Canada',
    donor_type: 'individual',
    notes: ''
  });
  
  const [loading, setLoading] = useState(isEditMode);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    if (isEditMode) {
      const fetchDonor = async () => {
        try {
          const response = await axios.get(`/api/donors/${id}`);
          setFormData(response.data);
          setError(null);
        } catch (err) {
          console.error('Error fetching donor:', err);
          setError('Failed to load donor information. Please try again later.');
        } finally {
          setLoading(false);
        }
      };

      fetchDonor();
    }
  }, [id, isEditMode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear validation error when field is edited
    if (validationErrors[name]) {
      setValidationErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const errors = {};
    
    if (!formData.name.trim()) {
      errors.name = 'Name is required';
    }
    
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Invalid email format';
    }
    
    if (formData.phone && !/^[\d\s\-+()]*$/.test(formData.phone)) {
      errors.phone = 'Invalid phone format';
    }
    
    if (formData.postal_code && !/^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/.test(formData.postal_code)) {
      errors.postal_code = 'Invalid Canadian postal code format (e.g., A1A 1A1)';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validate()) {
      return;
    }
    
    setSubmitting(true);
    setError(null);
    
    try {
      if (isEditMode) {
        await axios.put(`/api/donors/${id}`, formData);
        navigate(`/donors/${id}`, { state: { message: 'Donor updated successfully' } });
      } else {
        const response = await axios.post('/api/donors', formData);
        navigate(`/donors/${response.data.id}`, { state: { message: 'Donor created successfully' } });
      }
    } catch (err) {
      console.error('Error saving donor:', err);
      setError(err.response?.data?.message || 'Failed to save donor. Please try again.');
      
      // Handle validation errors from backend
      if (err.response?.data?.errors) {
        setValidationErrors(err.response.data.errors);
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, mb: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Box display="flex" alignItems="center" mb={3}>
        <Button
          component={Link}
          to={isEditMode ? `/donors/${id}` : '/donors'}
          startIcon={<ArrowBackIcon />}
          sx={{ mr: 2 }}
        >
          Back
        </Button>
        <Typography variant="h4" component="h1">
          {isEditMode ? 'Edit Donor' : 'Add New Donor'}
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Paper sx={{ p: 3 }}>
        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <FormControl fullWidth error={Boolean(validationErrors.name)}>
                <TextField
                  required
                  label="Name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  error={Boolean(validationErrors.name)}
                />
                {validationErrors.name && (
                  <FormHelperText>{validationErrors.name}</FormHelperText>
                )}
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <TextField
                  select
                  label="Donor Type"
                  name="donor_type"
                  value={formData.donor_type}
                  onChange={handleChange}
                >
                  <MenuItem value="individual">Individual</MenuItem>
                  <MenuItem value="organization">Organization</MenuItem>
                </TextField>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth error={Boolean(validationErrors.email)}>
                <TextField
                  label="Email"
                  name="email"
                  type="email"
                  value={formData.email || ''}
                  onChange={handleChange}
                  error={Boolean(validationErrors.email)}
                />
                {validationErrors.email && (
                  <FormHelperText>{validationErrors.email}</FormHelperText>
                )}
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth error={Boolean(validationErrors.phone)}>
                <TextField
                  label="Phone"
                  name="phone"
                  value={formData.phone || ''}
                  onChange={handleChange}
                  error={Boolean(validationErrors.phone)}
                />
                {validationErrors.phone && (
                  <FormHelperText>{validationErrors.phone}</FormHelperText>
                )}
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Address"
                name="address"
                value={formData.address || ''}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="City"
                name="city"
                value={formData.city || ''}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Province/State"
                name="province"
                value={formData.province || ''}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth error={Boolean(validationErrors.postal_code)}>
                <TextField
                  label="Postal Code"
                  name="postal_code"
                  value={formData.postal_code || ''}
                  onChange={handleChange}
                  error={Boolean(validationErrors.postal_code)}
                />
                {validationErrors.postal_code && (
                  <FormHelperText>{validationErrors.postal_code}</FormHelperText>
                )}
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Country"
                name="country"
                value={formData.country || 'Canada'}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Notes"
                name="notes"
                multiline
                rows={4}
                value={formData.notes || ''}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
              <Button
                component={Link}
                to={isEditMode ? `/donors/${id}` : '/donors'}
                variant="outlined"
                sx={{ mr: 1 }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                startIcon={<SaveIcon />}
                disabled={submitting}
              >
                {submitting ? 'Saving...' : 'Save Donor'}
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Container>
  );
};

export default DonorForm;
