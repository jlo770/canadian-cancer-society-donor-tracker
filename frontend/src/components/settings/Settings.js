import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Box, 
  Grid, 
  Typography, 
  Card, 
  CardContent, 
  CardHeader,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Divider,
  Switch,
  FormControlLabel,
  Tabs,
  Tab,
  IconButton,
  InputAdornment,
  MenuItem,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle
} from '@mui/material';
import {
  Save,
  Visibility,
  VisibilityOff,
  Delete,
  Edit,
  Person,
  Security,
  Notifications,
  ColorLens
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';

// Tab Panel Component
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`settings-tabpanel-${index}`}
      aria-labelledby={`settings-tab-${index}`}
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

const Settings = () => {
  const { currentUser, updateUserProfile, logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  
  // Profile state
  const [profile, setProfile] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    jobTitle: '',
    department: ''
  });
  
  // Password state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  
  // Notification settings
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    donationAlerts: true,
    campaignUpdates: true,
    monthlyReports: true
  });
  
  // Theme settings
  const [themeSettings, setThemeSettings] = useState({
    darkMode: false,
    highContrast: false,
    fontSize: 'medium'
  });
  
  // API keys
  const [apiKeys, setApiKeys] = useState([]);
  const [newApiKeyName, setNewApiKeyName] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedApiKey, setSelectedApiKey] = useState(null);

  // Load user data
  useEffect(() => {
    if (currentUser) {
      // Load profile data
      setProfile({
        firstName: currentUser.firstName || '',
        lastName: currentUser.lastName || '',
        email: currentUser.email || '',
        phone: currentUser.phone || '',
        jobTitle: currentUser.jobTitle || '',
        department: currentUser.department || ''
      });
      
      // Load notification settings
      const fetchSettings = async () => {
        try {
          const response = await axios.get('/api/users/settings');
          setNotificationSettings(response.data.notifications || {
            emailNotifications: true,
            donationAlerts: true,
            campaignUpdates: true,
            monthlyReports: true
          });
          
          setThemeSettings(response.data.theme || {
            darkMode: false,
            highContrast: false,
            fontSize: 'medium'
          });
        } catch (err) {
          console.error('Error loading user settings:', err);
        }
      };
      
      // Load API keys if user is admin
      const fetchApiKeys = async () => {
        if (currentUser.role === 'admin') {
          try {
            const response = await axios.get('/api/settings/api-keys');
            setApiKeys(response.data || []);
          } catch (err) {
            console.error('Error loading API keys:', err);
          }
        }
      };
      
      fetchSettings();
      fetchApiKeys();
    }
  }, [currentUser]);

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  // Handle profile change
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle password change
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle notification toggle
  const handleNotificationToggle = (setting) => {
    setNotificationSettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
  };
  
  // Handle theme toggle
  const handleThemeToggle = (setting) => {
    setThemeSettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
  };
  
  // Handle font size change
  const handleFontSizeChange = (e) => {
    setThemeSettings(prev => ({
      ...prev,
      fontSize: e.target.value
    }));
  };

  // Save profile
  const saveProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      
      await updateUserProfile({
        firstName: profile.firstName,
        lastName: profile.lastName,
        phone: profile.phone,
        jobTitle: profile.jobTitle,
        department: profile.department
      });
      
      setSuccess('Profile updated successfully');
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Change password
  const changePassword = async () => {
    // Validate passwords
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('New passwords do not match');
      return;
    }
    
    if (passwordData.newPassword.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      
      await axios.post('/api/auth/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      
      setSuccess('Password changed successfully');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (err) {
      console.error('Error changing password:', err);
      if (err.response && err.response.status === 401) {
        setError('Current password is incorrect');
      } else {
        setError('Failed to change password. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };
  
  // Save notification settings
  const saveNotificationSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      
      await axios.post('/api/users/settings', {
        notifications: notificationSettings
      });
      
      setSuccess('Notification settings saved successfully');
    } catch (err) {
      console.error('Error saving notification settings:', err);
      setError('Failed to save notification settings. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Save theme settings
  const saveThemeSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      
      await axios.post('/api/users/settings', {
        theme: themeSettings
      });
      
      setSuccess('Theme settings saved successfully');
      
      // Apply theme changes immediately
      document.documentElement.setAttribute('data-theme', themeSettings.darkMode ? 'dark' : 'light');
      document.documentElement.setAttribute('data-high-contrast', themeSettings.highContrast ? 'true' : 'false');
      document.documentElement.setAttribute('data-font-size', themeSettings.fontSize);
    } catch (err) {
      console.error('Error saving theme settings:', err);
      setError('Failed to save theme settings. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Generate new API key
  const generateApiKey = async () => {
    if (!newApiKeyName.trim()) {
      setError('Please enter a name for the API key');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      
      const response = await axios.post('/api/settings/api-keys', {
        name: newApiKeyName
      });
      
      setApiKeys([...apiKeys, response.data]);
      setNewApiKeyName('');
      setSuccess('API key generated successfully');
    } catch (err) {
      console.error('Error generating API key:', err);
      setError('Failed to generate API key. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Delete API key
  const deleteApiKey = async () => {
    if (!selectedApiKey) return;
    
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      
      await axios.delete(`/api/settings/api-keys/${selectedApiKey.id}`);
      
      setApiKeys(apiKeys.filter(key => key.id !== selectedApiKey.id));
      setSuccess('API key deleted successfully');
    } catch (err) {
      console.error('Error deleting API key:', err);
      setError('Failed to delete API key. Please try again.');
    } finally {
      setLoading(false);
      setDeleteDialogOpen(false);
      setSelectedApiKey(null);
    }
  };
  
  // Open delete dialog
  const openDeleteDialog = (apiKey) => {
    setSelectedApiKey(apiKey);
    setDeleteDialogOpen(true);
  };

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Settings
      </Typography>
      
      <Paper sx={{ mb: 3 }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange} 
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
        >
          <Tab icon={<Person />} label="Profile" />
          <Tab icon={<Security />} label="Security" />
          <Tab icon={<Notifications />} label="Notifications" />
          <Tab icon={<ColorLens />} label="Appearance" />
        </Tabs>
      </Paper>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {success}
        </Alert>
      )}
      
      {/* Profile Settings */}
      <TabPanel value={tabValue} index={0}>
        <Card>
          <CardHeader title="Personal Information" />
          <CardContent>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="First Name"
                  name="firstName"
                  value={profile.firstName}
                  onChange={handleProfileChange}
                  margin="normal"
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Last Name"
                  name="lastName"
                  value={profile.lastName}
                  onChange={handleProfileChange}
                  margin="normal"
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  value={profile.email}
                  disabled
                  margin="normal"
                  helperText="Email cannot be changed. Contact administrator for assistance."
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Phone"
                  name="phone"
                  value={profile.phone}
                  onChange={handleProfileChange}
                  margin="normal"
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Job Title"
                  name="jobTitle"
                  value={profile.jobTitle}
                  onChange={handleProfileChange}
                  margin="normal"
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Department"
                  name="department"
                  value={profile.department}
                  onChange={handleProfileChange}
                  margin="normal"
                />
              </Grid>
              
              <Grid item xs={12}>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<Save />}
                  onClick={saveProfile}
                  disabled={loading}
                >
                  {loading ? <CircularProgress size={24} /> : 'Save Changes'}
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </TabPanel>
      
      {/* Security Settings */}
      <TabPanel value={tabValue} index={1}>
        <Card sx={{ mb: 3 }}>
          <CardHeader title="Change Password" />
          <CardContent>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Current Password"
                  name="currentPassword"
                  type={showCurrentPassword ? 'text' : 'password'}
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  margin="normal"
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          edge="end"
                        >
                          {showCurrentPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="New Password"
                  name="newPassword"
                  type={showNewPassword ? 'text' : 'password'}
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  margin="normal"
                  helperText="Password must be at least 8 characters long"
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          edge="end"
                        >
                          {showNewPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Confirm New Password"
                  name="confirmPassword"
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  margin="normal"
                  error={passwordData.newPassword !== passwordData.confirmPassword && passwordData.confirmPassword !== ''}
                  helperText={
                    passwordData.newPassword !== passwordData.confirmPassword && passwordData.confirmPassword !== ''
                      ? 'Passwords do not match'
                      : ' '
                  }
                />
              </Grid>
              
              <Grid item xs={12}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={changePassword}
                  disabled={loading}
                >
                  {loading ? <CircularProgress size={24} /> : 'Change Password'}
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
        
        {currentUser && currentUser.role === 'admin' && (
          <Card>
            <CardHeader 
              title="API Keys" 
              subheader="Manage API keys for integration with external systems"
            />
            <CardContent>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', mb: 2 }}>
                    <TextField
                      label="API Key Name"
                      value={newApiKeyName}
                      onChange={(e) => setNewApiKeyName(e.target.value)}
                      sx={{ flexGrow: 1, mr: 2 }}
                    />
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={generateApiKey}
                      disabled={loading}
                    >
                      Generate Key
                    </Button>
                  </Box>
                </Grid>
                
                <Grid item xs={12}>
                  <List>
                    {apiKeys.map((key) => (
                      <React.Fragment key={key.id}>
                        <ListItem>
                          <ListItemText
                            primary={key.name}
                            secondary={`Created: ${new Date(key.created_at).toLocaleDateString()} | Last used: ${
                              key.last_used_at ? new Date(key.last_used_at).toLocaleDateString() : 'Never'
                            }`}
                          />
                          <ListItemSecondaryAction>
                            <IconButton 
                              edge="end" 
                              color="error"
                              onClick={() => openDeleteDialog(key)}
                            >
                              <Delete />
                            </IconButton>
                          </ListItemSecondaryAction>
                        </ListItem>
                        <Divider />
                      </React.Fragment>
                    ))}
                    
                    {apiKeys.length === 0 && (
                      <Typography color="text.secondary" align="center">
                        No API keys found
                      </Typography>
                    )}
                  </List>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        )}
      </TabPanel>
      
      {/* Notification Settings */}
      <TabPanel value={tabValue} index={2}>
        <Card>
          <CardHeader title="Notification Preferences" />
          <CardContent>
            <List>
              <ListItem>
                <ListItemText
                  primary="Email Notifications"
                  secondary="Receive notifications via email"
                />
                <ListItemSecondaryAction>
                  <Switch
                    edge="end"
                    checked={notificationSettings.emailNotifications}
                    onChange={() => handleNotificationToggle('emailNotifications')}
                  />
                </ListItemSecondaryAction>
              </ListItem>
              <Divider />
              
              <ListItem>
                <ListItemText
                  primary="Donation Alerts"
                  secondary="Get notified when new donations are received"
                />
                <ListItemSecondaryAction>
                  <Switch
                    edge="end"
                    checked={notificationSettings.donationAlerts}
                    onChange={() => handleNotificationToggle('donationAlerts')}
                    disabled={!notificationSettings.emailNotifications}
                  />
                </ListItemSecondaryAction>
              </ListItem>
              <Divider />
              
              <ListItem>
                <ListItemText
                  primary="Campaign Updates"
                  secondary="Receive updates about campaign progress"
                />
                <ListItemSecondaryAction>
                  <Switch
                    edge="end"
                    checked={notificationSettings.campaignUpdates}
                    onChange={() => handleNotificationToggle('campaignUpdates')}
                    disabled={!notificationSettings.emailNotifications}
                  />
                </ListItemSecondaryAction>
              </ListItem>
              <Divider />
              
              <ListItem>
                <ListItemText
                  primary="Monthly Reports"
                  secondary="Receive monthly donation summary reports"
                />
                <ListItemSecondaryAction>
                  <Switch
                    edge="end"
                    checked={notificationSettings.monthlyReports}
                    onChange={() => handleNotificationToggle('monthlyReports')}
                    disabled={!notificationSettings.emailNotifications}
                  />
                </ListItemSecondaryAction>
              </ListItem>
            </List>
            
            <Box sx={{ mt: 3 }}>
              <Button
                variant="contained"
                color="primary"
                onClick={saveNotificationSettings}
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : 'Save Preferences'}
              </Button>
            </Box>
          </CardContent>
        </Card>
      </TabPanel>
      
      {/* Appearance Settings */}
      <TabPanel value={tabValue} index={3}>
        <Card>
          <CardHeader title="Theme & Display" />
          <CardContent>
            <List>
              <ListItem>
                <ListItemText
                  primary="Dark Mode"
                  secondary="Use dark color scheme"
                />
                <ListItemSecondaryAction>
                  <Switch
                    edge="end"
                    checked={themeSettings.darkMode}
                    onChange={() => handleThemeToggle('darkMode')}
                  />
                </ListItemSecondaryAction>
              </ListItem>
              <Divider />
              
              <ListItem>
                <ListItemText
                  primary="High Contrast"
                  secondary="Increase contrast for better visibility"
                />
                <ListItemSecondaryAction>
                  <Switch
                    edge="end"
                    checked={themeSettings.highContrast}
                    onChange={() => handleThemeToggle('highContrast')}
                  />
                </ListItemSecondaryAction>
              </ListItem>
              <Divider />
              
              <ListItem>
                <ListItemText
                  primary="Font Size"
                  secondary="Adjust the text size throughout the application"
                />
                <ListItemSecondaryAction>
                  <TextField
                    select
                    value={themeSettings.fontSize}
                    onChange={handleFontSizeChange}
                    variant="outlined"
                    size="small"
                    sx={{ minWidth: 120 }}
                  >
                    <MenuItem value="small">Small</MenuItem>
                    <MenuItem value="medium">Medium</MenuItem>
                    <MenuItem value="large">Large</MenuItem>
                  </TextField>
                </ListItemSecondaryAction>
              </ListItem>
            </List>
            
            <Box sx={{ mt: 3 }}>
              <Button
                variant="contained"
                color="primary"
                onClick={saveThemeSettings}
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : 'Apply Theme'}
              </Button>
            </Box>
          </CardContent>
        </Card>
      </TabPanel>
      
      {/* Delete API Key Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete API Key</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the API key "{selectedApiKey?.name}"? This action cannot be undone and may break integrations that use this key.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={deleteApiKey} color="error" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Settings;
