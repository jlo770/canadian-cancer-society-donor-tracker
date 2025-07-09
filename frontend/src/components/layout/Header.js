import React from 'react';
import { AppBar, Toolbar, Typography, IconButton, Box, Button } from '@mui/material';
import { Notifications, Settings } from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { useSentiment } from '../../context/SentimentContext';

const Header = () => {
  const { overallSentiment, getSentimentLabel, getSentimentColor } = useSentiment();
  
  return (
    <AppBar position="static" color="primary">
      <Toolbar>
        <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
          <Typography
            variant="h6"
            component={Link}
            to="/"
            sx={{
              textDecoration: 'none',
              color: 'white',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            Canadian Tire Sentiment Tracker
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
          <Typography variant="body2" sx={{ mr: 1 }}>
            Overall Sentiment:
          </Typography>
          <Button
            variant="contained"
            size="small"
            sx={{
              backgroundColor: getSentimentColor(overallSentiment),
              '&:hover': {
                backgroundColor: getSentimentColor(overallSentiment),
                opacity: 0.9,
              },
            }}
          >
            {getSentimentLabel(overallSentiment)}
          </Button>
        </Box>
        
        <IconButton color="inherit" component={Link} to="/notifications">
          <Notifications />
        </IconButton>
        
        <IconButton color="inherit" component={Link} to="/settings">
          <Settings />
        </IconButton>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
