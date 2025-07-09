import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Box,
  Typography,
  LinearProgress
} from '@mui/material';
import { AccessTime, ExitToApp, Refresh } from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';

/**
 * Session timeout warning dialog
 * Shows when user session is about to expire
 * Allows user to extend session or logout
 */
const SessionTimeoutDialog = () => {
  const { sessionTimeoutWarning, extendSession, logout } = useAuth();
  
  // Calculate remaining time (5 minutes)
  const totalSeconds = 5 * 60;
  const [remainingSeconds, setRemainingSeconds] = React.useState(totalSeconds);
  
  // Format time as MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Countdown timer
  React.useEffect(() => {
    let interval = null;
    
    if (sessionTimeoutWarning && remainingSeconds > 0) {
      interval = setInterval(() => {
        setRemainingSeconds((prevSeconds) => prevSeconds - 1);
      }, 1000);
    } else if (!sessionTimeoutWarning) {
      setRemainingSeconds(totalSeconds);
      clearInterval(interval);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [sessionTimeoutWarning, remainingSeconds]);
  
  // Handle extend session
  const handleExtendSession = () => {
    extendSession();
  };
  
  // Handle logout
  const handleLogout = () => {
    logout();
  };
  
  return (
    <Dialog
      open={sessionTimeoutWarning}
      aria-labelledby="session-timeout-dialog-title"
      aria-describedby="session-timeout-dialog-description"
    >
      <DialogTitle id="session-timeout-dialog-title" sx={{ pb: 1 }}>
        <Box display="flex" alignItems="center">
          <AccessTime color="warning" sx={{ mr: 1 }} />
          <Typography variant="h6" component="div">
            Session Timeout Warning
          </Typography>
        </Box>
      </DialogTitle>
      
      <DialogContent>
        <DialogContentText id="session-timeout-dialog-description" sx={{ mb: 2 }}>
          Your session is about to expire due to inactivity. You will be automatically logged out in:
        </DialogContentText>
        
        <Box sx={{ textAlign: 'center', mb: 2 }}>
          <Typography variant="h4" color="warning.main" fontWeight="bold">
            {formatTime(remainingSeconds)}
          </Typography>
          
          <LinearProgress
            variant="determinate"
            value={(remainingSeconds / totalSeconds) * 100}
            sx={{
              mt: 1,
              height: 8,
              borderRadius: 4,
              bgcolor: 'grey.200',
              '& .MuiLinearProgress-bar': {
                bgcolor: 'warning.main'
              }
            }}
          />
        </Box>
        
        <DialogContentText>
          Would you like to continue your session or log out?
        </DialogContentText>
      </DialogContent>
      
      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button
          onClick={handleLogout}
          color="error"
          variant="outlined"
          startIcon={<ExitToApp />}
        >
          Log Out
        </Button>
        <Button
          onClick={handleExtendSession}
          color="primary"
          variant="contained"
          autoFocus
          startIcon={<Refresh />}
        >
          Continue Session
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SessionTimeoutDialog;
