import React from 'react';
import { Box, Typography, Link } from '@mui/material';

const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        py: 2,
        px: 2,
        mt: 'auto',
        backgroundColor: (theme) => theme.palette.grey[100],
        borderTop: '1px solid',
        borderColor: 'divider',
        textAlign: 'center',
      }}
    >
      <Typography variant="body2" color="text.secondary">
        {'© '}
        {new Date().getFullYear()}
        {' Canadian Tire Sentiment Tracker | '}
        <Link color="inherit" href="https://www.canadiantire.ca/" target="_blank" rel="noopener">
          Canadian Tire Corporation
        </Link>
      </Typography>
    </Box>
  );
};

export default Footer;
