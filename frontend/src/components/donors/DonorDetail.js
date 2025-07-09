import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  Container, Typography, Paper, Grid, Box, Button, Divider,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Chip, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import BusinessIcon from '@mui/icons-material/Business';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { useAuth } from '../../context/AuthContext';

const DonorDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [donor, setDonor] = useState(null);
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  useEffect(() => {
    const fetchDonorData = async () => {
      try {
        setLoading(true);
        const [donorResponse, donationsResponse] = await Promise.all([
          axios.get(`/api/donors/${id}`),
          axios.get(`/api/donors/${id}/donations`)
        ]);
        
        setDonor(donorResponse.data);
        setDonations(donationsResponse.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching donor details:', err);
        setError('Failed to load donor information. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchDonorData();
  }, [id]);

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await axios.delete(`/api/donors/${id}`);
      setDeleteDialogOpen(false);
      navigate('/donors', { state: { message: 'Donor successfully deleted' } });
    } catch (err) {
      console.error('Error deleting donor:', err);
      setError(err.response?.data?.message || 'Failed to delete donor. They may have associated donations.');
      setDeleteDialogOpen(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
  };

  const getDonorTypeIcon = (type) => {
    switch (type) {
      case 'individual':
        return <PersonIcon />;
      case 'organization':
        return <BusinessIcon />;
      default:
        return null;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-CA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography>Loading donor information...</Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography color="error">{error}</Typography>
        <Button component={Link} to="/donors" variant="outlined" sx={{ mt: 2 }}>
          Back to Donors
        </Button>
      </Container>
    );
  }

  if (!donor) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography>Donor not found</Typography>
        <Button component={Link} to="/donors" variant="outlined" sx={{ mt: 2 }}>
          Back to Donors
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box display="flex" alignItems="center">
          <Typography variant="h4" component="h1" gutterBottom>
            {donor.name}
          </Typography>
          <Chip 
            icon={getDonorTypeIcon(donor.donor_type)} 
            label={donor.donor_type} 
            color={donor.donor_type === 'organization' ? 'secondary' : 'primary'}
            sx={{ ml: 2 }}
          />
        </Box>
        <Box>
          <Button 
            variant="outlined" 
            color="secondary" 
            component={Link} 
            to={`/donors/edit/${donor.id}`}
            startIcon={<EditIcon />}
            sx={{ mr: 1 }}
          >
            Edit
          </Button>
          {isAdmin() && (
            <Button 
              variant="outlined" 
              color="error" 
              startIcon={<DeleteIcon />}
              onClick={handleDeleteClick}
            >
              Delete
            </Button>
          )}
        </Box>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>Contact Information</Typography>
            <Divider sx={{ mb: 2 }} />
            <Grid container spacing={2}>
              <Grid item xs={4}>
                <Typography variant="subtitle2" color="text.secondary">Email</Typography>
              </Grid>
              <Grid item xs={8}>
                <Typography>{donor.email || 'Not provided'}</Typography>
              </Grid>
              
              <Grid item xs={4}>
                <Typography variant="subtitle2" color="text.secondary">Phone</Typography>
              </Grid>
              <Grid item xs={8}>
                <Typography>{donor.phone || 'Not provided'}</Typography>
              </Grid>
              
              <Grid item xs={4}>
                <Typography variant="subtitle2" color="text.secondary">Address</Typography>
              </Grid>
              <Grid item xs={8}>
                <Typography>
                  {donor.address ? (
                    <>
                      {donor.address}<br />
                      {donor.city && donor.province ? `${donor.city}, ${donor.province}` : donor.city || donor.province}<br />
                      {donor.postal_code && donor.country ? `${donor.postal_code}, ${donor.country}` : donor.postal_code || donor.country}
                    </>
                  ) : (
                    'Not provided'
                  )}
                </Typography>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>Donor Summary</Typography>
            <Divider sx={{ mb: 2 }} />
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="subtitle2" color="text.secondary">First Donation</Typography>
                <Typography>
                  {donations.length > 0 
                    ? formatDate(donations.reduce((earliest, donation) => 
                        new Date(donation.donation_date) < new Date(earliest.donation_date) 
                          ? donation 
                          : earliest
                      , donations[0]).donation_date)
                    : 'No donations yet'}
                </Typography>
              </Grid>
              
              <Grid item xs={6}>
                <Typography variant="subtitle2" color="text.secondary">Latest Donation</Typography>
                <Typography>
                  {donations.length > 0 
                    ? formatDate(donations.reduce((latest, donation) => 
                        new Date(donation.donation_date) > new Date(latest.donation_date) 
                          ? donation 
                          : latest
                      , donations[0]).donation_date)
                    : 'No donations yet'}
                </Typography>
              </Grid>
              
              <Grid item xs={6}>
                <Typography variant="subtitle2" color="text.secondary">Total Donations</Typography>
                <Typography variant="h5" color="primary">
                  ${donations.reduce((sum, donation) => sum + donation.amount, 0).toFixed(2)}
                </Typography>
              </Grid>
              
              <Grid item xs={6}>
                <Typography variant="subtitle2" color="text.secondary">Number of Donations</Typography>
                <Typography variant="h5">{donations.length}</Typography>
              </Grid>
            </Grid>

            {donor.notes && (
              <>
                <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 2 }}>Notes</Typography>
                <Typography>{donor.notes}</Typography>
              </>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">Donation History</Typography>
              <Button 
                variant="contained" 
                color="primary" 
                component={Link} 
                to={`/donations/new?donor_id=${donor.id}`}
                startIcon={<AddIcon />}
                size="small"
              >
                Add Donation
              </Button>
            </Box>
            <Divider sx={{ mb: 2 }} />
            
            {donations.length === 0 ? (
              <Typography>No donations recorded for this donor yet.</Typography>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Date</TableCell>
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
                        <TableCell>${donation.amount.toFixed(2)}</TableCell>
                        <TableCell>{donation.payment_method}</TableCell>
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
            )}
          </Paper>
        </Grid>
      </Grid>

      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
      >
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the donor "{donor.name}"? This action cannot be undone.
            {donations.length > 0 && (
              <strong> Note: This donor has {donations.length} donations associated with them. Deletion may not be possible without removing these donations first.</strong>
            )}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} color="primary">Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default DonorDetail;
