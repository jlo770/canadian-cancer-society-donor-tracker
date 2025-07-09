import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  CardHeader,
  Grid,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  Divider,
  Snackbar,
  Alert,
  CircularProgress
} from '@mui/material';
import { Save, Refresh } from '@mui/icons-material';
import { triggerTwitterCollection, triggerRedditCollection, triggerNewsCollection } from '../../api/sentimentApi';

const Settings = () => {
  // API Keys state
  const [twitterApiKey, setTwitterApiKey] = useState('');
  const [twitterApiSecret, setTwitterApiSecret] = useState('');
  const [twitterAccessToken, setTwitterAccessToken] = useState('');
  const [twitterAccessSecret, setTwitterAccessSecret] = useState('');
  
  const [redditClientId, setRedditClientId] = useState('');
  const [redditClientSecret, setRedditClientSecret] = useState('');
  const [redditUserAgent, setRedditUserAgent] = useState('');
  
  const [newsApiKey, setNewsApiKey] = useState('');
  
  // Collection settings
  const [autoCollection, setAutoCollection] = useState(true);
  const [collectionFrequency, setCollectionFrequency] = useState('6');
  const [maxRecordsPerSource, setMaxRecordsPerSource] = useState('100');
  
  // Keywords settings
  const [keywords, setKeywords] = useState('Canadian Tire, CanadianTire, CT Corp, Canadian Tire Corporation, $CTC, CTCa');
  
  // UI state
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [refreshing, setRefreshing] = useState({
    twitter: false,
    reddit: false,
    news: false
  });

  // Handle save settings
  const handleSaveSettings = () => {
    setLoading(true);
    
    // In a real app, this would save to the backend
    setTimeout(() => {
      setLoading(false);
      setSnackbar({
        open: true,
        message: 'Settings saved successfully!',
        severity: 'success'
      });
    }, 1000);
  };

  // Handle manual data collection
  const handleCollectData = async (source) => {
    setRefreshing({ ...refreshing, [source]: true });
    
    try {
      let result;
      switch (source) {
        case 'twitter':
          result = await triggerTwitterCollection();
          break;
        case 'reddit':
          result = await triggerRedditCollection();
          break;
        case 'news':
          result = await triggerNewsCollection();
          break;
        default:
          throw new Error('Invalid source');
      }
      
      setSnackbar({
        open: true,
        message: `Collected ${result.count} items from ${source}!`,
        severity: 'success'
      });
    } catch (error) {
      console.error(`Error collecting data from ${source}:`, error);
      setSnackbar({
        open: true,
        message: `Failed to collect data from ${source}. Check API keys and try again.`,
        severity: 'error'
      });
    } finally {
      setRefreshing({ ...refreshing, [source]: false });
    }
  };

  // Handle snackbar close
  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Settings
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader title="API Keys" />
            <CardContent>
              <Typography variant="subtitle2" gutterBottom>
                Twitter API
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="API Key"
                    value={twitterApiKey}
                    onChange={(e) => setTwitterApiKey(e.target.value)}
                    fullWidth
                    margin="dense"
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="API Secret"
                    value={twitterApiSecret}
                    onChange={(e) => setTwitterApiSecret(e.target.value)}
                    fullWidth
                    margin="dense"
                    size="small"
                    type="password"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Access Token"
                    value={twitterAccessToken}
                    onChange={(e) => setTwitterAccessToken(e.target.value)}
                    fullWidth
                    margin="dense"
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Access Token Secret"
                    value={twitterAccessSecret}
                    onChange={(e) => setTwitterAccessSecret(e.target.value)}
                    fullWidth
                    margin="dense"
                    size="small"
                    type="password"
                  />
                </Grid>
              </Grid>
              
              <Divider sx={{ my: 2 }} />
              
              <Typography variant="subtitle2" gutterBottom>
                Reddit API
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Client ID"
                    value={redditClientId}
                    onChange={(e) => setRedditClientId(e.target.value)}
                    fullWidth
                    margin="dense"
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Client Secret"
                    value={redditClientSecret}
                    onChange={(e) => setRedditClientSecret(e.target.value)}
                    fullWidth
                    margin="dense"
                    size="small"
                    type="password"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="User Agent"
                    value={redditUserAgent}
                    onChange={(e) => setRedditUserAgent(e.target.value)}
                    fullWidth
                    margin="dense"
                    size="small"
                    placeholder="python:canadian-tire-sentiment:v1.0 (by /u/yourUsername)"
                  />
                </Grid>
              </Grid>
              
              <Divider sx={{ my: 2 }} />
              
              <Typography variant="subtitle2" gutterBottom>
                News API
              </Typography>
              <TextField
                label="API Key"
                value={newsApiKey}
                onChange={(e) => setNewsApiKey(e.target.value)}
                fullWidth
                margin="dense"
                size="small"
              />
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Card sx={{ mb: 3 }}>
            <CardHeader title="Collection Settings" />
            <CardContent>
              <FormControlLabel
                control={
                  <Switch
                    checked={autoCollection}
                    onChange={(e) => setAutoCollection(e.target.checked)}
                    color="primary"
                  />
                }
                label="Enable Automatic Data Collection"
              />
              
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Collection Frequency (hours)"
                    value={collectionFrequency}
                    onChange={(e) => setCollectionFrequency(e.target.value)}
                    fullWidth
                    margin="dense"
                    size="small"
                    type="number"
                    inputProps={{ min: 1, max: 24 }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Max Records per Source"
                    value={maxRecordsPerSource}
                    onChange={(e) => setMaxRecordsPerSource(e.target.value)}
                    fullWidth
                    margin="dense"
                    size="small"
                    type="number"
                    inputProps={{ min: 10, max: 500 }}
                  />
                </Grid>
              </Grid>
              
              <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
                Manual Data Collection
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={4}>
                  <Button
                    variant="outlined"
                    fullWidth
                    startIcon={refreshing.twitter ? <CircularProgress size={20} /> : <Refresh />}
                    onClick={() => handleCollectData('twitter')}
                    disabled={refreshing.twitter}
                  >
                    Twitter
                  </Button>
                </Grid>
                <Grid item xs={4}>
                  <Button
                    variant="outlined"
                    fullWidth
                    startIcon={refreshing.reddit ? <CircularProgress size={20} /> : <Refresh />}
                    onClick={() => handleCollectData('reddit')}
                    disabled={refreshing.reddit}
                  >
                    Reddit
                  </Button>
                </Grid>
                <Grid item xs={4}>
                  <Button
                    variant="outlined"
                    fullWidth
                    startIcon={refreshing.news ? <CircularProgress size={20} /> : <Refresh />}
                    onClick={() => handleCollectData('news')}
                    disabled={refreshing.news}
                  >
                    News
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader title="Keywords" />
            <CardContent>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Enter keywords to track, separated by commas
              </Typography>
              <TextField
                label="Keywords"
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                fullWidth
                margin="dense"
                size="small"
                multiline
                rows={3}
              />
              
              <Box sx={{ mt: 2 }}>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Save />}
                  onClick={handleSaveSettings}
                  disabled={loading}
                >
                  Save Settings
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleSnackbarClose}>
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Settings;
