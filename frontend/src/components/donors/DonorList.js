import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { 
  Container, Typography, Paper, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, Button, Box,
  TextField, InputAdornment, IconButton, Chip, Pagination
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import PersonIcon from '@mui/icons-material/Person';
import BusinessIcon from '@mui/icons-material/Business';
import { useAuth } from '../../context/AuthContext';

const DonorList = () => {
  const [donors, setDonors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { currentUser } = useAuth();
  
  const fetchDonors = async (pageNum = 1, search = '') => {
    try {
      setLoading(true);
      const response = await axios.get('/api/donors', {
        params: { page: pageNum, search, limit: 10 }
      });
      setDonors(response.data.donors);
      setTotalPages(Math.ceil(response.data.total / 10));
      setError(null);
    } catch (err) {
      console.error('Error fetching donors:', err);
      setError('Failed to fetch donors. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDonors(page, searchTerm);
  }, [page]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchDonors(1, searchTerm);
  };

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const getDonorTypeIcon = (type) => {
    switch (type) {
      case 'individual':
        return <PersonIcon fontSize="small" />;
      case 'organization':
        return <BusinessIcon fontSize="small" />;
      default:
        return null;
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1" gutterBottom>
          Donors
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          component={Link} 
          to="/donors/new"
          startIcon={<AddIcon />}
        >
          Add Donor
        </Button>
      </Box>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Box component="form" onSubmit={handleSearch} sx={{ mb: 3 }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search donors by name, email, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
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
        </Box>

        {error && (
          <Typography color="error" sx={{ mb: 2 }}>
            {error}
          </Typography>
        )}

        {loading ? (
          <Typography>Loading donors...</Typography>
        ) : donors.length === 0 ? (
          <Typography>No donors found. Add your first donor!</Typography>
        ) : (
          <>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Phone</TableCell>
                    <TableCell>Total Donations</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {donors.map((donor) => (
                    <TableRow key={donor.id}>
                      <TableCell>
                        <Link to={`/donors/${donor.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                          <Box sx={{ fontWeight: 'medium', display: 'flex', alignItems: 'center' }}>
                            {donor.name}
                          </Box>
                        </Link>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          icon={getDonorTypeIcon(donor.donor_type)} 
                          label={donor.donor_type} 
                          size="small"
                          color={donor.donor_type === 'organization' ? 'secondary' : 'primary'}
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>{donor.email}</TableCell>
                      <TableCell>{donor.phone}</TableCell>
                      <TableCell>
                        {donor.total_donations ? `$${donor.total_donations.toFixed(2)}` : '$0.00'}
                      </TableCell>
                      <TableCell>
                        <Button 
                          component={Link} 
                          to={`/donors/${donor.id}`} 
                          size="small" 
                          color="primary"
                        >
                          View
                        </Button>
                        <Button 
                          component={Link} 
                          to={`/donors/edit/${donor.id}`} 
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

export default DonorList;
