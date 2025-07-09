import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import {
  Container, Typography, Paper, Grid, Box, Button,
  TextField, MenuItem, FormControl, FormHelperText,
  Alert, CircularProgress, InputAdornment, Autocomplete
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const DonationForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const donorIdFromQuery = queryParams.get('donor_id');
  
  const isEditMode = Boolean(id);
  
  const [formData, setFormData] = useState({
    donor_id: donorIdFromQuery || '',
    amount: '',
    donation_date: new Date().toISOString().split('T')[0],
    payment_method: 'credit_card',
    is_recurring: false,
    receipt_number: '',
    campaign_id: '',
    notes: ''
  });
  
  const [donors, setDonors] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [selectedDonor, setSelectedDonor] = useState(null);
  const [loading, setLoading] = useState(isEditMode);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    const fetchDonors = async () => {
      try {
        const response = await axios.get('/api/donors');
        setDonors(response.data.donors);
      } catch (err) {
        console.error('Error fetching donors:', err);
      }
    };

    const fetchCampaigns = async () => {
      try {
        const response = await axios.get('/api/campaigns');
        setCampaigns(response.data);
      } catch (err) {
        console.error('Error fetching campaigns:', err);
      }
    };

    fetchDonors();
    fetchCampaigns();

    if (isEditMode) {
      const fetchDonation = async () => {
        try {
          const response = await axios.get(`/api/donations/${id}`);
          setFormData({
            ...response.data,
            donation_date: new Date(response.data.donation_date).toISOString().split('T')[0]
          });
          
          if (response.data.donor) {
            setSelectedDonor(response.data.donor);
          }
          
          setError(null);
        } catch (err) {
          console.error('Error fetching donation:', err);
          setError('Failed to load donation information. Please try again later.');
        } finally {
          setLoading(false);
        }
      };

      fetchDonation();
    } else if (donorIdFromQuery) {
      // If we have a donor ID from query params, fetch that donor's details
      const fetchDonor = async () => {
        try {
          const response = await axios.get(`/api/donors/${donorIdFromQuery}`);
          setSelectedDonor(response.data);
        } catch (err) {
          console.error('Error fetching donor:', err);
        }
      };
      
      fetchDonor();
    }
  }, [id, isEditMode, donorIdFromQuery]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear validation error when field is edited
    if (validationErrors[name]) {
      setValidationErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleDonorChange = (event, newValue) => {
    setSelectedDonor(newValue);
    setFormData(prev => ({ ...prev, donor_id: newValue?.id || '' }));
    
    // Clear validation error
    if (validationErrors.donor_id) {
      setValidationErrors(prev => ({ ...prev, donor_id: null }));
    }
  };

  const validate = () => {
    const errors = {};
    
    if (!formData.donor_id) {
      errors.donor_id = 'Donor is required';
    }
    
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      errors.amount = 'Amount must be greater than 0';
    }
    
    if (!formData.donation_date) {
      errors.donation_date = 'Donation date is required';
    }
    
    if (!formData.payment_method) {
      errors.payment_method = 'Payment method is required';
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
        await axios.put(`/api/donations/${id}`, formData);
        navigate('/donations', { state: { message: 'Donation updated successfully' } });
      } else {
        await axios.post('/api/donations', formData);
        navigate('/donations', { state: { message: 'Donation created successfully' } });
      }
    } catch (err) {
      console.error('Error saving donation:', err);
      setError(err.response?.data?.message || 'Failed to save donation. Please try again.');
      
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
          to={isEditMode ? '/donations' : (donorIdFromQuery ? `/donors/${donorIdFromQuery}` : '/donations')}
          startIcon={<ArrowBackIcon />}
          sx={{ mr: 2 }}
        >
          Back
        </Button>
        <Typography variant="h4" component="h1">
          {isEditMode ? 'Edit Donation' : 'Add New Donation'}
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
              <FormControl fullWidth error={Boolean(validationErrors.donor_id)}>
                <Autocomplete
                  options={donors}
                  getOptionLabel={(option) => option.name}
                  value={selectedDonor}
                  onChange={handleDonorChange}
                  isOptionEqualToValue={(option, value) => option.id === value.id}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      required
                      label="Donor"
                      error={Boolean(validationErrors.donor_id)}
                      helperText={validationErrors.donor_id}
                    />
                  )}
                />
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth error={Boolean(validationErrors.amount)}>
                <TextField
                  required
                  label="Amount"
                  name="amount"
                  type="number"
                  value={formData.amount}
                  onChange={handleChange}
                  error={Boolean(validationErrors.amount)}
                  helperText={validationErrors.amount}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                    inputProps: { min: 0.01, step: 0.01 }
                  }}
                />
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth error={Boolean(validationErrors.donation_date)}>
                <TextField
                  required
                  label="Donation Date"
                  name="donation_date"
                  type="date"
                  value={formData.donation_date}
                  onChange={handleChange}
                  error={Boolean(validationErrors.donation_date)}
                  helperText={validationErrors.donation_date}
                  InputLabelProps={{ shrink: true }}
                />
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth error={Boolean(validationErrors.payment_method)}>
                <TextField
                  select
                  required
                  label="Payment Method"
                  name="payment_method"
                  value={formData.payment_method}
                  onChange={handleChange}
                  error={Boolean(validationErrors.payment_method)}
                  helperText={validationErrors.payment_method}
                >
                  <MenuItem value="credit_card">Credit Card</MenuItem>
                  <MenuItem value="debit">Debit</MenuItem>
                  <MenuItem value="cash">Cash</MenuItem>
                  <MenuItem value="check">Check</MenuItem>
                  <MenuItem value="e_transfer">E-Transfer</MenuItem>
                  <MenuItem value="paypal">PayPal</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                </TextField>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <TextField
                  select
                  label="Is Recurring?"
                  name="is_recurring"
                  value={formData.is_recurring ? "true" : "false"}
                  onChange={(e) => handleChange({
                    target: {
                      name: 'is_recurring',
                      value: e.target.value === "true"
                    }
                  })}
                >
                  <MenuItem value="false">No</MenuItem>
                  <MenuItem value="true">Yes</MenuItem>
                </TextField>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <TextField
                  label="Receipt Number"
                  name="receipt_number"
                  value={formData.receipt_number || ''}
                  onChange={handleChange}
                />
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <TextField
                  select
                  label="Campaign"
                  name="campaign_id"
                  value={formData.campaign_id || ''}
                  onChange={handleChange}
                >
                  <MenuItem value="">No Campaign</MenuItem>
                  {campaigns.map(campaign => (
                    <MenuItem key={campaign.id} value={campaign.id}>
                      {campaign.name}
                    </MenuItem>
                  ))}
                </TextField>
              </FormControl>
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
                to={isEditMode ? '/donations' : (donorIdFromQuery ? `/donors/${donorIdFromQuery}` : '/donations')}
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
                {submitting ? 'Saving...' : 'Save Donation'}
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Container>
  );
};

export default DonationForm;
