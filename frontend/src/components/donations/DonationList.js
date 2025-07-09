import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import { 
  Container, Typography, Paper, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, Button, Box,
  TextField, InputAdornment, IconButton, Chip, Pagination,
  FormControl, InputLabel, Select, MenuItem, Grid, Alert
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import { useAuth } from '../../context/AuthContext';

const DonationList = () => {
  const location = useLocation();
  const [donations, setDonations] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(location.state?.message || null);
  const [filters, setFilters] = useState({
    search: '',
    campaign_id: '',
    start_date: '',
    end_date: '',
    min_amount: '',
    max_amount: '',
    payment_method: ''
  });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { currentUser } = useAuth();
  
  useEffect(() => {
    // Clear success message after 5 seconds
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const fetchCampaigns = async () => {
    try {
      const response = await axios.get('/api/campaigns');
      setCampaigns(response.data);
    } catch (err) {
      console.error('Error fetching campaigns:', err);
    }
  };
  
  const fetchDonations = async (pageNum = 1) => {
    try {
      setLoading(true);
      const response = await axios.get('/api/donations', {
        params: { 
          page: pageNum, 
          limit: 10,
          search: filters.search,
          campaign_id: filters.campaign_id || undefined,
          start_date: filters.start_date || undefined,
          end_date: filters.end_date || undefined,
          min_amount: filters.min_amount || undefined,
          max_amount: filters.max_amount || undefined,
          payment_method: filters.payment_method || undefined
        }
      });
      setDonations(response.data.donations);
      setTotalPages(Math.ceil(response.data.total / 10));
      setError(null);
    } catch (err) {
      console.error('Error fetching donations:', err);
      setError('Failed to fetch donations. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
    fetchDonations(page);
  }, [page]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchDonations(1);
  };

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      campaign_id: '',
      start_date: '',
      end_date: '',
      min_amount: '',
      max_amount: '',
      payment_method: ''
    });
    setPage(1);
    fetchDonations(1);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-CA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1" gutterBottom>
          Donations
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          component={Link} 
          to="/donations/new"
          startIcon={<AddIcon />}
        >
          Add Donation
        </Button>
      </Box>

      {successMessage && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {successMessage}
        </Alert>
      )}

      <Paper sx={{ p: 2, mb: 3 }}>
        <Box component="form" onSubmit={handleSearch} sx={{ mb: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Search by donor name, receipt number..."
                name="search"
                value={filters.search}
                onChange={handleFilterChange}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton type="submit" edge="end">
                        <SearchIcon />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel>Campaign</InputLabel>
                <Select
                  name="campaign_id"
                  value={filters.campaign_id}
                  onChange={handleFilterChange}
                  label="Campaign"
                >
                  <MenuItem value="">All Campaigns</MenuItem>
                  {campaigns.map(campaign => (
                    <MenuItem key={campaign.id} value={campaign.id}>
                      {campaign.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel>Payment Method</InputLabel>
                <Select
                  name="payment_method"
                  value={filters.payment_method}
                  onChange={handleFilterChange}
                  label="Payment Method"
                >
                  <MenuItem value="">All Methods</MenuItem>
                  <MenuItem value="credit_card">Credit Card</MenuItem>
                  <MenuItem value="debit">Debit</MenuItem>
                  <MenuItem value="cash">Cash</MenuItem>
                  <MenuItem value="check">Check</MenuItem>
                  <MenuItem value="e_transfer">E-Transfer</MenuItem>
                  <MenuItem value="paypal">PayPal</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="Start Date"
                name="start_date"
                type="date"
                value={filters.start_date}
                onChange={handleFilterChange}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="End Date"
                name="end_date"
                type="date"
                value={filters.end_date}
                onChange={handleFilterChange}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="Min Amount ($)"
                name="min_amount"
                type="number"
                value={filters.min_amount}
                onChange={handleFilterChange}
                InputProps={{ inputProps: { min: 0, step: 0.01 } }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="Max Amount ($)"
                name="max_amount"
                type="number"
                value={filters.max_amount}
                onChange={handleFilterChange}
                InputProps={{ inputProps: { min: 0, step: 0.01 } }}
              />
            </Grid>
            
            <Grid item xs={12} sm={12} md={6}>
              <Box display="flex" gap={1}>
                <Button 
                  type="submit" 
                  variant="contained" 
                  color="primary"
                  fullWidth
                >
                  Apply Filters
                </Button>
                <Button 
                  type="button" 
                  variant="outlined"
                  onClick={clearFilters}
                  fullWidth
                >
                  Clear Filters
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Box>

        {error && (
          <Typography color="error" sx={{ mb: 2 }}>
            {error}
          </Typography>
        )}

        {loading ? (
          <Typography>Loading donations...</Typography>
        ) : donations.length === 0 ? (
          <Typography>No donations found. Add your first donation!</Typography>
        ) : (
          <>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Donor</TableCell>
                    <TableCell>Amount</TableCell>
                    <TableCell>Payment Method</TableCell>
                    <TableCell>Campaign</TableCell>
                    <TableCell>Receipt #</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {donations.map((donation) => (
                    <TableRow key={donation.id}>
                      <TableCell>{formatDate(donation.donation_date)}</TableCell>
                      <TableCell>
                        <Link to={`/donors/${donation.donor_id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                          <Box sx={{ fontWeight: 'medium' }}>
                            {donation.donor?.name || 'Unknown Donor'}
                          </Box>
                        </Link>
                      </TableCell>
                      <TableCell>${donation.amount.toFixed(2)}</TableCell>
                      <TableCell>
                        <Chip 
                          label={donation.payment_method} 
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        {donation.campaign ? (
                          <Link to={`/campaigns/${donation.campaign_id}`}>
                            {donation.campaign.name}
                          </Link>
                        ) : (
                          'General'
                        )}
                      </TableCell>
                      <TableCell>{donation.receipt_number || 'N/A'}</TableCell>
                      <TableCell>
                        <Button 
                          component={Link} 
                          to={`/donations/edit/${donation.id}`} 
                          size="small" 
                          color="secondary"
                        >
                          Edit
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            
            <Box display="flex" justifyContent="center" mt={3}>
              <Pagination 
                count={totalPages} 
                page={page} 
                onChange={handlePageChange} 
                color="primary" 
              />
            </Box>
          </>
        )}
      </Paper>
    </Container>
  );
};

export default DonationList;
