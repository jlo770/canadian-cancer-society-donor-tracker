import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { 
  Box, 
  Grid, 
  Typography, 
  Card, 
  CardContent, 
  CardHeader,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Button,
  List,
  ListItem,
  ListItemText,
  Divider,
  LinearProgress
} from '@mui/material';
import { 
  TrendingUp, 
  TrendingDown, 
  TrendingFlat,
  PeopleAlt,
  Paid,
  Campaign,
  CalendarMonth
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Title } from 'chart.js';
import { Pie, Line } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Title);


const Dashboard = () => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState(30); // Default to 30 days
  const [dashboardData, setDashboardData] = useState({
    totalDonations: 0,
    totalDonors: 0,
    totalAmount: 0,
    activeCampaigns: 0,
    recentDonations: [],
    donationsByMonth: [],
    donationsByType: [],
    topDonors: []
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/reports/dashboard', {
          params: { days: timeRange }
        });
        setDashboardData(response.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [timeRange]);

  // Calculate donation trend
  const donationTrend = React.useMemo(() => {
    if (!dashboardData.donationsByMonth || dashboardData.donationsByMonth.length < 2) return 0;
    
    const firstMonth = dashboardData.donationsByMonth[0];
    const lastMonth = dashboardData.donationsByMonth[dashboardData.donationsByMonth.length - 1];
    
    return lastMonth.amount - firstMonth.amount;
  }, [dashboardData.donationsByMonth]);

  // Get trend icon
  const getTrendIcon = (trend) => {
    if (trend > 0) return <TrendingUp sx={{ color: '#4caf50' }} />;
    if (trend < 0) return <TrendingDown sx={{ color: '#f44336' }} />;
    return <TrendingFlat sx={{ color: '#ff9800' }} />;
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-CA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Handle time range change
  const handleTimeRangeChange = (event) => {
    setTimeRange(event.target.value);
  };

  // Prepare chart data
  const donationChartData = {
    labels: dashboardData.donationsByMonth?.map(item => item.month) || [],
    datasets: [
      {
        label: 'Donation Amount ($)',
        data: dashboardData.donationsByMonth?.map(item => item.amount) || [],
        borderColor: '#d81b60',
        backgroundColor: 'rgba(216, 27, 96, 0.2)',
        fill: true,
        tension: 0.4
      }
    ]
  };

  const donationTypeChartData = {
    labels: dashboardData.donationsByType?.map(item => item.type) || [],
    datasets: [
      {
        data: dashboardData.donationsByType?.map(item => item.amount) || [],
        backgroundColor: [
          '#d81b60',
          '#1e88e5',
          '#43a047',
          '#fb8c00',
          '#8e24aa'
        ],
        borderWidth: 1
      }
    ]
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Canadian Cancer Society Donor Dashboard
        </Typography>
        
        <FormControl sx={{ minWidth: 120 }} size="small">
          <InputLabel id="time-range-label">Time Range</InputLabel>
          <Select
            labelId="time-range-label"
            id="time-range-select"
            value={timeRange}
            label="Time Range"
            onChange={handleTimeRangeChange}
          >
            <MenuItem value={7}>Last 7 days</MenuItem>
            <MenuItem value={30}>Last 30 days</MenuItem>
            <MenuItem value={90}>Last 3 months</MenuItem>
            <MenuItem value={180}>Last 6 months</MenuItem>
            <MenuItem value={365}>Last year</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Total Donations
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography variant="h4" component="div" sx={{ mr: 1 }}>
                  ${dashboardData.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </Typography>
                {getTrendIcon(donationTrend)}
              </Box>
              <Typography variant="body2" color="text.secondary">
                From {dashboardData.totalDonations} donations
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1 }}>
                <PeopleAlt sx={{ color: 'primary.main', mr: 1 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  Total Donors
                </Typography>
              </Box>
              <Typography variant="h4" component="div">
                {dashboardData.totalDonors}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                In the last {timeRange} days
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1 }}>
                <Paid sx={{ color: 'success.main', mr: 1 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  Average Donation
                </Typography>
              </Box>
              <Typography variant="h4" component="div" sx={{ color: 'success.main' }}>
                ${dashboardData.totalDonations > 0 
                  ? (dashboardData.totalAmount / dashboardData.totalDonations).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                  : '0.00'
                }
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Per donation
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1 }}>
                <Campaign sx={{ color: 'secondary.main', mr: 1 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  Active Campaigns
                </Typography>
              </Box>
              <Typography variant="h4" component="div" sx={{ color: 'secondary.main' }}>
                {dashboardData.activeCampaigns}
              </Typography>
              <Button 
                component={Link} 
                to="/campaigns" 
                size="small" 
                sx={{ mt: 1 }}
              >
                View All Campaigns
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts and Lists */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card sx={{ mb: 3 }}>
            <CardHeader title="Donation Trends" />
            <CardContent sx={{ height: 300 }}>
              {dashboardData.donationsByMonth?.length > 0 ? (
                <Line 
                  data={donationChartData} 
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                      y: {
                        beginAtZero: true,
                        title: {
                          display: true,
                          text: 'Amount ($)'
                        }
                      },
                      x: {
                        title: {
                          display: true,
                          text: 'Month'
                        }
                      }
                    },
                    plugins: {
                      title: {
                        display: false
                      },
                      legend: {
                        display: false
                      }
                    }
                  }}
                />
              ) : (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                  <Typography color="text.secondary">No donation data available</Typography>
                </Box>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader title="Recent Donations" />
            <CardContent>
              {dashboardData.recentDonations?.length > 0 ? (
                <List>
                  {dashboardData.recentDonations.map((donation, index) => (
                    <React.Fragment key={donation.id}>
                      <ListItem>
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                              <Link to={`/donors/${donation.donor_id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                                <Typography fontWeight="medium">{donation.donor_name}</Typography>
                              </Link>
                              <Typography fontWeight="medium" color="primary">
                                ${donation.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </Typography>
                            </Box>
                          }
                          secondary={
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <CalendarMonth fontSize="small" sx={{ mr: 0.5, fontSize: '0.875rem', color: 'text.secondary' }} />
                                <Typography variant="body2" color="text.secondary">
                                  {formatDate(donation.donation_date)}
                                </Typography>
                              </Box>
                              {donation.campaign_name && (
                                <Typography variant="body2" color="text.secondary">
                                  Campaign: {donation.campaign_name}
                                </Typography>
                              )}
                            </Box>
                          }
                        />
                      </ListItem>
                      {index < dashboardData.recentDonations.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              ) : (
                <Typography color="text.secondary">No recent donations</Typography>
              )}
              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
                <Button 
                  component={Link} 
                  to="/donations" 
                  variant="outlined" 
                  color="primary"
                >
                  View All Donations
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card sx={{ mb: 3 }}>
            <CardHeader title="Donation Distribution" />
            <CardContent sx={{ height: 300, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              {dashboardData.donationsByType?.length > 0 ? (
                <Pie 
                  data={donationTypeChartData} 
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'bottom'
                      }
                    }
                  }}
                />
              ) : (
                <Typography color="text.secondary">No donation type data available</Typography>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader title="Top Donors" />
            <CardContent>
              {dashboardData.topDonors?.length > 0 ? (
                <List>
                  {dashboardData.topDonors.map((donor, index) => (
                    <React.Fragment key={donor.id}>
                      <ListItem>
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                              <Link to={`/donors/${donor.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                                <Typography fontWeight="medium">{donor.name}</Typography>
                              </Link>
                              <Typography fontWeight="medium" color="primary">
                                ${donor.total_amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </Typography>
                            </Box>
                          }
                          secondary={
                            <Typography variant="body2" color="text.secondary">
                              {donor.donation_count} donation{donor.donation_count !== 1 ? 's' : ''}
                            </Typography>
                          }
                        />
                      </ListItem>
                      {index < dashboardData.topDonors.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              ) : (
                <Typography color="text.secondary">No donor data available</Typography>
              )}
              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
                <Button 
                  component={Link} 
                  to="/donors" 
                  variant="outlined" 
                  color="primary"
                >
                  View All Donors
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
