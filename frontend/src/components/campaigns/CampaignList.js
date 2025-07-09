import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import { 
  Container, Typography, Paper, Box, Button, Alert,
  Card, CardContent, CardActions, Grid, LinearProgress,
  Chip, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useAuth } from '../../context/AuthContext';

const CampaignList = () => {
  const location = useLocation();
  const { isAdmin } = useAuth();
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(location.state?.message || null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [campaignToDelete, setCampaignToDelete] = useState(null);
  
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
      setLoading(true);
      const response = await axios.get('/api/campaigns');
      setCampaigns(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching campaigns:', err);
      setError('Failed to fetch campaigns. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const handleDeleteClick = (campaign) => {
    setCampaignToDelete(campaign);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!campaignToDelete) return;
    
    try {
      await axios.delete(`/api/campaigns/${campaignToDelete.id}`);
      setDeleteDialogOpen(false);
      setCampaignToDelete(null);
      setSuccessMessage(`Campaign "${campaignToDelete.name}" successfully deleted`);
      fetchCampaigns();
    } catch (err) {
      console.error('Error deleting campaign:', err);
      setError(err.response?.data?.message || 'Failed to delete campaign. It may have associated donations.');
      setDeleteDialogOpen(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setCampaignToDelete(null);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-CA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const calculateProgress = (campaign) => {
    if (!campaign.goal_amount || campaign.goal_amount <= 0) return 0;
    const progress = (campaign.total_donations / campaign.goal_amount) * 100;
    return Math.min(progress, 100); // Cap at 100%
  };

  const getStatusChip = (campaign) => {
    const today = new Date();
    const startDate = new Date(campaign.start_date);
    const endDate = campaign.end_date ? new Date(campaign.end_date) : null;
    
    if (endDate && today > endDate) {
      return <Chip label="Completed" color="default" size="small" />;
    } else if (today < startDate) {
      return <Chip label="Upcoming" color="info" size="small" />;
    } else {
      return <Chip label="Active" color="success" size="small" />;
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1" gutterBottom>
          Campaigns
        </Typography>
        {isAdmin() && (
          <Button 
            variant="contained" 
            color="primary" 
            component={Link} 
            to="/campaigns/new"
            startIcon={<AddIcon />}
          >
            Create Campaign
          </Button>
        )}
      </Box>

      {successMessage && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {successMessage}
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Typography>Loading campaigns...</Typography>
      ) : campaigns.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>No campaigns found</Typography>
          {isAdmin() && (
            <Typography variant="body1">
              Create your first fundraising campaign to start tracking donations for specific initiatives.
            </Typography>
          )}
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {campaigns.map((campaign) => (
            <Grid item xs={12} md={6} lg={4} key={campaign.id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="h6" component="div" noWrap>
                      {campaign.name}
                    </Typography>
                    {getStatusChip(campaign)}
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2, height: '40px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {campaign.description || 'No description provided'}
                  </Typography>
                  
                  <Box sx={{ mb: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="body2">Progress:</Typography>
                      <Typography variant="body2" fontWeight="medium">
                        ${campaign.total_donations?.toFixed(2) || '0.00'} 
                        {campaign.goal_amount ? ` / $${campaign.goal_amount.toFixed(2)}` : ''}
                      </Typography>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={calculateProgress(campaign)} 
                      sx={{ height: 8, borderRadius: 1 }}
                    />
                  </Box>
                  
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      {campaign.start_date && `Start: ${formatDate(campaign.start_date)}`}
                      {campaign.end_date && ` • End: ${formatDate(campaign.end_date)}`}
                    </Typography>
                  </Box>
                </CardContent>
                <CardActions>
                  <Button 
                    component={Link} 
                    to={`/campaigns/${campaign.id}`} 
                    size="small" 
                    color="primary"
                  >
                    View Details
                  </Button>
                  {isAdmin() && (
                    <>
                      <Button 
                        component={Link} 
                        to={`/campaigns/edit/${campaign.id}`} 
                        size="small" 
                        color="secondary"
                        startIcon={<EditIcon />}
                      >
                        Edit
                      </Button>
                      <Button 
                        size="small" 
                        color="error"
                        startIcon={<DeleteIcon />}
                        onClick={() => handleDeleteClick(campaign)}
                      >
                        Delete
                      </Button>
                    </>
                  )}
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
      >
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the campaign "{campaignToDelete?.name}"? This action cannot be undone.
            {campaignToDelete?.total_donations > 0 && (
              <strong> Note: This campaign has donations associated with it. Deletion may not be possible.</strong>
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

export default CampaignList;
