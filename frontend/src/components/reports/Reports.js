import React, { useState, useEffect } from 'react';
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
  TextField,
  Button,
  CircularProgress,
  Alert,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Stack,
  Tabs,
  Tab,
  Divider
} from '@mui/material';
// Date picker imports removed to fix build issues
import { 
  FileDownload,
  Print,
  BarChart,
  PieChart,
  ShowChart,
  CalendarMonth
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title } from 'chart.js';
import { Bar, Line, Pie } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  ArcElement, 
  Tooltip, 
  Legend, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  BarElement,
  Title
);

// Tab Panel Component
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`report-tabpanel-${index}`}
      aria-labelledby={`report-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const Reports = () => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [reportType, setReportType] = useState('monthly');
  const [startDate, setStartDate] = useState(new Date(new Date().getFullYear(), new Date().getMonth() - 6, 1));
  const [endDate, setEndDate] = useState(new Date());
  const [campaignId, setCampaignId] = useState('all');
  const [donorType, setDonorType] = useState('all');
  const [reportData, setReportData] = useState(null);
  const [campaigns, setCampaigns] = useState([]);
  
  // Pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Fetch campaigns for filter
  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const response = await axios.get('/api/campaigns');
        setCampaigns(response.data);
      } catch (err) {
        console.error('Error fetching campaigns:', err);
      }
    };

    fetchCampaigns();
  }, []);

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Handle report type change
  const handleReportTypeChange = (event) => {
    setReportType(event.target.value);
  };

  // Handle campaign change
  const handleCampaignChange = (event) => {
    setCampaignId(event.target.value);
  };

  // Handle donor type change
  const handleDonorTypeChange = (event) => {
    setDonorType(event.target.value);
  };

  // Handle pagination change
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Format currency
  const formatCurrency = (amount) => {
    return amount.toLocaleString('en-US', { 
      style: 'currency', 
      currency: 'CAD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-CA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Generate report
  const generateReport = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get('/api/reports/generate', {
        params: {
          reportType,
          startDate: startDate.toISOString().split('T')[0],
          endDate: endDate.toISOString().split('T')[0],
          campaignId: campaignId === 'all' ? null : campaignId,
          donorType: donorType === 'all' ? null : donorType
        }
      });
      
      setReportData(response.data);
    } catch (err) {
      console.error('Error generating report:', err);
      setError('Failed to generate report. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Export report as CSV
  const exportReport = async () => {
    try {
      const response = await axios.get('/api/reports/export', {
        params: {
          reportType,
          startDate: startDate.toISOString().split('T')[0],
          endDate: endDate.toISOString().split('T')[0],
          campaignId: campaignId === 'all' ? null : campaignId,
          donorType: donorType === 'all' ? null : donorType
        },
        responseType: 'blob'
      });
      
      // Create a download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${reportType}-report-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Error exporting report:', err);
      setError('Failed to export report. Please try again later.');
    }
  };

  // Prepare chart data for donation trends
  const donationTrendsChartData = {
    labels: reportData?.donationTrends?.map(item => item.period) || [],
    datasets: [
      {
        label: 'Donation Amount',
        data: reportData?.donationTrends?.map(item => item.amount) || [],
        backgroundColor: '#d81b60',
        borderColor: '#d81b60',
        borderWidth: 1
      }
    ]
  };

  // Prepare chart data for donor distribution
  const donorDistributionChartData = {
    labels: reportData?.donorDistribution?.map(item => item.type) || [],
    datasets: [
      {
        data: reportData?.donorDistribution?.map(item => item.count) || [],
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

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Reports & Analytics
      </Typography>
      
      <Paper sx={{ mb: 3 }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange} 
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
        >
          <Tab icon={<BarChart />} label="Donation Reports" />
          <Tab icon={<PieChart />} label="Donor Analytics" />
          <Tab icon={<ShowChart />} label="Campaign Performance" />
        </Tabs>
      </Paper>
      
      {/* Report Filters */}
      <Card sx={{ mb: 3 }}>
        <CardHeader title="Report Filters" />
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel id="report-type-label">Report Type</InputLabel>
                <Select
                  labelId="report-type-label"
                  id="report-type-select"
                  value={reportType}
                  label="Report Type"
                  onChange={handleReportTypeChange}
                >
                  <MenuItem value="daily">Daily</MenuItem>
                  <MenuItem value="weekly">Weekly</MenuItem>
                  <MenuItem value="monthly">Monthly</MenuItem>
                  <MenuItem value="quarterly">Quarterly</MenuItem>
                  <MenuItem value="yearly">Yearly</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={3}>
              <TextField
                label="Start Date"
                type="date"
                value={startDate ? startDate.toISOString().split('T')[0] : ''}
                onChange={(e) => setStartDate(new Date(e.target.value))}
                InputLabelProps={{ shrink: true }}
                fullWidth
              />
            </Grid>
            
            <Grid item xs={12} md={3}>
              <TextField
                label="End Date"
                type="date"
                value={endDate ? endDate.toISOString().split('T')[0] : ''}
                onChange={(e) => setEndDate(new Date(e.target.value))}
                InputLabelProps={{ shrink: true }}
                fullWidth
              />
            </Grid>
            
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel id="campaign-label">Campaign</InputLabel>
                <Select
                  labelId="campaign-label"
                  id="campaign-select"
                  value={campaignId}
                  label="Campaign"
                  onChange={handleCampaignChange}
                >
                  <MenuItem value="all">All Campaigns</MenuItem>
                  {campaigns.map((campaign) => (
                    <MenuItem key={campaign.id} value={campaign.id}>
                      {campaign.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel id="donor-type-label">Donor Type</InputLabel>
                <Select
                  labelId="donor-type-label"
                  id="donor-type-select"
                  value={donorType}
                  label="Donor Type"
                  onChange={handleDonorTypeChange}
                >
                  <MenuItem value="all">All Donors</MenuItem>
                  <MenuItem value="individual">Individual</MenuItem>
                  <MenuItem value="corporate">Corporate</MenuItem>
                  <MenuItem value="foundation">Foundation</MenuItem>
                  <MenuItem value="government">Government</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={9}>
              <Stack direction="row" spacing={2}>
                <Button 
                  variant="contained" 
                  color="primary" 
                  onClick={generateReport}
                  disabled={loading}
                >
                  Generate Report
                </Button>
                
                <Button 
                  variant="outlined" 
                  color="primary" 
                  startIcon={<FileDownload />}
                  onClick={exportReport}
                  disabled={loading || !reportData}
                >
                  Export CSV
                </Button>
                
                <Button 
                  variant="outlined" 
                  color="primary" 
                  startIcon={<Print />}
                  disabled={loading || !reportData}
                  onClick={() => window.print()}
                >
                  Print
                </Button>
              </Stack>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
      
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      )}
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {/* Report Content Tabs */}
      {reportData && !loading && (
        <>
          <TabPanel value={tabValue} index={0}>
            <Typography variant="h5" gutterBottom>
              Donation Report: {formatDate(startDate)} - {formatDate(endDate)}
            </Typography>
            
            <Grid container spacing={3} sx={{ mb: 3 }}>
              <Grid item xs={12} md={4}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                      Total Donations
                    </Typography>
                    <Typography variant="h4" component="div">
                      {reportData.summary.totalDonations}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                      Total Amount
                    </Typography>
                    <Typography variant="h4" component="div" color="primary">
                      {formatCurrency(reportData.summary.totalAmount)}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                      Average Donation
                    </Typography>
                    <Typography variant="h4" component="div" color="secondary">
                      {formatCurrency(reportData.summary.averageDonation)}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
            
            <Card sx={{ mb: 3 }}>
              <CardHeader title="Donation Trends" />
              <CardContent sx={{ height: 400 }}>
                <Bar 
                  data={donationTrendsChartData} 
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
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader 
                title="Donation Details" 
                subheader={`Showing ${Math.min(reportData.donations.length, rowsPerPage)} of ${reportData.donations.length} donations`}
              />
              <CardContent>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Date</TableCell>
                        <TableCell>Donor</TableCell>
                        <TableCell>Campaign</TableCell>
                        <TableCell>Payment Method</TableCell>
                        <TableCell align="right">Amount</TableCell>
                        <TableCell>Receipt #</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {reportData.donations
                        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                        .map((donation) => (
                          <TableRow key={donation.id}>
                            <TableCell>{formatDate(donation.date)}</TableCell>
                            <TableCell>{donation.donor_name}</TableCell>
                            <TableCell>{donation.campaign_name || 'N/A'}</TableCell>
                            <TableCell>{donation.payment_method}</TableCell>
                            <TableCell align="right">{formatCurrency(donation.amount)}</TableCell>
                            <TableCell>{donation.receipt_number || 'N/A'}</TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </TableContainer>
                <TablePagination
                  rowsPerPageOptions={[5, 10, 25]}
                  component="div"
                  count={reportData.donations.length}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  onPageChange={handleChangePage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                />
              </CardContent>
            </Card>
          </TabPanel>
          
          <TabPanel value={tabValue} index={1}>
            <Typography variant="h5" gutterBottom>
              Donor Analytics: {formatDate(startDate)} - {formatDate(endDate)}
            </Typography>
            
            <Grid container spacing={3} sx={{ mb: 3 }}>
              <Grid item xs={12} md={4}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                      Total Donors
                    </Typography>
                    <Typography variant="h4" component="div">
                      {reportData.donorSummary?.totalDonors || 0}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                      New Donors
                    </Typography>
                    <Typography variant="h4" component="div" color="primary">
                      {reportData.donorSummary?.newDonors || 0}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                      Recurring Donors
                    </Typography>
                    <Typography variant="h4" component="div" color="secondary">
                      {reportData.donorSummary?.recurringDonors || 0}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card sx={{ mb: 3 }}>
                  <CardHeader title="Donor Distribution" />
                  <CardContent sx={{ height: 300 }}>
                    <Pie 
                      data={donorDistributionChartData} 
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
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Card sx={{ mb: 3 }}>
                  <CardHeader title="Top Donors" />
                  <CardContent>
                    <TableContainer>
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell>Donor</TableCell>
                            <TableCell>Type</TableCell>
                            <TableCell align="right">Donations</TableCell>
                            <TableCell align="right">Total Amount</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {(reportData.topDonors || []).map((donor) => (
                            <TableRow key={donor.id}>
                              <TableCell>{donor.name}</TableCell>
                              <TableCell>{donor.type}</TableCell>
                              <TableCell align="right">{donor.donation_count}</TableCell>
                              <TableCell align="right">{formatCurrency(donor.total_amount)}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </TabPanel>
          
          <TabPanel value={tabValue} index={2}>
            <Typography variant="h5" gutterBottom>
              Campaign Performance: {formatDate(startDate)} - {formatDate(endDate)}
            </Typography>
            
            <Card sx={{ mb: 3 }}>
              <CardHeader title="Campaign Summary" />
              <CardContent>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Campaign</TableCell>
                        <TableCell>Start Date</TableCell>
                        <TableCell>End Date</TableCell>
                        <TableCell align="right">Goal</TableCell>
                        <TableCell align="right">Raised</TableCell>
                        <TableCell align="right">% of Goal</TableCell>
                        <TableCell align="right">Donors</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {(reportData.campaignPerformance || []).map((campaign) => (
                        <TableRow key={campaign.id}>
                          <TableCell>{campaign.name}</TableCell>
                          <TableCell>{formatDate(campaign.start_date)}</TableCell>
                          <TableCell>{formatDate(campaign.end_date)}</TableCell>
                          <TableCell align="right">{formatCurrency(campaign.goal_amount)}</TableCell>
                          <TableCell align="right">{formatCurrency(campaign.raised_amount)}</TableCell>
                          <TableCell align="right">
                            {Math.round((campaign.raised_amount / campaign.goal_amount) * 100)}%
                          </TableCell>
                          <TableCell align="right">{campaign.donor_count}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
            
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Card>
                  <CardHeader title="Campaign Comparison" />
                  <CardContent sx={{ height: 400 }}>
                    <Bar 
                      data={{
                        labels: (reportData.campaignPerformance || []).map(c => c.name),
                        datasets: [
                          {
                            label: 'Goal',
                            data: (reportData.campaignPerformance || []).map(c => c.goal_amount),
                            backgroundColor: 'rgba(30, 136, 229, 0.6)',
                            borderColor: '#1e88e5',
                            borderWidth: 1
                          },
                          {
                            label: 'Raised',
                            data: (reportData.campaignPerformance || []).map(c => c.raised_amount),
                            backgroundColor: 'rgba(216, 27, 96, 0.6)',
                            borderColor: '#d81b60',
                            borderWidth: 1
                          }
                        ]
                      }}
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
                          }
                        }
                      }}
                    />
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </TabPanel>
        </>
      )}
    </Box>
  );
};

export default Reports;
